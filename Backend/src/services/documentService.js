import Document from "../models/Document.js";

import {
    uploadDocumentToCloudinary,
    deleteDocumentFromCloudinary,
} from "./cloudinaryService.js";

import axios from "axios";
import fs from "fs";

// Upload document
 
export const createDocument = async ({
    userId,
    file,
}) => {
    try {
        if (!file) {
            throw new Error("File is required.");
        }

        // Upload file to Cloudinary
        const uploadResult =
            await uploadDocumentToCloudinary(file.path);

        // Save document information in MongoDB
        const document = await Document.create({
            user: userId,
            name: file.originalname,
            fileUrl: uploadResult.url,
            publicId: uploadResult.publicId,
            fileType: file.mimetype,
            size: file.size,
            status: "uploaded",
        });

        // Remove temporary local file
        if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // Send document to AI service for processing
        try {
            await axios.post(
                `${process.env.AI_SERVICE_URL}/ingest`,
                {
                    documentId: document._id,
                    userId,
                    fileUrl: document.fileUrl,
                    fileName: document.name,
                }
            );

            // Update status after sending to AI service
            document.status = "processing";
            await document.save();

        } catch (aiError) {
            console.error(
                "⚠️ AI ingestion failed:",
                aiError.response?.data ||
                aiError.message
            );

            document.status = "failed";
            document.errorMessage =
                "AI document processing failed.";

            await document.save();
        }

        return document;

    } catch (error) {
        console.error(
            "❌ Create Document Error:",
            error.message
        );

        // Delete temporary file if something fails
        if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        throw error;
    }
};


// Get all documents of a user
 
export const getUserDocuments = async (userId) => {
    try {
        const documents = await Document.find({
            user: userId,
        }).sort({
            createdAt: -1,
        });

        return documents;

    } catch (error) {
        console.error(
            "❌ Get User Documents Error:",
            error.message
        );

        throw error;
    }
};


// Get one document
export const getUserDocument = async ({
    userId,
    documentId,
}) => {
    try {
        const document = await Document.findOne({
            _id: documentId,
            user: userId,
        });

        if (!document) {
            throw new Error("Document not found.");
        }

        return document;

    } catch (error) {
        console.error(
            "❌ Get Document Error:",
            error.message
        );

        throw error;
    }
};


// Delete document
 
export const removeDocument = async ({
    userId,
    documentId,
}) => {
    try {
        const document = await Document.findOne({
            _id: documentId,
            user: userId,
        });

        if (!document) {
            throw new Error("Document not found.");
        }

        // Delete from Cloudinary
        if (document.publicId) {
            await deleteDocumentFromCloudinary(
                document.publicId
            );
        }

        // Delete from MongoDB
        await Document.deleteOne({
            _id: documentId,
        });

        return document;

    } catch (error) {
        console.error(
            "❌ Delete Document Error:",
            error.message
        );

        throw error;
    }
};

