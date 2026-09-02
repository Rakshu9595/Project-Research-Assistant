import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const connectCloudinary = () => {
    try {
        const {
            CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET,
        } = process.env;

        // Check required environment variables
        if (!CLOUDINARY_CLOUD_NAME) {
            throw new Error("CLOUDINARY_CLOUD_NAME is missing from .env");
        }

        if (!CLOUDINARY_API_KEY) {
            throw new Error("CLOUDINARY_API_KEY is missing from .env");
        }

        if (!CLOUDINARY_API_SECRET) {
            throw new Error("CLOUDINARY_API_SECRET is missing from .env");
        }

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
        });

        console.log("✅ Cloudinary configured successfully");

        return cloudinary;

    } catch (error) {
        console.error("❌ Cloudinary configuration error:", error.message);
        throw error;
    }
};

const cloudinaryClient = connectCloudinary();

export default cloudinaryClient;