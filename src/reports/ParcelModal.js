import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";

import "../css/ParcelModal.css";

const ParcelModal = ({ isOpen, onClose, parcelID }) => {
  const initialData = {
    FirstName: "",
    LastName: "",
    StreetAddress: "",
    City: "",
    State: "",
    ZipCode: "",
    EmailAddress: "",
  };

  const [recipientShippingInfo, setRecipientShippingInfo] =
    useState(initialData);

  const recipientChange = (event) => {
    const { name, value } = event.target;
    setRecipientShippingInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchRecipientInfo = async () => {
      console.log(parcelID);
      try {
        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + "/user/edit-shipping-info",
          { parcelID }
        );
        const data = response.data.results[1][0];
        console.log(data);
        setRecipientShippingInfo(data || initialData);
      } catch (error) {
        console.error("Error fetching recipient info:", error);
      }
    };

    fetchRecipientInfo();
  }, [isOpen, parcelID]);

  const handleSave = () => {
    const postRecipientInfo = async () => {
      await axios.post(
        process.env.REACT_APP_BASE_URL + "/user/update-shipping-info",
        { recipientShippingInfo, parcelID }
      );
    };

    postRecipientInfo();
    setRecipientShippingInfo({});
    onClose();
  };

  const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="parcelModalStyles"
      contentLabel="Parcel Modal"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <div className="parcelModal">
        <form className="form">
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            {" "}
            Edit Recipient{" "}
          </p>
          <p
            style={{
              display: "flex",
              justifyContent: "right",
              fontStyle: "italic",
            }}
          >
            {" "}
            *Required Field{" "}
          </p>
          <div className="item">
            <label htmlFor="FirstName" className="required">
              {" "}
              Recipient First Name
            </label>
            <input
              type="text"
              maxLength="100"
              placeholder="Recipient First Name"
              required
              name="FirstName"
              onChange={recipientChange}
              value={recipientShippingInfo.FirstName || ""}
            />
          </div>
          <div className="item">
            <label htmlFor="LastName" className="required">
              {" "}
              Recipient Last Name{" "}
            </label>
            <input
              type="text"
              maxLength="100"
              placeholder="Recipient Last Name"
              required
              name="LastName"
              onChange={recipientChange}
              value={recipientShippingInfo.LastName || ""}
            />
          </div>
          <div className="item">
            <label htmlFor="EmailAddress" className="required">
              {" "}
              Email Address
            </label>
            <input
              type="text"
              maxLength="500"
              placeholder="Email Address"
              required
              name="EmailAddress"
              onChange={recipientChange}
              value={recipientShippingInfo.EmailAddress || ""}
            />
          </div>
          <div className="item">
            <label htmlFor="StreetAddress" className="required">
              {" "}
              Recipient Street Address{" "}
            </label>
            <input
              type="text"
              placeholder="Recipient Street Address"
              maxLength="100"
              required
              name="StreetAddress"
              onChange={recipientChange}
              value={recipientShippingInfo.StreetAddress || ""}
            />
          </div>
          <div className="item">
            <label htmlFor="City" className="required">
              {" "}
              Recipient City{" "}
            </label>
            <input
              type="text"
              placeholder="Recipient City"
              maxLength="50"
              required
              name="City"
              onChange={recipientChange}
              value={recipientShippingInfo.City || ""}
            />
          </div>
          <div className="item">
            <label htmlFor="State" className="required">
              {" "}
              Recipient State{" "}
            </label>
            <select
              required
              name="State"
              onChange={recipientChange}
              value={recipientShippingInfo.State || ""}
              style={{ padding: "1em" }}
            >
              <option value=""> State </option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="item">
            <label htmlFor="ZipCode" className="required">
              {" "}
              Recipient Zip Code{" "}
            </label>
            <input
              type="number"
              placeholder="Recipient Zip Code"
              maxLength="9"
              required
              name="ZipCode"
              pattern="\d{5}(-\d{4})?"
              onChange={recipientChange}
              value={recipientShippingInfo.ZipCode || ""}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "left",
              paddingTop: "1em",
            }}
          >
            <button variant="primary" type="submit" onClick={handleSave}>
              Save
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ParcelModal;
