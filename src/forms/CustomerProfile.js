import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { RiVisaLine } from "react-icons/ri";
import { MdOutlinePinDrop  } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import "../css/Profile.css"


const CustomerProfile = () => {
    const [cookies, setCookie] = useCookies();
    const [customerProfile, setCustomerProfile] = useState([]);
    const [paymentProfile, setPaymentProfile] = useState([]);
    const [error, setError] = useState('');
    const [accountEditing, setAccountEditing] = useState(false);
    const [shippingEditing, setShippingEditing] = useState(false);
    const [userEditing, setUserEditing] = useState(false);
    const [paymentEditing, setPaymentEditing] = useState(false);
    const [accountFormData, setAccountFormData] = useState([]);
    const [shippingFormData, setShippingFormData] = useState([]);
    const [userFormData, setUserFormData] = useState([]);
    const [paymentFormData, setPaymentFormData] = useState([]);
    const userID = cookies.userID;
    const userRole = cookies.userRole;

    useEffect(() => {
      if (customerProfile.length > 0) {
          setAccountFormData(customerProfile[0]); 
          setShippingFormData(customerProfile[0]);
          setUserFormData(customerProfile[0]); 
      }
  }, [customerProfile]);

  useEffect(() => {
    if(paymentProfile.length > 0) {
      setPaymentFormData(paymentProfile[0]);
    }
  }, [paymentProfile]);

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

    const handlePaymentInputChange = (event) => {
      const { name, value } = event.target;
      setPaymentFormData(prevFormData => ({
        ...prevFormData,
        [name]: value
      }));
    };
    

    const toggleAccountEditing = () => {
      setAccountEditing(prevState => !prevState);
      setError('');
    };

    const toggleShippingEditing = () => {
      setShippingEditing(prevState => !prevState);
      setError('');
    };

    const toggleUserEditing = () => {
      setUserEditing(prevState => !prevState);
      setError('');
    };

    const togglePaymentEditing = () => {
      setPaymentEditing(prevState => !prevState);
    }

    const fetchCustomerProfile = async () => {
        try {
          const response = await axios.post(process.env.REACT_APP_BASE_URL + '/customer/get-profile', { userID });
          const data = response.data;

          setCustomerProfile(data);
    
        } catch (error) {
          console.error('Error fetching customer profile:', error);
        }
      };

      const fetchPaymentInfo = async () => {
        try {
          const response = await axios.post(process.env.REACT_APP_BASE_URL + '/customer/get-payment-profile', { userID });
          const data = response.data;
          const parsedData = data.map((item) => {
            const formattedCardNumber = item.CardNumber.replace(/\d{4}(?=.)/g, '$& ');
            const cardHolderFullName = `${item.CardHolderFirstName} ${item.CardHolderLastName}`;
            const expiration = `${item.ExpMonth}/${item.ExpYear}`
          return {
            CardNumber: formattedCardNumber,
            UnformattedCardNumber: item.CardNumber,
            CVV: item.CVV,
            CardHolder: cardHolderFullName,
            Expiration: expiration
          }
        });
          console.log("parsed DAta: ", parsedData)
          setPaymentProfile(parsedData);
        } catch (error) {
          console.error('Error fetching payment profile: ', error)
        }
      };

      useEffect(() => {
        if (userID) {
            fetchCustomerProfile();
            fetchPaymentInfo();
        }
      }, [userID]);

      const hidePassword = (password) => {
        return "*".repeat(password.length); 
      }

    const handleAccountSubmit = async (e) => {
      e.preventDefault();
      try {
          await axios.post(process.env.REACT_APP_BASE_URL + '/customer/update-account-details', { userID, ...accountFormData });
          fetchCustomerProfile();
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
          await axios.post(process.env.REACT_APP_BASE_URL + '/customer/update-shipping-details', { AddressID: customerProfile.AddressID, ...shippingFormData });
          fetchCustomerProfile();
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
          fetchCustomerProfile();
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

    const handlePaymentSubmit = async (e) => {
      e.preventDefault();
      try {
          await axios.post(process.env.REACT_APP_BASE_URL + '/customer/update-payment-details', { userID, ...paymentFormData });
          fetchPaymentInfo();
          setPaymentEditing(false);
      } catch (error) {
          console.error('Error updating payment details:', error);
      }
    };

    const states = [
      "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
      "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
      "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
      "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
    ];

return (
    <div className="customerProfileForm">
      <div className="leftContainer">
        <div className="leftbox">
          <div className="userHeader">
            <div className="customerUserEditIcon" onClick={toggleUserEditing}> <CiEdit /> </div>
          </div>
          
          <div className="customerProfileArea">
            <div className="profilepicture"> </div>
          </div>
        </div>

        <div className="customerNameArea">
          <div className="customerName"> 
              {customerProfile.map(profile => (
                <div key={profile.CustomerID} style={{ fontSize: `${Math.max(12, 40 - (profile.FirstName.length + profile.MiddleInitial.length + profile.LastName.length))}px`, textAlign: 'center' }}>
                  <p> {profile.FirstName} {profile.MiddleInitial} {profile.LastName} </p>
                </div>
              ))}
              <div className="userRole">
                {customerProfile.map(profile => (
                  <div key={profile.CustomerID}>
                    <p> {profile.Username} | {userRole} </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        <div className="underbox">
            <div className="customerDetails">
              {customerProfile.map(profile => (
                <div key={profile.CustomerID} className="detailsContainer">
                {userEditing ? (
                    <form onSubmit={handleUserSubmit} >
                      <div className="info" style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                        <p className="icon"> <MdOutlinePinDrop /> </p>
                        <input
                            type="text"
                            name="Salary"
                            value={[userFormData.City, userFormData.State] || [profile.City, profile.State] }
                            readOnly
                            className="userInput"
                        />
                      </div>
                      <div className="info" style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                        <p className="icon"> <FaRegUser /> </p>
                        <input
                            type="text"
                            name="Username"
                            placeholder= {profile.Username}
                            value={userFormData.Username}
                            onChange={handleUserInputChange}
                            className="userInput"
                        />
                      </div>
                      <div className="info" style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                        <p className="icon"> <RiLockPasswordLine /> </p>
                        <input
                            type="password"
                            name="Password"
                            value={userFormData.Password || profile.Pwd}
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
                        <p className="icon"> <MdOutlinePinDrop /> </p>
                        <p className="data"> {profile.City}, {profile.State} </p>
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
                {customerProfile.map(profile => (
                <div key={profile.CustomerID} className="accountEdit">
                  {accountEditing ? (
                    <form onSubmit={handleAccountSubmit}>
                      <div className="accountEditInfo">
                        <p className="editLabel"> First Name </p>
                        <input
                            type="text"
                            name="FirstName"
                            value={accountFormData.FirstName || profile.FirstName }
                            onChange={handleAccountInputChange}
                            className="accountInput"
                        />
                      </div>
                      <div className="accountEditInfo">
                        <p className="editLabel"> Middle Initial </p>
                        <input
                            type="text"
                            name="MiddleInitial"
                            value={accountFormData.MiddleInitial || profile.MiddleInitial }
                            onChange={handleAccountInputChange}
                            className="accountInput"
                        />
                      </div>
                      <div className="accountEditInfo">
                        <p className="editLabel"> Last Name </p>
                        <input
                            type="text"
                            name="LastName"
                            value={accountFormData.LastName || profile.LastName }
                            onChange={handleAccountInputChange}
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
                      {error && <p style={{ color: 'red' }}>{error}</p>}

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
              {customerProfile.map(profile => (
                  <div key={profile.CustomerID}>
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
        
        <div className="paymentContainer">
          <div className="paymentHeader">
              <p className="headerText"> Payment Method </p>
              <p className="headerIcon" onClick={togglePaymentEditing}> <CiEdit /> </p>
          </div>
          <div className="creditCardContainer">
            <div className="creditCard">
              <div className="creditCardMargin">
                <div className="creditCardTop">
                  <div className="visaLogo">
                    <RiVisaLine /> 
                  </div>
                </div>
                {paymentProfile.map((payment) => (
                  <div key={payment.UserID}>
                    <div className="creditCardMiddle">
                      <p className="creditCardNumber"> {payment.CardNumber} </p>
                    </div>
                    <div className="creditCardBottomHeader">
                      <p className="creditCardBottomTitles"> CARD HOLDER </p>
                      <p className="creditCardBottomTitles"> EXPIRATION </p>
                    </div>
                    <div className="creditCardBottom">
                      <p className="creditCardBottomData"> {payment.CardHolder} </p>
                      <p className="creditCardBottomData"> {payment.Expiration} </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="creditCardInfoContainer">
            {paymentEditing ? (
              <form className="paymentEditContainer" onSubmit={handlePaymentSubmit}>
                <div className="paymentEditArea">
                  <div className="creditCardInfo">
                    <p className="label"> Card Number </p>
                    <input
                      type="text"
                      field="numeric"
                      name="UnformattedCardNumber"
                      placeholder= {paymentProfile.UnformattedCardNumber || "0123456789101112"}
                      pattern="^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$"
                      value={paymentFormData.UnformattedCardNumber  || paymentProfile.UnformattedCardNumber}
                      onChange={handlePaymentInputChange}
                      className="userDataInput"
                  />
                  </div>
                  <div className="creditCardInfo">
                    <p className="label"> Card Holder </p>
                    <input
                      type="text"
                      name="CardHolder"
                      placeholder = {paymentProfile.CardHolder || "John Doe"}
                      value={paymentFormData.CardHolder || paymentProfile.CardHolder}
                      onChange={handlePaymentInputChange}
                      className="userDataInput"
                  />
                  </div>
                  <div className="creditCardInfo">
                    <p className="label"> Expiration </p>
                    <input
                      type="text"
                      field="numeric"
                      pattern="(0[1-9]|1[0-2])\/\d{2}"
                      name="Expiration"
                      placeholder = {paymentProfile.Expiration || "11/24"}
                      value={paymentFormData.Expiration || paymentProfile.Expiration}
                      onChange={handlePaymentInputChange}
                      className="userDataInput"
                  />
                  </div>
                  <div className="creditCardInfo">
                    <p className="label"> CVV </p>
                    <input
                      type="text"
                      field="numeric"
                      minLength={3}
                      name="CVV"
                      placeholder = {paymentProfile.CVV || "123"} 
                      value={paymentFormData.CVV || paymentProfile.CVV}
                      onChange={handlePaymentInputChange}
                      className="userDataInput"
                  />
                  </div>
                  <div className="paymentSaveArea">
                    <button type="submit" className="paymentSaveButton"> Save </button>
                  </div>
                </div>       
              </form>
            ) : (
            <>
            {paymentProfile.map((payment) => (
              <div key={payment.UserID}>
                <div className="creditCardInfo">
                  <p className="label"> Card Type </p>
                  <p className="userData"> VISA </p>
                </div>
                <div className="creditCardInfo">
                  <p className="label"> Card Number </p>
                  <p className="userData"> {payment.CardNumber} </p>
                </div>
                <div className="creditCardInfo">
                  <p className="label"> Card Holder </p>
                  <p className="userData"> {payment.CardHolder} </p>
                </div>
                <div className="creditCardInfo">
                  <p className="label"> Expiration </p>
                  <p className="userData"> {payment.Expiration} </p>
                </div>
                <div className="creditCardInfo">
                <p className="label"> CVV </p>
                  <p className="userData"> {payment.CVV} </p>
                </div>
              </div>
            ))}
           </>
          )}
          
          </div>

        </div>
    </div>
    )
}

export default CustomerProfile