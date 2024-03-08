import React from 'react';
import ThisProSidebar from './SideBar.jsx';
import { useState, useEffect } from "react";
import { Box } from '@mui/system'

// Frames page with sidebar on the side of the actual content.
const PageFrame = ({ element }) => {
  useEffect(() => {
    // Your side effect code goes here
    console.log('Component did mount or update');

    // Cleanup function (optional)
    return () => {
      console.log('Component will unmount or before next update');
      // Perform cleanup here, such as clearing intervals or canceling network requests
    };
  }, []); // Dependency array (optional)

  return (
    <div style={({ height: "100vh", display: "flex" })}>
      <ThisProSidebar/>
      <main>
      <Box m="5vh">

        {/* TODO move these box containers to a separate component which gets used inside the element, so that multiple large cards can be on the same page. */}
        <Box gridColumn="span 16" gridRow="span 2" backgroundColor="#f3f4f8" sx={{borderRadius: '16px', boxShadow: 2}}> 
          <Box gridColumn="span 16" gridRow="span 10" sx={{ width:'100%', borderRadius:'16px', display:"flex", direction:"row", padding: "20px 20px 20px 20px" }}>
        {element}
        </Box>
        </Box>
        </Box>
      </main>
    </div>
  );
};

export default PageFrame;