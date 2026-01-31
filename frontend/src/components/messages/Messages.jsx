import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/messageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";

const Messages = () => {
  const { loading, messages } = useGetMessages();
  useListenMessages();
  const lastMessageRef = useRef();
  
  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);
  
  // Debug logging
  useEffect(() => {
    console.log("Messages component - loading:", loading, "messages count:", messages?.length);
  }, [loading, messages]);
  
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {/* Show loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, idx) => <MessageSkeleton key={idx} />)}
        </div>
      )}
      
      {/* Show messages when not loading and messages exist */}
      {!loading && messages && messages.length > 0 && (
        messages.map((message, index) => (
          <div 
            key={message._id || `message-${index}`} 
            ref={index === messages.length - 1 ? lastMessageRef : null}
          >
            <Message message={message} />
          </div>
        ))
      )}
      
      {/* Show empty state when not loading and no messages */}
      {!loading && (!messages || messages.length === 0) && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-center bg-white/5 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/10">
            Send a message to start the conversation
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
