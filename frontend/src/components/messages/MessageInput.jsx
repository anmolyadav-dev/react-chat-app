import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import { useState } from "react";
import { FaLock } from "react-icons/fa";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const { loading, sendMessage } = useSendMessage();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      return;
    }
    await sendMessage(message);
    setMessage("");
  };
  
  return (
    <form className="px-6 py-4 bg-gradient-to-t from-black/30 to-transparent backdrop-blur-sm" onSubmit={handleSubmit}>
      <div className="relative">
        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 focus-within:border-purple-400 transition-all duration-300">
          <input
            type="text"
            className="flex-1 px-6 py-3 bg-transparent text-white placeholder-gray-400 outline-none rounded-full"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
          <div className="flex items-center pr-2">
            <div className="text-green-400 mr-2">
              <FaLock className="text-xs" />
            </div>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <BsSend className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
