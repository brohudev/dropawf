import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { TbPigMoney } from "react-icons/tb";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import "../css/Profile.css"


const EmployeeProfile = () => {
    const [cookies] = useCookies();
    const [postmasterProfile, setPostmasterProfile] = useState([]);
    const [error, setError] = useState('');
    const [accountEditing, setAccountEditing] = useState(false);
    const [shippingEditing, setShippingEditing] = useState(false);
    const [userEditing, setUserEditing] = useState(false); 
    const [accountFormData, setAccountFormData] = useState([]);
    const [shippingFormData, setShippingFormData] = useState([]);
    const [userFormData, setUserFormData] = useState([]);
    const [postOffice, setPostOffice] = useState([]);
    const userID = cookies.userID;

    useEffect(() => {
      if (postmasterProfile.length > 0) {
          setAccountFormData(postmasterProfile[0]); 
          setShippingFormData(postmasterProfile[0]); 
          setUserFormData(postmasterProfile[0]);
      }
  }, [postmasterProfile]);

    const handleAccountInputChange = (e) => {
      const { name, value } = e.target;
      setAccountFormData(prevState => ({
          ...prevState,
          [name]: value
      }));
      setError('');
    };

    const handleShippingInputChange = (e) => {
      const { name, value } = e.target;
      setShippingFormData(prevState => ({
          ...prevState,
          [name]: value
      }));
      setError('');
    };

    const handleUserInputChange = (e) => {
      const { name, value } = e.target;
      setUserFormData(prevState => ({
          ...prevState,
          [name]: value
      }));
      setError('');
    };


    const toggleAccountEditing = () => {
      setAccountEditing(prevState => !prevState);
    };

    const toggleShippingEditing = () => {
      setShippingEditing(prevState => !prevState);
    };

    const toggleUserEditing = () => {
      setUserEditing(prevState => !prevState);
    };

    const fetchPostmasterProfile = async () => {
        try {
          const response = await axios.post(process.env.REACT_APP_BASE_URL + '/post-master/get-profile', { userID });
          const data = response.data;
    
          setPostmasterProfile(data);
    
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      };
      useEffect(() => {
        if (userID) {
            fetchPostmasterProfile();
        }
      }, [userID]);

      const fetchPostmasterOffice = async () => {
        try {
          const response = await axios.post(process.env.REACT_APP_BASE_URL + '/post-master/get-post-office', { userID });
          const data = response.data;
    
          setPostOffice(data);
    
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      };
      useEffect(() => {
        if (userID) {
            fetchPostmasterOffice();
        }
      }, [userID]);

    const hidePassword = (password) => {
        return "*".repeat(password.length); 
    }

    const handleAccountSubmit = async (e) => {
      e.preventDefault();
      try {
          await axios.post(process.env.REACT_APP_BASE_URL + '/post-master/update-account-details', { userID, ...accountFormData });
          fetchPostmasterProfile();
          setAccountEditing(false);
      } catch (error) {
          console.error('Error updating account details:', error);
          console.error('Error that email is already in use!', error);
          setError("Error that email is already in use!");
      }
    };

    const handleShippingSubmit = async (e) => {
      e.preventDefault();
      try {
          await axios.post(process.env.REACT_APP_BASE_URL + '/post-master/update-shipping-details', { AddressID: postmasterProfile.AddressID, ...shippingFormData });
          fetchPostmasterProfile();
          setShippingEditing(false);
      } catch (error) {
          console.error('Error updating shipping details:', error);
      }
    };

    const handleUserSubmit = async (e) => {
      e.preventDefault();

      if (!userFormData.Username) {
        setError("Username cannot be empty!");
        return;
      }

      if (!userFormData.Password) {
        setError("Invalid Password Format!");
        return;
      }
      try {
          await axios.post(process.env.REACT_APP_BASE_URL + '/user/update-user-details', { userID, ...userFormData });
          fetchPostmasterProfile();
          setUserEditing(false);
      } catch (error) {
          console.error('Error updating user details:', error);
          if (error.response && error.response.data && error.response.data.usernameError) {
            setError(error.response.data.usernameError);
          } else {
            setError("Username is already taken!");
          }
      }
    };

    const states = [
      "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
      "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
      "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
      "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
    ];

return (
    <div className="profileForm">
      <div className="leftContainer">
        <div className="leftbox">
          <div className="userHeader">
            <div className="userEditIcon" onClick={toggleUserEditing}> <CiEdit /> </div>
          </div>
          
          <div className="pfpArea">
            <div className="profilepicture">  </div>
          </div>
        </div>
        <div className="profileNameArea">
          <div className="Name"> 
              {postmasterProfile.map(profile => (
                <div key={profile.EmployeeID} style={{ fontSize: `${Math.max(12, 40 - (profile.FirstName.length + profile.MiddleInitial.length + profile.LastName.length))}px`, textAlign: 'center' }}>
                  <p> {profile.FirstName} {profile.MiddleInitial} {profile.LastName} </p>
                </div>
              ))}
              <div className="userRole">
                {postmasterProfile.map(profile => (
                  <div key={profile.EmployeeID}>
                    <p> {profile.Username} | {profile.JobTitle} </p>
                    <p style={{ fontSize: '15px' }}> {postOffice.map(office => office.StreetAddress)} {postOffice.map(office => office.City)}, {postOffice.map(office => office.State)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        <div className="underbox">
            <div className="customerDetails">
              {postmasterProfile.map(profile => (
                <div key={profile.EmployeeID} className="detailsContainer">
                {userEditing ? (
                    <form className="editingUserForm" onSubmit={handleUserSubmit}>
                      <div className="info" style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                        <p className="icon"> <TbPigMoney /> </p>
                        <input
                            type="text"
                            name="Salary"
                            value={userFormData.Salary || profile.Salary }
                            readOnly
                            className="userInput"
                        />
                      </div>
                      <div className="info" style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                        <p className="icon"> <FaRegUser /> </p>
                        <input
                            type="text"
                            name="Username"
                            value={userFormData.Username || profile.Username }
                            onChange={handleUserInputChange}
                            className="userInput"
                        />
                      </div>
                      <div className="info" style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                        <p className="icon"> <RiLockPasswordLine /> </p>
                        <input
                            type="password"
                            name="Password"
                            value={userFormData.Password || profile.Pwd }
                            onChange={handleUserInputChange}
                            className="userInput"
                        />
                      </div>
                        <div className="saveArea">
                          <button type="submit" className="userSaveButton">Save</button>
                        </div>
                        <div className="errorHandler">
                          {error && <p style={{ color: 'red' }}>{error}</p>}
                        </div>
                    </form>
                  ) : ( 
                    <>
                    <div className="detailsContainer">
                      <div className="info">
                        <p className="icon"> <TbPigMoney /> </p>
                        <p className="data"> ${profile.Salary.toLocaleString()}/year </p>
                      </div>
                      <div className="info">
                        <p className="icon"> <FaRegUser /> </p>
                        <p className="data"> {profile.Username} </p>
                      </div>
                      <div className="info">
                        <p className="icon"> <RiLockPasswordLine /> </p>
                        <p className="data"> {hidePassword(profile.Pwd)} </p>
                      </div>
                    </div>
                    </>
                    )}
                </div>
                ))}           
            </div>
        </div>
      </div>


      <div className="rightContainer">
        <div className="rightbox">
          <div className="boxHeader">
              <p className="headerText"> Account Details </p>
              <p className="headerIcon" onClick={toggleAccountEditing}> <CiEdit /> </p>
          </div>
                {postmasterProfile.map(profile => (
                <div key={profile.EmployeeID} className="accountEdit">
                  {accountEditing ? (
                    <form onSubmit={handleAccountSubmit}>
                      <div className="accountEditInfo">
                        <p className="editLabel"> First Name </p>
                        <input
                            type="text"
                            name="FirstName"
                            value={accountFormData.FirstName || profile.FirstName }
                            readOnly 
                            className="accountInput"
                        />
                      </div>
                      <div className="accountEditInfo">
                        <p className="editLabel"> Middle Initial </p>
                        <input
                            type="text"
                            name="MiddleInitial"
                            value={accountFormData.MiddleInitial || profile.MiddleInitial }
                            readOnly
                            className="accountInput"
                        />
                      </div>
                      <div className="accountEditInfo">
                        <p className="editLabel"> Last Name </p>
                        <input
                            type="text"
                            name="LastName"
                            value={accountFormData.LastName || profile.LastName }
                            readOnly
                            className="accountInput"
                        />
                      </div>
                      <div className="accountEditInfo">
                        <p className="editLabel"> Email </p>
                        <input
                            type="email"
                            name="EmailAddress"
                            value={accountFormData.EmailAddress || profile.EmailAddress }
                            onChange={handleAccountInputChange}
                            className="accountInput"
                        />
                      </div>
                      <div className="accountEditInfo">
                          <p className="editLabel"> Phone </p>
                          <input
                              type="text"
                              field="numeric"
                              name="PhoneNumber"
                              value={accountFormData.PhoneNumber || profile.PhoneNumber }
                              onChange={handleAccountInputChange}
                              className="accountInput"
                          />
                      </div>
                      <button type="submit" className="accountSaveButton">Save</button>
                      {error && <p style={{ position: 'absolute', marginLeft: '20px', top: '392px', color: 'red' }}>{error}</p>}

                    </form>
                  ) : ( 
                    <>
                    <div className="accountDetails">
                      <div className="accountDetailsInfo">
                        <p className="label"> First Name </p>
                        <p className="userData"> {profile.FirstName}</p>
                      </div>
                      <div className="accountDetailsInfo">
                        <p className="label"> Middle Initial </p>
                        <p className="userData"> {profile.MiddleInitial} </p>
                      </div>
                      <div className="accountDetailsInfo">
                        <p className="label"> Last Name </p>
                        <p className="userData"> {profile.LastName} </p>
                      </div>
                      <div className="accountDetailsInfo">
                        <p className="label"> Email </p>
                        <p  className="userData"> {profile.EmailAddress} </p>
                      </div>
                      <div className="accountDetailsInfo">
                        <p className="label"> Phone </p>
                        <p className="userData"> {profile.PhoneNumber} </p>
                      </div>
                    </div>
                    </>
                    )}
                </div>
                ))}           
        </div>
          <div className="rightunder">
            <div className="boxHeader">
              <p className="headerText"> Shipping Address </p>
              <p className="headerIcon" onClick={toggleShippingEditing}> <CiEdit /> </p>
            </div>
            <div className="shippingDetails">
              {postmasterProfile.map(profile => (
                  <div key={profile.EmployeeID}>
                      {shippingEditing ? (
                        <form onSubmit={handleShippingSubmit}>
                          <div className="shippingEditInfo">
                            <p className="editLabel"> Address </p>
                            <input
                                type="text"
                                name="StreetAddress"
                                value={shippingFormData.StreetAddress || profile.StreetAddress }
                                onChange={handleShippingInputChange}
                                className="shippingInput"
                            />
                          </div>
                          <div className="shippingEditInfo">
                            <p className="editLabel"> City </p>
                            <input
                                type="text"
                                name="City"
                                value={shippingFormData.City || profile.City }
                                onChange={handleShippingInputChange}
                                className="shippingInput"
                            />
                          </div>
                          <div className="shippingEditInfo">
                            <p className="editLabel"> State </p>
                            <select
                                type="text"
                                name="State"
                                value={shippingFormData.State || profile.State }
                                onChange={handleShippingInputChange}
                                className="shippingInput"
                                >
                                <option value=""> State </option>
                                  {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                                  ))}
                            </select>
                          </div>
                          <div className="shippingEditInfo">
                            <p className="editLabel"> Country </p>
                            <p className="shippingInput"> United States </p>
                          </div>
                          <div className="shippingEditInfo">
                              <p className="editLabel"> Zip Code </p>
                              <input
                                  type="text"
                                  maxLength="9"
                                  name="ZipCode"
                                  pattern="\d{5}(-\d{4})?"
                                  value={shippingFormData.ZipCode || profile.ZipCode }
                                  onChange={handleShippingInputChange}
                                  inputMode="numeric"
                                  className="shippingInput"
                              />
                          </div>
                          <button type="submit" className="shippingSaveButton">Save</button>
                        </form>
                      ) : (
                          <>
                            <div className="shippingDetailsInfo">
                              <p className="label"> Address </p>
                              <p className="userData"> {profile.StreetAddress}</p>
                            </div>
                            <div className="shippingDetailsInfo">
                              <p className="label"> City </p>
                              <p className="userData"> {profile.City} </p>
                            </div>
                            <div className="shippingDetailsInfo">
                              <p className="label"> State </p>
                              <p className="userData"> {profile.State} </p>
                            </div>
                            <div className="shippingDetailsInfo">
                              <p className="label"> Country </p>
                              <p className="userData"> United States </p>
                            </div>
                            <div className="shippingDetailsInfo">
                              <p className="label"> Zip Code </p>
                              <p className="userData"> {profile.ZipCode} </p>
                            </div>
                          </>
                        )}
                    </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    )
}

export default EmployeeProfile;