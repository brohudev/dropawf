// This component renders a report of parcels at a particular office
// Can filter by sender name

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { PiPencilBold } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";
import ParcelModal from "./ParcelModal.js";

const OrdersInOffice = () => {
  const [cookies] = useCookies();
  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);
  const [selectedParcelID, setSelectedParcelID] = useState(null);
  const [actionHistory, setActionHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStatus, setCurrentStatus] = useState([]);
  const userID = cookies.userID;
  const userRole = cookies.userRole;

  const filteredActionHistory = actionHistory.filter((item) =>
    item.SenderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + "/user/get-orders-through-office",
          { userID: userID }
        );
        const data = response.data.results;

        if (data.length > 0) {
          setCurrentStatus(data[2][0]);
        }
        setActionHistory(data[2]);
      } catch (error) {
        console.error("Error fetching action history: ", error);
      }
    };

    fetchData();
  }, [userID]);

  const handleIconClick = async (parcelID) => {
    try {
      console.log(parcelID);
      setSelectedParcelID(parcelID);
      setIsParcelModalOpen(true);
    } catch {
      setIsParcelModalOpen(false);
    }
  };

  const handleDeleteParcel = (parcelID) => {
    setSelectedParcelID(parcelID);
    const confirmDelete = window.confirm(
      "Are you sure you'd like to delete this order?"
    );
    if (confirmDelete) {
      const deleteParcel = async () => {
        try {
          await axios.post(
            process.env.REACT_APP_BASE_URL + "/post-master/delete-parcel",
            { parcelID }
          );
        } catch (error) {
          console.error("Error fetching action history: ", error);
        }
      };

      deleteParcel();
    }
  };

  return (
    <form style={{ width: "80%" }} className="actionHistory">
      <input
        type="text"
        placeholder="Filter by Sender Name"
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
              Parcel Type
            </th>
            <th style={{ border: "1px solid black", padding: "12px" }}>
              ParcelID
            </th>
            <th style={{ border: "1px solid black", padding: "12px" }}>
              Sender Name
            </th>
            <th style={{ border: "1px solid black", padding: "12px" }}>
              Recipient Name
            </th>
            <th style={{ border: "1px solid black", padding: "12px" }}>Edit</th>
            {userRole == "postmaster" && (
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Delete
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredActionHistory.map((item, index) => (
            <tr
              key={index}
              style={{ background: index % 2 === 0 ? "#f2f2f2" : "white" }}
            >
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.ParcelType}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.ParcelID}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.SenderName}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.ReceiverName}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                <div
                  className="editLink"
                  onClick={() => handleIconClick(item.ParcelID)}
                >
                  {currentStatus.ParcelStatus === "Received" ? (
                    <PiPencilBold />
                  ) : (
                    " "
                  )}
                </div>
              </td>
              {userRole === "postmaster" && (
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  <div
                    className="deleteLink"
                    onClick={() => handleDeleteParcel(item.ParcelID)}
                  >
                    <RiDeleteBin5Line />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
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

export default OrdersInOffice;