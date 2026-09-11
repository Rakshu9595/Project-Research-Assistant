import axios from "axios";


// AI SERVICE BASE URL
const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || "http://localhost:8000";


// SEND CHAT MESSAGE TO AI SERVICE

export const sendChatToAI = async ({
    message,
    conversationId,
    userId,
}) => {
    try {
        const response = await axios.post(
            `${AI_SERVICE_URL}/chat`,
            {
                message,
                conversationId,
                userId,
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "❌ AI Chat Service Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "AI service is currently unavailable."
        );
    }
};



// SEND DOCUMENT FOR INGESTION

export const ingestDocument = async ({
    documentId,
    userId,
    fileUrl,
    fileName,
}) => {
    try {
        const response = await axios.post(
            `${AI_SERVICE_URL}/ingest`,
            {
                documentId,
                userId,
                fileUrl,
                fileName,
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "❌ AI Document Ingestion Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Document processing failed."
        );
    }
};



// SEARCH RESEARCH PAPERS

export const searchResearch = async ({
    query,
    documentId,
    userId,
    limit = 10,
}) => {
    try {
        const response = await axios.post(
            `${AI_SERVICE_URL}/research/search`,
            {
                query,
                documentId,
                userId,
                limit,
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "❌ AI Research Search Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Research service is currently unavailable."
        );
    }
};


// FIND RELATED RESEARCH PAPERS

export const findRelatedResearch = async ({
    documentId,
    userId,
}) => {
    try {
        const response = await axios.post(
            `${AI_SERVICE_URL}/research/related`,
            {
                documentId,
                userId,
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "❌ Related Research Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Unable to find related research papers."
        );
    }
};



// GET PAPER DETAILS

export const getPaperDetails = async (paperId) => {
    try {
        const response = await axios.get(
            `${AI_SERVICE_URL}/research/paper/${paperId}`
        );

        return response.data;

    } catch (error) {
        console.error(
            "❌ Paper Details Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Unable to retrieve paper details."
        );
    }
};