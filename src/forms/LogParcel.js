import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Card, Container } from "react-bootstrap";
import { useLoginCookies } from "../cookies";
import { useCookies } from "react-cookie";

const LogParcel = () => {
  const [showParcelSuccess, setShowParcelSuccess] = useState(false);
  const [offices, setOffices] = useState([]);
  const { cookies, setCookie } = useLoginCookies();
  const [locationType, setLocationType] = useState("Address");
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [parcelInfo, setParcelInfo] = useState({
    eventType: "",
    parcelID: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    const getOfficeList = async () => {
      try {
        const userID = cookies.userID;
        const results = await axios.post(
          process.env.REACT_APP_BASE_URL + "/mail-carriers/get-office-list",
          { userID }
        );

        const officeData = results.data.results;
        setOffices(officeData);
      } catch (error) {
        console.error("Error fetching office list:", error);
      }
    };

    getOfficeList();
  }, []);

  const parcelChange = (event) => {
    const { name, value } = event.target;
    setParcelInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLocTypeChange = (event) => {
    const { value } = event.target;
    setLocationType(value);
  };

  const handleOfficeSelect = (event) => {
    const selectedOfficeName = event.target.value;
    const office = offices.find(
      (office) => office.OfficeName === selectedOfficeName
    );
    setSelectedOffice(office);

    setParcelInfo({
      ...parcelInfo,
      streetAddress: office.StreetAddress,
      city: office.City,
      state: office.State,
      zipCode: office.ZipCode,
    });
  };

  const handleContinueToSucess = async (event) => {
    event.preventDefault();
    setShowParcelSuccess(true);
    const userID = cookies.userID;
    const sendData = {
      userID,
      parcelInfo,
    };

    try {
      await fetch(
        process.env.REACT_APP_BASE_URL + "/mail-carriers/post-action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(sendData),
        }
      );
    } catch (error) {
      console.error("Error submitting order: ", error);
    }
  };

  const EventTypes = ["Received", "In Transit", "Delivered", "Lost"];

  const locTypes = ["Post Office", "Residential"];

  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  return (
    <Container>
      <div
        className="LogParcel"
        style={{ display: "flex", justifyContent: "center", paddingTop: "2em" }}
      >
        <Card className="poform">
          <Card.Body>
            {!showParcelSuccess ? (
              <Form onSubmit={handleContinueToSucess}>
                <p
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  {" "}
                  Log a Parcel{" "}
                </p>
                <p
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    fontStyle: "italic",
                  }}
                >
                  {" "}
                  *Required Field{" "}
                </p>
                <Form.Group>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: "10px",
                      gap: "20px",
                    }}
                  >
                    <Form.Control
                      as="select"
                      placeholder="Event Type"
                      name="eventType"
                      id="eventType"
                      onChange={parcelChange}
                      value={parcelInfo.eventType || ""}
                      required
                      style={{ width: "320px", padding: "1em" }}
                    >
                      <option value=""> Event Type * </option>
                      {EventTypes.map((EventTypes) => (
                        <option key={EventTypes} value={EventTypes}>
                          {EventTypes}
                        </option>
                      ))}
                    </Form.Control>

                    <Form.Control
                      type="text"
                      placeholder="Tracking Number *"
                      name="parcelID"
                      id="parcelID"
                      pattern=".{36}"
                      onChange={parcelChange}
                      value={parcelInfo.parcelID || ""}
                      required
                      style={{ width: "320px", padding: "1em", border: '1px solid #E5E5EA', borderRadius: '4px', fontSize: '0.75em'}}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: "10px",
                      gap: "20px",
                    }}
                  >
                    <Form.Control
                      as="select"
                      placeholder="Building Type"
                      name="eventType"
                      id="eventType"
                      onChange={handleLocTypeChange}
                      value={locationType || ""}
                      required
                      style={{ width: "660px", padding: "1em" }}
                    >
                      <option value=""> Building Type * </option>
                      {locTypes.map((locTypes) => (
                        <option key={locTypes} value={locTypes}>
                          {locTypes}
                        </option>
                      ))}
                    </Form.Control>
                  </div>

                  {locationType == "Post Office" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: "10px",
                        gap: "20px",
                      }}
                    >
                      <Form.Control
                        as="select"
                        placeholder="Office Name"
                        name="officeName"
                        id="officeName"
                        onChange={handleOfficeSelect}
                        value={selectedOffice ? selectedOffice.OfficeName : ""}
                        required
                        style={{ width: "660px", padding: "1em" }}
                      >
                        <option value="">Select Office *</option>
                        {offices.map((office) => (
                          <option
                            key={office.OfficeName}
                            value={office.OfficeName}
                          >
                            {office.OfficeName}
                          </option>
                        ))}
                      </Form.Control>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: "10px",
                      gap: "20px",
                    }}
                  >
                    <Form.Control
                      type="text"
                      placeholder="e.g. 123 Main Street"
                      name="streetAddress"
                      id="streetAddress"
                      onChange={parcelChange}
                      value={parcelInfo.streetAddress || ""}
                      required
                      style={{ width: "660px", padding: "1em", border: '1px solid #E5E5EA', borderRadius: '4px', fontSize: '0.75em'}}                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: "10px",
                      gap: "20px",
                    }}
                  >
                    <Form.Control
                      type="text"
                      placeholder="e.g. Anytown"
                      name="city"
                      id="city"
                      onChange={parcelChange}
                      value={parcelInfo.city || ""}
                      required
                      style={{ width: "207px", padding: "1em", border: '1px solid #E5E5EA', borderRadius: '4px', fontSize: '0.75em'}}                    />

                    <Form.Control
                      as="select"
                      name="state"
                      id="state"
                      onChange={parcelChange}
                      value={parcelInfo.state || ""}
                      required
                      style={{ width: "207px", padding: "1em" }}
                    >
                      <option value=""> State * </option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Form.Control>

                    <Form.Control
                      type="text"
                      placeholder="e.g. 12345"
                      name="zipCode"
                      id="zipCode"
                      pattern="\d{5}(-\d{4})?"
                      onChange={parcelChange}
                      value={parcelInfo.zipCode || ""}
                      required
                      style={{ width: "207", padding: "1em", border: '1px solid #E5E5EA', borderRadius: '4px', fontSize: '0.75em'}}                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      juistifyContent: "center",
                      paddingTop: "20px",
                      paddingBottom: "10px",
                    }}
                  >
                    <Button variant="primary" type="submit">
                      Log
                    </Button>
                  </div>
                </Form.Group>
              </Form>
            ) : (
              <Form>
                <div style={{ textAlign: "center" }}>
                  <h2> Parcel Successfully Logged! </h2>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LogParcel;
