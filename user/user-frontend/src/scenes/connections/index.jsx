import React, { useState, useEffect, useRef  } from 'react'
import { Box, Stack } from '@mui/system'
// import { useStateValue } from '../../state/state'
import { useNavigate } from 'react-router-dom'
import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme, ButtonBase  } from "@mui/material";
// import cachePull from '../../utils/cachePull'
import { NavLink } from "react-router-dom";
import config from '../../utils/config'
import axios from 'axios'
import { styled } from '@mui/system';
import ServProvDetailModal from './ServProvDetailModal';
import MyModal from '../../components/MyModal';
import MyModalContent from '../../components/MyModalContent';
import MyCard from '../../components/MyCard';


const ConnectionsPage = () => {
    const theme = useTheme();
    const colors = theme.palette;
    // const [, dispatch] = useStateValue()
    // const navigate = useNavigate()

    const [servProvs, setServProvs] = useState([]);

    const [newInvitationModalOpen, setNewInvitationModalOpen] = useState(false);
    const [invitationUrl, setInvitationUrl] = useState('');

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState({});

    async function updateServProvsList() {
      const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/service-providers`);
      console.log("fetched serv providers list:", response.data);
      setServProvs(response.data);
    }

    const handleSubmit = async () => {
      const uniqueId = Date.now();

      const formData = new FormData();
      formData.append('invitationUrl', invitationUrl);

      var response = await axios.post(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${uniqueId}`, formData);

      // Close the modal:
      setNewInvitationModalOpen(false);

      var newServProv = response.data;
      setDetailData(newServProv);
      setDetailModalOpen(true);

      updateServProvsList();
    };

    const handleTextChange = (e) => {
      setInvitationUrl(e.target.value);
    };

    const hasRan = useRef(false);
    useEffect(() => {
      if (!hasRan.current){
        hasRan.current = true;

        updateServProvsList();
      }
  
      document.title = 'Connections';
      return () => {
        document.title = 'TODO title';
      };
    }, []);

    return (
            <Box sx = {{color: "F8F8F8"}}>
              <Typography variant="h3" sx={{ color: "#000000"}}>
                Connected Service Providers
              </Typography>
              {/* {servProvs.map(servProv => (
                <li key={servProv._id}>{servProv.connId}</li>
              ))} */}
              
              <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column' }}>
              {servProvs.map(item => {
                  return (
                    <MyCard key={item._id} onClick={() => { setDetailData(item); setDetailModalOpen(true) }} style={{cursor: 'pointer'}}>
                      <CardContent>
                        {/* TODO click to bringup detail modal - then theres a list of toggles for each requested permission (which the serv prov provides/responds again from the first/initial connection message). Delete button here. */}
                        <Typography component="div">
                          [Serv Prov Name Here]
                        </Typography>
                        <Typography color="text.secondary">[description (provided by service provider) here - responded from serv prov on the first connection message/test]</Typography>
                      </CardContent>
                    </MyCard>
                  );
                })}
              </div>
              
              
              <Button
                sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                variant="contained"
                onClick={() => setNewInvitationModalOpen(true)}>
                  Add Service Provider
              </Button>


        {/* Popup Modal */}
        <MyModal
          open={newInvitationModalOpen}
          onClose={() => setNewInvitationModalOpen(false)}
          closeAfterTransition
        >
          <Fade in={newInvitationModalOpen}>
            <MyModalContent>
              <h2>Add a Service Provider</h2>
              
              <TextField
                label="Invitation URL"
                name="invitation-url"
                value={invitationUrl}
                onChange={handleTextChange}
                fullWidth
                autoComplete="off"
                margin="normal"
              />

              <Button variant="contained" onClick={handleSubmit}>
                Add
              </Button>
              <Button variant="contained" onClick={() => setNewInvitationModalOpen(false)} color="secondary">
                Cancel
              </Button>
            </MyModalContent>
          </Fade>
        </MyModal>


        <ServProvDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} servProvData={detailData} onServProvsUpdate={updateServProvsList} />
      </Box>
    );
}

export default ConnectionsPage
