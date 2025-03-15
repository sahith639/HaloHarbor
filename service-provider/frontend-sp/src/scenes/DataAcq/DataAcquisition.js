import React, { useState } from "react";

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:9081/api/participants");
            const data = await response.json();
            setUsers(data); // Assuming data is an array of user IDs (strings)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleUserSelect = async (event) => {
        const userId = event.target.value;
        setSelectedUserId(userId);

        try {
            // Make the request to the backend to trigger computeHandler
            const response = await fetch(`http://localhost:9081/api/compute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ connId: userId }), // Sending the selected connId
            });

            if (response.ok) {
                console.log("Compute initiated successfully for connId:", userId);
            } else {
                console.error("Failed to trigger compute for connId:", userId);
            }
        } catch (error) {
            console.error("Error triggering compute:", error);
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

            {/* Optionally, you can display additional information here */}
            {selectedUserId && <p>Selected User ID: {selectedUserId}</p>}
        </div>
    );
};

export default UsersList;
