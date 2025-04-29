import React, { useEffect, useState } from 'react';
import { Typography } from "@mui/material";
import SectionCard from '../../components/SectionCard';

const Insights = () => {
  const [collections, setCollections] = useState({});

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = localStorage.getItem("jwt_token");
        const res = await fetch("http://localhost:9080/oauth/fetchCollections", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collection data:", error);
      }
    };

    fetchCollections();
  }, []);

  const renderAccessList = () => {
    return Object.entries(collections)
      .filter(([key, value]) => value === true && key !== 'userId')
      .map(([key]) => (
        <li key={key}>{key.replaceAll('_', ' ')}</li>
      ));
  };

  const connectedSources = () => {
    const services = [];
    if (collections.Reddit_Saved_Posts || collections.Reddit_Up_Voted_Posts || collections.Reddit_Doen_Voted_Posts) {
      services.push("Reddit");
    }
    if (collections.spotify_data_DataPlaylists || collections.spotify_data_PlayListsSongs || collections.spotify_data_TopArtists) {
      services.push("Spotify");
    }
    if (collections.athlete || collections.athlete_activities || collections.athlete_clubs) {
      services.push("Strava");
    }
    return services.join(', ');
  };

  return (
    <SectionCard>
      <Typography variant="h3" sx={{ color: "#000000" }}>
        My Insights
      </Typography>

      <Typography variant="h6" sx={{ padding: "20px 0 5px", color: "#333" }}>
        Connected Sources: <strong>{connectedSources() || 'None'}</strong>
      </Typography>

      {Object.keys(collections).length > 1 ? (
        <>
          <Typography variant="body1" sx={{ padding: "5px 0", color: "#555" }}>
            Access has been granted to:
            <ul style={{ marginTop: 8 }}>{renderAccessList()}</ul>
          </Typography>

          <Typography variant="body1" sx={{ padding: "10px 0", color: "#555" }}>
            You have likely used data from these sources in acquisition or computation workflows.
          </Typography>

          <Typography variant="body2" sx={{ padding: "12px 0", color: "#666", fontStyle: 'italic' }}>
            Note: Strava data is currently not included in computation.
          </Typography>
        </>
      ) : (
        <Typography variant="body2" sx={{ padding: "12px 0", color: "#999" }}>
          No data sources connected yet. Please connect services from the Data Plug page.
        </Typography>
      )}
    </SectionCard>
  );
};

export default Insights;