import React, { useState, useEffect } from "react";
import { BsFillPersonVcardFill } from "react-icons/bs";
import { useCookies } from "react-cookie";
import axios from "axios";
import "../css/Profile.css";
import AddEmployee from "./AddEmployee";
import ProfileModal from "./profileModal.js"; 

import "../css/ManageEmployees.css";

const ManageEmployees = () => {
  const [cookies, setCookie] = useCookies();
  const [employeesUnder, setEmployeesUnder] = useState([]);
  const [reloadTable, setReloadTable] = useState(false); 
  const userID = cookies.userID;
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState(null);
  const [selectedEmployeeOffice, setSelectedEmployeeOffice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + "/post-master/get-employees-under",
          { userID: userID }
        );
        const data = response.data.results;
        setEmployeesUnder(data[2]);
      } catch (error) {
        console.error("Error fetching action history: ", error);
      }
    };

    fetchData();
  }, [userID, reloadTable]);

  const filteredEmployees = employeesUnder.filter((item) =>
    item.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIconClick = async (employeeID) => {
    try {
      const responseProfile = await axios.post(
        process.env.REACT_APP_BASE_URL + "/post-master/get-employee-profile",
        { employeeID: employeeID }
      );

      const responseOffice = await axios.post(
        process.env.REACT_APP_BASE_URL + "/post-master/get-employee-post-office",
        { employeeID: employeeID }
      );

      setSelectedEmployeeOffice(responseOffice.data);
      setSelectedEmployeeProfile(responseProfile.data);
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error("Error fetching Employee profile:", error);
      setSelectedEmployeeProfile(null);
      setIsProfileModalOpen(false);
    }
  };

  const formatJobTitle = (jobTitle) => {
    switch (jobTitle) {
      case "officeclerk":
        return "Office Clerk";
      case "postmaster":
        return "Post Master";
      case "mailcourier":
        return "Mail Courier";
      default:
        return jobTitle;
    }
  };

  return (
    <section className="ManageEmployeeForm">
      <form style={{ width: "80%" }} className="actionHistory">
        <input
          type="text"
          placeholder="Search by Employee Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ margin: "10px 0", padding: "5px", width: "100%" }}
        />
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            border: "1px solid black",
            textAlign: "center",
          }}
        >
          <thead
            style={{
              background: "#a2845e",
              color: "white",
              textDecoration: "bold",
            }}
          >
            <tr>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Employee Name
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                EmployeeID
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Job Title
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Email Address
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((item, index) => (
              <tr
                key={index}
                style={{
                  background: index % 2 === 0 ? "#f2f2f2" : "white",
                }}
              >
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  {item.Name}
                </td>
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  {item.EmployeeID}
                </td>
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  {formatJobTitle(item.JobTitle)}
                </td>
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  {item.EmailAddress}
                </td>
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  <div
                    className="profileLink"
                    onClick={() => handleIconClick(item.EmployeeID)}
                  >
                    <BsFillPersonVcardFill />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </form>
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => {
        setIsProfileModalOpen(false);
        setReloadTable(!reloadTable);
      }} employee={selectedEmployeeProfile} postOffice={selectedEmployeeOffice} />
    </section>
  );
};

export default ManageEmployees;
