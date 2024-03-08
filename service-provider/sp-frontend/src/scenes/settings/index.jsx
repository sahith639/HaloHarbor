import React, { useEffect } from 'react'
import { Box, Stack } from '@mui/system'
// import { useStateValue } from '../../state/state'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, Typography, useTheme } from "@mui/material";
import SectionCard from '../../components/SectionCard';
import DataMenu from '../../components/DataMenu';
// import cachePull from '../../utils/cachePull'


const SettingsPage = () => {
    const theme = useTheme();
    const colors = theme.palette;
    // const [, dispatch] = useStateValue()
    const navigate = useNavigate()


    return (
      <SectionCard>
        <Typography variant="h3" sx={{ color: "#000000"}}>
          Data Pulling
        </Typography>

        <DataMenu></DataMenu>

        <Box>
          <Button
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            variant="contained"
            onClick={() => {}}>
              Save Changes
          </Button>
          <Button
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            variant="contained"
            onClick={() => {}}>
              Revert Changes
          </Button>
        </Box>
      </SectionCard>
    );
}

export default SettingsPage
