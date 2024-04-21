// This component encompasses the different reports a postmaster can view

import React, { useState, useEffect } from "react";
import OrderReport from "./OrderReport";
import { EmployeeReportForm } from "../forms";
import RevenueReport from "./RevenueReport";
import OfficeReport from "./OfficeReport";
import { useCookies } from "react-cookie";
import axios from "axios";

const Reports = () => {
  const [currentForm, setCurrentForm] = useState();
  const [activeComponent, setActiveComponent] = useState("");
  const [cookies] = useCookies();
  const [role, setRole] = useState([]);
  const userID = cookies.userID;

  const components = {
    EmployeeReportForm: EmployeeReportForm,
    OrderReport: OrderReport,
    RevenueReport: RevenueReport,
    OfficeReport: OfficeReport,
  };

  function handleClick(event) {
    const form = event.target.id;
    const MyComponent = components[form];
    setCurrentForm(<MyComponent />);

    if (activeComponent.length > 0) {
      // remove active class from component
      document.getElementById(activeComponent).classList.remove("active");
    }

    setActiveComponent(form);
    event.target.classList.add("active");
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + "/user/check-role",
          { userID: userID }
        );
        const data = response.data.results;
        const JobTitle = data[1][0].JobTitle;

        setRole(JobTitle);
      } catch (error) {
        console.error("Error fetching role: ", error);
      }
    };

    fetchData();
  }, [userID]);

  return (
    <section>
      <div className="miniNav">
        <a id="OrderReport" onClick={handleClick}>
          Order Report
        </a>
        <div className="line"></div>
        <a id="EmployeeReportForm" onClick={handleClick}>
          Employee Report
        </a>
        <div className="line"></div>
        <a id="RevenueReport" onClick={handleClick}>
          Revenue Report
        </a>
      </div>
      {currentForm && currentForm}
    </section>
  );
};

export default Reports;
