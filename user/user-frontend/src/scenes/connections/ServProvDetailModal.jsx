import { styled } from '@mui/system';
import { TextField , Backdrop, Fade, Modal, Card, CardContent, Button, IconButton, Typography, useTheme } from "@mui/material";
import axios from 'axios'
import MyModal from '../../components/MyModal';
import MyModalContent from '../../components/MyModalContent';
import config from '../../utils/config'
import DataMenu from '../../components/DataMenu';

const ServProvDetailModal = ({ isOpen, onClose, servProvData, onServProvsUpdate }) => {
  console.log("detail modal", servProvData);

  const deleteServProv = async () => {
    var response = await axios.delete(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${servProvData._id}`);
    onServProvsUpdate();
    onClose();
  }

  return (
    <MyModal
    open={isOpen}
    onClose={onClose}
    closeAfterTransition
    >
    <Fade in={isOpen}>
      <MyModalContent>
        <h2>Service Provider Connection</h2>

        <DataMenu></DataMenu>

        <Button variant="contained">
          Save Changes
        </Button>
        <Button variant="contained" onClick={deleteServProv}>
          Delete
        </Button>
        <Button variant="contained" onClick={onClose} color="secondary">
          Cancel
        </Button>
      </MyModalContent>
    </Fade>
  </MyModal>
  )
};

export default ServProvDetailModal
