import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext.jsx";
import encryption from "../utils/encryption.js";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { encryptionKeys } = useAuthContext();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages/${selectedConversation._id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        // Decrypt messages if they're encrypted
        const decryptedMessages = data.map(msg => {
          if (msg.isEncrypted && encryptionKeys) {
            try {
              const decryptedMessage = encryption.decryptMessage(
                msg.message, 
                encryptionKeys.privateKey
              );
              return {
                ...msg,
                message: decryptedMessage || "[Decryption failed]"
              };
            } catch (error) {
              console.error("Failed to decrypt message:", error);
              return {
                ...msg,
                message: "[Decryption failed]"
              };
            }
          }
          return msg;
        });
        
        setMessages(decryptedMessages);
      } catch (error) {
        console.error("Error getting messages:", error);
        toast.error(error.message);
        setMessages([]); // Clear messages on error to prevent black screen
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) {
      getMessages();
    } else {
      setMessages([]); // Clear messages when no conversation is selected
    }
  }, [selectedConversation?._id, setMessages, encryptionKeys]);

  return { messages, loading };
};

export default useGetMessages;
