import React, { useState } from 'react';
import axios from 'axios';

const YtData = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("Selected file:", file);
    console.log("Selected filedata:", formData);
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: (File)`, {
          name: value.name,
          size: value.size,
          type: value.type,
        });
      } else {
        console.log(`${key}:`, value);
      }
    }

    try {
      await axios.post("http://localhost:9080/api/yt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Upload successful!");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md my-4 w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">📤 Upload YouTube CSV Data</h3>
      
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full mb-3 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
      />

      <button
        onClick={handleUpload}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        Upload
      </button>
    </div>
  );
};

export default YtData;
