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

    return (
        <div className={styles.container}>
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
                <div>
                    <h3 className={styles.heading}>Available Data Collections</h3>
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
