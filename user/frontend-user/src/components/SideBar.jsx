import { useState, useEffect } from "react";
import { Sidebar, MenuItem, Menu} from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";
// import { tokens } from "../theme";
// import 'react-pro-sidebar/dist/css/styles.css';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import DocumentScannerOutlinedIcon from '@mui/icons-material/DocumentScannerOutlined';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import '../menu.css';
// import StressScore from "../StressScore";
// import Logout from "../../components/Logout";


const SidebarHeader = () => {
  return (
    <Typography sx={{ textAlign: 'center', marginBottom: '1rem' }} variant="h4" fontWeight={800} color="#003071" >
      User Data Agent
    </Typography>
  );
};

const Item = ({ title, to, icon, selected, setSelected }) => {
  // const theme = useTheme();
  // const colors = tokens(theme.palette.mode);
  // const activeStyle = {
  //   color: 'blue',
  //   // Add other styles as needed
  // };

  return (
    <MenuItem
      active={selected === title}
      onClick={() => setSelected(title)}
      icon={icon}
      component={
      <NavLink to={to} />
    }
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

// const Item2=()=>{
//     return(
//         <MenuItem disabled={true} background= {'$(colors.primary)'}></MenuItem>
//     )
// };

const ThisProSidebar = () => {
  // const theme = useTheme();
  // const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  useEffect(() => {
    // Your side effect code goes here
    console.log('Component did mount or update');

    // Cleanup function (optional)
    return () => {
      console.log('Component will unmount or before next update');
      // Perform cleanup here, such as clearing intervals or canceling network requests
    };
  }, []); // Dependency array (optional)

  return (
    // https://github.com/azouaoui-med/react-pro-sidebar#readme
    <div style={{"background": "#272C34","min-height": "100vh",  "border":'#272C34'}}>
    <Sidebar collapsed={isCollapsed} style={{"background": "#272C34","min-height": "100vh",  "border":'#272C34'}}>
      {/* <SidebarHeader/> */}
      <div className="home_header" style={{"background": "#272C34"}}>
        <div className="header_title" style={{"padding-left": "0%","width": "100%"}}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_23_17)">
              <path d="M11.6641 28.3333H13.4807C13.9474 25.55 15.5474 23.1666 17.8141 21.6666H11.6641L11.6641 28.3333Z" fill="#4D73EF"/>
              <path d="M8.33333 31.6667L8.33333 8.33333L31.6667 8.33333L31.6667 20H33.3333C33.9 20 34.45 20.0667 35 20.15V8.33333C35 6.5 33.5 5 31.6667 5L8.33333 5C6.5 5 5 6.5 5 8.33333L5 31.6667C5 33.5 6.5 35 8.33333 35H14.6833C14.1 33.9833 13.6833 32.8667 13.4833 31.6667L8.33333 31.6667Z" fill="#4D73EF"/>
              <path d="M18.3307 11.6666L11.6641 11.6666L11.6641 18.3333H18.3307V11.6666Z" fill="#4D73EF"/>
              <path d="M28.3307 11.6666L21.6641 11.6666V18.3333H28.3307V11.6666Z" fill="#4D73EF"/>
              <path d="M26.6641 33.3334H23.3307C21.4974 33.3334 19.9974 31.8334 19.9974 30C19.9974 28.1667 21.4974 26.6667 23.3307 26.6667L26.6641 26.6667V23.3334L23.3307 23.3334C19.6474 23.3334 16.6641 26.3167 16.6641 30C16.6641 33.6834 19.6474 36.6667 23.3307 36.6667H26.6641L26.6641 33.3334Z" fill="#4D73EF"/>
              <path d="M33.3333 23.3334H30V26.6667H33.3333C35.1667 26.6667 36.6667 28.1667 36.6667 30C36.6667 31.8334 35.1667 33.3334 33.3333 33.3334H30V36.6667H33.3333C37.0167 36.6667 40 33.6834 40 30C40 26.3167 37.0167 23.3334 33.3333 23.3334Z" fill="#4D73EF"/>
              <path d="M33.3359 31.6667V28.3334L28.3359 28.3334H23.3359V31.6667L31.6693 31.6667H33.3359Z" fill="#4D73EF"/>
            </g>
            <defs>
              <clipPath id="clip0_23_17">
              <rect width="40" height="40" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <h3>Halo Harbor</h3>
        </div>
        </div>
      <Menu style={{"background": "#272C34","min-height": "100vh","color":"#a7a9ac", "border":'#272C34'}} menuItemStyles={{
      button: {
        // the active class will be added automatically by react router
        // so we can use it to style the active menu item
        [`&.active`]: {
         
        },
        ["&:hover"]: {
          backgroundColor: "rgb(39, 44, 52)", // Hover background
          color: "white", // Hover text color
          border: "rgb(39, 44, 52)"
        },
      },
    }}>
        <Box paddingLeft={isCollapsed ? undefined : "10%"}>
          <Item 
              title= {"Dashboard"}
              to="../"
              icon = {<AppstoreOutlined />}
              selected= {selected}
              setSelected= {setSelected} 

             
          />
          <Item
              title={"Profile"}
              to="../profile"
              icon ={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
             
          />
          <Item 
              title={"Shared Data"}
              to="/history"
              icon ={<ChatBubbleOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
             
          />
          <Item 
              title={"Connections"}
              to="/connections"
              icon ={<LanguageIcon />}
              selected={selected}
              setSelected={setSelected}
             
          />
          <Item 
              title={"My Insights"}
              to="/insights"
              icon ={<DocumentScannerOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}

          />
          <Item 
              title={"Help / About"}
              to="/about"
              // TODO do rounded question mark icon instead, like maybe with a circle around it.
              icon ={<QuestionMarkOutlinedIcon />} 
              selected={selected}
              setSelected={setSelected}
              
          />
          
          {/* <Item 
              title={"Settings"}
              to="../Profile"
              icon ={<SettingsOutlinedIcon/>}
              selected={selected}
              setSelected={setSelected}
          /> */}
          {/* <MenuItem 
              icon ={<LogoutOutlinedIcon />}                
          ><Logout /></MenuItem> */}
        </Box>
      </Menu>
    </Sidebar>
    </div>
  );
};

export default ThisProSidebar;