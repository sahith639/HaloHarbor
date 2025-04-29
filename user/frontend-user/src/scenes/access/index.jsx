// import React, { useEffect, useState } from 'react';
// import { ChevronDown } from 'lucide-react';

// const AccessControl = () => {
//   const [expanded, setExpanded] = useState(null);
//   const [selectedOptions, setSelectedOptions] = useState({});
//   const [isRedditConnected, setIsRedditConnected] = useState(false);

//   // Fetch connected data from backend on load
//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const res = await fetch('http://localhost:9080/oauth/fetchCollections');
//         const data = await res.json();
//         setIsRedditConnected(
//           data.hasOwnProperty('Reddit_Saved_Posts') ||
//           data.hasOwnProperty('Reddit_Up_Voted_Posts') ||
//           data.hasOwnProperty('Reddit_Doen_Voted_Posts')
//         );
//         setSelectedOptions({
//           Reddit: {
//             Reddit_Saved_Posts: data.Reddit_Saved_Posts || false,
//             Reddit_Up_Voted_Posts: data.Reddit_Up_Voted_Posts || false,
//             Reddit_Doen_Voted_Posts: data.Reddit_Doen_Voted_Posts || false,
//           },
//         });
//       } catch (error) {
//         console.error("Failed to fetch collections", error);
//       }
//     };
//     fetchStatus();
//   }, []);

//   const handleOptionChange = (optionKey) => {
//     setSelectedOptions((prev) => ({
//       ...prev,
//       Reddit: {
//         ...prev.Reddit,
//         [optionKey]: !prev.Reddit?.[optionKey],
//       },
//     }));
//   };

//   const handleSave = async () => {
//     const payload = {
//       userId: 'user1',
//       ...selectedOptions.Reddit
//     };

//     try {
//       const response = await fetch('http://localhost:9080/oauth/saveUserDataSettings', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         alert('Changes saved successfully!');
//       } else {
//         throw new Error('Failed to save changes');
//       }
//     } catch (error) {
//       console.error('Save error:', error);
//       alert('Error saving changes: ' + error.message);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-3xl font-bold mb-2 text-white">Access Control</h2>
//       <p className="text-sm text-white mb-6">Manage what Reddit data you allow us to use.</p>

//       <div className="bg-white p-5 rounded-2xl shadow">
//         <div className="flex justify-between items-center mb-2">
//           <div>
//             <h3 className="text-lg font-semibold text-black">Reddit</h3>
//             <p className="text-sm text-gray-500">Saved, Upvoted & Downvoted posts</p>
//           </div>
//           <span className={isRedditConnected ? "text-green-600 font-medium" : "text-yellow-500 font-medium"}>
//             {isRedditConnected ? "Connected" : "Not Connected"}
//           </span>
//         </div>

//         {isRedditConnected && (
//           <>
//             <button
//               onClick={() => setExpanded(expanded === 0 ? null : 0)}
//               className="flex items-center mt-2 text-blue-600 hover:underline"
//             >
//               Manage Access <ChevronDown className="ml-1 w-4 h-4" />
//             </button>

//             {expanded === 0 && (
//               <ul className="mt-3 text-sm text-gray-700 space-y-2">
//                 {Object.keys(selectedOptions.Reddit || {}).map((optKey, i) => (
//                   <li key={i}>
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={selectedOptions.Reddit[optKey] || false}
//                         onChange={() => handleOptionChange(optKey)}
//                         className="form-checkbox rounded text-blue-600"
//                       />
//                       <span>{optKey.replaceAll('_', ' ')}</span>
//                     </label>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </>
//         )}
//       </div>

//       {isRedditConnected && (
//         <div className="mt-6">
//           <button
//             onClick={handleSave}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow"
//           >
//             Save Changes
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccessControl;

// import React, { useEffect, useState } from 'react';
// import { ChevronDown } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const AccessControl = () => {
//   const [expanded, setExpanded] = useState(null);
//   const [selectedOptions, setSelectedOptions] = useState({});
//   const [isRedditConnected, setIsRedditConnected] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);

//   // Fetch Reddit access state on load
//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const token = localStorage.getItem("jwt_token");
//         const res = await fetch('http://localhost:9080/oauth/fetchCollections', {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
//         const data = await res.json();

