import React, { useEffect } from 'react'
import { Box, Stack } from '@mui/system'
// import { useStateValue } from '../../state/state'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, Typography, useTheme } from "@mui/material";
import SectionCard from '../../components/SectionCard';
// import cachePull from '../../utils/cachePull'
import Header from '../../commpont/Header';

const Insights = () => {
    const theme = useTheme();
    const colors = theme.palette;
    // const [, dispatch] = useStateValue()
    const navigate = useNavigate()

    // useEffect(function () {
    //     const user = cachePull()
    //     if (user) {
    //         // dispatch({ type: "SET_USER", payload: user })
    //     } else {
    //         //navigate("/")
    //     }
    // }, [dispatch, navigate]);

    return (
      <div>
      <Header></Header>
      <SectionCard>
        <h3 style={{color:'#fff'}}>
          My Insights
        </h3>
        <h5 style={{color:'#fff'}}>
          Text here
          TODO have data menu where users can pull their own data (rather than a service provider) for personal insights.
          </h5>
      </SectionCard>
      </div>
    );
}

export default Insights

            {/* <Box height="250px">
              <div style={{ paddingLeft:"50px", paddingRight:"10px", height:"300px", width:"300px"}}>
                  <Donut />
                </div>
            </Box> */}