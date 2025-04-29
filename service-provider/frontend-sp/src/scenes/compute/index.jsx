// import React, { useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import styles from './compute.module.css';

// const ComputationPage = () => {
//     const [users, setUsers] = useState([]);
//     const [selectedUserId, setSelectedUserId] = useState("");
//     const [checkedValues, setCheckedValues] = useState({});
//     const [data, setData] = useState("");
//     const [isFetchEnabled, setIsFetchEnabled] = useState(false);
//     const [log, setLog] = useState("");
//     const [showComputationControls, setShowComputationControls] = useState(false);
//     const [isLoadingDataCollections, setIsLoadingDataCollections] = useState(false);

//     // Fetch users list
//     const fetchUsers = async () => {
//         try {
//             const response = await fetch("http://localhost:9081/api/participants");
//             const data = await response.json();
//             setUsers(data);
//         } catch (error) {
//             console.error("Error fetching users:", error);
//             toast.error("Error fetching users!");
//         }
//     };

//     // Handle user selection from dropdown
//     const handleUserSelect = async (event) => {
//         const userId = event.target.value;
//         setSelectedUserId(userId);
//         setIsLoadingDataCollections(true);

//         try {
//             const controlResponse = await fetch("http://localhost:9081/oauth/fetchUserControlData", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ userId })
//             });

//             if (!controlResponse.ok) throw new Error("Failed to fetch user control data");

//             await new Promise(resolve => setTimeout(resolve, 3000));

//             const listResponse = await fetch("http://localhost:9081/oauth/fetchUserList");
//             if (!listResponse.ok) throw new Error("Failed to fetch user list");

//             const fetchedData = await listResponse.json();
//             delete fetchedData.spotify_data;
//             delete fetchedData.spotify_data_DataPlaylists;
//             delete fetchedData.spotify_data_PlayListsSongs;
//             setCheckedValues(fetchedData);

//         } catch (error) {
//             console.error("Error fetching user data:", error);
//             toast.error("Error fetching user data!");
//         } finally {
//             setIsLoadingDataCollections(false);
//         }
//     };

//     // Handle checkbox toggle
//     const handleCheckboxChange = (key) => {
//         setCheckedValues(prevState => ({
//             ...prevState,
//             [key]: !prevState[key]
//         }));
//     };

//     // Handle form submission - THIS WAS MISSING
//     const handleSubmit = async () => {
//         const payload = {
//             userId: selectedUserId,
//             ...Object.fromEntries(Object.entries(checkedValues).filter(([_, value]) => value))
//         };

//         try {
//             const response = await fetch("http://localhost:9081/api/compute", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (response.ok) {
//                 toast.success("Data submitted successfully!");
//                 setIsFetchEnabled(true);
//                 setShowComputationControls(true);
//             } else {
//                 throw new Error("Failed to submit data");
//             }
//         } catch (error) {
//             console.error("Error submitting data:", error);
//             toast.error("Error submitting data!");
//         }
//     };

//     // Handle fetch data on button click
//     // const handleFetchData = async () => {
//     //     try {
//     //         const response = await fetch("http://localhost:9081/oauth/getDAData");
//     //         if (!response.ok) throw new Error("Failed to fetch data");
//     //
//     //         const result = await response.json();
//     //         setData(JSON.stringify(result, null, 2));
//     //     } catch (error) {
//     //         console.error("Error fetching data:", error);
//     //         toast.error("Error fetching data!");
//     //     }
//     // };

//     // Handle Compute button click
//     const handleTrainingButtonClick = () => {
//         const selectedData = Object.keys(checkedValues).filter(key => checkedValues[key]);
//         const message = `Computation request submitted for the following data: ${selectedData.join(', ')}`;
//         toast.info(message);
//         const payload = {
//             userId: selectedUserId
//         };

//         fetch('http://localhost:9081/compute', {
//             method: 'POST',
//             mode: 'cors',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(payload),
//         })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 console.log('Response:', response.text());
//             })
//             .then(data => {
//                 console.log('Success:', data);
//                 toast.success("Computation started successfully!");
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 toast.error("Error starting computation!");
//             });
//     };