//         setIsRedditConnected(
//           data?.Reddit_Saved_Posts || data?.Reddit_Up_Voted_Posts || data?.Reddit_Doen_Voted_Posts
//         );

//         setSelectedOptions({
//           Reddit: {
//             Reddit_Saved_Posts: data?.Reddit_Saved_Posts || false,
//             Reddit_Up_Voted_Posts: data?.Reddit_Up_Voted_Posts || false,
//             Reddit_Doen_Voted_Posts: data?.Reddit_Doen_Voted_Posts || false,
//           },
//         });
//       } catch (error) {
//         console.error("Failed to fetch collections", error);
//         toast.error("Failed to load Reddit access data");
//       }
//     };

//     fetchStatus();
//   }, []);

//   const handleOptionChange = (optionKey) => {
//     setSelectedOptions((prev) => ({
//       ...prev,
//       Reddit: {
//         ...prev.Reddit,
//         [optionKey]: !prev.Reddit?.[optionKey],
//       },
//     }));
//   };

//   const handleSave = async () => {
//     const payload = {
//       ...selectedOptions.Reddit
//     };

//     setIsSaving(true);

//     try {
//       const token = localStorage.getItem("jwt_token");
//       const response = await fetch("http://localhost:9080/oauth/saveUserDataSettings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         toast.success("Changes saved successfully!");
//       } else {
//         const errorText = await response.text();
//         throw new Error(errorText || "Failed to save changes");
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       toast.error("Error saving changes: " + error.message);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <ToastContainer />
//       <h2 className="text-3xl font-bold mb-2 text-white">Access Control</h2>
//       <p className="text-sm text-white mb-6">Manage what Reddit data you allow us to use.</p>

//       <div className="bg-white p-5 rounded-2xl shadow">
//         <div className="flex justify-between items-center mb-2">
//           <div>
//             <h3 className="text-lg font-semibold text-black">Reddit</h3>
//             <p className="text-sm text-gray-500">Saved, Upvoted & Downvoted posts</p>
//           </div>
//           <span className={isRedditConnected ? "text-green-600 font-medium" : "text-yellow-500 font-medium"}>
//             {isRedditConnected ? "Connected" : "Not Connected"}
//           </span>
//         </div>

//         {isRedditConnected && (
//           <>
//             <button
//               onClick={() => setExpanded(expanded === 0 ? null : 0)}
//               className="flex items-center mt-2 text-blue-600 hover:underline"
//             >
//               Manage Access <ChevronDown className="ml-1 w-4 h-4" />
//             </button>

//             {expanded === 0 && (
//               <ul className="mt-3 text-sm text-gray-700 space-y-2">
//                 {Object.keys(selectedOptions.Reddit || {}).map((optKey, i) => (
//                   <li key={i}>
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={selectedOptions.Reddit[optKey] || false}
//                         onChange={() => handleOptionChange(optKey)}
//                         className="form-checkbox rounded text-blue-600"
//                       />
//                       <span>{optKey.replaceAll('_', ' ')}</span>
//                     </label>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </>
//         )}
//       </div>

//       {isRedditConnected && (
//         <div className="mt-6">
//           <button
//             onClick={handleSave}
//             disabled={isSaving}
//             className={`${
//               isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//             } text-white font-semibold py-2 px-6 rounded shadow`}
//           >
//             {isSaving ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccessControl;





// import React, { useEffect, useState } from 'react';
// import { ChevronDown } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const AccessControl = () => {
//   const [expanded, setExpanded] = useState(null);
//   const [selectedOptions, setSelectedOptions] = useState({});
//   const [isRedditConnected, setIsRedditConnected] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const token = localStorage.getItem("jwt_token");
//         const res = await fetch('http://localhost:9080/oauth/fetchCollections', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const data = await res.json();

//         setIsRedditConnected(
//           data?.Reddit_Saved_Posts || data?.Reddit_Up_Voted_Posts || data?.Reddit_Doen_Voted_Posts
//         );

