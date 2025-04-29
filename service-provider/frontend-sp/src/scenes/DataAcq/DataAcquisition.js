// import React, { useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import styles from './UsersList.module.css';

// const UsersList = () => {
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
//     const handleFetchData = async () => {
//         try {
//             const response = await fetch("http://localhost:9081/oauth/getDAData");
//             if (!response.ok) throw new Error("Failed to fetch data");

//             const result = await response.json();
//             setData(JSON.stringify(result, null, 2));
//         } catch (error) {
//             console.error("Error fetching data:", error);
//             toast.error("Error fetching data!");
//         }
//     };

//     // Handle Compute button click
//     const handleTrainingButtonClick = () => {
//         console.log('Training button clicked');
//         fetch('http://localhost:9081/compute', {
//             method: 'GET',
//             mode: 'cors',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
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

//                 {isFetchEnabled && (
//                     <div className={styles.section}>
//                         <button className={styles.button} onClick={handleFetchData}>Fetch Data</button>
//                         <textarea
//                             className={styles.textarea}
//                             rows="10"
//                             cols="50"
//                             value={data}
//                             readOnly
//                             placeholder="Fetched data will be displayed here..."
//                         />
//                     </div>
//                 )}
//             </div>

//             {/*{showComputationControls && (*/}
//             {/*    <div className={styles.section}>*/}
//             {/*        <h2 className={styles.heading}>Computation Controls</h2>*/}
//             {/*        <div className={styles.buttonGroup}>*/}
//             {/*            <button className={styles.button} onClick={handleTrainingButtonClick}>Compute</button>*/}
//             {/*            <button className={styles.button} onClick={handleRefreshStatusButtonClick}>Refresh Status</button>*/}
//             {/*        </div>*/}

//             {/*        <h3 className={styles.subHeading}>Computation Logs:</h3>*/}
//             {/*        <textarea*/}
//             {/*            className={styles.textarea}*/}
//             {/*            rows="10"*/}
//             {/*            cols="50"*/}
//             {/*            value={log}*/}
//             {/*            readOnly*/}
//             {/*            placeholder="Computation logs will appear here..."*/}
//             {/*        />*/}
//             {/*    </div>*/}
//             {/*)}*/}

//             <ToastContainer />
//         </div>
//     );
// };

// export default UsersList;


//New Code

// import React, { useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import styles from './UsersList.module.css';

// const UsersList = () => {
//     const [users, setUsers] = useState([]);
//     const [selectedUserId, setSelectedUserId] = useState("");
//     const [checkedValues, setCheckedValues] = useState({});
//     const [data, setData] = useState("");
//     const [isLoadingDataCollections, setIsLoadingDataCollections] = useState(false);

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

//     const handleRunAcquisition = async () => {
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

//             if (!response.ok) throw new Error("Failed to submit data");

//             toast.success("Data submitted successfully!");
//         } catch (error) {
//             console.error("Error submitting data:", error);
//             toast.error("Error submitting data!");
//             return;
//         }

//         await new Promise(resolve => setTimeout(resolve, 1000));

//         try {
//             const response = await fetch(`http://localhost:9081/oauth/getDAData?userId=${selectedUserId}`);
//             if (!response.ok) throw new Error("Failed to fetch data");

//             const result = await response.json();
//             setData(JSON.stringify(result, null, 2));
//             toast.success("Data fetched successfully!");
//         } catch (error) {
//             console.error("Error fetching data:", error);
//             toast.error("Error fetching data!");
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
//                         <button className={styles.button} onClick={handleRunAcquisition}>🚀 Run Acquisition</button>
//                     </div>
//                 )}

//                 {data && (
//                     <div className={styles.section}>
//                         <h3 className={styles.subHeading}>Fetched Data</h3>
//                         <textarea
//                             className={styles.textarea}
//                             rows="10"
//                             cols="50"
//                             value={data}
//                             readOnly
//                             placeholder="Fetched data will be displayed here..."
//                         />
//                     </div>
//                 )}
//             </div>

//             <ToastContainer />
//         </div>
//     );
// };

// export default UsersList;

// With Status change

// import React, { useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import styles from './UsersList.module.css';

