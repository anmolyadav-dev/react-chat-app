import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext.jsx";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { encryptionKeys } = useAuthContext();

  const sendMessage = async (message) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/messages/send/${selectedConversation._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // For the sender, we don't need to decrypt since we sent the original message
      // The server sends back the encrypted version, but we should display our original message
      const processedMessage = {
        ...data,
        message: message, // Use the original message for the sender
        shouldShake: true
      };

      setMessages([...messages, processedMessage]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;
