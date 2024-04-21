import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { PiDogFill } from "react-icons/pi";
import { IoIosNotifications } from "react-icons/io";
import { useCookies } from "react-cookie";
import { baseUrl } from "..";
import axios from "axios";

import "../css/Header.css";

const Header = () => {
  const location = useLocation().pathname;
  const [notificationCount, setNotificationCount] = useState(0);
  const [postMasterNotificationCount, setPostMasterNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [postMasterNotifications, setPostMasterNotifications] = useState([]);
  const [postMasterInventoryNotifications, setPostMasterInventoryNotifications] = useState([])
  const [cookies] = useCookies();
  const [showDropdown, setShowDropdown] = useState(false);
  const userID = cookies.userID;
  const userRole = cookies.userRole;

  const fetchNotificationCount = async () => {
    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + '/customer/notification-number', { userID });
      const data = response.data;

      setNotificationCount(data.length);
      setNotifications(data);

    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchNotificationCount();
    }
  }, [userID]);

  const fetchPostMasterNotificationCount = async () => {
    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + '/post-master/get-notifs', { userID });
      const data = response.data;

      const inventoryresponse = await axios.post(process.env.REACT_APP_BASE_URL + '/post-master/get-inventory-notifs', { userID });
      const inventoryData = inventoryresponse.data;

      setPostMasterNotificationCount(data.length + inventoryData.length);
      setPostMasterNotifications(data);
      setPostMasterInventoryNotifications(inventoryData);

    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchPostMasterNotificationCount();
    }
  }, [userID]);

  const markAllAsRead = async () => {
    try {
      await axios.post(process.env.REACT_APP_BASE_URL + '/customer/read-notifications', { userID });
      fetchNotificationCount();
    } catch (error) {
    }
  }

  const markAsClosed = async (notifID) => {
    try {
      await axios.post(process.env.REACT_APP_BASE_URL + '/post-master/close-notifs', { userID, notifID });
      fetchPostMasterNotificationCount();
    } catch (error) {
    }
  }

  const getNotificationMessage = (postMasterNotifications) => {
    switch(postMasterNotifications.ConcernType) {
      case 'Shipping Delay':
        return `There is a Shipping Delay for parcel with the ID of ${postMasterNotifications.ParcelID}!`;
      case 'Customer Service':
        return `A Customer is experiencing poor Customer Service for parcel with the ID of ${postMasterNotifications.ParcelID}!`;
      case 'Product Damage':
          return `A parcel has been damaged with the ID of ${postMasterNotifications.ParcelID}!`
      default:
        return `There is an issue with a parcel with the ID of ${postMasterNotifications.ParcelID}!`;
    }
  };

  const getInventoryMessage = (postMasterInventoryNotifications) => {
    return `Low Inventory: ${postMasterInventoryNotifications.ProductName} needs to be restocked!'`;
  };

  const markInventoryRead = async (productName) => {
    try {
      await axios.post(process.env.REACT_APP_BASE_URL + '/post-master/close-inventory', { userID, productName });
      fetchPostMasterNotificationCount();
    } catch (error) {
    }
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const text = () => {
    switch (location) {
      case "/":
        return "Sign in";
      case "/dashboard":
        return "Sign out";
      case "/login":
        return "Back";
      case "/register":
        return "Back";
      default:
        return "Home";
    }
  };

  const goTo = () => {
    switch (location) {
      case "/":
        return "/login";
      case "/dashboard":
        return "/";
      case "/login":
        return "/";
      case "/register":
        return "/";
      default:
        return "/";
    }
  };

  function handleClick() {
    if (location === "/dashboard") {
      document.cookie =
        "userID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "userFirstName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }

  return (
    <header className="Header" style={location === "/" ? {backgroundColor: "white", color: "var(--brown)"} : {}}>
      <NavLink to={goTo()} onClick={handleClick} style={location === "/" ? {color: "var(--brown)"} : {}}>
        {text()}
      </NavLink>
      <h1 className="company-title">
        <PiDogFill /> Dropawf
      </h1>
      {userRole === 'customer' && userID && location === "/dashboard" && (
        <div className="notification" onClick={toggleDropdown}>
          <IoIosNotifications />
          {notificationCount > 0 && (
            <span className="badge">{notificationCount}</span>
          )}          {showDropdown && (
            <div className="dropdown-content">
              <div className="notification-list">
                <div className="notification-header"> 
                  <h3 className="notification-text"> Notifications </h3>
                  <button className="mark-all-btn" onClick={markAllAsRead}> Mark all as Read </button>
                </div>
                <ul>
                  {notifications.map(notification => (
                    <li key={notification.NotificationID} className="notification-item">
                      {notification.Message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      {userRole === 'postmaster' && userID  && location === "/dashboard" && (
        <div className="notification" onClick={toggleDropdown}>
          <IoIosNotifications />
          {postMasterNotificationCount > 0 && (
            <span className="badge">{postMasterNotificationCount}</span>
          )}          {showDropdown && (
            <div className="dropdown-content">
            <div className="notification-list">
                <div className="notification-header"> 
                  <h3 className="notification-text"> Notifications </h3>
                </div>
                <ul>
                  {postMasterNotifications.map(notification => (
                    <li key={notification.PMNotificationID} className="notification-item">
                      
                      <h2 onClick={() => markAsClosed(notification.PMNotificationID)} style={{ fontSize: '15px' }}> 
                        {getNotificationMessage(notification)}
                      </h2>
                    </li>
                  ))}
                  {postMasterInventoryNotifications.map(notification => (
                    <li key={notification.ProductName} className="notification-item">
                      <h2 onClick={() => markInventoryRead(notification.ProductName)} style={{ fontSize: '15px' }}>
                        {getInventoryMessage(notification)}
                      </h2>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
  
};

export default Header;
