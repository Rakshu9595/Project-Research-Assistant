import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        // User who uploaded the document
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Original document name
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // Cloudinary URL
        fileUrl: {
            type: String,
            required: true,
        },

        // Cloudinary public ID
        publicId: {
            type: String,
            required: true,
        },

        // File type
        fileType: {
            type: String,
            required: true,
        },

        // File size in bytes
        size: {
            type: Number,
            required: true,
        },

        // Document processing status
        status: {
            type: String,
            enum: [
                "uploaded",
                "processing",
                "completed",
                "failed",
            ],
            default: "uploaded",
        },

        // Number of pages in the document
        pageCount: {
            type: Number,
            default: 0,
        },

        // Error message if processing fails
        errorMessage: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Document = mongoose.model(
    "Document",
    documentSchema
);

export default Document;