// const UsersList = () => {
//     const [users, setUsers] = useState([]);
//     const [selectedUserId, setSelectedUserId] = useState("");
//     const [checkedValues, setCheckedValues] = useState({});
//     const [data, setData] = useState("");
//     const [isLoadingDataCollections, setIsLoadingDataCollections] = useState(false);
//     const [isAcquiring, setIsAcquiring] = useState(false);

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
//             await new Promise(resolve => setTimeout(resolve, 2000));

//             const listResponse = await fetch("http://localhost:9081/oauth/fetchUserList");
//             if (!listResponse.ok) throw new Error("Failed to fetch user list");

//             const fetchedData = await listResponse.json();
//             setCheckedValues(fetchedData);

//         } catch (error) {
//             console.error("Error fetching user data:", error);
//             toast.error("Error fetching user data!");
//         } finally {
//             setIsLoadingDataCollections(false);
//         }
//     };

//     const handleCheckboxChange = (key) => {
//         setCheckedValues(prev => ({ ...prev, [key]: !prev[key] }));
//     };

//     const handleRunAcquisition = async () => {
//         const confirm = window.confirm("Are you sure you want to start data acquisition?");
//         if (!confirm) return;

//         setIsAcquiring(true);

//         const payload = {
//             userId: selectedUserId,
//             ...Object.fromEntries(Object.entries(checkedValues).filter(([_, val]) => val))
//         };

//         try {
//             const postRes = await fetch("http://localhost:9081/api/compute", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload)
//             });

//             if (!postRes.ok) throw new Error("Failed to submit data");
//             toast.success("Submitted successfully!");

//             await new Promise(res => setTimeout(res, 2000));

//             const fetchRes = await fetch("http://localhost:9081/oauth/getDAData");
//             if (!fetchRes.ok) throw new Error("Failed to fetch data");

//             const result = await fetchRes.json();
//             setData(JSON.stringify(result, null, 2));
//             toast.success("Data fetched successfully!");
//         } catch (error) {
//             console.error("Error during acquisition:", error);
//             toast.error("Acquisition failed!");
//         } finally {
//             setIsAcquiring(false);
//         }
//     };

//     return (
//         <div className={styles.container}>
//             <h2 className={styles.heading}>User Data Acquisition</h2>

//             <div className={styles.section}>
//                 <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

//                 <select className={styles.select} onChange={handleUserSelect} value={selectedUserId}>
//                     <option value="">Select a User</option>
//                     {users.map((id, idx) => (
//                         <option key={idx} value={id}>{id}</option>
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
//                             <label key={key} className={styles.label}>
//                                 <input
//                                     type="checkbox"
//                                     checked={value}
//                                     onChange={() => handleCheckboxChange(key)}
//                                     className={styles.checkbox}
//                                 />
//                                 {key}
//                             </label>
//                         ))}
//                         <button
//                             className={styles.button}
//                             onClick={handleRunAcquisition}
//                             disabled={isAcquiring}
//                         >
//                             {isAcquiring ? "⏳ Acquiring..." : "🚀 Start Acquisition"}
//                         </button>
//                     </div>
//                 )}

//                 {data && (
//                     <div className={styles.section}>
//                         <h3 className={styles.subHeading}>Acquired Data</h3>
//                         <textarea
//                             className={styles.textarea}
//                             rows="10"
//                             value={data}
//                             readOnly
//                         />
//                     </div>
//                 )}
//             </div>

//             <ToastContainer />
//         </div>
//     );
// };

// export default UsersList;


// Without NO USER

// import React, { useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import styles from './UsersList.module.css';

// const UsersList = () => {
//   const [users, setUsers] = useState([]);
//   const [selectedUserId, setSelectedUserId] = useState("");
//   const [checkedValues, setCheckedValues] = useState({});
//   const [data, setData] = useState("");
//   const [isLoadingDataCollections, setIsLoadingDataCollections] = useState(false);
//   const [isAcquiring, setIsAcquiring] = useState(false);

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch("http://localhost:9081/api/participants");
//       const data = await response.json();
//       setUsers(data);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       toast.error("Error fetching users!");
//     }
//   };

//   const handleUserSelect = async (event) => {
//     const userId = event.target.value;
//     setSelectedUserId(userId);
//     setIsLoadingDataCollections(true);
//     setCheckedValues({}); // Reset previous

