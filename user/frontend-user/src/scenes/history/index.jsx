import { useState, useEffect, useRef } from 'react'
import { Box, Stack } from '@mui/system'
// import { useStateValue } from '../../state/state'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, Typography, useTheme } from "@mui/material";
// import cachePull from '../../utils/cachePull'
import SectionCard from '../../components/SectionCard';
import SpotifyIntegrateModal from '../../components/SpotifyIntegrateModal';
import ObtainBCGovCredentialModal from '../../components/ObtainBCGovCredentialModal';
import axios from 'axios'
import config from '../../utils/config'
import BCGovCredentialDetailModal from '../../components/BCGovCredentialDetailModal';
import { DataGrid } from "@mui/x-data-grid";
import { jwtDecode } from "jwt-decode";
import Header from '../../commpont/Header';



const HistoryPage = () => {
    const theme = useTheme();
    
    const [data, setData] = useState([]);
    const [userId, setUserId] = useState('');  // Store userId in the component's state

    useEffect(() => {
      // Get the JWT token from localStorage
      const token = localStorage.getItem("jwt_token");

      // If token exists, decode it to get the userId
      if (token) {
        const decoded = jwtDecode(token);  // Decode the JWT token
        setUserId(decoded.sub);  // Set the userId from the decoded token
      } else {
        toast.error("No token found. Please log in again.");
      }
    }, []);

    async function updateCollectedDataList() {
      const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/shared-data`);
      console.log("fetched data:", response.data);
      setData(response.data);
    }


    function downloadJSONAsFile(jsonData, filename) {
      const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  }

    async function download() {
      downloadJSONAsFile(data, "user-data.json");
    }


    const hasRan = useRef(false);
    useEffect(() => {
      if (!hasRan.current){
        hasRan.current = true;

        updateCollectedDataList();
      }
    }, []);


    function epochSecondsToDateTimeString(epochSeconds) {
      return new Date(epochSeconds * 1000).toLocaleString();
    }


    const columns = [  
      { field: 'datetime', headerName: 'Date Time', flex: 1 },
      { field: 'servProvId', headerName: 'Service Provider ID', flex: 1 },
      { field: 'dataSourceId', headerName: 'Data Source', flex: 1 },
      { field: 'dataItemId', headerName: 'Data Item', flex: 1 },
      { field: 'dataStr', headerName: 'Data', flex: 2 },  
      ];
  
    const rows = data.map((dataItem, idx) => {
      const r = {
        ...dataItem,
        datetime: epochSecondsToDateTimeString(dataItem.epoch_seconds),
        servProvId: dataItem.servProvId.substring(0, 8),
        dataStr: JSON.stringify(dataItem.data, null, 2),
        id: dataItem._id,
      };
      console.log(r);
      return r;
    });
    

    return (
      <div style={{display:'block'}}>
      <Header></Header>
     
        <SectionCard>
        <h3 style={{color:'#fff'}}>
            Shared Data / Activity
          </h3>
          
          <Box sx={{
    height: '500px',
    width: '800px',
    maxWidth: 1500,
    '& .MuiDataGrid-root': {
      backgroundColor: '#ffffff', // Table rows background
      color: '#000000', // Table text color
      border: '1px solid #ccc',
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#f5f5f5', // Header background
      color: '#000', // Header text color
      fontSize: '16px', // Header font size
      fontWeight: 'bold', // Optional: bold header
    },
    '& .MuiDataGrid-footerContainer': {
      backgroundColor: '#f5f5f5', // Footer background (pagination)
      color: '#000', // Footer text color
    },
    '& .MuiDataGrid-row': {
      backgroundColor: '#ffffff', // Row background color
    },
    '& .MuiDataGrid-row:hover': {
      backgroundColor: '#f0f0f0', // Row hover effect
    },
    '& .MuiDataGrid-cell': {
      color: '#000000', // Cell text color
    },
  }}>
            <DataGrid 
            rows={rows} 
            columns={columns}
            disableSelectionOnClick
            rowSelectionModel={[]} 
              />
          </Box>

          <Button variant="contained" onClick={download}>
            Download Data Dump
          </Button>
          

          {/* TODO put mock Google Maps and Metriport buttons as well */}
        </SectionCard>
      </div>
    );
}

export default HistoryPage
