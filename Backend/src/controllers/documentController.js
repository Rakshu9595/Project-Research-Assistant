import Document from "../models/Document.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import fs from "fs";


// UPLOAD DOCUMENT

export const uploadDocument = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a document.",
            });
        }

        // Get logged-in user
        const userId = req.user.id;

        // Upload file to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
            req.file.path,
            {
                resource_type: "raw",
                folder: "research-assistant/documents",
            }
        );

        // Save document information in MongoDB
        const document = await Document.create({
            user: userId,
            name: req.file.originalname,
            fileUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            fileType: req.file.mimetype,
            size: req.file.size,
        });

        // Delete temporary local file
        fs.unlinkSync(req.file.path);

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
        } catch (aiError) {
            console.error(
                "⚠️ AI ingestion failed:",
                aiError.response?.data || aiError.message
            );
        }

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully.",
            document,
        });

    } catch (error) {
        console.error(
            "❌ Upload Document Error:",
            error.message
        );

        // Remove temporary file if upload failed
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: "Failed to upload document.",
        });
    }
};



// GET ALL USER DOCUMENTS

export const getDocuments = async (req, res) => {
    try {
        const userId = req.user.id;

        const documents = await Document.find({
            user: userId,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: documents.length,
            documents,
        });

    } catch (error) {
        console.error(
            "❌ Get Documents Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch documents.",
        });
    }
};



// GET SINGLE DOCUMENT

export const getDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;

        const document = await Document.findOne({
            _id: documentId,
            user: userId,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found.",
            });
        }

        return res.status(200).json({
            success: true,
            document,
        });

    } catch (error) {
        console.error(
            "❌ Get Document Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch document.",
        });
    }
};

// DELETE DOCUMENT
export const deleteDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;

        // Find document belonging to logged-in user
        const document = await Document.findOne({
            _id: documentId,
            user: userId,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found.",
            });
        }

        // Delete from Cloudinary
        if (document.publicId) {
            await cloudinary.uploader.destroy(
                document.publicId,
                {
                    resource_type: "raw",
                }
            );
        }

        // Delete from MongoDB
        await Document.deleteOne({
            _id: documentId,
        });

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully.",
        });

    } catch (error) {
        console.error(
            "❌ Delete Document Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete document.",
        });
    }
};