//     try {
//       const controlResponse = await fetch("http://localhost:9081/oauth/fetchUserControlData", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId })
//       });

//       if (!controlResponse.ok) throw new Error("Failed to fetch user control data");

//       await new Promise(resolve => setTimeout(resolve, 1500)); // slight delay

//       const listResponse = await fetch("http://localhost:9081/oauth/fetchUserList");
//       if (!listResponse.ok) throw new Error("Failed to fetch user list");

//       const fetchedData = await listResponse.json();

//       if (fetchedData && typeof fetchedData === 'object') {
//         const filtered = Object.fromEntries(
//           Object.entries(fetchedData).filter(([_, val]) => val === true)
//         );
//         setCheckedValues(filtered);
//       } else {
//         setCheckedValues({});
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       toast.error("Error fetching user data!");
//     } finally {
//       setIsLoadingDataCollections(false);
//     }
//   };

//   const handleCheckboxChange = (key) => {
//     setCheckedValues(prev => ({
//       ...prev,
//       [key]: !prev[key]
//     }));
//   };

//   const handleRunAcquisition = async () => {
//     if (!selectedUserId) return;
//     const confirm = window.confirm("Are you sure you want to start data acquisition?");
//     if (!confirm) return;

//     setIsAcquiring(true);

//     const payload = {
//       userId: selectedUserId,
//       ...Object.fromEntries(Object.entries(checkedValues).filter(([_, val]) => val))
//     };

//     try {
//       const postRes = await fetch("http://localhost:9081/api/compute", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       if (!postRes.ok) throw new Error("Failed to submit data");
//       toast.success("Acquisition request submitted!");

//       await new Promise(res => setTimeout(res, 1500));

//       const fetchRes = await fetch("http://localhost:9081/oauth/getDAData");
//       if (!fetchRes.ok) throw new Error("Failed to fetch data");

//       const result = await fetchRes.json();
//       setData(JSON.stringify(result, null, 2));
//       toast.success("Data fetched successfully!");
//     } catch (error) {
//       console.error("Error during acquisition:", error);
//       toast.error("Acquisition failed!");
//     } finally {
//       setIsAcquiring(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <ToastContainer />
//       <h2 className={styles.heading}>User Data Acquisition</h2>

//       <div className={styles.section}>
//         <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

//         <select className={styles.select} onChange={handleUserSelect} value={selectedUserId}>
//           <option value="">Select a User</option>
//           {users.map((id, idx) => (
//             <option key={idx} value={id}>{id}</option>
//           ))}
//         </select>

//         {isLoadingDataCollections && (
//           <div className={styles.loadingContainer}>
//             <div className={styles.loadingSpinner}></div>
//             <p>Loading Available Data Collections...</p>
//           </div>
//         )}

//         {selectedUserId && !isLoadingDataCollections && (
//           <>
//             {Object.keys(checkedValues).length > 0 ? (
//               <div className={styles.section}>
//                 <h3 className={styles.subHeading}>Available Data Collections</h3>
//                 {Object.entries(checkedValues).map(([key, value]) => (
//                   <label key={key} className={styles.label}>
//                     <input
//                       type="checkbox"
//                       checked={value}
//                       onChange={() => handleCheckboxChange(key)}
//                       className={styles.checkbox}
//                     />
//                     {key}
//                   </label>
//                 ))}
//                 <button
//                   className={styles.button}
//                   onClick={handleRunAcquisition}
//                   disabled={isAcquiring}
//                 >
//                   {isAcquiring ? "⏳ Acquiring..." : "🚀 Start Acquisition"}
//                 </button>
//               </div>
//             ) : (
//                 <div className="mt-6 text-center bg-yellow-100 text-yellow-800 font-semibold px-4 py-3 rounded-lg shadow-md">
//                 ⚠️ The selected user has not granted access to any data collections.
//                 <br />
//                 <span className="text-sm font-normal text-gray-700">
//                   Please ask the user to enable access from their Access Control settings.
//                 </span>
//               </div>
              
//             )}
//           </>
//         )}

//         {data && (
//           <div className={styles.section}>
//             <h3 className={styles.subHeading}>Acquired Data</h3>
//             <textarea
//               className={styles.textarea}
//               rows="10"
//               value={data}
//               readOnly
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UsersList;


