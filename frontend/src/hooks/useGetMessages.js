import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext.jsx";
import encryption from "../utils/encryption.js";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { authUser, encryptionKeys } = useAuthContext();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages/${selectedConversation._id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        // Messages are already decrypted on the server, so we don't need to decrypt here
        setMessages(data);
      } catch (error) {
        console.error("Error getting messages:", error);
        toast.error(error.message);
        setMessages([]); // Clear messages on error to prevent black screen
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id && authUser?._id && encryptionKeys) {
      getMessages();
    } else {
      setMessages([]); // Clear messages when no conversation is selected
    }
  }, [selectedConversation?._id, setMessages, authUser, encryptionKeys]);

  return { messages, loading };
};

export default useGetMessages;
