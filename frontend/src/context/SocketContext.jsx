import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const { authUser, encryptionKeys } = useAuthContext();

  useEffect(() => {
    if (authUser && encryptionKeys) {
      console.log("Initializing socket connection with user:", authUser._id);
      
      // Connect to localhost in development, production URL in production
      const socketUrl = import.meta.env.PROD 
        ? "https://react-chat-app-1-54y0.onrender.com/"
        : "http://localhost:5000";
      
      const newSocket = io(socketUrl, {
        query: {
          userId: authUser._id,
        },
        transports: ['websocket', 'polling'], // Ensure both transports are available
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
      
      setSocket(newSocket);

      // Listen for online users updates
      newSocket.on("getOnlineUsers", (users) => {
        console.log("Online users updated:", users);
        setOnlineUsers(users);
      });

      // Handle connection errors
      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      // Handle successful connection
      newSocket.on("connect", () => {
        console.log("Socket connected successfully with ID:", newSocket.id);
      });

      // Handle disconnection
      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      return () => {
        console.log("Cleaning up socket connection");
        newSocket.close();
      };
    } else {
      if (socket) {
        console.log("User not authenticated, closing socket");
        socket.close();
        setSocket(null);
        setOnlineUsers([]);
      }
    }
  }, [authUser, encryptionKeys]); // Added encryptionKeys dependency

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
