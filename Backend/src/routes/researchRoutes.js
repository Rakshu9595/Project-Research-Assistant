import express from "express";

import {
    searchResearchPapers,
    findRelatedPapers,
    getPaperDetails,
} from "../controllers/researchController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * Search research papers
 * POST /api/research/search
 */
router.post(
    "/search",
    protect,
    searchResearchPapers
);

/*
 * Find research papers related to a document
 * POST /api/research/related
 */
router.post(
    "/related",
    protect,
    findRelatedPapers
);

/*
 * Get details of a research paper
 * GET /api/research/paper/:paperId
 */
router.get(
    "/paper/:paperId",
    protect,
    getPaperDetails
);

export default router;
