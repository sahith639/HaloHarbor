// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Users, Mail, Database, Activity } from 'lucide-react';

// const Dashboard = () => {
//   const [stats, setStats] = useState({
//     participants: 0,
//     invitations: 0,
//     dataSources: 0,
//     lastTrainingTime: 'N/A',
//   });

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const [participantsRes, invitationsRes, logsRes] = await Promise.all([
//           fetch('http://localhost:9081/api/participants'),
//           fetch('http://localhost:9081/invitations'),
//           fetch('http://localhost:9081/get-logs'),
//         ]);

//         const participants = await participantsRes.json();
//         const invitations = await invitationsRes.json();
//         const logs = await logsRes.json();

//         const lastTraining = logs?.value?.split('\n').find(line => line.includes('Training started'));

//         setStats({
//           participants: participants.length,
//           invitations: invitations.length,
//           dataSources: 2, // e.g., Reddit + Spotify
//           lastTrainingTime: lastTraining || 'N/A',
//         });
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       }
//     };

//     fetchStats();
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
//       <p className="text-white text-lg mb-6">Overview and quick access</p>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//         <Card title="Connected Participants" value={stats.participants} icon={Users} />
//         <Card title="Active Invitations" value={stats.invitations} icon={Mail} />
//         <Card title="Data Sources" value={stats.dataSources} icon={Database} />
//         <Card title="Last Training" value={stats.lastTrainingTime} icon={Activity} />
//       </div>

//       <div className="flex flex-wrap gap-4">
//         <button
//           onClick={() => navigate('/participants')}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
//         >
//           📩 Create Invitation
//         </button>

//         <button
//           onClick={() => navigate('/training')}
//           className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition"
//         >
//           🚀 Start Training
//         </button>
//       </div>
//     </div>
//   );
// };

// const Card = ({ title, value, icon: Icon }) => (
//   <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition w-full">
//     <div className="flex items-center gap-3 mb-2">
//       {Icon && <Icon className="text-gray-700" size={20} />}
//       <span className="text-lg font-semibold text-black">{value}</span>
//     </div>
//     <p className="text-sm text-gray-500">{title}</p>
//   </div>
// );

// export default Dashboard;


// With some minor changes 

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Database, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    participants: 0,
    invitations: 0,
    dataSources: 0,
    lastTrainingTime: 'N/A',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [participantsRes, invitationsRes, logsRes, collectionsRes] = await Promise.all([
          fetch('http://localhost:9081/api/participants'),
          fetch('http://localhost:9081/invitations'),
          fetch('http://localhost:9081/get-logs'),
          fetch('http://localhost:9080/oauth/fetchCollections'),
        ]);

        const participants = await participantsRes.json();
        const invitations = await invitationsRes.json();
        const logs = await logsRes.json();
        const collections = await collectionsRes.json();

        const lastTraining = logs?.value?.split('\n').find(line => line.includes('Training started'));

        const allKeys = new Set();
        for (const key in collections) {
          if (key !== "userId" && collections[key] === true) {
            allKeys.add(key);
          }
        }

        setStats({
          participants: participants.length,
          invitations: invitations.length,
          dataSources: allKeys.size,
          lastTrainingTime: lastTraining || 'N/A',
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-white text-lg mb-6">Overview and quick access</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="Connected Participants" value={stats.participants} icon={Users} />
        <Card title="Active Invitations" value={stats.invitations} icon={Mail} />
        <Card title="Data Sources" value={stats.dataSources} icon={Database} />
        <Card title="Last Training" value={stats.lastTrainingTime} icon={Activity} />
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate('/participants')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
        >
          📩 Create Invitation
        </button>

        <button
          onClick={() => navigate('/training')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition"
        >
          🚀 Start Training
        </button>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition w-full">
    <div className="flex items-center gap-3 mb-2">
      {Icon && <Icon className="text-gray-700" size={20} />}
      <span className="text-lg font-semibold text-black">{value}</span>
    </div>
    <p className="text-sm text-gray-500">{title}</p>
  </div>
);

export default Dashboard;
