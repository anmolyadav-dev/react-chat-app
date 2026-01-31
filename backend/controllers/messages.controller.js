import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId } from "../socket/socket.js";
import { io } from "../socket/socket.js";
import encryption from "../utils/encryption.js";
import redisClient from "../utils/redis.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Get receiver's public key for encryption
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Encrypt the message with receiver's public key
    const encryptedMessage = encryption.encryptMessage(message, receiver.encryptionKeys.publicKey);
    if (!encryptedMessage) {
      return res.status(500).json({ error: "Encryption failed" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If conversation doesn't exist, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create message object with encryption
    const newMessage = new Message({
      senderId,
      receiverId,
      message, // Keep original for debugging (remove in production)
      encryptedMessage,
      isEncrypted: true,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // Save both conversation and message in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    // Invalidate cache for this conversation
    const conversationId = [senderId, receiverId].sort().join('_');
    await redisClient.invalidateMessagesCache(conversationId);

    // Send to receiver via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: encryptedMessage, // Send encrypted to receiver
        isEncrypted: true,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
      });
    }

    // Return message to sender (with original message for display)
    res.status(201).json({
      _id: newMessage._id,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      message: message, // Return original message to sender
      isEncrypted: true,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
    });
  } catch (error) {
    console.log("error in send message controller", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;
    
    // Create conversation ID for caching
    const conversationId = [senderId, receiverId].sort().join('_');
    
    // Try to get from cache first
    const cachedMessages = await redisClient.getCachedMessages(conversationId);
    if (cachedMessages) {
      // Decrypt cached messages for the current user
      const decryptedMessages = cachedMessages.map(msg => {
        if (msg.isEncrypted && msg.encryptedMessage) {
          try {
            const decryptedMessage = encryption.decryptMessage(
              msg.encryptedMessage, 
              req.user.encryptionKeys.privateKey
            );
            return {
              ...msg,
              message: decryptedMessage || msg.message,
            };
          } catch (error) {
            console.error("Decryption error:", error);
            return {
              ...msg,
              message: "[Decryption failed]",
            };
          }
        }
        return msg;
      });
      return res.status(200).json(decryptedMessages);
    }
    
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");
    
    if (!conversation) {
      return res.status(200).json([]);
    }

    // Decrypt messages for the current user
    const decryptedMessages = conversation.messages.map(msg => {
      if (msg.isEncrypted && msg.encryptedMessage) {
        try {
          const decryptedMessage = encryption.decryptMessage(
            msg.encryptedMessage, 
            req.user.encryptionKeys.privateKey
          );
          return {
            ...msg.toObject(),
            message: decryptedMessage || msg.message, // Fallback to original if decryption fails
          };
        } catch (error) {
          console.error("Decryption error:", error);
          return {
            ...msg.toObject(),
            message: "[Decryption failed]",
          };
        }
      }
      return msg.toObject();
    });

    // Cache the decrypted messages
    await redisClient.cacheMessages(conversationId, decryptedMessages);

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log("error in get message controller", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};
