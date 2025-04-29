import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThisProSidebar from './SideBar.jsx';
import { ToastContainer } from 'react-toastify';

const PageFrame = ({ element }) => {
  const navigate = useNavigate();

  const logout = async (url) => {
    try {
      localStorage.removeItem("jwt_token");
      const response = await fetch(url);
      navigate("/login");
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="h-full">
        <ThisProSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
        {element}
        <ToastContainer />
      </div>
    </div>
  );
};

export default PageFrame;
