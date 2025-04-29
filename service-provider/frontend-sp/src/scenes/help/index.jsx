import React from 'react';
import { Typography } from '@mui/material';
import SectionCard from '../../components/SectionCard';

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
      <div className="max-w-4xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl p-6 sm:p-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">❓ Help / About</h2>
        <p className="mb-6 text-sm text-gray-500">
          Welcome to the Service Provider Portal! Below are brief descriptions of each section and how to use them effectively.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-indigo-700">📊 Dashboard</h3>
            <p className="text-sm text-gray-700 mt-1">
              View high-level metrics and charts summarizing data trends and recent activity.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-indigo-700">📥 Collected Data</h3>
            <p className="text-sm text-gray-700 mt-1">
              Shows all data collected from participants. You can view, filter, and download this data.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-indigo-700">👥 Participants</h3>
            <p className="text-sm text-gray-700 mt-1">
              Lists all connected participants and their credentials. You can inspect their shared data and access history.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-indigo-700">⚙️ Settings</h3>
            <p className="text-sm text-gray-700 mt-1">
              Manage data pulling preferences for each data source. You can turn on/off specific items and set frequency.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-indigo-700">🧠 Training</h3>
            <p className="text-sm text-gray-700 mt-1">
              Configure AI/ML models or pipelines that can use collected data for training purposes.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-indigo-700">🔄 Data Acquisition</h3>
            <p className="text-sm text-gray-700 mt-1">
              Setup how and when your system acquires new data — either through polling or event-driven triggers.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-indigo-700">⚙️ Computation</h3>
            <p className="text-sm text-gray-700 mt-1">
              View and run computations or analytics on the collected datasets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
