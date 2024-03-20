import React from 'react';
import ThisProSidebar from './SideBar.jsx';
import { useState, useEffect } from "react";
import { Box } from '@mui/system'
import { ToastContainer, toast } from 'react-toastify';

// Frames page with sidebar on the side of the actual content.
const PageFrame = ({ element }) => {

  document.title = 'User Agent';

  return (
    <div style={({ height: "100vh", display: "flex" })}>
      <ThisProSidebar/>
      <main>
      <Box m="5vh">
        {element}
        <ToastContainer></ToastContainer>
      </Box>
      </main>
    </div>
  );
};

export default PageFrame;