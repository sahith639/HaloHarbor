// import { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import config from '../../utils/config';
// import { jwtDecode } from 'jwt-decode';
// import { DataGrid } from '@mui/x-data-grid';
// import { toast } from 'react-toastify';

// const HistoryPage = () => {
//   const [data, setData] = useState([]);
//   const [userId, setUserId] = useState('');

//   useEffect(() => {
//     const token = localStorage.getItem('jwt_token');
//     if (token) {
//       const decoded = jwtDecode(token);
//       setUserId(decoded.sub);
//     } else {
//       toast.error('No token found. Please log in again.');
//     }
//   }, []);

//   const hasRan = useRef(false);
//   useEffect(() => {
//     if (!hasRan.current) {
//       hasRan.current = true;
//       updateCollectedDataList();
//     }
//   }, []);

//   const updateCollectedDataList = async () => {
//     const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/shared-data`);
//     setData(response.data);
//   };

//   const epochSecondsToDateTimeString = (epochSeconds) => {
//     return new Date(epochSeconds * 1000).toLocaleString();
//   };

//   const columns = [
//     { field: 'datetime', headerName: 'Date Time', flex: 1 },
//     { field: 'servProvId', headerName: 'Service Provider ID', flex: 1 },
//     { field: 'dataSourceId', headerName: 'Data Source', flex: 1 },
//     { field: 'dataItemId', headerName: 'Data Item', flex: 1 },
//     { field: 'dataStr', headerName: 'Data', flex: 2 },
//   ];

//   const rows = data.map((item) => ({
//     ...item,
//     datetime: epochSecondsToDateTimeString(item.epoch_seconds),
//     servProvId: item.servProvId.substring(0, 8),
//     dataStr: JSON.stringify(item.data, null, 2),
//     id: item._id,
//   }));

//   const downloadJSONAsFile = (jsonData, filename) => {
//     const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(jsonBlob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   const download = () => {
//     downloadJSONAsFile(data, 'user-data.json');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
//       <div className="max-w-7xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl p-6 sm:p-10">
//         <h2 className="text-3xl sm:text-4xl font-bold mb-2">📁 Shared Data / Activity</h2>
//         <p className="mb-6 text-sm text-gray-500">View and export data shared with service providers.</p>

//         <div className="w-full overflow-x-auto mb-6">
//           <div className="h-[500px] min-w-[800px]">
//             <DataGrid
//               rows={rows}
//               columns={columns}
//               disableSelectionOnClick
//               rowSelectionModel={[]}
//               sx={{
//                 border: 0,
//                 borderRadius: '10px',
//                 '& .MuiDataGrid-columnHeaders': {
//                   backgroundColor: '#e0e7ff',
//                   fontWeight: 'bold',
//                 },
//               }}
//             />
//           </div>
//         </div>

//         <button
//           onClick={download}
//           className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
//         >
//           ⬇️ Download Data Dump
//         </button>
//       </div>
//     </div>
//   );
// };

// export default HistoryPage;


import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import { jwtDecode } from 'jwt-decode';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';

const HistoryPage = () => {
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState('');
  const hasRan = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.sub || decoded.userId || '');
      } catch (err) {
        toast.error("Failed to decode token. Please log in again.");
      }
    } else {
      toast.error('No token found. Please log in again.');
    }
  }, []);

  useEffect(() => {
    if (!hasRan.current && userId) {
      hasRan.current = true;
      updateCollectedDataList();
    }
  }, [userId]);

  const updateCollectedDataList = async () => {
    const token = localStorage.getItem('jwt_token');
  
    try {
      const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/shared-data`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      console.log("Shared data response:", response.data); // 🔍 Check this log
      setData(response.data);
    } catch (error) {
      console.error("Error fetching shared data:", error);
      toast.error("Failed to load shared data");
    }
  };
  

  const epochSecondsToDateTimeString = (epochSeconds) => {
    return new Date(epochSeconds * 1000).toLocaleString();
  };

  const columns = [
    { field: 'datetime', headerName: 'Date Time', flex: 1 },
    { field: 'servProvId', headerName: 'Service Provider ID', flex: 1 },
    { field: 'dataSourceId', headerName: 'Data Source', flex: 1 },
    { field: 'dataItemId', headerName: 'Data Item', flex: 1 },
    { field: 'dataStr', headerName: 'Data', flex: 2 },
  ];

  const rows = data.map((item) => ({
    ...item,
    datetime: epochSecondsToDateTimeString(item.epoch_seconds),
    servProvId: item.servProvId?.substring(0, 8),
    dataStr: JSON.stringify(item.data, null, 2),
    id: item._id || item.id,
  }));

  const downloadJSONAsFile = (jsonData, filename) => {
    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const download = () => {
    downloadJSONAsFile(data, 'user-data.json');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
      <div className="max-w-7xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl p-6 sm:p-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">📁 Shared Data / Activity</h2>
        <p className="mb-6 text-sm text-gray-500">View and export data shared with service providers.</p>

        <div className="w-full overflow-x-auto mb-6">
          <div className="h-[500px] min-w-[800px]">
            <DataGrid
              rows={rows}
              columns={columns}
              disableSelectionOnClick
              rowSelectionModel={[]}
              sx={{
                border: 0,
                borderRadius: '10px',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#e0e7ff',
                  fontWeight: 'bold',
                },
              }}
            />
          </div>
        </div>

        <button
          onClick={download}
          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md"
        >
          ⬇️ Download Data Dump
        </button>
      </div>
    </div>
  );
};

export default HistoryPage;

