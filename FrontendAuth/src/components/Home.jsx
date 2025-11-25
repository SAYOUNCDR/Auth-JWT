import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function Home() {
  const { accessToken, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users-me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUserData(res.data.safeUser); 
      } catch {
        alert("Session expired. Please log in again.");
        logout();
        navigate("/login");
      }
    };
    fetchUser();
  }, [accessToken, logout, navigate]);

  if (!userData) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Hello, {userData.name} </h2>
      <p>Your email: {userData.email}</p>
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Home;
