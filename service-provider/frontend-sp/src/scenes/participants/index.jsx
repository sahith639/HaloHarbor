import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Fade,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import config from '../../utils/config';
import SectionCard from '../../components/SectionCard';
import MyModal from '../../components/MyModal';
import MyModalContent from '../../components/MyModalContent';
import InvitationDetailModal from './InvitationDetailModal';
import ParticipationDetailModal from './ParticipantDetailModal';

const ParticipantsPage = () => {
  const theme = useTheme();

  const [invitations, setInvitations] = useState({});
  const [participants, setParticipants] = useState([]);
  const [newInvitationFormOpen, setNewInvitationFormOpen] = useState(false);
  const [newInvitationFormData, setNewInvitationFormData] = useState({ name: '' });
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [participantModalOpen, setParticipantModalOpen] = useState(false);
  const [participantDetailData, setParticipantDetailData] = useState({});
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    updateInvitationsList();
    document.title = 'Connections';
  }, []);

  const updateInvitationsList = async () => {
    const invitationsRes = await axios.get(`${config.BACKEND_BASE_URL}/invitations`);
    const invitationMap = {};
    for (const inv of invitationsRes.data) {
      const key = inv.invitationKey ?? "[not tracked]";
      invitationMap[key] = inv;
    }
    setInvitations(invitationMap);

    const participantsRes = await axios.get(`${config.BACKEND_BASE_URL}/participants`);
    const processed = participantsRes.data.map((p, idx) => ({ ...p, number: idx + 1 }));
    setParticipants(processed);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvitationFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const res = await axios.post(`${config.BACKEND_BASE_URL}/invitations`, newInvitationFormData);
    setNewInvitationFormOpen(false);
    setDetailData(res.data);
    setInvitationModalOpen(true);
    updateInvitationsList();
  };

  const epochSecondsToDateTimeString = (epochSeconds) =>
    new Date(epochSeconds * 1000).toLocaleString();

  const filteredInvitations = Object.entries(invitations).filter(([key, item]) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'createdAtStr', headerName: 'Join Date Time', flex: 1.5 },
    { field: 'invitationName', headerName: 'Invitation Used', flex: 1.5 },
  ];

  const rows = participants.map((p) => ({
    ...p,
    id: p._id.substring(0, 8),
    createdAtStr: epochSecondsToDateTimeString(p.createdAt),
    invitationName: invitations[p.invitationKey]?.name || "[unknown invitation]",
  }));

  return (
    <div>
      <SectionCard>
        <Typography variant="h4" fontWeight="bold" color="black" mb={1}>
          Connected Participants
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          View all participants currently connected to your system.
        </Typography>

        <Box sx={{ height: 420, width: '100%', backgroundColor: '#ffffff', borderRadius: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            onRowClick={(p) => {
              setParticipantDetailData(p.row);
              setParticipantModalOpen(true);
            }}
            disableSelectionOnClick
            rowSelectionModel={[]}
            sx={{
              border: 'none',
              backgroundColor: '#ffffff',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f0f4ff',
                color: '#000',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-cell': {
                color: '#000',
              },
              '& .MuiTablePagination-root': {
                backgroundColor: '#fff',
              },
            }}
          />
        </Box>

        <ParticipationDetailModal
          isOpen={participantModalOpen}
          onClose={() => setParticipantModalOpen(false)}
          detailData={participantDetailData}
          onListingUpdate={updateInvitationsList}
        />
      </SectionCard>

      <SectionCard>
        <Typography variant="h4" fontWeight="bold" color="black" mb={1}>
          Connection Invitations
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Create and manage connection invites.
        </Typography>

        <TextField
          placeholder="Search by invitation name..."
          variant="outlined"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ mb: 2, backgroundColor: '#ffffff' }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredInvitations.map(([key, item]) => (
            <Box
              key={key}
              onClick={() => {
                setDetailData(item);
                setInvitationModalOpen(true);
              }}
              sx={{
                backgroundColor: '#ffffff',
                color: '#000',
                borderRadius: 1,
                p: 1.5,
                cursor: 'pointer',
                boxShadow: 1,
                border: '1px solid #e0e0e0',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              <Typography fontWeight="bold">{item.name}</Typography>
              <Typography fontStyle="italic" fontSize="0.9rem">
                (created {epochSecondsToDateTimeString(item.createdAt)})
              </Typography>
            </Box>
          ))}
        </Box>

        <Button
  onClick={() => setNewInvitationFormOpen(true)}
  sx={{
    mt: 2,
    backgroundColor: '#3366ee',
    color: '#fff',
    fontWeight: 'bold',
    px: 3,
    py: 1.2,
    borderRadius: '12px',
    textTransform: 'none',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      backgroundColor: '#295bcc',
    },
  }}
>
  📩 Create Invitation
</Button>


        <MyModal open={newInvitationFormOpen} onClose={() => setNewInvitationFormOpen(false)}>
          <Fade in={newInvitationFormOpen}>
            <MyModalContent>
              <Typography variant="h5" fontWeight="bold">Make a Connection Invitation</Typography>
              <TextField
                label="Invitation Name (for internal record keeping)"
                name="name"
                value={newInvitationFormData.name}
                onChange={handleInputChange}
                fullWidth
                autoComplete="off"
                margin="normal"
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" onClick={handleSubmit}>
                  Create
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setNewInvitationFormOpen(false)}>
                  Cancel
                </Button>
              </Box>
            </MyModalContent>
          </Fade>
        </MyModal>

        <InvitationDetailModal
          isOpen={invitationModalOpen}
          onClose={() => setInvitationModalOpen(false)}
          detailData={detailData}
          onListingUpdate={updateInvitationsList}
        />
      </SectionCard>
    </div>
  );
};

export default ParticipantsPage;
