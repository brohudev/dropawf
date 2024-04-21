import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../css/Footer.css";

const Footer = () => {
  const location = useLocation().pathname;

  const goCalc = () => {
    return "/Team";
  };

  const text = () => {
    return "Meet the Team!";
  };

  function handleClick() {
    if (location === "/dashboard") {
      document.cookie =
        "userID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <small>
          <NavLink to={goCalc()} onClick={handleClick}>
            {text()}
          </NavLink>
        </small>
      </div>
    </footer>
  );
};

export default Footer;
