
import cloudinary from "../config/cloudinary.js";


 // Upload a document to Cloudinary

export const uploadDocumentToCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error("File path is required.");
        }

        const result = await cloudinary.uploader.upload(
            filePath,
            {
                resource_type: "raw",
                folder: "research-assistant/documents",
            }
        );

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };

    } catch (error) {
        console.error(
            "❌ Cloudinary Upload Error:",
            error.message
        );

        throw new Error(
            "Failed to upload document to Cloudinary."
        );
    }
};


// Delete a document from Cloudinary
 
export const deleteDocumentFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            throw new Error("Cloudinary public ID is required.");
        }

        const result = await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: "raw",
            }
        );

        return result;

    } catch (error) {
        console.error(
            "❌ Cloudinary Delete Error:",
            error.message
        );

        throw new Error(
            "Failed to delete document from Cloudinary."
        );
    }
};

