// This component renders a report of orders in a date range
// Can filter by location

import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const OrderReport = () => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    City: "",
    State: "",
    ZipCode: "",
  });

  const [cookies] = useCookies();
  const [showReport, setShowReport] = useState(false);
  const [OreportData, setOReportData] = useState([]);
  const userID = cookies.userID;

  const calculatePercentage = (parcelType) => {
    const totalOrders = filteredOrderReport.length;
    const parcelTypeCount = filteredOrderReport.filter(
      (item) => item.ParcelType === parcelType
    ).length;
    const percentage = (parcelTypeCount / totalOrders) * 100;

    return percentage.toFixed(2); // Round to 2 decimal places
  };

  const parseDate = (dateIn) => {
    const date = new Date(dateIn);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    return formattedDate;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const filteredOrderReport = OreportData.filter((item) => {
    const isOrderMatchCity = item.ReceiverCity.toLowerCase().includes(
      formData.City.toLowerCase()
    );

    const isOrderMatchState = formData.State
      ? item.ReceiverState.toLowerCase().includes(formData.State.toLowerCase())
      : true;

    const isOrderMatchZipCode = formData.ZipCode
      ? item.ReceiverZipCode.includes(formData.ZipCode)
      : true;

    return isOrderMatchCity && isOrderMatchState && isOrderMatchZipCode;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startDate = formData.startDate;
    const endDate = formData.endDate;
    setShowReport(true);

    try {
      const response = await axios.post(
        process.env.REACT_APP_BASE_URL + "/report/get-order-report",
        {
          userID: userID,
          start: startDate,
          end: endDate,
        }
      );

      const data = response.data.results;
      console.log(data[2]);

      setOReportData(data[2]);
    } catch (error) {}
  };

  return (
    <section>
      <section>
        <form className="form" onSubmit={handleSubmit}>
          <h2>Order Report</h2>
          <h5>
            This report fetches a report of all orders from Date A to Date B,
            labeling it's type and showing what percent of the total package
            type it is. This report can be filtered by City, State, or ZipCode.
          </h5>
          <div className="item">
            <label htmlFor="startDate" className="required">
              Start Date
            </label>
            <input
              type="date"
              required
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="item">
            <label htmlFor="endDate" className="required">
              End Date
            </label>
            <input
              type="date"
              required
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
          <div className="item">
            <label htmlFor="City" className="optional">
              Recipient City
            </label>
            <input
              type="text"
              maxLength="100"
              placeholder="Enter City Name"
              name="City"
              value={formData.City}
              onChange={handleChange}
            />
          </div>
          <div className="item">
            <label htmlFor="State" className="optional">
              Recipient State
            </label>
            <input
              type="text"
              maxLength="10"
              placeholder="Enter State"
              name="State"
              value={formData.State}
              onChange={handleChange}
            />
          </div>
          <div className="item">
            <label htmlFor="ZipCode" className="optional">
              Recipient Zip Code
            </label>
            <input
              type="text"
              maxLength="10"
              placeholder="Ex. 77500"
              name="ZipCode"
              value={formData.ZipCode}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </section>
      <section>{showReport}</section>
      {showReport && (
        <div>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              border: "1px solid black",
              textAlign: "center",
            }}
            className="table"
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
                  % of Total Sale Type
                </th>
                <th style={{ border: "1px solid black", padding: "12px" }}>
                  Parcel ID
                  {/* these are repetitive so idk */}
                </th>
                <th style={{ border: "1px solid black", padding: "12px" }}>
                  Recripient Address
                  {/* should we also group this? */}
                </th>
                <th style={{ border: "1px solid black", padding: "12px" }}>
                  DropAwf Date
                  {/* should we also group this? */}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrderReport.map((item, index, arr) => {
                // Check if the current item's ParcelType is different from the previous item
                const showParcelType =
                  index === 0 || item.ParcelType !== arr[index - 1].ParcelType;
                const percentage = calculatePercentage(item.ParcelType);
                return (
                  <tr key={index}>
                    {showParcelType && (
                      <td
                        style={{ border: "1px solid black", padding: "12px" }}
                        rowSpan={
                          arr.filter((i) => i.ParcelType === item.ParcelType)
                            .length
                        }
                      >
                        {item.ParcelType}
                      </td>
                    )}
                    {showParcelType && (
                      <td
                        style={{ border: "1px solid black", padding: "12px" }}
                        rowSpan={
                          arr.filter((i) => i.ParcelType === item.ParcelType)
                            .length
                        }
                      >
                        {percentage}%
                      </td>
                    )}
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      {item.ParcelID}
                    </td>
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      {item.ReceiverStreetAddress +
                        " " +
                        item.ReceiverCity +
                        ", " +
                        item.ReceiverState +
                        " " +
                        item.ReceiverZipCode}
                    </td>
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      {parseDate(item.TransactionDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default OrderReport;
