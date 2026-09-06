import axios from "axios";


// SEND CHAT MESSAGE
export const sendMessage = async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        // Check message
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a message.",
            });
        }

        // Get logged-in user
        const userId = req.user.id;

        // Send question to AI service
        const response = await axios.post(
            `${process.env.AI_SERVICE_URL}/chat`,
            {
                message,
                conversationId,
                userId,
            }
        );

        // Return AI response
        return res.status(200).json({
            success: true,
            data: response.data,
        });

    } catch (error) {
        console.error(
            "❌ Chat Controller Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to process your question.",
        });
    }
};