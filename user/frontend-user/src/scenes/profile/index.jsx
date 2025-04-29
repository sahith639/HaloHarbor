import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from "@mui/material";
import SpotifyIntegrateModal from '../../components/SpotifyIntegrateModal';
import ObtainBCGovCredentialModal from '../../components/ObtainBCGovCredentialModal';
import BCGovCredentialDetailModal from '../../components/BCGovCredentialDetailModal';
import ExampleDataIntegrateModal from '../../components/ExampleDataIntegrateModal';
import GoogleLogin from '../../components/GoogleLogin';
import LocationComponent from '../../components/LocationComponent';
import YtData from '../../components/ytdata';
import axios from 'axios';
import config from '../../utils/config';
import { ToastContainer, toast } from 'react-toastify';

const Profile = () => {
  const [dataSourceModalKey, setDataSourceModalKey] = useState(null);
  const [bcGovCredentialModalOpen, setBcGovCredentialModalOpen] = useState(false);
  const [bcGovCredentialDetailModalOpen, setBcGovCredentialDetailModalOpen] = useState(false);
  const [dataSources, setDataSources] = useState({});
  const [credentials, setCredentials] = useState({});
  const hasRan = useRef(false);

  async function updateDataSources() {
    const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/data-sources`);
    setDataSources(response.data);
  }

  async function updateCredentials() {
    const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/credentials`);
    setCredentials(response.data);
  }

  async function SaveAccessToken(code) {
    const newDataSource = {
      dataSourceId: "spotify",
      code: code,
      redirectUri: "http://" + window.location.host + '/profile'
    };
    await axios.post(`${config.USER_CONTROLLER_BASE_URL}/data-sources`, newDataSource);
    toast.success("Connected to Spotify");
    updateDataSources();
  }

  useEffect(() => {
    if (!hasRan.current) {
      hasRan.current = true;
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) SaveAccessToken(code);
      updateDataSources();
      updateCredentials();
    }
  }, []);

  return (
    <div className="p-6 space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Source Integrations</h2>
        <div className="space-y-3">
          <GoogleLogin />
          <LocationComponent />
          <YtData />

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setDataSourceModalKey("spotify")} variant="contained" color={"spotify" in dataSources ? "success" : "inherit"}>
              Spotify
            </Button>
            <Button onClick={() => setDataSourceModalKey("test-example")} variant="contained" color={"test-example" in dataSources ? "success" : "inherit"}>
              Example Data Source
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Credentials</h2>
        <div className="flex gap-2">
          {(Object.keys(credentials).length > 0) ? (
            <Button variant="contained" onClick={() => setBcGovCredentialDetailModalOpen(true)} color="success">Demo Credential</Button>
          ) : (
            <Button variant="contained" onClick={() => setBcGovCredentialModalOpen(true)} style={{ color: '#555', backgroundColor: '#eee' }}>Demo Credential</Button>
          )}
        </div>
      </div>

      <SpotifyIntegrateModal isIntegrated={"spotify" in dataSources} isOpen={dataSourceModalKey === "spotify"} onClose={() => setDataSourceModalKey(null)} onListingUpdate={updateDataSources} />
      <ExampleDataIntegrateModal isIntegrated={"test-example" in dataSources} isOpen={dataSourceModalKey === "test-example"} onClose={() => setDataSourceModalKey(null)} onListingUpdate={updateDataSources} />
      <ObtainBCGovCredentialModal isOpen={bcGovCredentialModalOpen} onClose={() => setBcGovCredentialModalOpen(false)} onListingUpdate={updateCredentials} setCretModalOpen={() => setBcGovCredentialDetailModalOpen(true)} />
      <BCGovCredentialDetailModal isOpen={bcGovCredentialDetailModalOpen} onClose={() => setBcGovCredentialDetailModalOpen(false)} onListingUpdate={updateCredentials} />

      <ToastContainer />
    </div>
  );
};

export default Profile;