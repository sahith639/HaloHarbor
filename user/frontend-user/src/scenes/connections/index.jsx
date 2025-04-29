// ✅ Updated ConnectionsPage (index.jsx) using Tailwind

import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import config from '../../utils/config';
import ServProvDetailModal from './ServProvDetailModal';
import MyModal from '../../components/MyModal';
import MyModalContent from '../../components/MyModalContent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConnectionsPage = () => {
  const [servProvs, setServProvs] = useState([]);
  const [newInvitationModalOpen, setNewInvitationModalOpen] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.sub);
    } else {
      toast.error('No token found. Please log in again.');
    }
  }, []);

  const updateServProvsList = async () => {
    const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/service-providers?userid=${userId}`);
    setServProvs(response.data);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('invitationUrl', invitationUrl);
    const response = await axios.post(`${config.USER_CONTROLLER_BASE_URL}/service-providers?userid=${userId}`, formData);

    setNewInvitationModalOpen(false);
    const newServProv = response.data;
    setDetailData(newServProv);
    setDetailModalOpen(true);
    updateServProvsList();
    toast.success('Added Service Provider');
  };

  const handleTextChange = (e) => {
    setInvitationUrl(e.target.value);
  };

  const hasRan = useRef(false);
  useEffect(() => {
    if (!hasRan.current) {
      hasRan.current = true;
      updateServProvsList();
    }
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4 text-white">Connected Service Providers</h2>

      <div className="flex flex-col gap-4 mb-6">
        {servProvs.map((item) => (
          <div
            key={item._id}
            onClick={() => {
              setDetailData(item);
              setDetailModalOpen(true);
            }}
            className="bg-gray-900 hover:bg-gray-800 cursor-pointer p-4 rounded-lg shadow-md transition duration-200"
          >
            <h3 className="text-lg font-semibold">{item.bannerData.name} <span className="text-sm text-gray-400">(ID: {item.connId.substring(0, 8)})</span></h3>
            <p className="text-sm text-gray-300">{item.bannerData.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setNewInvitationModalOpen(true)}
        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md"
      >
        Add Service Provider
      </button>

      {/* Modal to Add Service Provider */}
      <MyModal open={newInvitationModalOpen} onClose={() => setNewInvitationModalOpen(false)}>
        <MyModalContent>
          <h2 className="text-xl font-bold mb-4">Add a Service Provider</h2>

          <input
            type="text"
            placeholder="Invitation URL"
            value={invitationUrl}
            onChange={handleTextChange}
            className="w-full p-2 mb-4 rounded border border-gray-300 text-black"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Add
            </button>
            <button
              onClick={() => setNewInvitationModalOpen(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </MyModalContent>
      </MyModal>

      <ServProvDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        summaryData={detailData}
        onServProvsUpdate={updateServProvsList}
      />

      <ToastContainer />
    </div>
  );
};

export default ConnectionsPage;