//     // Handle Refresh Status button click
//     const handleRefreshStatusButtonClick = async () => {
//         try {
//             const response = await fetch('http://localhost:9081/get-logs', {
//                 method: 'GET',
//                 mode: 'cors',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }

//             const data = await response.json();
//             const jsonString = JSON.stringify(data, null, 4);
//             const multiLineString = jsonString.replace(/(?:\\[rn]|[\r\n]+)+/g, '\n');
//             console.log(multiLineString);
//             setLog(multiLineString);
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error("Error fetching logs!");
//         }
//     };

//     return (
//         <div className={styles.container}>
//             <h2 className={styles.heading}>User Data Management</h2>

//             <div className={styles.section}>
//                 <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

//                 <select className={styles.select} onChange={handleUserSelect} value={selectedUserId}>
//                     <option value="">Select a User</option>
//                     {users.map((userId, index) => (
//                         <option key={index} value={userId}>{userId}</option>
//                     ))}
//                 </select>

//                 {isLoadingDataCollections && (
//                     <div className={styles.loadingContainer}>
//                         <div className={styles.loadingSpinner}></div>
//                         <p>Loading Available Data Collections...</p>
//                     </div>
//                 )}

//                 {selectedUserId && Object.keys(checkedValues).length > 0 && !isLoadingDataCollections && (
//                     <div className={styles.section}>
//                         <h3 className={styles.subHeading}>Available Data Collections</h3>
//                         {Object.entries(checkedValues).map(([key, value]) => (
//                             <div key={key}>
//                                 <label className={styles.label}>
//                                     <input
//                                         type="checkbox"
//                                         className={styles.checkbox}
//                                         checked={value}
//                                         onChange={() => handleCheckboxChange(key)}
//                                     />
//                                     {key}
//                                 </label>
//                             </div>
//                         ))}
//                         <button className={styles.button} onClick={handleSubmit}>Submit</button>
//                     </div>
//                 )}

//                 {/*{isFetchEnabled && (*/}
//                 {/*    <div className={styles.section}>*/}
//                 {/*        <button className={styles.button} onClick={handleFetchData}>Fetch Data</button>*/}
//                 {/*        <textarea*/}
//                 {/*            className={styles.textarea}*/}
//                 {/*            rows="10"*/}
//                 {/*            cols="50"*/}
//                 {/*            value={data}*/}
//                 {/*            readOnly*/}
//                 {/*            placeholder="Fetched data will be displayed here..."*/}
//                 {/*        />*/}
//                 {/*    </div>*/}
//                 {/*)}*/}
//             </div>

//             {showComputationControls && (
//                 <div className={styles.section}>
//                     <h2 className={styles.heading}>Computation Controls</h2>
//                     <div className={styles.buttonGroup}>
//                         <button className={styles.button} onClick={handleTrainingButtonClick}>Compute</button>
//                         <button className={styles.button} onClick={handleRefreshStatusButtonClick}>Refresh Status</button>
//                     </div>

//                     <h3 className={styles.subHeading}>Computation Logs:</h3>
//                     <textarea
//                         className={styles.textarea}
//                         rows="10"
//                         cols="50"
//                         value={log}
//                         readOnly
//                         placeholder="Computation logs will appear here..."
//                     />
//                 </div>
//             )}

//             <ToastContainer />
//         </div>
//     );
// };


// export default ComputationPage

            



// import React, { useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import styles from './compute.module.css';

// const ComputationPage = () => {
//     const [users, setUsers] = useState([]);
//     const [selectedUserId, setSelectedUserId] = useState("");
//     const [checkedValues, setCheckedValues] = useState({});
//     const [log, setLog] = useState("");
//     const [showComputationControls, setShowComputationControls] = useState(false);
//     const [isLoadingDataCollections, setIsLoadingDataCollections] = useState(false);

//     // ✅ Added toggle for future use
//     const [toggle, setToggle] = useState(false);

//     const fetchUsers = async () => {
//         try {
//             const response = await fetch("http://localhost:9081/api/participants");
//             const data = await response.json();
//             setUsers(data);
//         } catch (error) {
//             console.error("Error fetching users:", error);
//             toast.error("Error fetching users!");
//         }
//     };

