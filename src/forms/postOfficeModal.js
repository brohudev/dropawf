import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root') // replace '#root' with the id of your app element

function PostOfficeModal({ isOpen, onClose, postOffices, officeIndex }) {
     const [postOfficeName, setPostOfficeName] = useState('');
     const [postmasterName, setPostmasterName] = useState('');
     const [street, setStreet] = useState('');
     const [city, setCity] = useState('');
     const [state, setState] = useState('');
     const [zipCode, setZipCode] = useState('');
     const states = [
           "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
           "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
           "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
           "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
      ];

     const handleSubmit = (e) => {
          e.preventDefault();

          const [firstName, lastName] = postmasterName.split(' ');

          const data = {
               postmasterName: {
                    firstName,
                    lastName
               },
               OfficeID: postOffices[officeIndex].OfficeID,
               address: {
                    City: city,
                    State: state,
                    ZipCode: zipCode,
                    Street: street
               },
               OfficeName: postOfficeName
          };

          axios.post(process.env.REACT_APP_BASE_URL+`/admin/update-post-office`, data)
          .then(response => {
               if (response.status === 200) {
               alert('Post office details updated successfully');
               }
          })
          .catch(error => {
               console.error('Error updating post office details:', error);
          });
     };

     useEffect(() => {
          if (postOffices && postOffices[officeIndex]) {
               const { Address, PostmasterName, OfficeName } = postOffices[officeIndex];
               setStreet(Address.Street);
               setCity(Address.City);
               setState(Address.State);
               setZipCode(Address.Zip);
               setPostmasterName(PostmasterName);
               setPostOfficeName(OfficeName);
          }
     }, [postOffices, officeIndex]);

     return (
          <div>
               <Modal isOpen={isOpen} onRequestClose={onClose} className="form" 
                    style={{
                         overlay: {
                              backgroundColor: 'rgba(0, 0, 0, 0.7)', // Change the background color to be slightly darker and transparent
                              backdropFilter: 'blur(5px)', // Add a blur effect to the background
                              transition: 'opacity 0.3s', // Add a transition effect for opacity
                         },
                         content: {
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              right: 'auto',
                              bottom: 'auto',
                              width: '60%', // Set the width to 60% of the screen
                              transform: 'translate(-50%, -50%)',
                              opacity: isOpen ? 1 : 0, // Set the initial opacity based on the isOpen prop
                         },
                    }} >
                    <button className="close-button" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', width: "70px", height: "10px", "border-radius": "10px", margin: "10px","font-weight": "bold", background : "red", 	display: "flex","justify-content": "center",	"align-items": "center","text-align": "center"}}>close</button>

                    <form className="form" onSubmit={handleSubmit}>
                         <h1>Update Post Office Details</h1>
                         <div className="item">
                              <label htmlFor="OfficeName" className="required">
                                   Office Name
                              </label>
                              <input
                                   type="text"
                                   id="OfficeName"
                                   required
                                   onChange={(e) => setPostOfficeName(e.target.value)}
                                   value={postOfficeName}
                              />
                         </div>
                         <div className="item">
                              <label htmlFor="PostMasterName" className="required">
                                   Post Master Name
                              </label>
                              <input
                                   type="text"
                                   id="PostMasterName"
                                   required
                                   onChange={(e) => setPostmasterName(e.target.value)}
                                   value={postmasterName}
                              />
                         </div>
                         <div className="item">
                              <label htmlFor="Street" className="required">
                                   Street
                              </label>
                              <input
                                   type="text"
                                   id="Street"
                                   required
                                   onChange={(e) => setStreet(e.target.value)}
                                   value={street}
                              />
                         </div>
                         <div className="item">
                              <label htmlFor="City" className="required">
                                   City
                              </label>
                              <input
                                   type="text"
                                   id="City"
                                   required
                                   onChange={(e) => setCity(e.target.value)}
                                   value={city}
                              />
                         </div>
                         <div className="item">
                              <label htmlFor="State" className="required">
                                   State
                              </label>
                              <select
                                   required
                                   id="State"
                                   onChange={(e) => setState(e.target.value)}
                                   value={state}
                                   style={{ padding: '1em' }}
                              >
                                   <option value="">State</option>
                                   {states.map((state) => (
                                        <option key={state} value={state}>
                                             {state}
                                        </option>
                                   ))}
                              </select>
                         </div>
                         <div className="item">
                              <label htmlFor="ZipCode" className="required">
                                   ZIP Code
                              </label>
                              <input
                                   type="text"
                                   id="ZipCode"
                                   required
                                   onChange={(e) => setZipCode(e.target.value)}
                                   value={zipCode}
                              />
                         </div>
                         <button type="submit">Update</button>
                    </form>
               </Modal>
          </div>
     );
}

export default PostOfficeModal;