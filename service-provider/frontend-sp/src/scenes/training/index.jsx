import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, useTheme } from '@mui/material';
import SectionCard from '../../components/SectionCard';

const TrainingPage = () => {
  const theme = useTheme();
  const [log, setLog] = useState("");

  const handleTrainingButtonClick = () => {
    const url = 'http://localhost:4500/';
    fetch(url, {
      method: 'GET',
      mode:'no-cors',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => console.log('Success:', data))
      .catch(error => console.error('Error:', error));
  };

  const handleRefreshStatusButtonClick = async () => {
    const url = 'http://localhost:4500/get-logs';
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setLog(data['value']);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLog('Error fetching logs');
    }
  };

  return (
    <Box>
      <SectionCard>
        <Typography variant="h4" fontWeight="bold" color="black" mb={1}>
          Model Training
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Start training your model and check current training logs below.
        </Typography>

        <Stack direction="row" spacing={2} mb={3}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '10px 24px',
              fontWeight: 'bold',
              fontSize: '1rem',
              borderRadius: '8px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
            }}
            onClick={handleTrainingButtonClick}
          >
            Start Training
          </Button>

          <Button
            variant="outlined"
            sx={{
              color: '#2563eb',
              borderColor: '#2563eb',
              padding: '10px 24px',
              fontWeight: 'bold',
              fontSize: '1rem',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#eff6ff',
                borderColor: '#1d4ed8',
              },
            }}
            onClick={handleRefreshStatusButtonClick}
          >
            Refresh Status
          </Button>
        </Stack>

        <Typography variant="subtitle1" fontWeight="bold" color="black" mb={1}>
          Training Logs:
        </Typography>
        <Box
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 2,
            maxHeight: 300,
            overflowY: 'auto',
            whiteSpace: 'pre-line',
            fontFamily: 'monospace',
            color: '#333',
          }}
        >
          {log ? log : "No logs available."}
        </Box>
      </SectionCard>
    </Box>
  );
};


export default TrainingPage;

// NEw way 





// import React, { useEffect, useState } from 'react';
// import { Box, Typography, Button, Stack } from '@mui/material';
// import SectionCard from '../../components/SectionCard';

// const TrainingPage = () => {
//   const [log, setLog] = useState("");

//   const handleTrainingButtonClick = () => {
//     fetch('http://localhost:4500/', {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//     })
//       .then(response => {
//         if (!response.ok) throw new Error('Network response was not ok');
//         return response.json();
//       })
//       .then(data => console.log('Training Started:', data))
//       .catch(error => console.error('Error:', error));
//   };

//   const handleRefreshStatusButtonClick = async () => {
//     try {
//       const response = await fetch('http://localhost:4500/get-logs', {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//       });
//       const data = await response.json();
//       setLog(data?.value || '');
//     } catch (error) {
//       console.error('Error fetching logs:', error);
//       setLog('Error fetching logs');
//     }
//   };

//   return (
//     <Box p={3}>
//       <Typography variant="h4" fontWeight="bold" color="white" mb={2}>
//         Model Training:
//       </Typography>

//       <Stack direction="row" spacing={2} mb={4}>
//         <Button
//           variant="contained"
//           sx={{
//             backgroundColor: '#ef4444', // red-500
//             color: 'white',
//             textTransform: 'uppercase',
//             fontWeight: 'bold',
//             px: 4,
//             py: 1.5,
//             borderRadius: '8px',
//             '&:hover': {
//               backgroundColor: '#dc2626',
//             },
//           }}
//           onClick={handleTrainingButtonClick}
//         >
//           Start Training
//         </Button>

//         <Button
//           variant="outlined"
//           sx={{
//             color: '#2563eb',
//             borderColor: '#2563eb',
//             textTransform: 'uppercase',
//             fontWeight: 'bold',
//             px: 4,
//             py: 1.5,
//             borderRadius: '8px',
//             '&:hover': {
//               backgroundColor: '#eff6ff',
//               borderColor: '#1d4ed8',
//             },
//           }}
//           onClick={handleRefreshStatusButtonClick}
//         >
//           Refresh Status
//         </Button>
//       </Stack>

//       <Typography variant="h6" fontWeight="bold" color="white" mb={1}>
//         Training Logs:
//       </Typography>

//       <Box
//         sx={{
//           backgroundColor: '#1e293b',
//           borderRadius: '8px',
//           p: 2,
//           maxHeight: 300,
//           overflowY: 'auto',
//           color: '#e5e7eb',
//           fontFamily: 'monospace',
//           whiteSpace: 'pre-wrap',
//           boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
//         }}
//       >
//         {log ? log : "No logs available."}
//       </Box>
//     </Box>
//   );
// };

// export default TrainingPage;
