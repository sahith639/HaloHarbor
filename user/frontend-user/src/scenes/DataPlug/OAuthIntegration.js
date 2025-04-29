// import React, { useState } from 'react';
// import './OAuthIntegration.css';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const OAuthIntegration = () => {
//     const [jsonOutput, setJsonOutput] = useState('');
//     const [playlistIds, setPlaylistIds] = useState([]);
//     const [selectedPlaylist, setSelectedPlaylist] = useState('');

//     const fetchData = async (url) => {
//         try {
//             const response = await fetch(url);
//             const data = await response.json();
//             setJsonOutput(JSON.stringify(data, null, 2));
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     };

//     const fetchPlaylistIds = async () => {
//         try {
//             const response = await fetch('http://localhost:9080/oauth/spotify/getPlayListIDS');
//             const data = await response.json();
//             setPlaylistIds(data); // Assuming response contains a list of IDs
//         } catch (error) {
//             console.error('Error fetching Playlist IDs:', error);
//         }
//     };

//     const savePlaylistSongs = async () => {
//         if (!selectedPlaylist) {
//             alert('Please select a playlist');
//             return;
//         }

//         try {
//             const response = await fetch(`http://localhost:9080/oauth/spotify/StoreAllPlayListSongs?id=${selectedPlaylist}`, {
//                 method: 'GET',
//             });
//             const data = await response.json();
//             setJsonOutput(JSON.stringify(data, null, 2));
//         } catch (error) {
//             console.error('Error saving Playlist Songs:', error);
//         }
//     };

//     const handleSpotifyLogin = () => {
//         toast.success('Login Successful with Spotify!');
//     };

//     return (
//         <div className="oauth-container">
//             <div className="oauth-sections">
//                 {/* Reddit OAuth Section */}
//                 <div className="oauth-section">
//                     <h2 className="oauth-title">Reddit OAuth Integration</h2>
//                     <a href="http://localhost:9080/oauth/reddit/login">
//                         <button className="oauth-button login-button">Login with Reddit</button>
//                     </a>
//                     <div className="oauth-button-group">
//                         <button className="oauth-button spaced-button"
//                                 onClick={() => fetchData('http://localhost:9080/oauth/reddit/fetchSavedPosts')}>Get
//                             Saved Posts
//                         </button>
//                         <button className="oauth-button spaced-button"
//                                 onClick={() => fetchData('http://localhost:9080/oauth/reddit/upVotedPosts')}>Get UpVoted
//                             Posts
//                         </button>
//                         <button className="oauth-button spaced-button"
//                                 onClick={() => fetchData('http://localhost:9080/oauth/reddit/downVotedPosts')}>Get
//                             DownVoted Posts
//                         </button>
//                     </div>
//                 </div>

//                 {/* Strava OAuth Section
//                 <div className="oauth-section">
//                     <h2 className="oauth-title">Strava OAuth Integration</h2>
//                     <a href="http://localhost:9080/oauth/strava/login">
//                         <button className="oauth-button login-button">Login with Strava</button>
//                     </a>
//                 </div>*/}

//                 {/* Spotify OAuth Section */}
//                 <div className="oauth-section">
//                     <h2 className="oauth-title">Spotify OAuth Integration</h2>
//                     <a href="http://localhost:9080/oauth/spotify/login" onClick={handleSpotifyLogin}>
//                         <button className="oauth-button login-button">Login with Spotify</button>
//                     </a>
//                     <div className="oauth-button-group">
//                         <button className="oauth-button spaced-button"
//                                 onClick={() => fetchData('http://localhost:9080/oauth/spotify/getTopArt')}>Top Artists
//                         </button>
//                         <button className="oauth-button spaced-button"
//                                 onClick={() => fetchData('http://localhost:9080/oauth/spotify/getUserPlaylists')}>Fetch
//                             Playlists
//                         </button>
//                     </div>

//                     {/* Dropdown to select a Playlist */}
//                     <div className="dropdown-container">
//                         <button className="oauth-button spaced-button" onClick={fetchPlaylistIds}>Get Playlist IDs
//                         </button>
//                         <select
//                             className="oauth-dropdown"
//                             value={selectedPlaylist}
//                             onChange={(e) => setSelectedPlaylist(e.target.value)}
//                         >
//                             <option value="">Select Playlist</option>
//                             {playlistIds.map((id) => (
//                                 <option key={id} value={id}>{id}</option>
//                             ))}
//                         </select>
//                         <button className="oauth-button spaced-button" onClick={savePlaylistSongs}>Save Playlist Songs
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <textarea
//                 id="jsonOutput"
//                 rows="15"
//                 cols="80"
//                 readOnly
//                 value={jsonOutput}
//                 className="oauth-output"
//             />
//             <ToastContainer/>
//         </div>
//     );
// };