//     const handleUserSelect = async (event) => {
//         const userId = event.target.value;
//         setSelectedUserId(userId);
//         setIsLoadingDataCollections(true);

//         try {
//             const controlResponse = await fetch("http://localhost:9081/oauth/fetchUserControlData", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ userId })
//             });

//             if (!controlResponse.ok) throw new Error("Failed to fetch user control data");

//             await new Promise(resolve => setTimeout(resolve, 3000));

//             const listResponse = await fetch("http://localhost:9081/oauth/fetchUserList");
//             if (!listResponse.ok) throw new Error("Failed to fetch user list");

//             const fetchedData = await listResponse.json();
//             delete fetchedData.spotify_data;
//             delete fetchedData.spotify_data_DataPlaylists;
//             delete fetchedData.spotify_data_PlayListsSongs;
//             setCheckedValues(fetchedData);
//         } catch (error) {
//             console.error("Error fetching user data:", error);
//             toast.error("Error fetching user data!");
//         } finally {
//             setIsLoadingDataCollections(false);
//         }
//     };

//     const handleCheckboxChange = (key) => {
//         setCheckedValues(prevState => ({
//             ...prevState,
//             [key]: !prevState[key]
//         }));
//     };

//     const handleSubmit = async () => {
//         const payload = {
//             userId: selectedUserId,
//             ...Object.fromEntries(Object.entries(checkedValues).filter(([_, value]) => value))
//         };

//         try {
//             const response = await fetch("http://localhost:9081/api/compute", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (response.ok) {
//                 toast.success("Data submitted successfully!");
//                 setShowComputationControls(true);
//             } else {
//                 throw new Error("Failed to submit data");
//             }
//         } catch (error) {
//             console.error("Error submitting data:", error);
//             toast.error("Error submitting data!");
//         }
//     };

//     const handleTrainingButtonClick = async () => {
//         const selectedData = Object.keys(checkedValues).filter(key => checkedValues[key]);
//         const message = `Computation request submitted for the following data: ${selectedData.join(', ')}`;
//         toast.info(message);
//         const payload = { userId: selectedUserId };

//         try {
//             const response = await fetch('http://localhost:9081/compute', {
//                 method: 'POST',
//                 mode: 'cors',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload),
//             });

//             if (!response.ok) throw new Error('Network response was not ok');

//             toast.success("Computation started successfully!");
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error("Error starting computation!");
//         }
//     };

//     const handleRefreshStatusButtonClick = async () => {
//         try {
//             const response = await fetch('http://localhost:9081/get-logs', {
//                 method: 'GET',
//                 mode: 'cors',
//                 headers: { 'Content-Type': 'application/json' }
//             });

//             if (!response.ok) throw new Error('Network response was not ok');

//             const data = await response.json();
//             const jsonString = JSON.stringify(data, null, 4);
//             const multiLineString = jsonString.replace(/(?:\\[rn]|[\r\n]+)+/g, '\n');
//             setLog(multiLineString);
//         } catch (error) {
//             console.error('Error:', error);
//             setLog("No logs available yet.");
//             toast.error("Error fetching logs!");
//         }
//     };

//     const handleRunAll = async () => {
//         await handleSubmit();
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         await handleTrainingButtonClick();
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         await handleRefreshStatusButtonClick();
//     };

//     return (
//         <div className={styles.container}>
//             <h2 className={styles.heading}>User Data Management</h2>

//             <div className={styles.section}>
//                 <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

//                 <select className={styles.select} onChange={handleUserSelect} value={selectedUserId}>
//                     <option value="">Select a User</option>
//                     {users.map((userId, index) => (
//                         <option key={index} value={userId}>{userId}</option>
//                     ))}
//                 </select>

//                 {isLoadingDataCollections && (
//                     <div className={styles.loadingContainer}>
//                         <div className={styles.loadingSpinner}></div>
//                         <p>Loading Available Data Collections...</p>
//                     </div>
//                 )}

