import React, { useState } from "react";

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [checkedValues, setCheckedValues] = useState({});

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

            if (!response.ok) {
                throw new Error("Failed to submit data");
            }

            console.log("Submitted successfully:", payload);
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };

    return (
        <div>
            <button onClick={fetchUsers}>Fetch Users</button>

            {/* Dropdown to select a user */}
            <select onChange={handleUserSelect} value={selectedUserId}>
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
                    <h3>Available Data Collections</h3>
                    {checkboxItems.map((item) => (
                        <div key={item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={checkedValues[item]}
                                    onChange={() => handleCheckboxChange(item)}
                                />
                                {item}
                            </label>
                        </div>
                    ))}
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            )}
        </div>
    );
};

export default UsersList;
