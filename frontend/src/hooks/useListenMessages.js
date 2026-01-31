import React from "react";
import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext.jsx";
import useConversation from "../zustand/useConversation.js";
import { useAuthContext } from "../context/AuthContext.jsx";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { selectedConversation, addMessage } = useConversation();
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (!socket || !authUser) return;

    const handleNewMessage = (newMessage) => {
      console.log("Received new message:", newMessage);
      console.log("Selected conversation:", selectedConversation);
      
      // Only add message if it's from the currently selected conversation
      if (selectedConversation && selectedConversation._id === newMessage.senderId) {
        const processedMessage = {
          ...newMessage,
          shouldShake: true
        };
        
        // Add message to conversation (handles deduplication)
        addMessage(processedMessage);
        console.log("Message added to conversation:", processedMessage.message);
      } else {
        console.log("Message not for current conversation");
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage");
    };
  }, [socket, selectedConversation, authUser, addMessage]);

  return null; // This hook doesn't need to return anything
};

export default useListenMessages;
