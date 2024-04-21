import React, { useState } from 'react';
import axios from 'axios';
import { useUserIDCookie } from '../cookies';

const AddEmployee = () => {
  const initialFormData = {
    fname: "",
    minit: "",
    lname: "",
    title: "",
    ssn: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    hiredDate: "",
    phone: "",
    email: "",
    salary: "",
    username: "",
    password: ""
  };

  const initialMessageData = {
    class: '',
    text: ''
  };

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
    "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const { cookies } = useUserIDCookie();
  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState(initialMessageData);
  const [currentPage, setCurrentPage] = useState(1);


  function handleChange(event) {
    const { id, value } = event.target;
    setFormData(oldFormData => ({
      ...oldFormData,
      [id]: value
    }));
  }

  async function submitForm(event) {
    event.preventDefault();
    if (currentPage === 1) {
      setCurrentPage(2); // Proceed to next page (username and password)
    } else {
      await postSubmission(); // Submit form when on the final page
    }
  }

  async function postSubmission() {
    const payload = {
      ...formData,
      title: mapJobTitle(formData.title),
      userID: cookies.userID
    };

    try {
      const result = await axios.post(process.env.REACT_APP_BASE_URL + "/post-master/add-employee", payload);
      setMessage({
        class: 'success',
        text: 'Employee added.'
      });
      setFormData(initialFormData);
      setCurrentPage(3); // Reset to first page after successful submission
    } catch(error) {
      if (error.response && error.response.status === 409) {
        setMessage({
          class: 'failed',
          text: 'Failed to add employee. Duplicate information.'
        });
      } else {
        setMessage({
          class: 'failed',
          text: 'Failed to add employee. Please try again.'
        });
      }
    }
  }

  function handleAddAnother() {
    setMessage(initialMessageData); 
    setCurrentPage(1); 
  }


  function mapJobTitle(title) {
    if (title === 'Office Clerk') {
      return 'officeclerk';
    } else if (title === 'Mail Courier') {
      return 'mailcourier';
    }
    return '';
  }

  return (
    <section>
      {currentPage === 1 && (
      <form className='form' onSubmit={submitForm}>
        <h1>Add New Employee</h1>
        <div className="item">
              <label htmlFor="fname" className='required'>First Name</label>
              <input
                type="text"
                id="fname"
                required
                placeholder='e.g. John'
                onChange={handleChange}
                value={formData.fname}
              />
            </div>
            <div className="item">
              <label htmlFor="minit">Middle Initial</label>
              <input
                type="text"
                id="minit"
                maxLength="1"
                placeholder='e.g. A'
                onChange={handleChange}
                value={formData.minit}
              />
            </div>
            <div className="item">
              <label htmlFor="lname" className='required'>Last Name</label>
              <input
                type="text"
                id="lname"
                placeholder='e.g. Doe'
                required
                onChange={handleChange}
                value={formData.lname}
              />
            </div>
            <div className="item">
              <label htmlFor="title" className='required'>Job Title</label>
              <select
                id="title"
                required
                onChange={handleChange}
                value={formData.title}
                style={{ padding: '1em' }}
              >
                <option value="">Select Job Title</option>
                <option value="Office Clerk">Office Clerk</option>
                <option value="Mail Courier">Mail Courier</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="ssn" className='required'>SSN</label>
              <input
                type="text"
                id="ssn"
                required
                placeholder='###-##-####'
                pattern="\d{3}-\d{2}-\d{4}$"
                onChange={handleChange}
                value={formData.ssn}
              />
            </div>
            <div className="item">
              <label htmlFor="address" className='required'>Street Address</label>
              <input
                type="text"
                placeholder='e.g. 123 Main Street'
                id="address"
                required
                onChange={handleChange}
                value={formData.address}
              />
            </div>
            <div className="item">
              <label htmlFor="city" className='required'>City</label>
              <input
                type="text"
                id="city"
                required
                placeholder='e.g. Anytown'
                onChange={handleChange}
                value={formData.city}
              />
            </div>
            <div className="item">
        <label htmlFor="state" className='required'> State </label>
        <select
          required
          id="state"
          onChange={handleChange}
          value={formData.state|| ''}
          style={{ padding: '1em' }}
        > 
          <option value=""> State </option>
          {states.map(state => (
          <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
            <div className="item">
              <label htmlFor="zip" className='required'>ZIP</label>
              <input
                type="text"
                id="zip"
                required
                placeholder='e.g. 12345'
                onChange={handleChange}
                value={formData.zip}
              />
            </div>
            <div className="item">
              <label htmlFor="hiredDate" className='required'>Hired Date</label>
              <input
                type="date"
                id="hiredDate"
                required
                onChange={handleChange}
                value={formData.hiredDate}
              />
            </div>
            <div className="item">
              <label htmlFor="phone" className='required'>Phone Number</label>
              <input
                type="text"
                id="phone"
                placeholder='(###) ###-####'
                required
                pattern = "\(\d{3}\) \d{3}-\d{4}"
                onChange={handleChange}
                value={formData.phone}
              />
            </div>
            <div className="item">
              <label htmlFor="email" className='required'>Email Address</label>
              <input
                type="text"
                id="email"
                placeholder='e.g. johndoe@example.com'
                required
                onChange={handleChange}
                value={formData.email}
              />
            </div>
            <div className="item">
              <label htmlFor="salary" className='required'>Salary</label>
              <input
                type="number"
                id="salary"
                required
                placeholder='e.g. 40000'
                onChange={handleChange}
                value={formData.salary}
              />
            </div>
            <button type="submit">Next</button>
      </form>
      )}
        {currentPage === 2 && (
          <form className='form' onSubmit={submitForm}>
            <h1>Add New Employee</h1>
            <div className="item">
              <label htmlFor="username" className='required'>Username</label>
              <input
                type="text"
                id="username"
                required
                onChange={handleChange}
                value={formData.username}
              />
            </div>
            <div className="item">
              <label htmlFor="password" className='required'>Password</label>
              <input
                type="password"
                id="password"
                required
                onChange={handleChange}
                value={formData.password}
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        )}
        {currentPage === 3 && (
          <div className="form" >
            <h2>Employee Added Successfully!</h2>
            <button onClick={handleAddAnother}>Add Another Employee</button>
          </div>
        )}
        {message.class.length > 0 && (
          <div className={`message ${message.class}`}>
            <div>{message.text}</div>
          </div>
        )}
      {/* Display navigation between pages */}
      {currentPage === 2 && (
        <button onClick={() => setCurrentPage(1)}>Back</button>
      )}
    </section>
  );
};

export default AddEmployee;
