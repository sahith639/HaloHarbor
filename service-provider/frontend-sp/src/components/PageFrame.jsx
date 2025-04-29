import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThisProSidebar from './SideBar';
import { ToastContainer } from 'react-toastify';

const PageFrame = ({ element }) => {
  const navigate = useNavigate();

  document.title = 'Serv Prov Agent';

  const handleLogout = () => {
    localStorage.removeItem("jwt_token_service");
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="h-full">
        <ThisProSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
        {/* Optional Logout Button */}
        

        {element}
        <ToastContainer />
      </div>
    </div>
  );
};

export default PageFrame;
