import React, { useState } from 'react';
import './OAuthIntegration.css';

const OAuthIntegration = () => {
    const [jsonOutput, setJsonOutput] = useState('');

    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            setJsonOutput(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="oauth-container">
            <div className="oauth-sections"> {/* Flex container for side-by-side layout */}
                {/* Reddit OAuth Section */}
                <div className="oauth-section">
                    <h2 className="oauth-title">Reddit OAuth Integration</h2>
                    <a href="http://localhost:9080/oauth/reddit/login">
                        <button className="oauth-button login-button">Login with Reddit</button>
                    </a>
                    <div className="oauth-button-group">
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/reddit/fetchSavedPosts')}>Get Saved Posts</button>
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/reddit/upVotedPosts')}>Get UpVoted Posts</button>
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/reddit/downVotedPosts')}>Get DownVoted Posts</button>
                    </div>
                </div>

                {/* Spotify OAuth Section */}
                <div className="oauth-section">
                    <h2 className="oauth-title">Spotify OAuth Integration</h2>
                    <a href="http://localhost:9080/oauth/spotify/login">
                        <button className="oauth-button login-button">Login with Spotify</button>
                    </a>
                    <div className="oauth-button-group">
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/spotify/getTopArt')}>Top Artists</button>
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/spotify/getUserPlaylists')}>Fetch Playlists</button>
                    </div>
                </div>
            </div>

            {/* JSON Output Section */}
            <textarea
                id="jsonOutput"
                rows="15"
                cols="80"
                readOnly
                value={jsonOutput}
                className="oauth-output"
            />
        </div>
    );
};

export default OAuthIntegration;
