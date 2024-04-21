// This component renders a revenue report for a specific post office for
// a given date range. Can filter by employee type.

import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const RevenueReport = () => {
  const [reportData, setReportData] = useState([]);
  const [sumReportData, setSumReportData] = useState([]);
  const [revOfficeCData, setRevOfficeCData] = useState([]);
  const [revOfficeCoData, setRevOfficeCoData] = useState([]);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    revenueType: "OverallTotal",
  });
  const [showReport, setShowReport] = useState(false);
  const [selectedView, setSelectedView] = useState("Overall Total");
  const [expandedEmployeeID, setExpandedEmployeeID] = useState(null);

  const [cookies] = useCookies();
  const userID = cookies.userID;

  const formatTableName = (tableName) => {
    switch (tableName) {
      case "product_purchases":
        return "Product Sales";
      case "transactions":
        return "Deliveries";
      default:
        return tableName;
    }
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

    setSelectedView(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowReport(true);

    try {
      const startDate = formData.startDate;
      const endDate = formData.endDate;

      const response = await axios.post(
        process.env.REACT_APP_BASE_URL + "/report/get-revenue-report",
        { userID: userID, start: startDate, end: endDate }
      );

      const data = response.data.results;
      setReportData(data[2]);
    } catch (error) {
      console.error("Error fetching revenue report:", error);
    }

    try {
      const startDate = formData.startDate;
      const endDate = formData.endDate;
      const responseT = await axios.post(
        process.env.REACT_APP_BASE_URL + "/report/get-revenue-total",
        { userID: userID, start: startDate, end: endDate }
      );

      const dataT = responseT.data.results;
      setSumReportData(dataT[2]);
    } catch (error) {
      console.error("Error fetching total revenue report:", error);
    }

    try {
      const startDate = formData.startDate;
      const endDate = formData.endDate;
      const responseTh = await axios.post(
        process.env.REACT_APP_BASE_URL + "/report/get-revenue-by-clerk",
        { userID: userID, start: startDate, end: endDate }
      );

      const dataTh = responseTh.data.results;
      // console.log(dataTh);
      setRevOfficeCData(dataTh[2]);
    } catch (error) {
      console.error("Error fetching revenue report by clerk:", error);
    }

    try {
      const startDate = formData.startDate;
      const endDate = formData.endDate;
      const responseF = await axios.post(
        process.env.REACT_APP_BASE_URL + "/report/get-revenue-by-courier",
        { userID: userID, start: startDate, end: endDate }
      );

      const dataF = responseF.data.results;
      // console.log(dataF);
      setRevOfficeCoData(dataF[2]);
    } catch (error) {
      console.error("Error fetching revenue report by clerk:", error);
    }
  };

  return (
    <section className="ParcelForm">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Revenue Report</h2>
        <h5>
          This report fetches all revenue collected from Date A to Date B in
          this current Post Office. It can be queried based on type of
          employee's.
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
          <label htmlFor="employeeId" className="optional">
            View Type
          </label>
          <select
            aria-label="select"
            name="revenueType"
            value={formData.revenueType}
            onChange={handleChange}
            placeholder="Select"
          >
            <option value="Overall Total">Overall Total</option>
            <option value="By Officeclerk">By Officeclerk</option>
            <option value="By MailCourier">By MailCourier</option>
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
      {showReport && (
        <div>
          {selectedView === "By Officeclerk" ? (
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
                      Name
                    </th>
                    <th style={{ border: "1px solid black", padding: "12px" }}>
                      EmployeeID
                    </th>

                    <th style={{ border: "1px solid black", padding: "12px" }}>
                      Revenue Generated
                    </th>
                    <th style={{ border: "1px solid black", padding: "12px" }}>
                      # of Sales
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revOfficeCData.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        background: index % 2 === 0 ? "#f2f2f2" : "white",
                      }}
                    >
                      <td
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        {item.Name}
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "12px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          if (expandedEmployeeID === item.employeeID) {
                            setExpandedEmployeeID(null); // Toggle back to short version
                          } else {
                            setExpandedEmployeeID(item.employeeID);
                          }
                        }}
                      >
                        {expandedEmployeeID === item.employeeID ? (
                          <span>{item.employeeID}</span>
                        ) : (
                          <span>{item.employeeID.slice(0, 5)}...</span>
                        )}
                      </td>
                      <td
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        ${item.TotalAmount}
                      </td>
                      <td
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        {item.Occurances}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedView === "By MailCourier" ? (
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
                      Name
                    </th>
                    <th style={{ border: "1px solid black", padding: "12px" }}>
                      EmployeeID
                    </th>

                    <th style={{ border: "1px solid black", padding: "12px" }}>
                      Revenue Generated
                    </th>
                    <th style={{ border: "1px solid black", padding: "12px" }}>
                      # of Sales
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revOfficeCoData.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        background: index % 2 === 0 ? "#f2f2f2" : "white",
                      }}
                    >
                      <td
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        {item.EmployeeName}
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "12px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          if (expandedEmployeeID === item.employeeID) {
                            setExpandedEmployeeID(null); // Toggle back to short version
                          } else {
                            setExpandedEmployeeID(item.employeeID);
                          }
                        }}
                      >
                        {expandedEmployeeID === item.employeeID ? (
                          <span>{item.employeeID}</span>
                        ) : (
                          <span>{item.employeeID.slice(0, 5)}...</span>
                        )}
                      </td>

                      <td
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        ${item.TotalAmount}
                      </td>
                      <td
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        {item.Occurrences}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <div style={{ paddingBottom: "10px", paddingTop: "20px" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    // paddingBottom: "100px",
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
                      <th
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        Sum Revenue
                      </th>
                      <th
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sumReportData.map((item, index) => (
                      <tr
                        key={index}
                        style={{
                          background: index % 2 === 0 ? "#f2f2f2" : "white",
                        }}
                      >
                        <td
                          style={{ border: "1px solid black", padding: "12px" }}
                        >
                          ${item.ProductPurchasesAmount}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "12px" }}
                        >
                          {formatTableName(item.TableName)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                      <th
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        Date
                      </th>
                      <th
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        Amount
                      </th>
                      <th
                        style={{ border: "1px solid black", padding: "12px" }}
                      >
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, index) => (
                      <tr
                        key={index}
                        style={{
                          background: index % 2 === 0 ? "#f2f2f2" : "white",
                        }}
                      >
                        <td
                          style={{ border: "1px solid black", padding: "12px" }}
                        >
                          {parseDate(item.purchaseDate)}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "12px" }}
                        >
                          ${item.Amount}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "12px" }}
                        >
                          {formatTableName(item.TableName)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default RevenueReport;