//         setSelectedOptions({
//           Reddit: {
//             Reddit_Saved_Posts: data?.Reddit_Saved_Posts || false,
//             Reddit_Up_Voted_Posts: data?.Reddit_Up_Voted_Posts || false,
//             Reddit_Doen_Voted_Posts: data?.Reddit_Doen_Voted_Posts || false,
//           },
//         });
//       } catch (error) {
//         console.error("Failed to fetch collections", error);
//         toast.error("Failed to load Reddit access data");
//       }
//     };

//     fetchStatus();
//   }, []);

//   const handleOptionChange = (optionKey) => {
//     setSelectedOptions((prev) => ({
//       ...prev,
//       Reddit: {
//         ...prev.Reddit,
//         [optionKey]: !prev.Reddit?.[optionKey],
//       },
//     }));
//   };

//   const handleSave = async () => {
//     const payload = { ...selectedOptions.Reddit };
//     setIsSaving(true);

//     try {
//       const token = localStorage.getItem("jwt_token");
//       const response = await fetch("http://localhost:9080/oauth/saveUserDataSettings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         toast.success("Changes saved successfully!");
//       } else {
//         const errorText = await response.text();
//         throw new Error(errorText || "Failed to save changes");
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       toast.error("Error saving changes: " + error.message);
//     } finally {
//       setIsSaving(false);
//       setShowModal(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <ToastContainer />
//       <h2 className="text-3xl font-bold mb-2 text-white">Access Control</h2>
//       <p className="text-sm text-white mb-6">Manage what Reddit data you allow us to use.</p>

//       <div className="bg-white p-5 rounded-2xl shadow">
//         <div className="flex justify-between items-center mb-2">
//           <div>
//             <h3 className="text-lg font-semibold text-black">Reddit</h3>
//             <p className="text-sm text-gray-500">Saved, Upvoted & Downvoted posts</p>
//           </div>
//           <span className={isRedditConnected ? "text-green-600 font-medium" : "text-yellow-500 font-medium"}>
//             {isRedditConnected ? "Connected" : "Not Connected"}
//           </span>
//         </div>

//         {isRedditConnected && (
//           <>
//             <button
//               onClick={() => setExpanded(expanded === 0 ? null : 0)}
//               className="flex items-center mt-2 text-blue-600 hover:underline"
//             >
//               Manage Access <ChevronDown className="ml-1 w-4 h-4" />
//             </button>

//             {expanded === 0 && (
//               <ul className="mt-3 text-sm text-gray-700 space-y-2">
//                 {Object.keys(selectedOptions.Reddit || {}).map((optKey, i) => (
//                   <li key={i}>
//                     <label className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={selectedOptions.Reddit[optKey] || false}
//                         onChange={() => handleOptionChange(optKey)}
//                         className="form-checkbox rounded text-blue-600"
//                       />
//                       <span>{optKey.replaceAll('_', ' ')}</span>
//                     </label>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </>
//         )}
//       </div>

//       {isRedditConnected && (
//         <div className="mt-6">
//           <button
//             onClick={() => setShowModal(true)}
//             disabled={isSaving}
//             className={`${
//               isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//             } text-white font-semibold py-2 px-6 rounded shadow`}
//           >
//             {isSaving ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       )}

//       {/* Modal Confirmation */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
//             <h2 className="text-xl font-semibold mb-4">Confirm Save</h2>
//             <p className="text-gray-600 mb-6">Are you sure you want to apply these changes?</p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Confirm & Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccessControl;

// import React, { useEffect, useState } from 'react';
// import { ChevronDown } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const AccessControl = () => {
//   const [expanded, setExpanded] = useState(null);
//   const [selectedOptions, setSelectedOptions] = useState({});
//   const [isConnected, setIsConnected] = useState({ Reddit: false, Spotify: false });
//   const [isSaving, setIsSaving] = useState(false);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const token = localStorage.getItem("jwt_token");
//         const res = await fetch('http://localhost:9080/oauth/fetchCollections', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const data = await res.json();

//         setIsConnected({
//           Reddit: data?.Reddit_Saved_Posts || data?.Reddit_Up_Voted_Posts || data?.Reddit_Doen_Voted_Posts,
//           Spotify: data?.spotify_data_DataPlaylists || data?.spotify_data_PlayListsSongs || data?.spotify_data_TopArtists,
//         });

