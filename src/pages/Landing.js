import React, { useState, useEffect } from "react";
import axios from "axios";
import { LuPackage } from "react-icons/lu";
import { LuPackageCheck } from "react-icons/lu";
import { LuPackageSearch } from "react-icons/lu";
import { LuPackageOpen } from "react-icons/lu";
import "../css/Landing.css";

const Landing = () => {
  const [parcelIDInfo, setParcelIDInfo] = useState({
    ParcelID: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [showError, setShowError] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const trackingNumChange = (event) => {
    try {
      const { value } = event.target;
      setParcelIDInfo({
        ParcelID: value,
      });
    } catch (error) {
      console.error(error);
    }

    setShowSuccess(false);
    setShowError(false);
  };

  useEffect(() => {
    const fetchTrackingDetails = async () => {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + "/customer/get-tracking-details",
          { parcelID: parcelIDInfo.ParcelID }
        );

        setTrackingDetails(response.data);
      } catch (error) {
        console.error("Error fetching tracking data:", error);
      }
    };

    fetchTrackingDetails();
  }, [parcelIDInfo.ParcelID]);

    const handleSubmit = async (event) => {
      event.preventDefault();
      setFormSubmitted(true);

      const isTrackingFound = trackingDetails.some(tracking => tracking.ParcelID === parcelIDInfo.ParcelID);

      if (!isTrackingFound) {
        setShowError(true);
        setShowSuccess(false);
      } else {
        setShowSuccess(true);
        setShowError(false);
      }
  };

  return (
    <main className="Landing">
      <div className="splash">
        <div className="titles">
          <h1 className="slogan">
            Delivering Connections, One Package at a Time.
          </h1>
          <h2 className="miniSlogan">
            From Our Hands to Your Home, Ensuring Every Delivery Brings a Touch
            of Happiness.
          </h2>
        </div>
        <form className="landingForm" onSubmit={handleSubmit}>
          <h3 className="trackTitle">Track Your Package!</h3>
          <p>Enter your 36 character tracking number</p>
          <input
            className="trackingInput"
            type="text"
            placeholder="Tracking Number"
            name="ParcelID"
            id="ParcelID"
            onChange={trackingNumChange}
            value={parcelIDInfo.ParcelID}
            pattern=".{36}"
            required
          />
          <button>Start Tracking</button>
          {formSubmitted && showError && (
            <p style={{ color: "red", paddingTop: "5px", textAlign: "left" }}>
              {" "}
              No tracking information found for the provided tracking number.
            </p>
          )}
          {showSuccess && (
            <div>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ padding: "12px" }}> Delivery Status </th>
                  </tr>
                </thead>
                <tbody>
                  {trackingDetails.map((tracking) => (
                    <tr key={tracking.ParcelID}>
                      <td style={{ padding: "12px", textAlign: "left" }}>
                        {tracking.EventType}
                      </td>
                      <a href="/#/login"> Log in to get more info! </a>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </form>
      </div>
      <section>
        <div className="landingboxes">
          <div className="box">
            <div className="icon" style={{ fontSize: '4em' }}>
              {" "}
              <LuPackage />{" "}
            </div>
            <h2 className="boxTitles"> Package </h2>
            <p className="boxDescriptions">
              {" "}
              Effortlessly send and receive parcels at any time with our
              reliable packaging solutions.{" "}
            </p>
          </div>
          <div className="box">
            <div className="icon" style={{ fontSize: '4em' }}>
              {" "}
              <LuPackageCheck />{" "}
            </div>
            <h2 className="boxTitles"> Manage </h2>
            <p className="boxDescriptions">
              {" "}
              Seamlessly organize and oversee all of your shipments with our
              management tools.{" "}
            </p>
          </div>
          <div className="box">
            <div className="icon" style={{ fontSize: '4em' }}>
              <LuPackageSearch />{" "}
            </div>
            <h2 className="boxTitles"> Track </h2>
            <p className="boxDescriptions">
              {" "}
              Stay informed every step of the way with real-time tracking
              updates for your deliveries.{" "}
            </p>
          </div>
          <div className="box">
            <div className="icon" style={{ fontSize: '4em' }}>
              {" "}
              <LuPackageOpen />{" "}
            </div>
            <h2 className="boxTitles"> Deliver </h2>
            <p className="boxDescriptions">
              {" "}
              Enjoy peace of mind with timely and secure package deliveries to
              your destination.{" "}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