//                 {selectedUserId && Object.keys(checkedValues).length > 0 && !isLoadingDataCollections && (
//                     <div className={styles.section}>
//                         <h3 className={styles.subHeading}>Available Data Collections</h3>
//                         {Object.entries(checkedValues).map(([key, value]) => (
//                             <div key={key}>
//                                 <label className={styles.label}>
//                                     <input
//                                         type="checkbox"
//                                         className={styles.checkbox}
//                                         checked={value}
//                                         onChange={() => handleCheckboxChange(key)}
//                                     />
//                                     {key}
//                                 </label>
//                             </div>
//                         ))}
//                         <button className={styles.button} onClick={handleRunAll}>🚀 Start Computation</button>
//                         <button
//                             className={styles.buttonSecondary}
//                             onClick={() => setToggle(prev => !prev)}
//                         >
//                             {toggle ? "Hide Advanced Logs" : "Show Advanced Logs"}
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {showComputationControls && (
//                 <div className={styles.section}>
//                     <h3 className={styles.subHeading}>Computation Logs:</h3>
//                     <textarea
//                         className={styles.textarea}
//                         rows="10"
//                         cols="50"
//                         value={log}
//                         readOnly
//                         placeholder="Computation logs will appear here..."
//                     />
//                 </div>
//             )}

//             <ToastContainer />
//         </div>
//     );
// };

// export default ComputationPage;



// import React, { useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import styles from './compute.module.css';

// const ComputationPage = () => {
//     const [users, setUsers] = useState([]);
//     const [selectedUserId, setSelectedUserId] = useState("");
//     const [checkedValues, setCheckedValues] = useState({});
//     const [log, setLog] = useState("");
//     const [showComputationControls, setShowComputationControls] = useState(false);
//     const [isLoadingDataCollections, setIsLoadingDataCollections] = useState(false);
//     const [toggle, setToggle] = useState(false);

//     const fetchUsers = async () => {
//         try {
//             const response = await fetch("http://localhost:9081/api/participants");
//             const data = await response.json();
//             setUsers(data);
//         } catch (error) {
//             console.error("Error fetching users:", error);
//             toast.error("Error fetching users!");
//         }
//     };

//     const handleUserSelect = async (event) => {
//         const userId = event.target.value;
//         setSelectedUserId(userId);
//         setIsLoadingDataCollections(true);

//         try {
//             const controlResponse = await fetch("http://localhost:9081/oauth/fetchUserControlData", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ userId })
//             });

//             if (!controlResponse.ok) throw new Error("Failed to fetch user control data");

//             await new Promise(resolve => setTimeout(resolve, 3000));

//             const listResponse = await fetch("http://localhost:9081/oauth/fetchUserList");
//             if (!listResponse.ok) throw new Error("Failed to fetch user list");

//             const fetchedData = await listResponse.json();
//             delete fetchedData.spotify_data;
//             delete fetchedData.spotify_data_DataPlaylists;
//             delete fetchedData.spotify_data_PlayListsSongs;

//             const filtered = Object.fromEntries(
//                 Object.entries(fetchedData).filter(([_, value]) => value === true)
//             );

//             setCheckedValues(filtered);
//         } catch (error) {
//             console.error("Error fetching user data:", error);
//             toast.error("Error fetching user data!");
//         } finally {
//             setIsLoadingDataCollections(false);
//         }
//     };

//     const handleCheckboxChange = (key) => {
//         setCheckedValues(prevState => ({
//             ...prevState,
//             [key]: !prevState[key]
//         }));
//     };

//     const handleSubmit = async () => {
//         const payload = {
//             userId: selectedUserId,
//             ...Object.fromEntries(Object.entries(checkedValues).filter(([_, value]) => value))
//         };

//         try {
//             const response = await fetch("http://localhost:9081/api/compute", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (response.ok) {
//                 toast.success("Data submitted successfully!");
//                 setShowComputationControls(true);
//             } else {
//                 throw new Error("Failed to submit data");
//             }
//         } catch (error) {
//             console.error("Error submitting data:", error);
//             toast.error("Error submitting data!");
//         }
//     };

//     const handleTrainingButtonClick = async () => {
//         const selectedData = Object.keys(checkedValues).filter(key => checkedValues[key]);
//         const message = `Computation request submitted for the following data: ${selectedData.join(', ')}`;
//         toast.info(message);
//         const payload = { userId: selectedUserId };

//         try {
//             const response = await fetch('http://localhost:9081/compute', {
//                 method: 'POST',
//                 mode: 'cors',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload),
//             });

//             if (!response.ok) throw new Error('Network response was not ok');

//             toast.success("Computation started successfully!");
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error("Error starting computation!");
//         }
//     };

//     const handleRefreshStatusButtonClick = async () => {
//         try {
//             const response = await fetch('http://localhost:9081/get-logs', {
//                 method: 'GET',
//                 mode: 'cors',
//                 headers: { 'Content-Type': 'application/json' }
//             });

//             if (!response.ok) throw new Error('Network response was not ok');

//             const data = await response.json();
//             const jsonString = JSON.stringify(data, null, 4);
//             const multiLineString = jsonString.replace(/(?:\\[rn]|[\r\n]+)+/g, '\n');
//             setLog(multiLineString);
//         } catch (error) {
//             console.error('Error:', error);
//             setLog("No logs available yet.");
//             toast.error("Error fetching logs!");
//         }
//     };

//     const handleRunAll = async () => {
//         await handleSubmit();
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         await handleTrainingButtonClick();
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         await handleRefreshStatusButtonClick();
//     };

//     return (
//         <div className={styles.container}>
//             <h2 className={styles.heading}>User Data Management</h2>

//             <div className={styles.section}>
//                 <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

//                 <select className={styles.select} onChange={handleUserSelect} value={selectedUserId}>
//                     <option value="">Select a User</option>
//                     {users.map((userId, index) => (
//                         <option key={index} value={userId}>{userId}</option>
//                     ))}
//                 </select>

//                 {isLoadingDataCollections && (
//                     <div className={styles.loadingContainer}>
//                         <div className={styles.loadingSpinner}></div>
//                         <p>Loading Available Data Collections...</p>
//                     </div>
//                 )}

//                 {selectedUserId && Object.keys(checkedValues).length === 0 && !isLoadingDataCollections && (
//                     <div className="mt-6 text-center bg-yellow-100 text-yellow-800 font-semibold px-4 py-3 rounded-lg shadow-md">
//                     ⚠️ The selected user has not granted access to any data collections.
//                     <br />
//                     <span className="text-sm font-normal text-gray-700">
//                       Please ask the user to enable access from their Access Control settings.
//                     </span>
//                   </div>
                  
//                 )}

//                 {selectedUserId && Object.keys(checkedValues).length > 0 && !isLoadingDataCollections && (
//                     <div className={styles.section}>
//                         <h3 className={styles.subHeading}>Available Data Collections</h3>
//                         {Object.entries(checkedValues).map(([key, value]) => (
//                             <div key={key}>
//                                 <label className={styles.label}>
//                                     <input
//                                         type="checkbox"
//                                         className={styles.checkbox}
//                                         checked={value}
//                                         onChange={() => handleCheckboxChange(key)}
//                                     />
//                                     {key}
//                                 </label>
//                             </div>
//                         ))}
//                         <button className={styles.button} onClick={handleRunAll}>🚀 Start Computation</button>
//                         <button
//                             className={styles.buttonSecondary}
//                             onClick={() => setToggle(prev => !prev)}
//                         >
//                             {toggle ? "Hide Advanced Logs" : "Show Advanced Logs"}
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {showComputationControls && (
//                 <div className={styles.section}>
//                     <h3 className={styles.subHeading}>Computation Logs:</h3>
//                     <textarea
//                         className={styles.textarea}
//                         rows="10"
//                         cols="50"
//                         value={log}
//                         readOnly
//                         placeholder="Computation logs will appear here..."
//                     />
//                 </div>
//             )}

//             <ToastContainer />
//         </div>
//     );
// };

// export default ComputationPage;


// Without Checking No user
// import React, { useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import styles from './compute.module.css';

// const ComputationPage = () => {
//     const [users, setUsers] = useState([]);
//     const [selectedUserId, setSelectedUserId] = useState("");
//     const [checkedValues, setCheckedValues] = useState({});
//     const [log, setLog] = useState("");
//     const [showComputationControls, setShowComputationControls] = useState(false);
//     const [isLoadingDataCollections, setIsLoadingDataCollections] = useState(false);
//     const [toggle, setToggle] = useState(false);

//     const fetchUsers = async () => {
//         try {
//             const response = await fetch("http://localhost:9081/api/participants");
//             const data = await response.json();
//             setUsers(data);
//         } catch (error) {
//             console.error("Error fetching users:", error);
//             toast.error("Error fetching users!");
//         }
//     };

//     const handleUserSelect = async (event) => {
//         const userId = event.target.value;
//         setSelectedUserId(userId);
//         setIsLoadingDataCollections(true);

//         try {
//             const controlResponse = await fetch("http://localhost:9081/oauth/fetchUserControlData", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ userId })
//             });

//             if (!controlResponse.ok) throw new Error("Failed to fetch user control data");

//             await new Promise(resolve => setTimeout(resolve, 3000));

//             const listResponse = await fetch("http://localhost:9081/oauth/fetchUserList");
//             if (!listResponse.ok) throw new Error("Failed to fetch user list");

//             const fetchedData = await listResponse.json();

//             // ✅ Filter out any Strava fields
//             const allowedKeys = [
//                 "Reddit_Saved_Posts",
//                 "Reddit_Up_Voted_Posts",
//                 "Reddit_Doen_Voted_Posts",
//                 "spotify_data_DataPlaylists",
//                 "spotify_data_PlayListsSongs",
//                 "spotify_data_TopArtists"
//             ];

//             const filtered = Object.fromEntries(
//                 Object.entries(fetchedData)
//                     .filter(([key, value]) => allowedKeys.includes(key) && value === true)
//             );

//             setCheckedValues(filtered);
//         } catch (error) {
//             console.error("Error fetching user data:", error);
//             toast.error("Error fetching user data!");
//         } finally {
//             setIsLoadingDataCollections(false);
//         }
//     };

//     const handleCheckboxChange = (key) => {
//         setCheckedValues(prevState => ({
//             ...prevState,
//             [key]: !prevState[key]
//         }));
//     };

//     const handleSubmit = async () => {
//         const payload = {
//             userId: selectedUserId,
//             ...Object.fromEntries(Object.entries(checkedValues).filter(([_, value]) => value))
//         };

//         try {
//             const response = await fetch("http://localhost:9081/api/compute", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (response.ok) {
//                 toast.success("Data submitted successfully!");
//                 setShowComputationControls(true);
//             } else {
//                 throw new Error("Failed to submit data");
//             }
//         } catch (error) {
//             console.error("Error submitting data:", error);
//             toast.error("Error submitting data!");
//         }
//     };

//     const handleTrainingButtonClick = async () => {
//         const selectedData = Object.keys(checkedValues).filter(key => checkedValues[key]);
//         const message = `Computation request submitted for the following data: ${selectedData.join(', ')}`;
//         toast.info(message);
//         const payload = { userId: selectedUserId };

//         try {
//             const response = await fetch('http://localhost:9081/compute', {
//                 method: 'POST',
//                 mode: 'cors',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload),
//             });

//             if (!response.ok) throw new Error('Network response was not ok');

//             toast.success("Computation started successfully!");
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error("Error starting computation!");
//         }
//     };

//     const handleRefreshStatusButtonClick = async () => {
//         try {
//             const response = await fetch('http://localhost:9081/get-logs', {
//                 method: 'GET',
//                 mode: 'cors',
//                 headers: { 'Content-Type': 'application/json' }
//             });

//             if (!response.ok) throw new Error('Network response was not ok');

//             const data = await response.json();
//             const jsonString = JSON.stringify(data, null, 4);
//             const multiLineString = jsonString.replace(/(?:\\[rn]|[\r\n]+)+/g, '\n');
//             setLog(multiLineString);
//         } catch (error) {
//             console.error('Error:', error);
//             setLog("No logs available yet.");
//             toast.error("Error fetching logs!");
//         }
//     };

//     const handleRunAll = async () => {
//         await handleSubmit();
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         await handleTrainingButtonClick();
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         await handleRefreshStatusButtonClick();
//     };

//     return (
//         <div className={styles.container}>
//             <h2 className={styles.heading}>User Data Management</h2>

//             <div className={styles.section}>
//                 <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

//                 <select className={styles.select} onChange={handleUserSelect} value={selectedUserId}>
//                     <option value="">Select a User</option>
//                     {users.map((userId, index) => (
//                         <option key={index} value={userId}>{userId}</option>
//                     ))}
//                 </select>

//                 {isLoadingDataCollections && (
//                     <div className={styles.loadingContainer}>
//                         <div className={styles.loadingSpinner}></div>
//                         <p>Loading Available Data Collections...</p>
//                     </div>
//                 )}

//                 {selectedUserId && Object.keys(checkedValues).length === 0 && !isLoadingDataCollections && (
//                     <div className="mt-6 text-center bg-yellow-100 text-yellow-800 font-semibold px-4 py-3 rounded-lg shadow-md">
//                         ⚠️ The selected user has not granted access to any data collections.
//                         <br />
//                         <span className="text-sm font-normal text-gray-700">
//                             Please ask the user to enable access from their Access Control settings.
//                         </span>
//                     </div>
//                 )}

//                 {selectedUserId && Object.keys(checkedValues).length > 0 && !isLoadingDataCollections && (
//                     <div className={styles.section}>
//                         <h3 className={styles.subHeading}>Available Data Collections</h3>
//                         {Object.entries(checkedValues).map(([key, value]) => (
//                             <div key={key}>
//                                 <label className={styles.label}>
//                                     <input
//                                         type="checkbox"
//                                         className={styles.checkbox}
//                                         checked={value}
//                                         onChange={() => handleCheckboxChange(key)}
//                                     />
//                                     {key}
//                                 </label>
//                             </div>
//                         ))}
//                         <button className={styles.button} onClick={handleRunAll}>🚀 Start Computation</button>
//                         <button
//                             className={styles.buttonSecondary}
//                             onClick={() => setToggle(prev => !prev)}
//                         >
//                             {toggle ? "Hide Advanced Logs" : "Show Advanced Logs"}
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {showComputationControls && (
//                 <div className={styles.section}>
//                     <h3 className={styles.subHeading}>Computation Logs:</h3>
//                     <textarea
//                         className={styles.textarea}
//                         rows="10"
//                         cols="50"
//                         value={log}
//                         readOnly
//                         placeholder="Computation logs will appear here..."
//                     />
//                 </div>
//             )}

//             <ToastContainer />
//         </div>
//     );
// };

// export default ComputationPage;



import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from './compute.module.css';

const ComputationPage = () => {
  const [users, setUsers] = useState([]);
  const [usersFetched, setUsersFetched] = useState(false); // ✅ NEW
  const [selectedUserId, setSelectedUserId] = useState("");
  const [checkedValues, setCheckedValues] = useState({});
  const [log, setLog] = useState("");
  const [showComputationControls, setShowComputationControls] = useState(false);
  const [isLoadingDataCollections, setIsLoadingDataCollections] = useState(false);
  const [toggle, setToggle] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:9081/api/participants");
      const data = await response.json();
      setUsers(data);
      setUsersFetched(true); // ✅ Mark as fetched

      if (data.length === 0) {
        toast.warn("⚠️ No user is connected.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users!");
      setUsersFetched(true); // ✅ Even if error, mark as attempted
    }
  };

  const handleUserSelect = async (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    setIsLoadingDataCollections(true);

    try {
      const controlResponse = await fetch("http://localhost:9081/oauth/fetchUserControlData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (!controlResponse.ok) throw new Error("Failed to fetch user control data");

      await new Promise(resolve => setTimeout(resolve, 3000));

      const listResponse = await fetch("http://localhost:9081/oauth/fetchUserList");
      if (!listResponse.ok) throw new Error("Failed to fetch user list");

      const fetchedData = await listResponse.json();

      const allowedKeys = [
        "Reddit_Saved_Posts",
        "Reddit_Up_Voted_Posts",
        "Reddit_Doen_Voted_Posts",
        "spotify_data_DataPlaylists",
        "spotify_data_PlayListsSongs",
        "spotify_data_TopArtists"
      ];

      const filtered = Object.fromEntries(
        Object.entries(fetchedData).filter(([key, value]) => allowedKeys.includes(key) && value === true)
      );

      setCheckedValues(filtered);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error fetching user data!");
    } finally {
      setIsLoadingDataCollections(false);
    }
  };

  const handleCheckboxChange = (key) => {
    setCheckedValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      userId: selectedUserId,
      ...Object.fromEntries(Object.entries(checkedValues).filter(([_, value]) => value))
    };

    try {
      const response = await fetch("http://localhost:9081/api/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Data submitted successfully!");
        setShowComputationControls(true);
      } else {
        throw new Error("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error submitting data!");
    }
  };

  const handleTrainingButtonClick = async () => {
    const selectedData = Object.keys(checkedValues).filter(key => checkedValues[key]);
    toast.info(`Computation request submitted for: ${selectedData.join(', ')}`);
    const payload = { userId: selectedUserId };

    try {
      const response = await fetch('http://localhost:9081/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      toast.success("Computation started successfully!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error starting computation!");
    }
  };

  const handleRefreshStatusButtonClick = async () => {
    try {
      const response = await fetch('http://localhost:9081/get-logs', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const multiLineString = JSON.stringify(data, null, 4).replace(/(?:\\[rn]|[\r\n]+)+/g, '\n');
      setLog(multiLineString);
    } catch (error) {
      console.error('Error:', error);
      setLog("No logs available yet.");
      toast.error("Error fetching logs!");
    }
  };

  const handleRunAll = async () => {
    await handleSubmit();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await handleTrainingButtonClick();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await handleRefreshStatusButtonClick();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>User Data Management</h2>

      <div className={styles.section}>
        <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

        <select className={styles.select} onChange={handleUserSelect} value={selectedUserId} disabled={users.length === 0}>
          <option value="">Select a User</option>
          {users.map((userId, index) => (
            <option key={index} value={userId}>{userId}</option>
          ))}
        </select>

        {usersFetched && users.length === 0 && !isLoadingDataCollections && (
          <div className="mt-4 text-center text-yellow-600 font-semibold">
            ⚠️ No user is connected. Please onboard users first.
          </div>
        )}

        {isLoadingDataCollections && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading Available Data Collections...</p>
          </div>
        )}

        {selectedUserId && Object.keys(checkedValues).length === 0 && !isLoadingDataCollections && (
          <div className="mt-6 text-center bg-yellow-100 text-yellow-800 font-semibold px-4 py-3 rounded-lg shadow-md">
            ⚠️ The selected user has not granted access to any data collections.
            <br />
            <span className="text-sm font-normal text-gray-700">
              Please ask the user to enable access from their Access Control settings.
            </span>
          </div>
        )}

        {selectedUserId && Object.keys(checkedValues).length > 0 && !isLoadingDataCollections && (
          <div className={styles.section}>
            <h3 className={styles.subHeading}>Available Data Collections</h3>
            {Object.entries(checkedValues).map(([key, value]) => (
              <label key={key} className={styles.label}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={value}
                  onChange={() => handleCheckboxChange(key)}
                />
                {key}
              </label>
            ))}
            <button className={styles.button} onClick={handleRunAll}>🚀 Start Computation</button>
            <button
              className={styles.buttonSecondary}
              onClick={() => setToggle(prev => !prev)}
            >
              {toggle ? "Hide Advanced Logs" : "Show Advanced Logs"}
            </button>
          </div>
        )}
      </div>

      {showComputationControls && (
        <div className={styles.section}>
          <h3 className={styles.subHeading}>Computation Logs:</h3>
          <textarea
            className={styles.textarea}
            rows="10"
            value={log}
            readOnly
            placeholder="Computation logs will appear here..."
          />
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ComputationPage;