// export default OAuthIntegration;


// import React, { useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const OAuthIntegration = () => {
//   const [jsonOutput, setJsonOutput] = useState('');
//   const [playlistIds, setPlaylistIds] = useState([]);
//   const [selectedPlaylist, setSelectedPlaylist] = useState('');

//   const fetchData = async (url) => {
//     try {
//       const response = await fetch(url);
//       const data = await response.json();
//       setJsonOutput(JSON.stringify(data, null, 2));
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const fetchPlaylistIds = async () => {
//     try {
//       const response = await fetch('http://localhost:9080/oauth/spotify/getPlayListIDS');
//       const data = await response.json();
//       setPlaylistIds(data);
//     } catch (error) {
//       console.error('Error fetching Playlist IDs:', error);
//     }
//   };

//   const savePlaylistSongs = async () => {
//     if (!selectedPlaylist) {
//       alert('Please select a playlist');
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:9080/oauth/spotify/StoreAllPlayListSongs?id=${selectedPlaylist}`);
//       const data = await response.json();
//       setJsonOutput(JSON.stringify(data, null, 2));
//     } catch (error) {
//       console.error('Error saving Playlist Songs:', error);
//     }
//   };

//   const handleSpotifyLogin = () => {
//     toast.success('Login Successful with Spotify!');
//   };

//   return (
//     <div className="w-full p-8 text-white">
//       <h2 className="text-3xl font-bold mb-6">Data Plug</h2>

//       <div className="grid md:grid-cols-2 gap-6 mb-8">
//         {/* Reddit OAuth */}
//         <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
//           <h3 className="text-xl font-semibold mb-4 text-green-400">Reddit OAuth Integration</h3>
//           <a href="http://localhost:9080/oauth/reddit/login">
//             <button className="w-full bg-green-600 hover:bg-emerald-700 text-white py-2 px-4 rounded mb-4">
//               Login with Reddit
//             </button>
//           </a>
//           <div className="flex flex-col gap-3">
//             <button
//               onClick={() => fetchData('http://localhost:9080/oauth/reddit/fetchSavedPosts')}
//               className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded"
//             >
//               Get Saved Posts
//             </button>
//             <button
//               onClick={() => fetchData('http://localhost:9080/oauth/reddit/upVotedPosts')}
//               className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded"
//             >
//               Get Upvoted Posts
//             </button>
//             <button
//               onClick={() => fetchData('http://localhost:9080/oauth/reddit/downVotedPosts')}
//               className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded"
//             >
//               Get Downvoted Posts
//             </button>
//           </div>
//         </div>

//         {/* Spotify OAuth */}
//         <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
//           <h3 className="text-xl font-semibold mb-4 text-green-400">Spotify OAuth Integration</h3>
//           <a href="http://localhost:9080/oauth/spotify/login" onClick={handleSpotifyLogin}>
//             <button className="w-full bg-green-600 hover:bg-emerald-700 text-white py-2 px-4 rounded mb-4">
//               Login with Spotify
//             </button>
//           </a>
//           <div className="flex flex-col gap-3">
//             <button
//               onClick={() => fetchData('http://localhost:9080/oauth/spotify/getTopArt')}
//               className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded"
//             >
//               Top Artists
//             </button>
//             <button
//               onClick={() => fetchData('http://localhost:9080/oauth/spotify/getUserPlaylists')}
//               className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded"
//             >
//               Fetch Playlists
//             </button>
//             <button
//               onClick={fetchPlaylistIds}
//               className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded"
//             >
//               Get Playlist IDs
//             </button>
//             <select
//               value={selectedPlaylist}
//               onChange={(e) => setSelectedPlaylist(e.target.value)}
//               className="text-black rounded px-3 py-2"
//             >
//               <option value="">Select Playlist</option>
//               {playlistIds.map((id) => (
//                 <option key={id} value={id}>{id}</option>
//               ))}
//             </select>
//             <button
//               onClick={savePlaylistSongs}
//               className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded"
//             >
//               Save Playlist Songs
//             </button>
//           </div>
//         </div>
//       </div>

//       <textarea
//         rows="12"
//         readOnly
//         value={jsonOutput}
//         className="w-full rounded-lg p-4 text-black text-sm font-mono bg-white shadow-lg"
//       />

//       <ToastContainer />
//     </div>
//   );
// };

// export default OAuthIntegration;



import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OAuthIntegration = () => {
  const [jsonOutput, setJsonOutput] = useState('');
  const [playlistIds, setPlaylistIds] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');

  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setJsonOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPlaylistIds = async () => {
    try {
      const response = await fetch('http://localhost:9080/oauth/spotify/getPlayListIDS');
      const data = await response.json();
      setPlaylistIds(data);
    } catch (error) {
      console.error('Error fetching Playlist IDs:', error);
    }
  };

  const savePlaylistSongs = async () => {
    if (!selectedPlaylist) {
      alert('Please select a playlist');
      return;
    }

    try {
      const response = await fetch(`http://localhost:9080/oauth/spotify/StoreAllPlayListSongs?id=${selectedPlaylist}`);
      const data = await response.json();
      setJsonOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving Playlist Songs:', error);
    }
  };

  const handleSpotifyLogin = () => {
    toast.success('Login Successful with Spotify!');
  };

  return (
    <div className="w-full p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">Data Plug</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Reddit OAuth */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-green-400">Reddit OAuth Integration</h3>
          <a href="http://localhost:9080/oauth/reddit/login">
            <button className="w-full bg-green-600 hover:bg-emerald-700 text-white py-2 px-4 rounded mb-4">
              Login with Reddit
            </button>
          </a>
          <div className="flex flex-col gap-3">
            <button onClick={() => fetchData('http://localhost:9080/oauth/reddit/fetchSavedPosts')} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Get Saved Posts</button>
            <button onClick={() => fetchData('http://localhost:9080/oauth/reddit/upVotedPosts')} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Get Upvoted Posts</button>
            <button onClick={() => fetchData('http://localhost:9080/oauth/reddit/downVotedPosts')} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Get Downvoted Posts</button>
          </div>
        </div>

        {/* Spotify OAuth */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-green-400">Spotify OAuth Integration</h3>
          <a href="http://localhost:9080/oauth/spotify/login" onClick={handleSpotifyLogin}>
            <button className="w-full bg-green-600 hover:bg-emerald-700 text-white py-2 px-4 rounded mb-4">
              Login with Spotify
            </button>
          </a>
          <div className="flex flex-col gap-3">
            <button onClick={() => fetchData('http://localhost:9080/oauth/spotify/getTopArt')} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Top Artists</button>
            <button onClick={() => fetchData('http://localhost:9080/oauth/spotify/getUserPlaylists')} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Fetch Playlists</button>
            <button onClick={fetchPlaylistIds} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Get Playlist IDs</button>
            <select value={selectedPlaylist} onChange={(e) => setSelectedPlaylist(e.target.value)} className="text-black rounded px-3 py-2">
              <option value="">Select Playlist</option>
              {playlistIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            <button onClick={savePlaylistSongs} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Save Playlist Songs</button>
          </div>
        </div>

        {/* ✅ Strava OAuth */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-green-400">Strava OAuth Integration</h3>
          <a href="http://localhost:9080/oauth/strava/login">
            <button className="w-full bg-green-600 hover:bg-emerald-700 text-white py-2 px-4 rounded mb-4">
              Login with Strava
            </button>
          </a>
          <div className="flex flex-col gap-3">
            <button onClick={() => fetchData('http://localhost:9080/oauth/strava/getActivities')} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Get Activities</button>
            <button onClick={() => fetchData('http://localhost:9080/oauth/strava/athlete')} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Get Athlete</button>
            <button onClick={() => fetchData('http://localhost:9080/oauth/strava/athleteClubs')} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Get Athlete Clubs</button>
          </div>
        </div>
      </div>

      <textarea
        rows="12"
        readOnly
        value={jsonOutput}
        className="w-full rounded-lg p-4 text-black text-sm font-mono bg-white shadow-lg"
      />

      <ToastContainer />
    </div>
  );
};

export default OAuthIntegration;
