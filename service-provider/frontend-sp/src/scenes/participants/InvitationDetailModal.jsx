// import { styled } from '@mui/system';
// import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme, Box } from "@mui/material";
// import axios from 'axios'
// import MyModal from '../../components/MyModal';
// import MyModalContent from '../../components/MyModalContent';
// import config from '../../utils/config'

// const InvitationDetailModal = ({ isOpen, onClose, detailData, onListingUpdate }) => {
//   console.log("detail modal", detailData);

//   const deleteInvitation = async () => {
//     var response = await axios.delete(`${config.BACKEND_BASE_URL}/invitations/${detailData._id}`);
//     onListingUpdate();
//     onClose();
//   }

//   const containerStyle = {
//     maxWidth: '500px', // Set the maximum width to 'sm' (small)
//     backgroundColor: 'white', // Customize the background color if needed
//   };

//   const style = {
//     wordWrap: 'break-word', // This will make the URL wrap within the container
//     overflow: 'hidden',     // This will hide any overflow content
//   };

//   return (
//     <MyModal
//     open={isOpen}
//     onClose={onClose}
//     closeAfterTransition
//     >
//     <Fade in={isOpen}>
//       <MyModalContent>
//         <h2>Connection Invitation</h2>
//         <Box style={containerStyle}>
//           <Typography variant="contained" style={style}>
//             {detailData.url}
//           </Typography>
//         </Box>
//         <Box style={{padding: "10px"}}>
//           <Button variant="contained" onClick={deleteInvitation}>
//             Delete
//           </Button>
//           <Button variant="contained" onClick={onClose} color="secondary">
//           Close
//           </Button>
//         </Box>
//       </MyModalContent>
//     </Fade>
//   </MyModal>
//   )
// };

// export default InvitationDetailModal


import {
  Box,
  Button,
  Typography,
  Fade,
  TextField,
} from "@mui/material";
import axios from "axios";
import MyModal from "../../components/MyModal";
import MyModalContent from "../../components/MyModalContent";
import config from "../../utils/config";

const InvitationDetailModal = ({ isOpen, onClose, detailData, onListingUpdate }) => {
  const url = detailData.url || "";

  const deleteInvitation = async () => {
    try {
      const id = detailData._id || detailData.id;
      if (!id) {
        alert("Invitation ID is missing.");
        return;
      }

      await axios.delete(`${config.BACKEND_BASE_URL}/invitations/${id}`);
      onListingUpdate();
      onClose();
    } catch (error) {
      console.error("Error deleting invitation:", error);
      alert("❌ Failed to delete invitation.");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("✅ URL copied to clipboard!");
    } catch (err) {
      alert("❌ Failed to copy");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({ title: "Connection Invitation", text: "Join via this link:", url })
        .catch((err) => console.log("Share cancelled or failed:", err));
    } else {
      alert("Sharing not supported in this browser.");
    }
  };

  return (
    <MyModal open={isOpen} onClose={onClose} closeAfterTransition>
      <Fade in={isOpen}>
        <MyModalContent
          sx={{
            width: '100%',
            maxWidth: '600px',
            bgcolor: '#fff',
            borderRadius: 2,
            p: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Connection Invitation
          </Typography>

          <TextField
            multiline
            fullWidth
            value={url}
            variant="outlined"
            InputProps={{ readOnly: true }}
            sx={{
              backgroundColor: '#f9f9f9',
              fontSize: '0.9rem',
              wordBreak: 'break-word',
              mb: 3,
            }}
          />

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'flex-start',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Button variant="contained" onClick={handleCopy}>
              Copy
            </Button>
            <Button variant="outlined" onClick={handleShare}>
              Share
            </Button>
            <Button variant="contained" color="error" onClick={deleteInvitation}>
              Delete
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          </Box>
        </MyModalContent>
      </Fade>
    </MyModal>
  );
};

export default InvitationDetailModal;



