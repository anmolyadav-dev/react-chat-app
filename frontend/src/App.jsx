import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import Login from "./pages/login/Login.jsx";
import SignUp from "./pages/signUp/SignUp.jsx";
import Home from "./pages/home/Home.jsx";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext.jsx";
import { testEncryption } from "./utils/encryptionTest.js";

function App() {
  const { authUser } = useAuthContext();
  
  // Run encryption test in development
  if (import.meta.env.DEV) {
    useState(() => {
      setTimeout(testEncryption, 2000);
    });
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Routes>
          <Route
            path="/"
            element={!authUser ? <Navigate to="/login" /> : <Home />}
          />
          <Route
            path="/signup"
            element={authUser ? <Navigate to="/" /> : <SignUp />}
          />
          <Route
            path="/login"
            element={authUser ? <Navigate to="/" /> : <Login />}
          />
        </Routes>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
