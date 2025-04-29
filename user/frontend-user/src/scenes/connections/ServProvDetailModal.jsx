import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import { toast } from 'react-toastify';
import MyModal from '../../components/MyModal';
import DataMenu from '../../components/DataMenu';
import ObtainBCGovCredentialModal from '../../components/ObtainBCGovCredentialModal';
import BCGovCredentialDetailModal from '../../components/BCGovCredentialDetailModal';

const ServProvDetailModal = ({ isOpen, onClose, summaryData, onServProvsUpdate }) => {
  const [detail, setDetail] = useState({ bannerData: { name: 'Loading...', desc: 'Loading...' } });
  const [dataMenuSelection, setDataMenuSelection] = useState({});
  const [bcGovCredentialModalOpen, setBcGovCredentialModalOpen] = useState(false);
  const [bcGovCredentialDetailModalOpen, setBcGovCredentialDetailModalOpen] = useState(false);
  const [bcGovCredentialDetailModalData, setBcGovCredentialDetailModalData] = useState({});
  const [dataSources, setDataSources] = useState({});

  const updateCredListing = async () => {
    await updateServProvDetail();
  };

  const updateServProvDetail = async () => {
    const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${summaryData._id}`);
    setDetail(response.data);
  };

  const updateServProvDataMenuDetail = async () => {
    const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${summaryData._id}/data-menu`);
    setDataMenuSelection(response.data.dataMenu);
  };

  const updateDataSources = async () => {
    const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/data-sources`);
    setDataSources(response.data);
  };

  const saveChanges = async () => {
    const response = await axios.put(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${summaryData._id}/data-menu`, dataMenuSelection);
    toast.success(' Saved Data Settings');
    const itemsShared = response.data.itemsSharedCount;
    if (itemsShared > 0) toast.success(`🚀 Shared ${itemsShared} data items`);
  };

  const verifyCredentials = async () => {
    const response = await axios.post(`${config.USER_CONTROLLER_BASE_URL}/verify?presentationExchangeId=${summaryData.presentationExchangeId}&credId=${detail.relevantCredential}`);
    updateServProvDetail();
    if (response.data === true) toast.success('🔐 Verified with Service Provider');
  };

  const deleteServProv = async () => {
    await axios.delete(`${config.USER_CONTROLLER_BASE_URL}/service-providers/${summaryData._id}`);
    onServProvsUpdate();
    onClose();
  };

  const hasRan = useRef(false);
  useEffect(() => {
    if (isOpen && !hasRan.current) {
      hasRan.current = true;
      updateServProvDetail();
      updateServProvDataMenuDetail();
      updateDataSources();
    }
  }, [isOpen]);

  return (
    <MyModal open={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full px-6 py-8 sm:p-10 max-w-md sm:max-w-lg md:max-w-xl mx-auto border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 flex justify-center items-center gap-2">
            🔗 Service Provider Connection
          </h2>
          <h3 className="text-xl sm:text-2xl text-indigo-700 font-semibold mt-2">
            {detail.bannerData.name}
          </h3>
        </div>

        <hr className="my-4 border-gray-300" />

        {summaryData.presentationExchangeId === '' ? (
          <p className="text-green-600 font-medium text-center text-lg mb-4">✅ Credential Verified!</p>
        ) : (
          <div className="mb-4 text-center space-y-4">
            {detail.verifiedWith ? (
              <p className="text-green-600 font-semibold text-lg">✅ Credential Verified!</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">⚠️ Credential Required</p>

                {!detail.relevantCredential ? (
                  <button
                    onClick={() => setBcGovCredentialModalOpen(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    ➕ Issue Demo Credential
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setBcGovCredentialDetailModalData();
                      setBcGovCredentialDetailModalOpen(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    👁️ View Credential
                  </button>
                )}

                {detail.relevantCredential && (
                  <button
                    onClick={verifyCredentials}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    🔐 Verify with Service Provider
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <div className="my-4">
          <DataMenu
            isUserView={true}
            dataSources={dataSources}
            dataMenuSelection={dataMenuSelection}
            setDataMenuSelection={setDataMenuSelection}
            refreshDataSources={updateDataSources}
          />
        </div>

        <button
          onClick={saveChanges}
          disabled={!detail.verifiedWith}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-md shadow transition flex justify-center items-center gap-2
            ${detail.verifiedWith
              ? 'bg-violet-600 hover:bg-violet-700 text-black'
              : 'bg-violet-200 text-gray-500 cursor-not-allowed'
            }`}
        >
          💾 Save Data Sharing Settings
        </button>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
          <button
            onClick={deleteServProv}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow"
          >
            🗑️ Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
          >
            ❌ Close
          </button>
        </div>

        <ObtainBCGovCredentialModal
          isOpen={bcGovCredentialModalOpen}
          onClose={() => setBcGovCredentialModalOpen(false)}
          onListingUpdate={updateCredListing}
          setCretModalOpen={() => setBcGovCredentialDetailModalOpen(true)}
        />
        <BCGovCredentialDetailModal
          isOpen={bcGovCredentialDetailModalOpen}
          onClose={() => setBcGovCredentialDetailModalOpen(false)}
          onListingUpdate={updateCredListing}
        />
      </div>
    </MyModal>
  );
};

export default ServProvDetailModal;
