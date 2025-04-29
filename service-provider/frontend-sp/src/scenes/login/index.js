import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import haloLogo from "./halo.png"; 

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = { username, password };

    try {
      const response = await fetch("http://localhost:9081/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchSecureData(data.accessToken);
        localStorage.setItem("jwt_token_service", data.accessToken);
        navigate("/");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const fetchSecureData = async (token) => {
    try {
      const response = await fetch("http://localhost:9081/api/secure-data", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const secureData = await response.json();
        console.log("Secure data fetched:", secureData);
      } else {
        console.error("Failed to fetch secure data:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching secure data:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-4">
      <div className="bg-gray-900 text-white px-6 py-8 sm:px-8 sm:py-10 rounded-3xl shadow-md w-full max-w-md">
      <div className="flex flex-col items-center mb-2">
          <img
            src={haloLogo}
            alt="Halo Harbor Logo"
            className="w-52 h-auto mb-2 drop-shadow-lg"
          />
          <p className="text-gray-400 italic text-sm mb-2">Server Agent Login</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="block text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              className="w-full bg-gray-800 text-white border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="mb-4 relative">
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full bg-gray-800 text-white border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <div className="flex items-center justify-between text-sm mb-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-pink-400 hover:underline">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-pink-400 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;





//frontend


// Process for adding userId for every request
// import { jwtDecode } from "jwt-decode";

// cconst [userId, setUserId] = useState('');  // Store userId in the component's state

// useEffect(() => {
//   // Get the JWT token from localStorage
//   const token = localStorage.getItem("jwt_token");

//   // If token exists, decode it to get the userId
//   if (token) {
//     const decoded = jwtDecode(token);  // Decode the JWT token
//     setUserId(decoded.sub);  // Set the userId from the decoded token
//   } else {
//     toast.error("No token found. Please log in again.");
//   }
// }, []);

//     // Use userId in the request URL

//     const response = await axios.get(`${config.USER_CONTROLLER_BASE_URL}/service-providers?userid=${userId}`);


// in backend 




// private void addServiceProviderHandler(RoutingContext ctx){
//    String currentUser = ctx.request().getParam("userid"); // Get userId from query parameters
//   logger.info("Received userId from query parameter: {}", currentUser);