import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import { FaLock } from "react-icons/fa";

const Conversation = ({ conversation, lastIdx }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = conversation._id === selectedConversation?._id;

  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers?.includes(conversation._id);
  
  return (
    <>
      <div
        className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-all duration-300 ${
          isSelected 
            ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-white/20" 
            : "hover:bg-white/10 border border-transparent"
        }`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className={`avatar ${isOnline ? "online" : "offline"} relative`}>
          <div className="w-12 rounded-full ring-2 ring-white/20">
            <img
              src={conversation.avatar}
              alt={conversation.username}
              className="object-cover"
            />
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white/20"></div>
          )}
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white">{conversation.fullName}</p>
            <div className="flex items-center text-green-400">
              <FaLock className="text-xs" />
            </div>
          </div>
          <p className="text-gray-400 text-sm">@{conversation.username}</p>
        </div>
      </div>

      {!lastIdx && <div className="h-px bg-white/10 my-2" />}
    </>
  );
};

export default Conversation;
