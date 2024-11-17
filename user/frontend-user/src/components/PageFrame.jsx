// src/components/PageFrame.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThisProSidebar from './SideBar.jsx';
import { Box, Button } from '@mui/material';
import { ToastContainer } from 'react-toastify';

const PageFrame = ({ element }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("jwt_token"); // Clear token
    navigate("/login"); // Redirect to login
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <ThisProSidebar />
      <main>
        <Box m="5vh">
          <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
          {element}
          <ToastContainer />
        </Box>
      </main>
    </div>
  );
};

export default PageFrame;
