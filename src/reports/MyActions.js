// This component renders the actions an employee has made
// An action is defined as events the employee has processed involving parcels

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const MyActions = () => {
  const [cookies] = useCookies();
  const [actionHistory, setActionHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const userID = cookies.userID;

  const filteredActionHistory = actionHistory.filter((item) =>
    item.parcelID.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const parseDate = (dateIn) => {
    const date = new Date(dateIn);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    return formattedDate;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + "/user/getActions",
          { userID: userID }
        );
        const data = response.data.results;

        setActionHistory(data[2]);
      } catch (error) {
        console.error("Error fetching action history: ", error);
      }
    };

    fetchData();
  }, [userID]);

  return (
    <form style={{ width: "80%" }} className="actionHistory">
      <input
        type="text"
        placeholder="Filter by ParcelID"
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
            <th style={{ border: "1px solid black", padding: "12px" }}>Date</th>
            <th style={{ border: "1px solid black", padding: "12px" }}>Type</th>
            <th style={{ border: "1px solid black", padding: "12px" }}>
              Parcel ID
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredActionHistory.map((item, index) => (
            <tr
              key={index}
              style={{ background: index % 2 === 0 ? "#f2f2f2" : "white" }}
            >
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {parseDate(item.EventTimeStamp)}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.EventType}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.parcelID}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </form>
  );
};

export default MyActions;
