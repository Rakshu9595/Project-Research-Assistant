import express from "express";

import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
} from "../controllers/documentController.js";

import { protect } from "../middleware/authMiddleware.js";

import multer from "multer";

const router = express.Router();

/*
 * Temporary file storage
 * The file is temporarily stored locally,
 * then uploaded to Cloudinary.
 */
const upload = multer({
    dest: "uploads/",
});

/*
 * Upload a document
 * POST /api/documents/upload
 */
router.post(
    "/upload",
    protect,
    upload.single("file"),
    uploadDocument
);

/*
 * Get all documents of logged-in user
 * GET /api/documents
 */
router.get(
    "/",
    protect,
    getDocuments
);

/*
 * Get one document
 * GET /api/documents/:id
 */
router.get(
    "/:id",
    protect,
    getDocument
);

/*
 * Delete a document
 * DELETE /api/documents/:id
 */
router.delete(
    "/:id",
    protect,
    deleteDocument
);

export default router;

