import React from 'react';
import ThisProSidebar from './SideBar.jsx';
import { useState, useEffect } from "react";
import { Box } from '@mui/system'
import { FormLabel, Select, MenuItem, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const DataItem = ({dataKey, title}) => {
  return (
    <FormControl component="fieldset" variant="standard">
      <Box>
        <FormControlLabel control={<Switch />} label={title} />
        <Select
          labelId="demo-simple-select-label"
          value={1}
          label="Age"
          // onChange={handleChange}
        >
          <MenuItem value={1}>Once</MenuItem>
          <MenuItem value={2}>Daily</MenuItem>
          <MenuItem value={2}>Weekly</MenuItem>
          <MenuItem value={3}>Monthly</MenuItem>
        </Select>
      </Box>
    </FormControl>
  );
};

const DataMenu = () => {
  return (
    <Box sx={{paddingBottom: "20px"}}>
      
      <Typography variant="h6">Spotify</Typography>
      <FormGroup>
        <DataItem dataKey="spotify:fav-artist" title="Most Played Artist"></DataItem>
        <DataItem dataKey="spotify:fav-artist" title="Other 1"></DataItem>
        <DataItem dataKey="spotify:fav-artist" title="Other 2"></DataItem>
      </FormGroup>

      <Typography variant="h6" paddingTop="20px">Google Maps</Typography>
      <FormGroup>
        <DataItem dataKey="spotify:fav-artist" title="Zip Code"></DataItem>
      </FormGroup>
    </Box>
  );
};

export default DataMenu;
