import React, { useEffect } from 'react'
import { Box, Stack } from '@mui/system'
// import { useStateValue } from '../../state/state'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, Typography, useTheme } from "@mui/material";
// import cachePull from '../../utils/cachePull'


const Profile = () => {
    const theme = useTheme();
    const colors = theme.palette;
    // const [, dispatch] = useStateValue()
    const navigate = useNavigate()


    return (
      <Box sx = {{color: "F8F8F8"}}>
        <Typography variant="h3" sx={{ color: "#000000"}}>
          My Data (integrations) and Credentials
        </Typography>
        <Typography variant="h5" sx={{ padding: "20px 30px 0 5px", color: "#000000"}}>
          Text here
        </Typography>
        <ul>
          <li>Text here...</li>
        </ul>
        <data />
      </Box>
    );
}

export default Profile
