import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        // User who owns this conversation
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Conversation title
        title: {
            type: String,
            default: "New Conversation",
            trim: true,
        },

        // Optional document related to this conversation
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            default: null,
        },

        // Type of conversation
        mode: {
            type: String,
            enum: ["rag", "general", "research", "adaptive"],
            default: "adaptive",
        },

        // Last message preview
        lastMessage: {
            type: String,
            default: "",
            trim: true,
        },

        // Number of messages
        messageCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Conversation = mongoose.model(
    "Conversation",
    conversationSchema
);

export default Conversation;