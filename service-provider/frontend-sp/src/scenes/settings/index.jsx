// import { useEffect, useState, useRef } from 'react'
// import { Box, Stack } from '@mui/system'
// // import { useStateValue } from '../../state/state'
// import { useNavigate } from 'react-router-dom'
// import { Button, IconButton, Typography, useTheme } from "@mui/material";
// import SectionCard from '../../components/SectionCard';
// import DataMenu from '../../components/DataMenu';
// import config from '../../utils/config'
// import axios from 'axios'
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';


// const SettingsPage = () => {
//     const [dataMenuSelection, setDataMenuSelection] = useState({});
    
//     async function updateDataMenuSelection() {
//       const response = await axios.get(`${config.BACKEND_BASE_URL}/data-menu-settings`);
//       console.log("fetched data menu:", response.data);
//       setDataMenuSelection(response.data);
//     }

//     async function cancelChanges(){
//       await updateDataMenuSelection();
//       toast.info("Reverted Changes");
//     }

//     async function saveDataMenuSelection() {
//       const response = await axios.put(`${config.BACKEND_BASE_URL}/data-menu-settings`, dataMenuSelection);
//       toast.success("Saved Data Settings");
//     }

//     const hasRan = useRef(false);
//     useEffect(() => {
//       if (!hasRan.current){
//         hasRan.current = true;

//         updateDataMenuSelection();
//       }
//     }, []);



//     return (
//       <SectionCard>
//         <Typography variant="h3" sx={{ color: "#000000"}}>
//           Data Pulling
//         </Typography>

//         <DataMenu dataMenuSelection={dataMenuSelection} setDataMenuSelection={setDataMenuSelection}></DataMenu>

//         <Box>
//           <Button
//             sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
//             variant="contained"
//             onClick={saveDataMenuSelection}>
//               Save Changes
//           </Button>
//           <Button
//             sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
//             variant="contained"
//             onClick={cancelChanges}>
//               Cancel Changes
//           </Button>
//         </Box>

//         <ToastContainer />
//       </SectionCard>
//     );
// }

// export default SettingsPage

// import { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import config from '../../utils/config';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import DataMenu from '../../components/DataMenu';

// const SettingsPage = () => {
//   const [dataMenuSelection, setDataMenuSelection] = useState({});
//   const hasRan = useRef(false);

//   const updateDataMenuSelection = async () => {
//     const response = await axios.get(`${config.BACKEND_BASE_URL}/data-menu-settings`);
//     setDataMenuSelection(response.data);
//   };

//   const cancelChanges = async () => {
//     await updateDataMenuSelection();
//     toast.info("Reverted changes");
//   };

//   const saveDataMenuSelection = async () => {
//     await axios.put(`${config.BACKEND_BASE_URL}/data-menu-settings`, dataMenuSelection);
//     toast.success("✅ Data Settings Saved");
//   };

//   useEffect(() => {
//     if (!hasRan.current) {
//       hasRan.current = true;
//       updateDataMenuSelection();
//     }
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
//       <div className="max-w-5xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl p-8">
//         <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
//           ⚙️ Data Pulling Settings
//         </h2>
//         <p className="text-gray-500 mb-6">
//           Configure what data you want to collect from participants.
//         </p>

//         <div className="mb-6">
//           <DataMenu
//             isUserView={false}
//             dataMenuSelection={dataMenuSelection}
//             setDataMenuSelection={setDataMenuSelection}
//           />
//         </div>

//         <div className="flex flex-col sm:flex-row gap-4">
//           <button
//             onClick={saveDataMenuSelection}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow"
//           >
//             💾 Save Changes
//           </button>
//           <button
//             onClick={cancelChanges}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow"
//           >
//             ❌ Cancel Changes
//           </button>
//         </div>
//       </div>

//       <ToastContainer />
//     </div>
//   );
// };

// export default SettingsPage;


import { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import SectionCard from '../../components/SectionCard';
import DataMenu from '../../components/DataMenu';
import config from '../../utils/config';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SettingsPage = () => {
  const [dataMenuSelection, setDataMenuSelection] = useState({});

  const hasRan = useRef(false);
  useEffect(() => {
    if (!hasRan.current) {
      hasRan.current = true;
      updateDataMenuSelection();
    }
  }, []);

  const updateDataMenuSelection = async () => {
    try {
      const response = await axios.get(`${config.BACKEND_BASE_URL}/data-menu-settings`);
      setDataMenuSelection(response.data);
    } catch (error) {
      toast.error("Failed to load data menu settings.");
    }
  };

  const saveDataMenuSelection = async () => {
    try {
      await axios.put(`${config.BACKEND_BASE_URL}/data-menu-settings`, dataMenuSelection);
      toast.success("✅ Data Settings Saved");
    } catch (error) {
      toast.error("❌ Failed to save settings.");
    }
  };

  const cancelChanges = async () => {
    await updateDataMenuSelection();
    toast.info("Changes reverted.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
      <div className="max-w-4xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl p-8 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
         ⚙️ Data Pulling Settings
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Configure what data you want to collect from participants.
        </p>

        <div className="mb-6">
          <DataMenu
            dataMenuSelection={dataMenuSelection}
            setDataMenuSelection={setDataMenuSelection}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-start gap-4">
          <button
            onClick={saveDataMenuSelection}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 shadow transition"
          >
            💾 Save Changes
          </button>
          <button
            onClick={cancelChanges}
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 shadow transition"
          >
            ❌ Cancel Changes
          </button>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default SettingsPage;


