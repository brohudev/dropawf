import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { PiPencilBold } from "react-icons/pi";
import { RiDeleteBin5Line } from "react-icons/ri";
import "../css/Profile.css";
import PostOfficeModal from "./postOfficeModal.js";
import "../css/ManageEmployees.css";

const ManageOffice = () => {
  let postOfficeList = [];
  const [cookies, setCookie] = useCookies();
  const [postOffices, setPostOffices] = useState([]);
  const [reloadTable, setReloadTable] = useState(false);
  const [editOfficeIndex, setEditOfficeIndex] = useState(null);
  const [selectedPostOffice, setSelectedPostOffice] = useState(null);
  const [isPostOfficeModalOpen, setIsPostOfficeModalOpen] = useState(false);

  const userID = cookies.userID;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + "/admin/get-post-office-details",
          { userID: userID }
        );
        const data = response.data;
        Object.keys(data).forEach((index) => {
          postOfficeList.push(data[index]);
        });
        setPostOffices(postOfficeList);
      } catch (error) {
        console.error("Error fetching post office details: ", error);
      }
    };

    fetchData();
  }, [userID, reloadTable]);
  const handleDeleteClick = async (officeID) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post office?"
    );
    if (confirmDelete) {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + "/admin/ensure-post-office-empty",
          { officeID: officeID }
        );
        if (response.status === 201) {
          try {
            const otherResponse = await axios.post(
              process.env.REACT_APP_BASE_URL + "/admin/delete-post-office",
              { officeID: officeID }
            );
            // Success message or any other action after successful deletion
            alert("Post office successfully deleted.");
            setReloadTable(!reloadTable);
          } catch (error) {
            // Handle error
            console.error("Error deleting post office: ", error);
          }
        }
      } catch (error) {
        if (error.response.status === 409) {
          window.confirm(
            "You cannot delete a post office where parcels are currently stored."
          );
        } else {
          console.error("Error ensuring post office is empty: ", error);
        }
      }
    }
  };

  const handleEditClick = async (Index) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_BASE_URL + "/admin/get-post-office-details",
        { userID: userID }
      );
      setSelectedPostOffice(response.data);
      setEditOfficeIndex(Index);
      setIsPostOfficeModalOpen(true);
    } catch (error) {
      console.error("Error fetching post office details: ", error);
    }
  };

  return (
    <section className="ManagePostOfficeForm">
      <form style={{ width: "80%" }} className="postOfficeDetails">
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
                Office Name
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Postmaster Name
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Post Office Address
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Edit
              </th>
              <th style={{ border: "1px solid black", padding: "12px" }}>
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {postOffices &&
              postOffices.length > 0 &&
              postOffices.map((office, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid black", padding: "12px" }}>
                    {office.OfficeName}
                  </td>
                  <td style={{ border: "1px solid black", padding: "12px" }}>
                    {office.PostmasterName}
                  </td>
                  <td style={{ border: "1px solid black", padding: "12px" }}>
                    {`${office.Address.Street}, ${office.Address.City}, ${office.Address.State}, ${office.Address.Zip}`}
                  </td>
                  <td style={{ border: "1px solid black", padding: "12px" }}>
                    <div
                      className="editLink"
                      onClick={() => handleEditClick(index)}
                    >
                      <PiPencilBold />
                    </div>
                  </td>
                  <td style={{ border: "1px solid black", padding: "12px" }}>
                    <div
                      className="deleteLink"
                      onClick={() => handleDeleteClick(index)}
                    >
                      <RiDeleteBin5Line />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </form>
      <PostOfficeModal
        isOpen={isPostOfficeModalOpen}
        onClose={() => {
          setIsPostOfficeModalOpen(false);
          setReloadTable(!reloadTable);
        }}
        postOffices={selectedPostOffice}
        officeIndex={editOfficeIndex}
      />
    </section>
  );
};

export default ManageOffice;
