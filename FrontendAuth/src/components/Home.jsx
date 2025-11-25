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

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-slate-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 mb-2">
                Hello, {userData.name}
              </h2>
              <p className="text-slate-600">{userData.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Logout
            </button>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Account Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">User ID</span>
                <span className="text-slate-900 font-mono text-sm">
                  {userData._id}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Email</span>
                <span className="text-slate-900">{userData.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Name</span>
                <span className="text-slate-900">{userData.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
