import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const setAuth = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    };
    
    return (
        <AuthContext.Provider value={{user, accessToken, setAuth, logout}}>
            {children}
        </AuthContext.Provider>
    )
};


export const useAuth = () => useContext(AuthContext);