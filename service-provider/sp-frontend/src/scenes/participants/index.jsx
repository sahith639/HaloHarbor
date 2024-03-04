import React, { useState, useEffect, useRef  } from 'react'
import { Box, Stack } from '@mui/system'
// import { useStateValue } from '../../state/state'
import { useNavigate } from 'react-router-dom'
import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme } from "@mui/material";
// import cachePull from '../../utils/cachePull'
import { NavLink } from "react-router-dom";
import config from '../../utils/config'
import axios from 'axios'
import { styled } from '@mui/system';
import MyModal from '../../components/MyModal';
import MyModalContent from '../../components/MyModalContent';
import MyCard from '../../components/MyCard';
import InvitationDetailModal from './InvitationDetailModal';


const ParticipantsPage = () => {
    const theme = useTheme();
    const colors = theme.palette;
    // const [, dispatch] = useStateValue()
    // const navigate = useNavigate()

    const [invitations, setInvitations] = useState([]);

    const [newInvitationFormOpen, setNewInvitationFormOpen] = useState(false);
    const [newInvitationFormData, setNewInvitationFormData] = useState({name: ""});

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState({});


    async function updateInvitationsList() {
      const response = await axios.get(`${config.BACKEND_BASE_URL}/invitations`);
      console.log("fetched invitations list:", response.data);
      setInvitations(response.data);
    }

    
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewInvitationFormData({
        ...newInvitationFormData,
        [name]: value,
      });
    };

    const handleSubmit = async () => {
      const response = await axios.post(`${config.BACKEND_BASE_URL}/invitations`, newInvitationFormData);

      // Close the modal
      setNewInvitationFormOpen(false);

      var newInvitation = response.data;
      setDetailData(newInvitation);
      setDetailModalOpen(true);

      updateInvitationsList();
    };

    const hasRan = useRef(false);
    useEffect(() => {
      if (!hasRan.current){
        hasRan.current = true;

        updateInvitationsList();
      }
  
      document.title = 'Connections';
      return () => {
        document.title = 'TODO title';
      };
    }, []);

    return (
      <Box sx = {{color: "F8F8F8"}}>
        <Typography variant="h3" sx={{ color: "#000000"}}>
          Connected Participants / Invitations
        </Typography>

        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column' }}>
          {invitations.map(item => {
            return (
              <MyCard key={item._id} onClick={() => { setDetailData(item); setDetailModalOpen(true) }} style={{cursor: 'pointer'}}>
                <CardContent>
                  {/* TODO click to bringup detail modal - then theres a list of toggles for each requested permission (which the serv prov provides/responds again from the first/initial connection message). Delete button here. */}
                  <Typography component="div">
                    {item.name} - {item.createdAt}
                  </Typography>
                </CardContent>
              </MyCard>
            );
          })}
        </div>

        <Button
          sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          variant="contained"
          onClick={() => setNewInvitationFormOpen(true)}>
            Create Invitation
        </Button>


        {/* Popup Modal */}
        <MyModal
          open={newInvitationFormOpen}
          onClose={() => setNewInvitationFormOpen(false)}
          closeAfterTransition
        >
          <Fade in={newInvitationFormOpen}>
            <MyModalContent>
              <h2>Make a Connection Invitation</h2>
              
              <TextField
                label="Invitation Name (for internal record keeping)"
                name="name"
                value={newInvitationFormData.name}
                onChange={handleInputChange}
                fullWidth
                autoComplete="off"
                margin="normal"
              />

              <Button variant="contained" onClick={handleSubmit}>
                Create
              </Button>
              <Button variant="contained" onClick={() => setNewInvitationFormOpen(false)} color="secondary">
                Cancel
              </Button>
            </MyModalContent>
          </Fade>
        </MyModal>

        <InvitationDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} detailData={detailData} onListingUpdate={updateInvitationsList} />

      </Box>
    );
}

export default ParticipantsPage
