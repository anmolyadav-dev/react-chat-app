import React from "react";
import { useEffect, useRef } from "react";
import { useSocketContext } from "../context/SocketContext.jsx";
import useConversation from "../zustand/useConversation.js";
import { useAuthContext } from "../context/AuthContext.jsx";
import encryption from "../utils/encryption.js";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { selectedConversation, addMessage } = useConversation();
  const { encryptionKeys } = useAuthContext();
  const decryptionAttempts = useRef(new Map()); // Track decryption attempts

  const attemptDecryption = (message, maxRetries = 3) => {
    const messageId = message._id;
    
    // Check if we already tried to decrypt this message
    if (decryptionAttempts.current.has(messageId)) {
      const attempts = decryptionAttempts.current.get(messageId);
      if (attempts >= maxRetries) {
        console.log(`Max decryption attempts reached for message ${messageId}`);
        return "[Decryption failed - max attempts]";
      }
    }

    if (!message.isEncrypted) {
      return message.message; // Return as-is if not encrypted
    }

    if (!encryptionKeys) {
      console.log("No encryption keys available, queuing for later...");
      return "[Waiting for keys...]";
    }

    try {
      console.log("Attempting to decrypt message:", messageId);
      const decryptedMessage = encryption.decryptMessage(
        message.message, 
        encryptionKeys.privateKey
      );
      
      if (decryptedMessage) {
        console.log("Message decrypted successfully:", decryptedMessage);
        decryptionAttempts.current.delete(messageId); // Clear attempts on success
        return decryptedMessage;
      } else {
        throw new Error("Decryption returned null");
      }
    } catch (error) {
      console.error("Decryption attempt failed:", error);
      const currentAttempts = decryptionAttempts.current.get(messageId) || 0;
      decryptionAttempts.current.set(messageId, currentAttempts + 1);
      
      if (currentAttempts + 1 >= maxRetries) {
        return "[Decryption failed]";
      }
      return "[Decrypting...]";
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      console.log("Received new message:", newMessage);
      console.log("Selected conversation:", selectedConversation);
      console.log("Encryption keys available:", !!encryptionKeys);
      
      // Only add message if it's from the currently selected conversation
      if (selectedConversation && selectedConversation._id === newMessage.senderId) {
        let processedMessage = { ...newMessage };
        
        // Attempt decryption
        const decryptedText = attemptDecryption(newMessage);
        processedMessage.message = decryptedText;
        processedMessage.shouldShake = true;
        
        // Add message to conversation (handles deduplication)
        addMessage(processedMessage);
        
        // If decryption is still pending, try again after a delay
        if (decryptedText === "[Waiting for keys...]" || decryptedText === "[Decrypting...]") {
          const retryDelay = decryptedText === "[Waiting for keys...]" ? 2000 : 1000;
          
          setTimeout(() => {
            const retryDecrypted = attemptDecryption(newMessage);
            if (retryDecrypted !== "[Waiting for keys...]" && retryDecrypted !== "[Decrypting...]") {
              // Update the message in the conversation
              const { messages, setMessages } = useConversation.getState();
              const updatedMessages = messages.map(msg => 
                msg._id === newMessage._id 
                  ? { ...msg, message: retryDecrypted }
                  : msg
              );
              setMessages(updatedMessages);
            }
          }, retryDelay);
        }
      } else {
        console.log("Message not for current conversation");
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedConversation, encryptionKeys, addMessage]);

  // Retry decryption for existing messages when encryption keys become available
  useEffect(() => {
    if (encryptionKeys) {
      console.log("Encryption keys available, checking for pending messages...");
      
      const { messages, setMessages } = useConversation.getState();
      const updatedMessages = messages.map(message => {
        if (message.isEncrypted && (
          message.message === "[Waiting for keys...]" || 
          message.message === "[Decrypting...]" ||
          message.message === "[Decryption failed]"
        )) {
          const decryptedText = attemptDecryption(message);
          return { ...message, message: decryptedText };
        }
        return message;
      });
      
      // Only update if there are changes
      const hasChanges = updatedMessages.some((msg, index) => 
        msg.message !== messages[index]?.message
      );
      
      if (hasChanges) {
        setMessages(updatedMessages);
      }
    }
  }, [encryptionKeys]);

  return null; // This hook doesn't need to return anything
};

export default useListenMessages;
