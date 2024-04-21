import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { TbPigMoney } from "react-icons/tb";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { useCookies } from "react-cookie";

import "../css/Profile.css";
import "../css/profileModal.css";

const ProfileModal = ({ isOpen, onClose, employee, postOffice }) => {
  const [employeeData, setEmployeeData] = useState([]);

  useEffect(() => {
    if (employee && employee.length > 0) {
      setEmployeeData(employee);
    }
  }, [employee]);

  const employeeID = Array.isArray(employee)
    ? employee[0]?.EmployeeID
    : employee?.EmployeeID;

  Modal.setAppElement("#root");
  const [cookies, setCookie] = useCookies();
  const [error, setError] = useState("");
  const [accountEditing, setAccountEditing] = useState(false);
  const [userEditing, setUserEditing] = useState(false);
  const [accountFormData, setAccountFormData] = useState([]);
  const [userFormData, setUserFormData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userID = cookies.userID;

  useEffect(() => {
    if (employeeData && employeeData.length > 0) {
      setAccountFormData(employeeData[0]);
      setUserFormData(employeeData[0]);
    }
  }, [employeeData]);

  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setAccountFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const toggleAccountEditing = () => {
    setAccountEditing((prevState) => !prevState);
  };

  const toggleUserEditing = () => {
    setUserEditing((prevState) => !prevState);
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        process.env.REACT_APP_BASE_URL + "/post-master/update-employee-account",
        { employeeID: employeeID, ...accountFormData }
      );

      const updatedProfile = await fetchEmployeeProfile(employeeID);
      setEmployeeData(updatedProfile);

      setAccountEditing(false);
    } catch (error) {
      console.error("Error updating account details:", error);
      console.error("Error that email is already in use!", error);
      setError("Error that email is already in use!");
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        process.env.REACT_APP_BASE_URL + "/post-master/update-employee-salary",
        { employeeID: employeeID, ...userFormData }
      );

      const updatedProfile = await fetchEmployeeProfile(employeeID);
      setEmployeeData(updatedProfile);

      setUserEditing(false);
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const fetchEmployeeProfile = async (employeeID) => {
    try {
      const responseProfile = await axios.post(
        process.env.REACT_APP_BASE_URL + "/post-master/get-employee-profile",
        { employeeID: employeeID }
      );
      return responseProfile.data;
    } catch (error) {
      console.error("Error fetching Employee profile:", error);
      return [];
    }
  };

  const fireEmployee = async (e) => {
    const confirmFire = window.confirm(
      "Are you sure you want to fire this employee"
    );
    if (confirmFire) {
      try {
        await axios.post(
          process.env.REACT_APP_BASE_URL + "/post-master/fire-employee",
          { employeeID: employeeID, ...userFormData }
        );
        onClose();
      } catch (error) {
        console.error("Error updating account details:", error);
        console.error("Error that email is already in use!", error);
        setError("Error that email is already in use!");
      }
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

  const hidePassword = (password) => {
    return "*".repeat(password.length);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modalStyles"
      contentLabel="Employee Profile Modal"
    >
      <div className="profile-modal">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <div className="profileModalHeader">
              <button className="CloseButton" onClick={onClose}></button>
            </div>

            {employee ? (
              <div className="manageEmployeeForm">
                <div className="ME_leftContainer">
                  <div className="fireButtonHeader">
                    <button className="fireButton" onClick={fireEmployee}>
                      {" "}
                      FIRE{" "}
                    </button>
                  </div>
                  <div
                    className="ME_leftbox"
                    style={{ height: "250px", borderRadius: "0px" }}
                  >
                    <div className="pictureArea">
                      <div className="profilepicture"></div>
                    </div>
                  </div>
                  <div className="nameArea">
                    <div className="ME_name">
                      {employeeData.map((profile) => (
                        <div
                          key={profile.EmployeeID}
                          style={{
                            fontSize: `${Math.max(
                              12,
                              40 -
                                (profile.FirstName.length +
                                  profile.MiddleInitial.length +
                                  profile.LastName.length)
                            )}px`,
                            textAlign: "center",
                          }}
                        >
                          <p>
                            {" "}
                            {profile.FirstName} {profile.MiddleInitial}{" "}
                            {profile.LastName}{" "}
                          </p>
                        </div>
                      ))}
                      <div className="userRole">
                        {employeeData.map((profile) => (
                          <div key={profile.EmployeeID}>
                            <p>
                              {" "}
                              {profile.Username} |{" "}
                              {formatJobTitle(profile.JobTitle)}{" "}
                            </p>
                            <p style={{ fontSize: "15px" }}>
                              {" "}
                              {postOffice.map(
                                (office) => office.StreetAddress
                              )}{" "}
                              {postOffice.map((office) => office.City)},{" "}
                              {postOffice.map((office) => office.State)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ME_leftunderboxes">
                    <div className="ME_userHeader">
                      <div
                        className="ME_userEditIcon"
                        onClick={toggleUserEditing}
                      >
                        {" "}
                        <CiEdit />{" "}
                      </div>
                    </div>
                    <div className="ME_underbox">
                      <div className="customerDetails">
                        {employeeData.map((profile) => (
                          <div
                            key={profile.EmployeeID}
                            className="detailsContainer"
                          >
                            {userEditing ? (
                              <form onSubmit={handleUserSubmit}>
                                <div className="info">
                                  <p className="icon">
                                    {" "}
                                    <TbPigMoney />{" "}
                                  </p>
                                  <input
                                    type="text"
                                    field="numeric"
                                    name="Salary"
                                    value={
                                      userFormData.Salary || profile.Salary
                                    }
                                    onChange={handleUserInputChange}
                                    className="userInput"
                                  />
                                </div>
                                <div className="info">
                                  <p className="icon">
                                    {" "}
                                    <FaRegUser />{" "}
                                  </p>
                                  <input
                                    type="text"
                                    name="Username"
                                    value={
                                      userFormData.Username || profile.Username
                                    }
                                    onChange={handleUserInputChange}
                                    className="userInput"
                                  />
                                </div>
                                <div className="info">
                                  <p className="icon">
                                    {" "}
                                    <RiLockPasswordLine />{" "}
                                  </p>
                                  <input
                                    type="password"
                                    name="Password"
                                    value={userFormData.Password || profile.Pwd}
                                    readOnly
                                    className="userInput"
                                  />
                                </div>
                                <div className="saveArea">
                                  <button
                                    type="submit"
                                    className="userSaveButton"
                                  >
                                    Save
                                  </button>
                                </div>

                                {error && (
                                  <p
                                    style={{
                                      position: "absolute",
                                      marginLeft: "20px",
                                      top: "392px",
                                      color: "red",
                                    }}
                                  >
                                    {error}
                                  </p>
                                )}
                              </form>
                            ) : (
                              <>
                                <div className="detailsContainer">
                                  <div className="info">
                                    <p className="icon">
                                      {" "}
                                      <TbPigMoney />{" "}
                                    </p>
                                    <p className="data">
                                      {" "}
                                      ${profile.Salary.toLocaleString()}/year{" "}
                                    </p>
                                  </div>
                                  <div className="info">
                                    <p className="icon">
                                      {" "}
                                      <FaRegUser />{" "}
                                    </p>
                                    <p className="data"> {profile.Username} </p>
                                  </div>
                                  <div className="info">
                                    <p className="icon">
                                      {" "}
                                      <RiLockPasswordLine />{" "}
                                    </p>
                                    <p className="data">
                                      {" "}
                                      {hidePassword(profile.Pwd)}{" "}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rightContainer">
                  <div className="rightbox">
                    <div className="boxHeader">
                      <p className="headerText"> Account Details </p>
                      <p className="headerIcon" onClick={toggleAccountEditing}>
                        {" "}
                        <CiEdit />{" "}
                      </p>
                    </div>
                    {employeeData.map((profile) => (
                      <div key={profile.EmployeeID} className="accountEdit">
                        {accountEditing ? (
                          <form onSubmit={handleAccountSubmit}>
                            <div className="accountEditInfo">
                              <p className="editLabel"> First Name </p>
                              <input
                                type="text"
                                name="FirstName"
                                value={
                                  accountFormData.FirstName || profile.FirstName
                                }
                                onChange={handleAccountInputChange}
                                className="accountInput"
                              />
                            </div>
                            <div className="accountEditInfo">
                              <p className="editLabel"> Middle Initial </p>
                              <input
                                type="text"
                                name="MiddleInitial"
                                value={
                                  accountFormData.MiddleInitial ||
                                  profile.MiddleInitial
                                }
                                onChange={handleAccountInputChange}
                                className="accountInput"
                              />
                            </div>
                            <div className="accountEditInfo">
                              <p className="editLabel"> Last Name </p>
                              <input
                                type="text"
                                name="LastName"
                                value={
                                  accountFormData.LastName || profile.LastName
                                }
                                onChange={handleAccountInputChange}
                                className="accountInput"
                              />
                            </div>
                            <div className="accountEditInfo">
                              <p className="editLabel"> Email </p>
                              <input
                                type="email"
                                name="EmailAddress"
                                value={
                                  accountFormData.EmailAddress ||
                                  profile.EmailAddress
                                }
                                readOnly
                                className="accountInput"
                              />
                            </div>
                            <div className="accountEditInfo">
                              <p className="editLabel"> Phone </p>
                              <input
                                type="text"
                                field="numeric"
                                name="PhoneNumber"
                                value={
                                  accountFormData.PhoneNumber ||
                                  profile.PhoneNumber
                                }
                                readOnly
                                className="accountInput"
                              />
                            </div>
                            <button type="submit" className="accountSaveButton">
                              Save
                            </button>
                            {error && (
                              <p
                                style={{
                                  position: "absolute",
                                  marginLeft: "20px",
                                  top: "392px",
                                  color: "red",
                                }}
                              >
                                {error}
                              </p>
                            )}
                          </form>
                        ) : (
                          <>
                            <div className="accountDetails">
                              <div className="ME_accountDetailsInfo">
                                <p className="ME_label"> First Name </p>
                                <p className="ME_userData">
                                  {" "}
                                  {profile.FirstName}
                                </p>
                              </div>
                              <div className="ME_accountDetailsInfo">
                                <p className="ME_label"> Middle Initial </p>
                                <p className="ME_userData">
                                  {" "}
                                  {profile.MiddleInitial}{" "}
                                </p>
                              </div>
                              <div className="ME_accountDetailsInfo">
                                <p className="ME_label"> Last Name </p>
                                <p className="ME_userData">
                                  {" "}
                                  {profile.LastName}{" "}
                                </p>
                              </div>
                              <div className="ME_accountDetailsInfo">
                                <p className="ME_label"> Email </p>
                                <p className="ME_userData">
                                  {" "}
                                  {profile.EmailAddress}{" "}
                                </p>
                              </div>
                              <div className="ME_accountDetailsInfo">
                                <p className="ME_label"> Phone </p>
                                <p className="ME_userData">
                                  {" "}
                                  {profile.PhoneNumber}{" "}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="rightunder">
                    <div className="boxHeader">
                      <p className="headerText" style={{ marginTop: "15px" }}>
                        {" "}
                        Shipping Address{" "}
                      </p>
                    </div>
                    <div className="shippingDetails">
                      {employeeData.map((profile) => (
                        <div key={profile.EmployeeID}>
                          <div className="ME_shippingDetailsInfo">
                            <p className="ME_label"> Address </p>
                            <p className="ME_userData">
                              {" "}
                              {profile.StreetAddress}
                            </p>
                          </div>
                          <div className="ME_shippingDetailsInfo">
                            <p className="ME_label"> City </p>
                            <p className="ME_userData"> {profile.City} </p>
                          </div>
                          <div className="ME_shippingDetailsInfo">
                            <p className="ME_label"> State </p>
                            <p className="ME_userData"> {profile.State} </p>
                          </div>
                          <div className="ME_shippingDetailsInfo">
                            <p className="ME_label"> Country </p>
                            <p className="ME_userData"> United States </p>
                          </div>
                          <div className="ME_shippingDetailsInfo">
                            <p className="ME_label"> Zip Code </p>
                            <p className="ME_userData"> {profile.ZipCode} </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>No employee data available</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProfileModal;
