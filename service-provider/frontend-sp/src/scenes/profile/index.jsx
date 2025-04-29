import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import { DataGrid } from '@mui/x-data-grid';
import SectionCard from '../../components/SectionCard';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [data, setData] = useState([]);

  const updateCollectedDataList = async () => {
    try {
      const response = await axios.get(`${config.BACKEND_BASE_URL}/collected-data`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const downloadJSONAsFile = (jsonData, filename) => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const download = () => {
    downloadJSONAsFile(data, 'sp-data.json');
  };

  const hasRan = useRef(false);
  useEffect(() => {
    if (!hasRan.current) {
      hasRan.current = true;
      updateCollectedDataList();
    }
  }, []);

  const formatDate = (epochSeconds) =>
    new Date(epochSeconds * 1000).toLocaleString();

  const columns = [
    { field: 'datetime', headerName: 'Date Time', flex: 1 },
    { field: 'userId', headerName: 'Participant ID', flex: 1 },
    { field: 'dataSourceId', headerName: 'Data Source', flex: 1 },
    { field: 'dataItemId', headerName: 'Data Item', flex: 1 },
    { field: 'dataStr', headerName: 'Data', flex: 2 },
  ];

  const rows = data.map((item) => ({
    ...item,
    datetime: formatDate(item.epoch_seconds),
    userId: item.participantId?.substring(0, 8),
    dataStr: JSON.stringify(item.data, null, 2),
    id: item._id,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
      <div className="max-w-7xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl p-6 sm:p-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center">
          📊 Collected Data
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          View and download all participant data shared with your system.
        </p>

        <div className="w-full overflow-x-auto mb-6">
          <div className="h-[500px] min-w-[800px]">
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              localeText={{
                noRowsLabel: '📭 No data available',
              }}
              sx={{
                border: 0,
                borderRadius: '10px',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#e0e7ff',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-virtualScroller': {
                  minHeight: '80px',
                },
              }}
            />
          </div>
        </div>

        <button
          onClick={download}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
        >
          ⬇️ Download Data Dump
        </button>
      </div>
    </div>
  );
};

export default Profile;
