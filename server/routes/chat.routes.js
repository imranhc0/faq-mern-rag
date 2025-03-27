import { Router } from "express";
import Chat from "../models/chat.model.js";
import { retrieveEmbeddings } from "../services/langchain.service.js";
import { refineResponse } from "../services/chat.service.js";
import Message from "../models/message.model.js";
import { logger } from '../utils/logger.js';

const router = Router();

// Get all chats for a user
router.get("/", async (req, res) => {
    try {
        const chats = await Chat.find({ users: req.user.id });
        if (!chats.length) {
            return res.status(404).json({ message: "No chats found for this user" });
        }
        const messages = await Message.findById(chats[0].messages);
        res.status(200).json(messages);
    } catch (error) {
        logger.error('Error fetching chats:', error);
        res.status(500).json({ message: error.message });
    }
});

// ask new question
router.post("/", async (req, res) => {
    try {
        if (!req.body.question) {
            return res.status(400).json({ message: "Question is required" });
        }

        const { question } = req.body;
        const response = await retrieveEmbeddings(question);


        // refine the response using langchain and OpenAI
        const refinedResponse = await refineResponse(response[0][0].pageContent, question);

        console.log(refinedResponse);

        // Find existing chat for the user
        let chat = await Chat.findOne({ users: req.user.id });

        if (!chat) {
            // If no chat exists, create a new message and chat
            const message = await Message.create({
                content: [{ query: question, answer: refinedResponse }]
            });
            chat = await Chat.create({
                users: req.user.id,
                messages: message._id
            });
        } else {
            // If chat exists, update the existing message document
            const message = await Message.findById(chat.messages);
            message.content.push({ query: question, answer: refinedResponse });
            await message.save();
        }

        // Get the updated messages
        const messages = await Message.findById(chat.messages);
        logger.info('Chat updated successfully:', { userId: req.user.id, messageCount: messages.content.length });

        res.status(201).json(messages);
    } catch (error) {
        logger.error('Error in chat route:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
