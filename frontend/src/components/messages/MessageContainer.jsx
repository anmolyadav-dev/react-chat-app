import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import { FaLock } from "react-icons/fa";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);
  
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-md px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 text-sm">To:</span>{" "}
                <span className="text-white font-semibold text-lg ml-2">
                  {selectedConversation.fullName}
                </span>
              </div>
              <div className="flex items-center text-green-400 text-sm">
                <FaLock className="mr-1" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>
          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};

export default MessageContainer;

const NoChatSelected = () => {
  const { authUser } = useAuthContext();
  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-b from-transparent to-black/20">
      <div className="text-center px-6">
        <div className="mb-6">
          <TiMessages className="text-6xl md:text-8xl text-white/50 mx-auto mb-4" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Welcome 👋 {authUser?.fullName}
        </h3>
        <p className="text-gray-300 mb-4">
          Select a chat to start messaging
        </p>
        <div className="flex items-center justify-center text-green-400 text-sm">
          <FaLock className="mr-2" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};
