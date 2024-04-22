import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
// import Dashboard from './scenes/dashboard/index';
import Dashboard from './scenes/dashboard';

import PageFrame from './components/PageFrame';
import { CssBaseline, ThemeProvider,Box } from '@mui/material';
import {theme} from "./theme";
import Profile from './scenes/profile';
import ParticipantsPage from './scenes/participants';
import SettingsPage from './scenes/settings';
import HelpPage from './scenes/help';
import TrainingPage from './scenes/training';
import ComputationPage from './scenes/compute';

function App() {
  return (
    <div style={({ height: "100vh" })}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Routes>
          <Route path="/" element={<PageFrame element={<Dashboard/>}/>} />
          <Route path="/profile" element={<PageFrame element={<Profile/>}/>} />
          <Route path="/participants" element={<PageFrame element={<ParticipantsPage/>}/>} />
          <Route path="/settings" element={<PageFrame element={<SettingsPage/>}/>} />
          <Route path="/training" element={<PageFrame element={<TrainingPage/>}/>} />
          <Route path="/compute" element={<PageFrame element={<ComputationPage/>}/>} />
          <Route path="/about" element={<PageFrame element={<HelpPage/>}/>} />
          {/* <Route path="/connections" element={<ConnectionsPage/>} /> */}

        </Routes>
      </ThemeProvider>
    </div>

  );
}

export default App;
