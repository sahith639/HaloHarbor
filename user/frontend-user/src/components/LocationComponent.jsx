import React, { useState, useEffect } from 'react';

function LocationComponent() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });
  const [lastSentLocation, setLastSentLocation] = useState({
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    const watchId = geo.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          error: null,
        });

        if (shouldSendLocation(lastSentLocation, { latitude, longitude })) {
          fetch('http://localhost:9080/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              console.log('Location data saved:', data);
              setLastSentLocation({ latitude, longitude });
            })
            .catch((error) =>
              console.error('Error sending location data:', error)
            );
        }
      },
      (error) => {
        setLocation({
          latitude: null,
          longitude: null,
          error: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => geo.clearWatch(watchId);
  }, [lastSentLocation]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-md mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-2">📍 Your Location</h2>
      {location.error ? (
        <p className="text-red-500">Error: {location.error}</p>
      ) : location.latitude && location.longitude ? (
        <div>
          <p className="text-gray-700">Latitude: <span className="font-semibold">{location.latitude}</span></p>
          <p className="text-gray-700">Longitude: <span className="font-semibold">{location.longitude}</span></p>
        </div>
      ) : (
        <p className="text-gray-500 italic">Waiting for location...</p>
      )}
    </div>
  );
}

function shouldSendLocation(lastLocation, newLocation) {
  const minDistance = 0.0001; // Adjust sensitivity if needed
  return (
    !lastLocation.latitude ||
    !lastLocation.longitude ||
    Math.abs(lastLocation.latitude - newLocation.latitude) > minDistance ||
    Math.abs(lastLocation.longitude - newLocation.longitude) > minDistance
  );
}

export default LocationComponent;
