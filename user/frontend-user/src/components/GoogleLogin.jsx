import React from 'react';

const App = () => {
  const handleLogin = () => {
    // Initiates the OAuth2 flow by redirecting to the backend
    window.location.href = 'http://localhost:9080/auth/google/initiate';
  };

  const fetchProfile = () => {
    // Fetches the profile of the logged-in user
    window.location.href = 'http://localhost:9080/auth/fetchProfile';
  };

  return (
    
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Login with Google</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition mb-6 w-full"
        >
          Log In with Google
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-3">Existing User?</h2>
        <button
          onClick={fetchProfile}
          className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition w-full"
        >
          Fetch User Profile
        </button>
      </div>
    
  );
};

export default App;
