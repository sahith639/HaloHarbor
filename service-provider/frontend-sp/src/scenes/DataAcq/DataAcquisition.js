import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify"; // Correct import for toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import styles for toastify
import styles from './UsersList.module.css'; // Import the CSS module

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [checkedValues, setCheckedValues] = useState({});
    const [data, setData] = useState(""); // State to hold fetched data
    const [isFetchEnabled, setIsFetchEnabled] = useState(false); // State to enable fetch button

    // List of checkboxes with default checked state
    const checkboxItems = [
        "Reddit_Up_Voted_Posts",
        "Reddit_Saved_Posts",
        "Reddit_Doen_Voted_Posts",
        "spotify_data",
        "spotify_data_DataPlaylists",
        "spotify_data_PlayListsSongs"
    ];

    // Fetch users list
    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:9081/api/participants");
            const data = await response.json();
            setUsers(data); // Assuming data is an array of user IDs
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Handle user selection
    const handleUserSelect = (event) => {
        const userId = event.target.value;
        setSelectedUserId(userId);

        // Initialize the checked values (all true initially)
        const initialCheckedValues = {};
        checkboxItems.forEach(item => {
            initialCheckedValues[item] = true;
        });
        setCheckedValues(initialCheckedValues);
    };

    // Handle checkbox change
    const handleCheckboxChange = (key) => {
        setCheckedValues(prevState => ({
            ...prevState,
            [key]: !prevState[key] // Toggle true/false
        }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Construct request payload (direct key-value pairs)
        const payload = {
            userId: selectedUserId,
            ...Object.fromEntries(
                Object.entries(checkedValues).filter(([_, value]) => value === true)
            )
        };

        try {
            const response = await fetch("http://localhost:9081/api/compute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // Show success toast notification
                toast.success("Data submitted successfully!");
                setIsFetchEnabled(true); // Enable fetch button after successful submission
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
            const response = await fetch("http://localhost:9080/oauth/getDAData");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const result = await response.json();
            setData(JSON.stringify(result, null, 2)); // Format the fetched data for display
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error fetching data!");
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.button} onClick={fetchUsers}>Fetch Users</button>

            {/* Dropdown to select a user */}
            <select className={styles.select} onChange={handleUserSelect} value={selectedUserId}>
                <option value="">Select a User</option>
                {users.map((userId, index) => (
                    <option key={index} value={userId}>
                        {userId}
                    </option>
                ))}
            </select>

            {/* Display checkboxes if a user is selected */}
            {selectedUserId && (
                <div>
                    <h3 className={styles.heading}>Available Data Collections</h3>
                    {checkboxItems.map((item) => (
                        <div key={item}>
                            <label className={styles.label}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={checkedValues[item]}
                                    onChange={() => handleCheckboxChange(item)}
                                />
                                {item}
                            </label>
                        </div>
                    ))}
                    <button className={styles.button} onClick={handleSubmit}>Submit</button>
                </div>
            )}

            {/* Display the fetch button and textarea */}
            {isFetchEnabled && (
                <div>
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

            {/* Toast container for notifications */}
            <ToastContainer />
        </div>
    );
};

export default UsersList;
