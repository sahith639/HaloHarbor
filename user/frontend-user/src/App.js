import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
// import Dashboard from './scenes/dashboard/index';
import Dashboard from './scenes/dashboard';

import PageFrame from './components/PageFrame';
import { CssBaseline, ThemeProvider,Box } from '@mui/material';
import {theme} from "./theme";
import Profile from './scenes/profile';
import ConnectionsPage from './scenes/connections';
import Insights from './scenes/insights';
import HistoryPage from './scenes/history';

function App() {
  return (
    <div style={({ height: "100vh" })}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Routes>
                  
          <Route path="/" element={<PageFrame element={<Dashboard/>}/>} />
          <Route path="/profile" element={<PageFrame element={<Profile/>}/>} />
          <Route path="/connections" element={<PageFrame element={<ConnectionsPage/>}/>} />
          <Route path="/insights" element={<PageFrame element={<Insights/>}/>} />
          <Route path="/history" element={<PageFrame element={<HistoryPage/>}/>} />
          {/* <Route path="/connections" element={<ConnectionsPage/>} /> */}

        </Routes>
      </ThemeProvider>
    </div>

  );
}

export default App;
