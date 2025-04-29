import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const signUpData = { username, password };

    try {
      const response = await fetch("http://localhost:9081/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });

      const data = await response.text();

      if (response.ok) {
        setSuccessMessage("Account created successfully! Redirecting to login...");
        setError("");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Username already exists.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-4">
      <div className="bg-gray-900 text-white px-6 py-8 sm:px-8 sm:py-10 rounded-3xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-2">Create an Account</h2>
        <p className="text-center text-gray-400 mb-6">Join us today!</p>

        <form onSubmit={handleSignUp}>
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

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
              className="w-full bg-gray-800 text-white border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {successMessage && (
            <p className="text-green-400 text-sm mb-4">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={password !== confirmPassword}
            className={`w-full text-white font-semibold py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
              password !== confirmPassword
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-pink-500 hover:bg-pink-600"
            }`}
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-pink-400 hover:underline"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
