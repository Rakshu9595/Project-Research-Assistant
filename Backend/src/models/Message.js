import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        // Conversation this message belongs to
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        // User who sent the message
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Message sender
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },

        // Actual message content
        content: {
            type: String,
            required: true,
            trim: true,
        },

        // How the answer was generated
        source: {
            type: String,
            enum: ["rag", "general", "research", "adaptive"],
            default: "adaptive",
        },

        // Sources used to generate the answer
        sources: [
            {
                documentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Document",
                },

                documentName: {
                    type: String,
                    default: "",
                },

                pageNumber: {
                    type: Number,
                    default: null,
                },

                text: {
                    type: String,
                    default: "",
                },
            },
        ],

        // Academic papers used for the answer
        researchPapers: [
            {
                title: {
                    type: String,
                    default: "",
                },

                authors: [
                    {
                        type: String,
                    },
                ],

                url: {
                    type: String,
                    default: "",
                },
            },
        ],

        // Optional processing information
        metadata: {
            confidence: {
                type: Number,
                default: null,
            },

            retrievalScore: {
                type: Number,
                default: null,
            },
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model(
    "Message",
    messageSchema
);

export default Message;