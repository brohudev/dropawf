// This component renders a report of post office branches with their
// revenues and revenue categories. Can filter by branch and date.

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const OfficeReport = () => {
  const [reportData, setReportData] = useState([]);
  const [sumReportData, setSumReportData] = useState([]);
  // const [revOfficeCData, setRevOfficeCData] = useState([]);
  // const [revOfficeCoData, setRevOfficeCoData] = useState([]);
  const [offices, setOffices] = useState([]);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    selectedOffice: "All Branches",
  });
  const [showReport, setShowReport] = useState(false);

  const [cookies] = useCookies();
  const userID = cookies.userID;

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

    if (value === "") {
      setFormData({
        ...formData,
        selectedOffice: "All Branches",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowReport(true);

    try {
      const startDate = formData.startDate;
      const endDate = formData.endDate;

      const response = await axios.post(
        process.env.REACT_APP_BASE_URL + "/report/get-admin-revenue",
        { userID: userID, start: startDate, end: endDate }
      );

      const data = response.data.results;
      console.log(data);
      setReportData(data[1]);
    } catch (error) {
      console.error("Error fetching revenue report:", error);
    }

    try {
      const startDate = formData.startDate;
      const endDate = formData.endDate;
      const responseT = await axios.post(
        process.env.REACT_APP_BASE_URL + "/report/get-admin-revenue-total",
        { userID: userID, start: startDate, end: endDate }
      );

      const dataT = responseT.data.results;
      setSumReportData(dataT[1]);
    } catch (error) {
      console.error("Error fetching total revenue report:", error);
    }

    if (formData.selectedOffice !== "All Branches") {
      try {
        const startDate = formData.startDate;
        const endDate = formData.endDate;
        const poName = formData.selectedOffice;

        const response = await axios.post(
          process.env.REACT_APP_BASE_URL +
            "/report/get-admin-revenue-by-office",
          { poName: poName, start: startDate, end: endDate }
        );

        const data = response.data.results;
        console.log(data);
        setReportData(data[2]);
      } catch (error) {
        console.error("Error fetching revenue report:", error);
      }

      try {
        const startDate = formData.startDate;
        const endDate = formData.endDate;
        const poName = formData.selectedOffice;

        const responseT = await axios.post(
          process.env.REACT_APP_BASE_URL +
            "/report/get-admin-revenue-total-by-office",
          { poName: poName, start: startDate, end: endDate }
        );

        const dataT = responseT.data.results;
        console.log(dataT);
        setSumReportData(dataT[2]);
      } catch (error) {
        console.error("Error fetching total revenue report:", error);
      }
    }
  };

  return (
    <section className="ParcelForm">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Office Report</h2>
        <h5>
          This report allows you, the admin, to see how much revenue each branch
          has generated from Date A to Date B. You can also view the revenue for
          a single branch using the dropdown.
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
          <label htmlFor="selectedOffice" className="optional">
            Branch Name
          </label>
          <select
            aria-label="select"
            name="selectedOffice"
            value={formData.selectedOffice || "All Branches" || ""}
            onChange={handleChange}
            placeholder="Select"
          >
            <option value="">All Branches</option>
            {offices.map((office) => (
              <option key={office.OfficeName} value={office.OfficeName}>
                {office.OfficeName}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
      {showReport && (
        <div>
          <div style={{ paddingBottom: "10px", paddingTop: "20px" }}>
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
                    Total Revenue
                  </th>
                  <th style={{ border: "1px solid black", padding: "12px" }}>
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
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      ${item.ProductPurchasesAmount}
                    </td>
                    <td style={{ border: "1px solid black", padding: "12px" }}>
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
                  <th style={{ border: "1px solid black", padding: "12px" }}>
                    Transaction Date
                  </th>
                  <th style={{ border: "1px solid black", padding: "12px" }}>
                    Sale Amount
                  </th>
                  <th style={{ border: "1px solid black", padding: "12px" }}>
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
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      {parseDate(item.purchaseDate)}
                    </td>
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      ${item.Amount}
                    </td>
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      {formatTableName(item.TableName)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default OfficeReport;
