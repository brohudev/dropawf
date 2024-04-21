import React from "react";

const EmployeeReportResults = ({ formData }) => {
  return (
    <form style={{ width: "80%" }} className="actionHistory">
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
            <th style={{ border: "1px solid black", padding: "12px" }}>Name</th>
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
          {formData.map((item, index) => (
            <tr
              key={index}
              style={{ background: index % 2 === 0 ? "#f2f2f2" : "white" }}
            >
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.employeeID}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.FirstName + " " + item.LastName}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.JobTitle}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.EventType}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.ParcelID}
              </td>
              <td style={{ border: "1px solid black", padding: "12px" }}>
                {item.EventTimeStamp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </form>
  );
};

export default EmployeeReportResults;
