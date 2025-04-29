import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Clock, Plug, Share } from 'lucide-react';

const UserDashboard = () => {
  const [stats, setStats] = useState({
    connectedSources: [],
    sharedTypes: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("jwt_token");
        const res = await fetch('http://localhost:9080/oauth/fetchCollections', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        const connected = [];
        const shared = [];

        // Reddit
        if (data.Reddit_Saved_Posts || data.Reddit_Up_Voted_Posts || data.Reddit_Doen_Voted_Posts) {
          connected.push("Reddit");
          if (data.Reddit_Saved_Posts) shared.push("Reddit Saved Posts");
          if (data.Reddit_Up_Voted_Posts) shared.push("Reddit Upvoted Posts");
          if (data.Reddit_Doen_Voted_Posts) shared.push("Reddit Downvoted Posts");
        }

        // Spotify
        if (data.spotify_data_DataPlaylists || data.spotify_data_PlayListsSongs || data.spotify_data_TopArtists) {
          connected.push("Spotify");
          if (data.spotify_data_DataPlaylists) shared.push("Spotify Playlists");
          if (data.spotify_data_PlayListsSongs) shared.push("Spotify Playlist Songs");
          if (data.spotify_data_TopArtists) shared.push("Spotify Top Artists");
        }

        // Strava
        if (data.athlete || data.athlete_clubs || data.athlete_activities) {
          connected.push("Strava");
          if (data.athlete) shared.push("Strava Athlete");
          if (data.athlete_clubs) shared.push("Strava Athlete Clubs");
          if (data.athlete_activities) shared.push("Strava Activities");
        }

        setStats({
          connectedSources: connected,
          sharedTypes: shared,
        });
      } catch (error) {
        console.error('Failed to fetch user dashboard stats:', error);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-2">Welcome to Your Dashboard</h1>
      <p className="text-white mb-6">Here's an overview of your activity.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="Connected Sources" value={stats.connectedSources.length} icon={Plug} />
        <Card title="Last Shared" value={"N/A"} icon={Clock} />
        <Card title="Shared Types" value={stats.sharedTypes.length} icon={Share} />
        <Card title="Data Types" value={stats.sharedTypes.join(', ') || 'None'} icon={Database} />
      </div>

      {/* Source Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SourceCard
          title="Reddit"
          description="Saved, Upvoted & Downvoted posts"
          isConnected={stats.connectedSources.includes("Reddit")}
        />
        <SourceCard
          title="Spotify"
          description="Top Artists, Playlists, & Songs"
          isConnected={stats.connectedSources.includes("Spotify")}
        />
        <SourceCard
          title="Strava"
          description="Athlete, Activities & Clubs"
          isConnected={stats.connectedSources.includes("Strava")}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate('/oauth')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition"
        >
          🔌 Connect a Data Source
        </button>

        <button
          onClick={() => navigate('/history')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
        >
          📂 View Shared Data
        </button>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition w-full">
    <div className="flex items-center gap-3 mb-2">
      {Icon && <Icon className="text-gray-700" size={20} />}
      <span className="text-lg font-semibold text-black break-words">{value}</span>
    </div>
    <p className="text-sm text-gray-500">{title}</p>
  </div>
);

const SourceCard = ({ title, description, isConnected }) => (
  <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
    <div>
      <h3 className="text-lg font-semibold text-black">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <span className={`mt-2 text-sm font-medium ${isConnected ? 'text-green-600' : 'text-yellow-500'}`}>
      {isConnected ? 'Connected' : 'Not Connected'}
    </span>
  </div>
);

export default UserDashboard;