//         setSelectedOptions({
//           Reddit: {
//             Reddit_Saved_Posts: data?.Reddit_Saved_Posts || false,
//             Reddit_Up_Voted_Posts: data?.Reddit_Up_Voted_Posts || false,
//             Reddit_Doen_Voted_Posts: data?.Reddit_Doen_Voted_Posts || false,
//           },
//           Spotify: {
//             spotify_data_DataPlaylists: data?.spotify_data_DataPlaylists || false,
//             spotify_data_PlayListsSongs: data?.spotify_data_PlayListsSongs || false,
//             spotify_data_TopArtists: data?.spotify_data_TopArtists || false,
//           },
//         });
//       } catch (error) {
//         console.error("Failed to fetch collections", error);
//         toast.error("Failed to load access data");
//       }
//     };

//     fetchStatus();
//   }, []);

//   const handleOptionChange = (service, optionKey) => {
//     setSelectedOptions(prev => ({
//       ...prev,
//       [service]: {
//         ...prev[service],
//         [optionKey]: !prev[service][optionKey],
//       },
//     }));
//   };

//   const confirmSave = () => {
//     setShowModal(true);
//   };

//   const handleSaveConfirmed = async () => {
//     setShowModal(false);
//     const payload = {
//       ...selectedOptions.Reddit,
//       ...selectedOptions.Spotify
//     };

//     setIsSaving(true);

