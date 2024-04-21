import React from "react";
import { Routes, Route } from "react-router";
import { useEffect } from "react";
import { useAppCookies } from "./cookies";

import { Header, Footer } from "./components";
import { Landing, Dashboard, Login, Register, Team } from "./pages";

import "./css/App.css";
import "./css/Form.css";

const App = () => {
  const { cookies } = useAppCookies();

  useEffect(() => {
    function changeTheme() {
      let dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      if (dark) {
        document.documentElement.setAttribute("data-theme", "dark");
        document
          .querySelector('meta[name="theme-color"]')
          .setAttribute("content", "#000000");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        document
          .querySelector('meta[name="theme-color"]')
          .setAttribute("content", "#ffffff");
      }
    }
    changeTheme();

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", changeTheme);
    return () =>
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", changeTheme);
  }, []);

  return (
    <div className={`App ${cookies.userRole ? cookies.userRole : ""}`}>
      <Header />
      <Routes>
        <Route
          path="/dashboard"
          element={<Dashboard user={cookies.userRole} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Team" element={<Team />} />
        <Route path="/" element={<Landing />} />
        {/* <Route path="/EmployeeDash" element={<EmployeeDash />} /> */}
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
