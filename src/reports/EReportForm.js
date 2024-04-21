// This component renders a report of actions by one or more employees
// Contains filters to customize report

import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const EmployeeReport = () => {
  const [cookies] = useCookies();
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    employeeName: "",
    eventType: null,
    jobTitle: null,
  });

  const userID = cookies.userID;

  const [showReport, setShowReport] = useState(false);
  const [EreportData, setEReportData] = useState([]);

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

  const filteredEmployeeReport = EreportData.filter((item) => {
    const isEmployeeNameMatch =
      item.FirstName.toLowerCase().includes(
        formData.employeeName.toLowerCase()
      ) ||
      item.LastName.toLowerCase().includes(formData.employeeName.toLowerCase());

    const isEventTypeMatch =
      formData.eventType === null ||
      formData.eventType === "" ||
      item.EventType === formData.eventType;

    const isJobTitleMatch =
      formData.jobTitle === null ||
      formData.jobTitle === "" ||
      item.JobTitle === formData.jobTitle;

    return isEmployeeNameMatch && isEventTypeMatch && isJobTitleMatch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startDate = formData.startDate + " 00:00:00";
    const endDate = formData.endDate + " 00:00:00";
    setShowReport(true);

    try {
      const response = await axios.post(
        process.env.REACT_APP_BASE_URL + "/report/get-employee-report",
        { userID: userID, start: startDate, end: endDate }
      );

      const data = response.data.results;

      setEReportData(data[2]);
    } catch (error) {}
  };

  return (
    <section>
      <form className="form" onSubmit={handleSubmit}>
        <h2>Employee Clocked Actions Report</h2>
        <h5>
          This report fetches number of clocked actions by employees from Date A
          to Date B and can be sorted by employee/employeeID, and/or parcel
          type.
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
          <label htmlFor="employeeName" className="optional">
            Employee Name
          </label>
          <input
            type="text"
            maxLength="100"
            placeholder="Enter Employee Name"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
          />
        </div>
        <div className="item">
          <label htmlFor="employeeId" className="optional">
            Event Type
          </label>
          <select
            aria-label="select"
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            placeholder="Select"
          >
            <option></option>
            <option value="Received">Recieved</option>
            <option value="In Transit">In transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
        <div className="item">
          <label htmlFor="parcelType" className="optional">
            Job Title
          </label>
          <select
            aria-label="select"
            name="jobTitle"
            placeholder="Select"
            value={formData.jobTitle}
            onChange={handleChange}
          >
            <option></option>
            <option value="officeclerk">Office Clerk</option>
            <option value="mailcourier">Mail Courier</option>
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
      {showReport}
      {showReport && (
        <div className="excel-table">
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
                  EmployeeID
                </th>
                <th style={{ border: "1px solid black", padding: "12px" }}>
                  Name
                </th>
                <th style={{ border: "1px solid black", padding: "12px" }}>
                  JobTitle
                </th>
                <th style={{ border: "1px solid black", padding: "12px" }}>
                  Event
                </th>
                <th style={{ border: "1px solid black", padding: "12px" }}>
                  ParcelID
                </th>
                <th style={{ border: "1px solid black", padding: "12px" }}>
                  Time Stamp
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployeeReport.map((item, index, arr) => {
                // Check if the current item's EmployeeID, Name, and JobTitle are different from the previous item
                const showEmployeeIDNameJobTitle =
                  index === 0 ||
                  item.employeeID !== arr[index - 1].employeeID ||
                  item.FirstName !== arr[index - 1].FirstName ||
                  item.LastName !== arr[index - 1].LastName ||
                  item.JobTitle !== arr[index - 1].JobTitle;

                return (
                  <tr
                    key={index}
                    style={{
                      background: index % 2 === 0 ? "#f2f2f2" : "white",
                    }}
                  >
                    {/* Conditionally render the EmployeeID, Name, and JobTitle only if they're different from the previous row */}
                    {showEmployeeIDNameJobTitle && (
                      <>
                        <td
                          style={{ border: "1px solid black", padding: "12px" }}
                          rowSpan={
                            arr.filter(
                              (i) =>
                                i.employeeID === item.employeeID &&
                                i.FirstName === item.FirstName &&
                                i.LastName === item.LastName &&
                                i.JobTitle === item.JobTitle
                            ).length
                          }
                        >
                          {item.employeeID}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "12px" }}
                          rowSpan={
                            arr.filter(
                              (i) =>
                                i.employeeID === item.employeeID &&
                                i.FirstName === item.FirstName &&
                                i.LastName === item.LastName &&
                                i.JobTitle === item.JobTitle
                            ).length
                          }
                        >
                          {item.FirstName + " " + item.LastName}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "12px" }}
                          rowSpan={
                            arr.filter(
                              (i) =>
                                i.employeeID === item.employeeID &&
                                i.FirstName === item.FirstName &&
                                i.LastName === item.LastName &&
                                i.JobTitle === item.JobTitle
                            ).length
                          }
                        >
                          {item.JobTitle}
                        </td>
                      </>
                    )}
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      {item.EventType}
                    </td>
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      {item.ParcelID}
                    </td>
                    <td style={{ border: "1px solid black", padding: "12px" }}>
                      {parseDate(item.EventTimeStamp)}
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

export default EmployeeReport;
