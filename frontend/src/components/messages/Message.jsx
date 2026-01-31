import { useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation";
import { extractTime } from "../../utils/extractTime";

const Message = ({ message }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  
  // Defensive checks
  if (!message) {
    console.warn("Message component received null/undefined message");
    return null;
  }
  
  const fromMe = message.senderId === authUser._id;
  const formattedTime = extractTime(message.createdAt);
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const profilePic = fromMe ? authUser.avatar : selectedConversation?.avatar;
  const bubbleBgColor = fromMe ? "bg-blue-500" : "bg-gray-700";
  const shakeClass = message.shouldShake ? "shake" : "";
  
  // Debug logging
  useEffect(() => {
    console.log("Message component rendering:", {
      messageId: message._id,
      fromMe,
      messageText: message.message?.substring(0, 50) + "...",
      isEncrypted: message.isEncrypted
    });
  }, [message]);
  
  return (
    <div className={`chat ${chatClassName}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img 
            src={profilePic || "/default-avatar.png"} 
            alt="Avatar" 
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>
      </div>

      <div 
        className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} break-words max-w-xs lg:max-w-md`}
      >
        {message.message || <span className="text-gray-400 italic">Empty message</span>}
      </div>
      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">
        {formattedTime}
        {message.isEncrypted && (
          <span className="text-green-400" title="Encrypted message">🔒</span>
        )}
      </div>
    </div>
  );
};

export default Message;
