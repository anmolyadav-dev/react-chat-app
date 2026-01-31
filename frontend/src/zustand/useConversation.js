import { create } from "zustand";

const useConversation = create((set, get) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => {
    console.log("Setting selected conversation:", selectedConversation);
    set({ selectedConversation, messages: [] }); // Clear messages when switching conversations
  },

  messages: [],
  setMessages: (messages) => {
    console.log("Setting messages:", messages?.length, "messages");
    set({ messages });
  },
  
  // Add message to the list (for real-time updates)
  addMessage: (message) => {
    const { messages } = get();
    console.log("Adding message to conversation:", message);
    
    // Check if message already exists to avoid duplicates
    const exists = messages.some(msg => msg._id === message._id);
    if (!exists) {
      set({ messages: [...messages, message] });
    }
  },
  
  // Clear all messages
  clearMessages: () => {
    console.log("Clearing all messages");
    set({ messages: [] });
  }
}));

export default useConversation;