//     try {
//       const token = localStorage.getItem("jwt_token");
//       const response = await fetch("http://localhost:9080/oauth/saveUserDataSettings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         toast.success("Changes saved successfully!");
//       } else {
//         const errorText = await response.text();
//         throw new Error(errorText || "Failed to save changes");
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       toast.error("Error saving changes: " + error.message);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const renderSection = (service, label, options) => (
//     <div className="bg-white p-5 rounded-2xl shadow">
//       <div className="flex justify-between items-center mb-2">
//         <div>
//           <h3 className="text-lg font-semibold text-black">{label}</h3>
//           <p className="text-sm text-gray-500">
//             {service === 'Reddit'
//               ? 'Saved, Upvoted & Downvoted posts'
//               : 'Playlists, Top Artists & Songs'}
//           </p>
//         </div>
//         <span className={isConnected[service] ? "text-green-600 font-medium" : "text-yellow-500 font-medium"}>
//           {isConnected[service] ? "Connected" : "Not Connected"}
//         </span>
//       </div>

//       {isConnected[service] && (
//         <>
//           <button
//             onClick={() => setExpanded(expanded === service ? null : service)}
//             className="flex items-center mt-2 text-blue-600 hover:underline"
//           >
//             Manage Access <ChevronDown className="ml-1 w-4 h-4" />
//           </button>

//           {expanded === service && (
//             <ul className="mt-3 text-sm text-gray-700 space-y-2">
//               {Object.keys(options).map((optKey, i) => (
//                 <li key={i}>
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={options[optKey]}
//                       onChange={() => handleOptionChange(service, optKey)}
//                       className="form-checkbox rounded text-blue-600"
//                     />
//                     <span>{optKey.replaceAll('_', ' ')}</span>
//                   </label>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </>
//       )}
//     </div>
//   );

//   return (
//     <div className="p-6">
//       <ToastContainer />
//       <h2 className="text-3xl font-bold mb-2 text-white">Access Control</h2>
//       <p className="text-sm text-white mb-6">Manage what data you allow us to use.</p>

//       <div className="grid md:grid-cols-2 gap-6">
//         {renderSection('Reddit', 'Reddit', selectedOptions.Reddit || {})}
//         {renderSection('Spotify', 'Spotify', selectedOptions.Spotify || {})}
//       </div>

//       {(isConnected.Reddit || isConnected.Spotify) && (
//         <div className="mt-6">
//           <button
//             onClick={confirmSave}
//             disabled={isSaving}
//             className={`${
//               isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//             } text-white font-semibold py-2 px-6 rounded shadow`}
//           >
//             {isSaving ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       )}

//       {/* Confirmation Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-xl shadow-lg w-96">
//             <h3 className="text-lg font-bold mb-4 text-gray-800">Confirm Changes</h3>
//             <p className="text-gray-600 mb-6">Are you sure you want to save these access settings?</p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveConfirmed}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccessControl;


import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AccessControl = () => {
  const [expanded, setExpanded] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isConnected, setIsConnected] = useState({ Reddit: false, Spotify: false, Strava: false });
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("jwt_token");
        const res = await fetch('http://localhost:9080/oauth/fetchCollections', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        const filteredRedditOptions = {};
        const filteredSpotifyOptions = {};
        const filteredStravaOptions = {};

        // Reddit: show if key exists
        ['Reddit_Saved_Posts', 'Reddit_Up_Voted_Posts', 'Reddit_Doen_Voted_Posts'].forEach(key => {
          if (key in data) filteredRedditOptions[key] = data[key];
        });

        // Spotify: show if key exists
        ['spotify_data_DataPlaylists', 'spotify_data_PlayListsSongs', 'spotify_data_TopArtists'].forEach(key => {
          if (key in data) filteredSpotifyOptions[key] = data[key];
        });

        // Strava: show if key exists
        ['athlete', 'athlete_clubs', 'athlete_activities'].forEach(key => {
          if (key in data) filteredStravaOptions[key] = data[key];
        });

        setIsConnected({
          Reddit: Object.keys(filteredRedditOptions).length > 0,
          Spotify: Object.keys(filteredSpotifyOptions).length > 0,
          Strava: Object.keys(filteredStravaOptions).length > 0,
        });

        setSelectedOptions({
          Reddit: filteredRedditOptions,
          Spotify: filteredSpotifyOptions,
          Strava: filteredStravaOptions,
        });
      } catch (error) {
        console.error("Failed to fetch collections", error);
        toast.error("Failed to load access data");
      }
    };

    fetchStatus();
  }, []);

  const handleOptionChange = (service, optionKey) => {
    setSelectedOptions(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [optionKey]: !prev[service][optionKey],
      },
    }));
  };

  const confirmSave = () => setShowModal(true);

  const handleSaveConfirmed = async () => {
    setShowModal(false);
    const payload = {
      ...selectedOptions.Reddit,
      ...selectedOptions.Spotify,
      ...selectedOptions.Strava,
    };

    setIsSaving(true);

    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch("http://localhost:9080/oauth/saveUserDataSettings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Changes saved successfully!");
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save changes");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving changes: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = (service, label, options) => (
    <div className="bg-white p-5 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold text-black">{label}</h3>
          <p className="text-sm text-gray-500">
            {service === 'Reddit' && 'Saved, Upvoted & Downvoted posts'}
            {service === 'Spotify' && 'Playlists, Top Artists & Songs'}
            {service === 'Strava' && 'Activities, Athlete & Clubs'}
          </p>
        </div>
        <span className={isConnected[service] ? "text-green-600 font-medium" : "text-yellow-500 font-medium"}>
          {isConnected[service] ? "Connected" : "Not Connected"}
        </span>
      </div>

      {isConnected[service] && (
        <>
          <button
            onClick={() => setExpanded(expanded === service ? null : service)}
            className="flex items-center mt-2 text-blue-600 hover:underline"
          >
            Manage Access <ChevronDown className="ml-1 w-4 h-4" />
          </button>

          {expanded === service && (
            <ul className="mt-3 text-sm text-gray-700 space-y-2">
              {Object.keys(options).map((optKey, i) => (
                <li key={i}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options[optKey]}
                      onChange={() => handleOptionChange(service, optKey)}
                      className="form-checkbox rounded text-blue-600"
                    />
                    <span>{optKey.replaceAll('_', ' ')}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <ToastContainer />
      <h2 className="text-3xl font-bold mb-2 text-white">Access Control</h2>
      <p className="text-sm text-white mb-6">Manage what data you allow us to use.</p>

      <div className="grid md:grid-cols-2 gap-6">
        {renderSection('Reddit', 'Reddit', selectedOptions.Reddit || {})}
        {renderSection('Spotify', 'Spotify', selectedOptions.Spotify || {})}
        {renderSection('Strava', 'Strava', selectedOptions.Strava || {})}
      </div>

      {(isConnected.Reddit || isConnected.Spotify || isConnected.Strava) && (
        <div className="mt-6">
          <button
            onClick={confirmSave}
            disabled={isSaving}
            className={`${
              isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold py-2 px-6 rounded shadow`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Confirm Changes</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to save these access settings?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirmed}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;

