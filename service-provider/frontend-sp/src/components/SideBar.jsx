// // src/components/SideBar.jsx (Server Side)

// import { NavLink } from "react-router-dom";
// import {
//   HomeOutlined,
//   DataObjectOutlined,
//   PeopleOutlined,
//   SettingsOutlined,
//   LocalFloristOutlined,
//   HelpOutline,
//   ExitToApp,
// } from "@mui/icons-material";

// const menuItems = [
//   { title: "Dashboard", icon: <HomeOutlined />, to: "/" },
//   { title: "Collected Data", icon: <DataObjectOutlined />, to: "/profile" },
//   { title: "Participants", icon: <PeopleOutlined />, to: "/participants" },
//  // { title: "Settings", icon: <SettingsOutlined />, to: "/settings" },
//   { title: "Training", icon: <LocalFloristOutlined />, to: "/training" },
//   { title: "Data Acquisition", icon: <LocalFloristOutlined />, to: "/dataAcq" },
//   { title: "Computation", icon: <LocalFloristOutlined />, to: "/compute" },
//   { title: "Help / About", icon: <HelpOutline />, to: "/about" },
// ];

// const SideBar = () => {
//   return (
//     <div className="h-screen w-64 bg-gray-900 text-white flex flex-col justify-between py-6 px-4">
//       <div>
//         <h1 className="text-2xl font-extrabold text-orange-500 mb-8 text-center">
//           Service Provider
//         </h1>
//         <nav className="flex flex-col space-y-2">
//           {menuItems.map((item) => (
//             <NavLink
//               key={item.title}
//               to={item.to}
//               className={({ isActive }) =>
//                 `flex items-center px-4 py-2 rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-blue-600 text-white"
//                     : "text-gray-300 hover:bg-gray-800 hover:text-white"
//                 }`
//               }
//             >
//               <span className="mr-3">{item.icon}</span>
//               {item.title}
//             </NavLink>
//           ))}
//         </nav>
//       </div>

//       <div>
//         <NavLink
//           to="/logout"
//           className="flex items-center px-4 py-2 text-red-400 hover:bg-gray-800 hover:text-red-500 rounded-lg transition-colors"
//         >
//           <ExitToApp className="mr-3" />
//           Logout
//         </NavLink>
//       </div>
//     </div>
//   );
// };

// export default SideBar;


// WIth LOGO

import { NavLink } from "react-router-dom";
import {
  HomeOutlined,
  DataObjectOutlined,
  PeopleOutlined,
  SettingsOutlined,
  LocalFloristOutlined,
  HelpOutline,
  ExitToApp,
} from "@mui/icons-material";

import haloLogo from "../scenes/login/halo.png"; // ✅ Your logo path

const menuItems = [
  { title: "Dashboard", icon: <HomeOutlined />, to: "/" },
  { title: "Collected Data", icon: <DataObjectOutlined />, to: "/profile" },
  { title: "Participants", icon: <PeopleOutlined />, to: "/participants" },
  // { title: "Settings", icon: <SettingsOutlined />, to: "/settings" },
  { title: "Training", icon: <LocalFloristOutlined />, to: "/training" },
  { title: "Data Acquisition", icon: <LocalFloristOutlined />, to: "/dataAcq" },
  { title: "Computation", icon: <LocalFloristOutlined />, to: "/compute" },
  { title: "Help / About", icon: <HelpOutline />, to: "/about" },
];

const SideBar = () => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col justify-between py-6 px-4">
      <div>
        {/* 🔷 Brand Logo */}
        <div className="flex justify-center mb-4">
          <img
            src={haloLogo}
            alt="Halo Harbor Logo"
            className="w-36 h-auto object-contain"
          />
        </div>

        <h1 className="text-2xl font-extrabold text-orange-500 mb-8 text-center">
          Service Provider
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
        <NavLink
          to="/logout"
          className="flex items-center px-4 py-2 text-red-400 hover:bg-gray-800 hover:text-red-500 rounded-lg transition-colors"
        >
          <ExitToApp className="mr-3" />
          Logout
        </NavLink>
      </div>
    </div>
  );
};

export default SideBar;
