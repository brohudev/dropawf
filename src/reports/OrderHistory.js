// This component renders the order history of a customer
// Can filter by incoming/outgoing and name

import React, { useEffect, useState } from "react";
import axios from "axios";
import { PiPencilBold } from "react-icons/pi";
import { useCookies } from "react-cookie";
import ParcelModal from "./ParcelModal.js";

const OrderHistory = () => {
  const [cookies] = useCookies();
  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);
  const [selectedParcelID, setSelectedParcelID] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const userID = cookies.userID;
  const [buttonText, setButtonText] = useState("Incoming Mail");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = "/customer/sent-packages";

        if (buttonText == "Outgoing Mail") {
          endpoint = "/customer/reciving-packages";
        }

        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + endpoint,
          { userID }
        );
        const data = response.data.results;

        const parsedData = data[2].map((item) => {
          const date = new Date(item.TransactionDate);
          const year = date.getFullYear();
          const month = ("0" + (date.getMonth() + 1)).slice(-2);
          const day = ("0" + (date.getDate() + 1)).slice(-2);
          const dateFormatted = month + "/" + day + "/" + year;
          let parsedItem = {};

          parsedItem = {
            transactionDate: dateFormatted,
            ParcelID: item.ParcelID,
            Name: item.FirstName + " " + item.LastName,
            Address:
              item.StreetAddress +
              ", " +
              item.City +
              ", " +
              item.State +
              " " +
              item.ZipCode,
          };

          return parsedItem;
        });
        setOrderHistory(parsedData);
      } catch (error) {
        console.error("Error fetching order history: ", error);
      }
    };

    fetchData();
  }, [userID, buttonText]);

  const filteredOrderHistory = orderHistory.filter((item) =>
    item.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIconClick = async (parcelID) => {
    try {
      console.log(parcelID);
      setSelectedParcelID(parcelID);
      setIsParcelModalOpen(true);
    } catch {
      setIsParcelModalOpen(false);
    }
  };

  const toggleMailType = () => {
    setButtonText((prevText) =>
      prevText === "Incoming Mail" ? "Outgoing Mail" : "Incoming Mail"
    );

    setOrderHistory([]);
  };

  return (
    <form className="orderhistory">
      <section style={{ margin: "auto", width: "80%" }}>
        <h1 style={{ color: "black", textAlign: "center" }}>
          {buttonText === "Incoming Mail"
            ? "Outgoing Mail History"
            : "Incoming Mail History"}
        </h1>
        <input
          type="text"
          placeholder="Filter by Recipient Name"
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
                Transaction Date
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Parcel ID
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                {buttonText === "Incoming Mail"
                  ? "Recipient Name"
                  : "Sender Name"}
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                {buttonText === "Incoming Mail"
                  ? "Recipient Address"
                  : "Dropawf Location"}
              </th>
              {buttonText === "Incoming Mail" && (
                <th style={{ border: "1px solid black", padding: "12px" }}>
                  Edit Order
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredOrderHistory.map((item, index) => (
              <tr
                key={index}
                style={{ background: index % 2 === 0 ? "#f2f2f2" : "white" }}
              >
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  {item.transactionDate}
                </td>
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  {item.ParcelID}
                </td>
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  {item.Name}
                </td>
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  {item.Address}
                </td>
                {buttonText === "Incoming Mail" && (
                  <td style={{ border: "1px solid black", padding: "12px" }}>
                    <div
                      className="editLink"
                      onClick={() => handleIconClick(item.ParcelID)}
                    >
                      {buttonText === "Incoming Mail" ? <PiPencilBold /> : " "}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={toggleMailType}>{buttonText}</button>
      </section>
      <ParcelModal
        isOpen={isParcelModalOpen}
        onClose={() => {
          setIsParcelModalOpen(false);
        }}
        parcelID={selectedParcelID}
      />
    </form>
  );
};

export default OrderHistory;
