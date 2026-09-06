import axios from "axios";


// SEARCH RESEARCH PAPERS

export const searchResearchPapers = async (req, res) => {
    try {
        const { query, documentId, limit } = req.body;

        // Check query
        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a research query.",
            });
        }

        // Get logged-in user
        const userId = req.user.id;

        // Send request to AI research service
        const response = await axios.post(
            `${process.env.AI_SERVICE_URL}/research/search`,
            {
                query,
                documentId,
                userId,
                limit: limit || 10,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Research papers retrieved successfully.",
            data: response.data,
        });

    } catch (error) {
        console.error(
            "❌ Research Search Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve research papers.",
        });
    }
};



// FIND RELATED PAPERS FROM PROJECT

export const findRelatedPapers = async (req, res) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a document ID.",
            });
        }

        // Get logged-in user
        const userId = req.user.id;

        // Send document-based research request
        const response = await axios.post(
            `${process.env.AI_SERVICE_URL}/research/related`,
            {
                documentId,
                userId,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Related research papers found successfully.",
            data: response.data,
        });

    } catch (error) {
        console.error(
            "❌ Related Papers Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to find related research papers.",
        });
    }
};



// GET RESEARCH PAPER DETAILS

export const getPaperDetails = async (req, res) => {
    try {
        const { paperId } = req.params;

        if (!paperId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a paper ID.",
            });
        }

        // Request paper details from AI service
        const response = await axios.get(
            `${process.env.AI_SERVICE_URL}/research/paper/${paperId}`
        );

        return res.status(200).json({
            success: true,
            data: response.data,
        });

    } catch (error) {
        console.error(
            "❌ Paper Details Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve paper details.",
        });
    }
};