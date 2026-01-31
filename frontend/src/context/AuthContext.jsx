import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("chat-user")) || null
  );
  
  // Store encryption keys in localStorage for persistence
  const [encryptionKeys, setEncryptionKeys] = useState(
    JSON.parse(localStorage.getItem("encryption-keys")) || null
  );

  const updateUser = (userData) => {
    setAuthUser(userData);
    localStorage.setItem("chat-user", JSON.stringify(userData));
    
    // Store encryption keys separately and immediately
    if (userData?.encryptionKeys) {
      console.log("Setting encryption keys in AuthContext:", userData.encryptionKeys);
      setEncryptionKeys(userData.encryptionKeys);
      localStorage.setItem("encryption-keys", JSON.stringify(userData.encryptionKeys));
    }
  };

  const clearUser = () => {
    setAuthUser(null);
    setEncryptionKeys(null);
    localStorage.removeItem("chat-user");
    localStorage.removeItem("encryption-keys");
  };

  // Debug: Log encryption keys state changes
  useEffect(() => {
    console.log("AuthContext encryptionKeys updated:", encryptionKeys);
  }, [encryptionKeys]);

  return (
    <AuthContext.Provider value={{ 
      authUser, 
      setAuthUser: updateUser,
      clearUser,
      encryptionKeys 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
