import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify"; // Toast notifications
import "react-toastify/dist/ReactToastify.css"; // Toast styles
import styles from './UsersList.module.css'; // Import CSS module

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [checkedValues, setCheckedValues] = useState({});
    const [data, setData] = useState(""); // State to hold fetched data
    const [isFetchEnabled, setIsFetchEnabled] = useState(false); // Enable fetch button
    const [log, setLog] = useState(""); // State for computation logs
    const [showComputationControls, setShowComputationControls] = useState(false); // Control visibility of computation section

    // Fetch users list
    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:9081/api/participants");
            const data = await response.json();
            setUsers(data); // Assuming data is an array of user IDs
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Error fetching users!");
        }
    };

    // Handle user selection from dropdown
    const handleUserSelect = async (event) => {
        const userId = event.target.value;
        setSelectedUserId(userId);

        try {
            // Step 1: Call fetchUserControlData
            const controlResponse = await fetch("http://localhost:9081/oauth/fetchUserControlData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (!controlResponse.ok) throw new Error("Failed to fetch user control data");

            // Step 2: Wait for 3 seconds before calling fetchUserList
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Step 3: Fetch user list (which is a Map)
            const listResponse = await fetch("http://localhost:9081/oauth/fetchUserList");
            if (!listResponse.ok) throw new Error("Failed to fetch user list");

            const fetchedData = await listResponse.json(); // Expecting a Map<String, Boolean>

            setCheckedValues(fetchedData); // Update checkboxes dynamically

        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Error fetching user data!");
        }
    };

    // Handle checkbox toggle
    const handleCheckboxChange = (key) => {
        setCheckedValues(prevState => ({
            ...prevState,
            [key]: !prevState[key] // Toggle true/false
        }));
    };

    // Handle form submission
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
                setIsFetchEnabled(true); // Enable fetch button after successful submission
                setShowComputationControls(true); // Show computation controls after submission
            } else {
                throw new Error("Failed to submit data");
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            toast.error("Error submitting data!");
        }
    };

    // Handle fetch data on button click
    const handleFetchData = async () => {
        try {
            const response = await fetch("http://localhost:9081/oauth/getDAData");
            if (!response.ok) throw new Error("Failed to fetch data");

            const result = await response.json();
            setData(JSON.stringify(result, null, 2)); // Format the fetched data
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error fetching data!");
        }
    };

    // Handle Compute button click
    const handleTrainingButtonClick = () => {
        console.log('Training button clicked');
        fetch('http://localhost:9081/compute', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log('Response:', response.text());
            })
            .then(data => {
                console.log('Success:', data);
                toast.success("Computation started successfully!");
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error("Error starting computation!");
            });
    };

    // Handle Refresh Status button click
    const handleRefreshStatusButtonClick = async () => {
        try {
            const response = await fetch('http://localhost:9081/get-logs', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const jsonString = JSON.stringify(data, null, 4); // Use 4 spaces for indentation
            const multiLineString = jsonString.replace(/(?:\\[rn]|[\r\n]+)+/g, '\n');
            console.log(multiLineString);
            setLog(multiLineString);
        } catch (error) {
            console.error('Error:', error);
            toast.error("Error fetching logs!");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>User Data Management</h2>

            <div className={styles.section}>
                <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

                {/* Dropdown to select a user */}
                <select className={styles.select} onChange={handleUserSelect} value={selectedUserId}>
                    <option value="">Select a User</option>
                    {users.map((userId, index) => (
                        <option key={index} value={userId}>{userId}</option>
                    ))}
                </select>

                {/* Dynamically render checkboxes if a user is selected */}
                {selectedUserId && Object.keys(checkedValues).length > 0 && (
                    <div className={styles.section}>
                        <h3 className={styles.subHeading}>Available Data Collections</h3>
                        {Object.entries(checkedValues).map(([key, value]) => (
                            <div key={key}>
                                <label className={styles.label}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={value}
                                        onChange={() => handleCheckboxChange(key)}
                                    />
                                    {key}
                                </label>
                            </div>
                        ))}
                        <button className={styles.button} onClick={handleSubmit}>Submit</button>
                    </div>
                )}

                {/* Display the fetch button and textarea */}
                {isFetchEnabled && (
                    <div className={styles.section}>
                        <button className={styles.button} onClick={handleFetchData}>Fetch Data</button>
                        <textarea
                            className={styles.textarea}
                            rows="10"
                            cols="50"
                            value={data}
                            readOnly
                            placeholder="Fetched data will be displayed here..."
                        />
                    </div>
                )}
            </div>

            {/* Show Computation Controls only after submission */}
            {showComputationControls && (
                <div className={styles.section}>
                    <h2 className={styles.heading}>Computation Controls</h2>
                    <div className={styles.buttonGroup}>
                        <button className={styles.button} onClick={handleTrainingButtonClick}>Compute</button>
                        <button className={styles.button} onClick={handleRefreshStatusButtonClick}>Refresh Status</button>
                    </div>

                    <h3 className={styles.subHeading}>Computation Logs:</h3>
                    <textarea
                        className={styles.textarea}
                        rows="10"
                        cols="50"
                        value={log}
                        readOnly
                        placeholder="Computation logs will appear here..."
                    />
                </div>
            )}

            {/* Toast container for notifications */}
            <ToastContainer />
        </div>
    );
};

export default UsersList;