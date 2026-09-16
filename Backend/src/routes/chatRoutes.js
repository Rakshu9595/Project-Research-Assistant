import express from "express";

import {
    sendMessage,
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


//Send a message to the AI assistant
//POST /api/chat

router.post(
    "/",
    protect,
    sendMessage
);


export default router;