import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from './UsersList.module.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [checkedValues, setCheckedValues] = useState({});
  const [data, setData] = useState("");
  const [isLoadingDataCollections, setIsLoadingDataCollections] = useState(false);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false); // ✅

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:9081/api/participants");
      const data = await response.json();
      setUsers(data);
      setHasFetchedUsers(true); // ✅ Set flag that we’ve fetched at least once
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users!");
    }
  };

  const handleUserSelect = async (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    setIsLoadingDataCollections(true);
    setCheckedValues({});

    try {
      const controlResponse = await fetch("http://localhost:9081/oauth/fetchUserControlData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (!controlResponse.ok) throw new Error("Failed to fetch user control data");
      await new Promise(resolve => setTimeout(resolve, 1500));

      const listResponse = await fetch("http://localhost:9081/oauth/fetchUserList");
      if (!listResponse.ok) throw new Error("Failed to fetch user list");

      const fetchedData = await listResponse.json();
      const filtered = Object.fromEntries(
        Object.entries(fetchedData).filter(([_, val]) => val === true)
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

  const handleRunAcquisition = async () => {
    if (!selectedUserId) return;
    const confirm = window.confirm("Are you sure you want to start data acquisition?");
    if (!confirm) return;

    setIsAcquiring(true);

    const payload = {
      userId: selectedUserId,
      ...Object.fromEntries(Object.entries(checkedValues).filter(([_, val]) => val))
    };

    try {
      const postRes = await fetch("http://localhost:9081/api/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!postRes.ok) throw new Error("Failed to submit data");
      toast.success("Acquisition request submitted!");

      await new Promise(res => setTimeout(res, 1500));

      const fetchRes = await fetch("http://localhost:9081/oauth/getDAData");
      if (!fetchRes.ok) throw new Error("Failed to fetch data");

      const result = await fetchRes.json();
      setData(JSON.stringify(result, null, 2));
      toast.success("Data fetched successfully!");
    } catch (error) {
      console.error("Error during acquisition:", error);
      toast.error("Acquisition failed!");
    } finally {
      setIsAcquiring(false);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <h2 className={styles.heading}>User Data Acquisition</h2>

      <div className={styles.section}>
        <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

        {hasFetchedUsers && users.length === 0 && (
          <div className="mt-6 text-center bg-yellow-100 text-yellow-800 font-semibold px-4 py-3 rounded-lg shadow-md">
            ⚠️ No user is connected. Please onboard users first.
          </div>
        )}

        {users.length > 0 && (
          <select className={styles.select} onChange={handleUserSelect} value={selectedUserId}>
            <option value="">Select a User</option>
            {users.map((id, idx) => (
              <option key={idx} value={id}>{id}</option>
            ))}
          </select>
        )}

        {isLoadingDataCollections && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading Available Data Collections...</p>
          </div>
        )}

        {selectedUserId && !isLoadingDataCollections && (
          <>
            {Object.keys(checkedValues).length > 0 ? (
              <div className={styles.section}>
                <h3 className={styles.subHeading}>Available Data Collections</h3>
                {Object.entries(checkedValues).map(([key, value]) => (
                  <label key={key} className={styles.label}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleCheckboxChange(key)}
                      className={styles.checkbox}
                    />
                    {key}
                  </label>
                ))}
                <button
                  className={styles.button}
                  onClick={handleRunAcquisition}
                  disabled={isAcquiring}
                >
                  {isAcquiring ? "⏳ Acquiring..." : "🚀 Start Acquisition"}
                </button>
              </div>
            ) : (
              <div className="mt-6 text-center bg-yellow-100 text-yellow-800 font-semibold px-4 py-3 rounded-lg shadow-md">
                ⚠️ The selected user has not granted access to any data collections.
                <br />
                <span className="text-sm font-normal text-gray-700">
                  Please ask the user to enable access from their Access Control settings.
                </span>
              </div>
            )}
          </>
        )}

        {data && (
          <div className={styles.section}>
            <h3 className={styles.subHeading}>Acquired Data</h3>
            <textarea
              className={styles.textarea}
              rows="10"
              value={data}
              readOnly
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
