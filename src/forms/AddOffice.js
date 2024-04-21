import React, { useState } from "react";
import axios from "axios";
import { useUserIDCookie } from "../cookies";
import AddPostMaster from "./AddPostMaster";

// Component for adding a new post office
const AddOffice = () => {
  const initialFormData = {
    City: "",
    State: "",
    ZipCode: "",
    Street: "",
    FirstName: "",
    LastName: "",
    OfficeName: "",
  };

  const initialMessageData = {
    class: "",
    text: "",
  };

  const states = [ "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", 
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", 
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", 
  "VA", "WA", "WV", "WI", "WY"];

  const { cookies } = useUserIDCookie();
  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState(initialMessageData);
  const [currentPage, setCurrentPage] = useState(1);

  function handleChange(event) {
    const { id, value } = event.target;
    setFormData((oldFormData) => ({
      ...oldFormData,
      [id]: value,
    }));
  }

  async function submitForm(event) {
    event.preventDefault();
    if (currentPage === 1) {
      setCurrentPage(2);
    } else {
      await postSubmission();
    }
  }

  async function postSubmission() {
    const payload = {
      ...formData,
      userID: cookies.userID,
    };

    try {
      await axios.post(
        process.env.REACT_APP_BASE_URL + "/post-master/add-office",
        payload
      );
      setMessage({
        class: "success",
        text: "Office added.",
      });
      setFormData(initialFormData);
      setCurrentPage(3);
    } catch (error) {
      setMessage({
        class: "failed",
        text: "Failed to add office. Please try again.",
      });
    }
  }

  function handleAddAnother() {
    setMessage(initialMessageData);
    setCurrentPage(1);
  }

  return (
    <section>
      {currentPage === 1 && (
        <form className="form" onSubmit={submitForm}>
          <h1>Add a New Post Office</h1>
          <div className="item">
            <label htmlFor="OfficeName" className="required">
              Post Office Name
            </label>
            <input
              type="text"
              id="OfficeName"
              placeholder="e.g. Sunny Valley"
              required
              onChange={handleChange}
              value={formData.OfficeName}
            />
          </div>
          <div className="item">
            <label htmlFor="Street" className="required">
              Street Address
            </label>
            <input
              type="text"
              id="Street"
              placeholder="e.g. 123 Main Street"
              required
              onChange={handleChange}
              value={formData.Street}
            />
          </div>
          <div className="item">
            <label htmlFor="City" className="required">
              City
            </label>
            <input
              type="text"
              id="City"
              placeholder="e.g. Anytown"
              required
              onChange={handleChange}
              value={formData.City}
            />
          </div>
          <div className="item">
            <label htmlFor="State" className="required">
              State
            </label>
            <select
              required
              id="State"
              onChange={handleChange}
              value={formData.State || ""}
              style={{ padding: "1em" }}
            >
              <option value="">State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="item">
            <label htmlFor="ZipCode" className="required">
              Zip Code
            </label>
            <input
              type="text"
              id="ZipCode"
              placeholder="e.g. 12345"
              required
              onChange={handleChange}
              value={formData.ZipCode}
            />
          </div>
          <button type="submit">Next</button>
        </form>
      )}
      {currentPage === 2 && <AddPostMaster />}
      {currentPage === 3 && (
        <div className="form">
          <h2>Office Added Successfully!</h2>
          <button onClick={handleAddAnother}>Add Another Office</button>
        </div>
      )}
      {message.class.length > 0 && (
        <div className={`message ${message.class}`}>
          <div>{message.text}</div>
        </div>
      )}
      {currentPage === 2 && (
        <button onClick={() => setCurrentPage(1)}>Back</button>
      )}
    </section>
  );
};

export default AddOffice;
