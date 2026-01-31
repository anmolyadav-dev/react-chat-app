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

    console.log("Sending message:", { senderId, receiverId, message });

    // Get both sender and receiver
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!receiver) {
      console.error("Receiver not found");
      return res.status(404).json({ error: "Receiver not found" });
    }

    console.log("Both users found, generating shared secret");

    // Generate a shared secret for this conversation
    const sharedSecret = encryption.generateSharedSecret(
      sender.encryptionKeys.privateKey,
      receiver.encryptionKeys.privateKey
    );

    console.log("Shared secret for encryption:", sharedSecret.substring(0, 20) + "...");

    // Encrypt the message with the shared secret
    const encryptedMessage = encryption.encryptMessage(message, sharedSecret);
    if (!encryptedMessage) {
      console.error("Encryption failed");
      return res.status(500).json({ error: "Encryption failed" });
    }

    console.log("Message encrypted successfully");

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If conversation doesn't exist, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
      console.log("Created new conversation");
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
    console.log("Message saved to database");

    // Invalidate cache for this conversation
    const conversationId = [senderId, receiverId].sort().join('_');
    await redisClient.invalidateMessagesCache(conversationId);

    // Send to receiver via Socket.IO (already decrypted)
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      console.log("Sending real-time message to receiver");
      io.to(receiverSocketId).emit("newMessage", {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: message, // Send decrypted message to receiver
        isEncrypted: true,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
      });
    } else {
      console.log("Receiver not online");
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

    console.log("Getting messages for conversation:", { senderId, receiverId });

    // Get both users to generate shared secret
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender || !receiver) {
      console.error("User not found:", { sender: !!sender, receiver: !!receiver });
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Users found, generating shared secret");

    // Generate shared secret for this conversation
    const sharedSecret = encryption.generateSharedSecret(
      sender.encryptionKeys.privateKey,
      receiver.encryptionKeys.privateKey
    );

    console.log("Shared secret generated:", sharedSecret.substring(0, 20) + "...");

    // Try to get messages from cache first
    const conversationId = [senderId, receiverId].sort().join('_');
    const cachedMessages = await redisClient.getCachedMessages(conversationId);
    
    let messages = cachedMessages;

    if (!messages) {
      console.log("Fetching messages from database");
      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      }).populate("messages");

      if (!conversation) {
        console.log("No conversation found");
        return res.status(200).json([]);
      }

      messages = conversation.messages;
      
      // Cache the messages
      await redisClient.cacheMessages(conversationId, messages);
    } else {
      console.log("Using cached messages");
    }

    console.log("Processing", messages.length, "messages");

    // Decrypt messages for the current user
    const decryptedMessages = messages.map(msg => {
      if (msg.isEncrypted && msg.encryptedMessage) {
        try {
          console.log("Decrypting message:", msg._id);
          const decryptedMessage = encryption.decryptMessage(msg.encryptedMessage, sharedSecret);
          console.log("Decryption result:", decryptedMessage ? "success" : "failed");
          
          // Handle both Mongoose documents and plain objects from cache
          const messageObj = msg.toObject ? msg.toObject() : msg;
          
          return {
            ...messageObj,
            message: decryptedMessage || "[Decryption failed]"
          };
        } catch (error) {
          console.error("Failed to decrypt message:", error);
          
          // Handle both Mongoose documents and plain objects from cache
          const messageObj = msg.toObject ? msg.toObject() : msg;
          
          return {
            ...messageObj,
            message: "[Decryption failed]"
          };
        }
      }
      
      // Handle both Mongoose documents and plain objects from cache
      return msg.toObject ? msg.toObject() : msg;
    });

    console.log("Returning", decryptedMessages.length, "decrypted messages");
    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log("error in get messages controller", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};
