import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  ChatBubbleOutline,
  Language,
  InsertChartOutlined,
  HelpOutline,
  ExitToApp,
  Lock,
  DataObject,
} from "@mui/icons-material";
import { useEffect } from "react";
import haloLogo from "../scenes/login/halo.png"; // ✅ logo import

const menuItems = [
  { title: "Dashboard", icon: <HomeOutlined />, to: "/" },
  { title: "Shared Data", icon: <ChatBubbleOutline />, to: "/history" },
  { title: "Connections", icon: <Language />, to: "/connections" },
  { title: "My Insights", icon: <InsertChartOutlined />, to: "/insights" },
  { title: "Access Control", icon: <Lock />, to: "/access" },
  { title: "Data Plug", icon: <DataObject />, to: "/oauth" },
  { title: "Help / About", icon: <HelpOutline />, to: "/help" },
];

const SideBar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:9080/oauth/logout", {
        method: "GET",
        credentials: "include",
      });
      localStorage.removeItem("jwt_token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("jwt_token");
      navigate("/login");
    }
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col justify-between py-6 px-4">
      <div>
        {/* 🧠 Logo */}
        <div className="flex justify-center mb-4">
          <img
            src={haloLogo}
            alt="Halo Harbor Logo"
            className="w-36 h-auto object-contain"
          />
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-8 text-center">
          User Data Agent
        </h1>

        <nav className="flex flex-col space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-red-400 hover:bg-gray-800 hover:text-red-500 rounded-lg transition-colors w-full"
        >
          <ExitToApp className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
