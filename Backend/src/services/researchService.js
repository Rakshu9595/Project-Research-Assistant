import axios from "axios";

// AI SERVICE BASE URL
const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || "http://localhost:8000";


// Search research papers

export const searchResearchPapers = async ({
    query,
    documentId,
    userId,
    limit = 10,
}) => {
    try {
        if (!query || !query.trim()) {
            throw new Error("Research query is required.");
        }

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
            "❌ Research Paper Search Error:",
            error.response?.data ||
            error.message
        );

        throw new Error(
            "Unable to search research papers."
        );
    }
};


// Find papers related to a project document
export const findRelatedPapers = async ({
    documentId,
    userId,
}) => {
    try {
        if (!documentId) {
            throw new Error("Document ID is required.");
        }

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
            "❌ Related Papers Error:",
            error.response?.data ||
            error.message
        );

        throw new Error(
            "Unable to find related research papers."
        );
    }
};


// Get details of a research paper
export const getResearchPaperDetails = async (
    paperId
) => {
    try {
        if (!paperId) {
            throw new Error("Paper ID is required.");
        }

        const response = await axios.get(
            `${AI_SERVICE_URL}/research/paper/${paperId}`
        );

        return response.data;

    } catch (error) {
        console.error(
            "❌ Research Paper Details Error:",
            error.response?.data ||
            error.message
        );

        throw new Error(
            "Unable to retrieve research paper details."
        );
    }
};
