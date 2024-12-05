import React, { useState,useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// import { Form, Input, Button,Checkbox,Alert,Menu,notification,List, Avatar } from 'antd';
import '../style.css';


function Header() {

    let menuClick = e => {
        window.location.href="./";
    };
    
    return(
        <div className="home_header">
        <div className="header_title" onClick={menuClick}>
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
          <h3 >Halo Harbour</h3>
        </div>
        <div style={{"text-align": "right"}} className="header_content">
          <p style={{"margin-top": "8px"}}>
            Don't have an account? <a href="./register">Register Now</a>
          </p>
        </div>
    </div>
    )
}

export default Header;