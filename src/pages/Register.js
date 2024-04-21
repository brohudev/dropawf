import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { useLoginCookies } from "../cookies";
import '../css/Register.css';

/**
 * Register Component
 * 
 * This component renders a registration form allowing users to sign up.
 * It handles form submission, user input validation, and registration requests.
 */
const Register = () => {
	const initialFormData = {
    fname: "",
		minit: "",
		lname: "",
		address: "",
		city: "",
		state: "",
		zip: "",
		phone: "",
		email: "",
		username: "",
		password: ""
  }
  const initialMessageData = {
		class: '',
		text: ''
	}

  const initialLoginData = {
    username: "",
    password: ""
  }

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
    "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  const { setCookie } = useLoginCookies();
	const [formData, setFormData] = useState(initialFormData)
  const [message, setMessage] = useState(initialMessageData)
  const [loginData, setLoginData] = useState(initialLoginData)
  
  const navigate = useNavigate();

	function handleChange(event) {
    const { id, value } = event.target
		setFormData(oldFormData => ({
			...oldFormData,
			[id]: value
		}))
  }

  async function submitForm(event) {
    event.preventDefault();
    
    // Call postSubmission function to handle form submission
    await postSubmission(); 

    // Check if there is no error message
    if (message.class !== 'failed') {
      const { username, password } = formData; 
      setLoginData({ username, password });
    }
  }

  useEffect(() => {
    if (loginData.username && loginData.password && message.class !== 'failed') {
      login();
    }
  }, [loginData]);
  
  async function postSubmission() {
    const payload = {
        ...formData
    };
    
    try {
      await axios.post(process.env.REACT_APP_BASE_URL + '/user/register', payload);
      setFormData(initialFormData);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setMessage({
            class: 'failed',
            text: 'That username is already taken. Please select a unique username!'
        });
      } else {
        setMessage({
            class: 'failed',
            text: 'Failed to register. Please try again.'
        });
      }
    }
  }

async function login () {
  await fetch(process.env.REACT_APP_BASE_URL + '/user/validate-login', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data[1].length > 0) {
        setCookie("userID", data[1][0].userID, { path: "/" });
        setCookie("userRole", data[1][0].role, { path: "/" });
        setCookie("userFirstName", data[1][0].FirstName, { path: "/" });

        navigate("/dashboard");
      } 
    });
};



	return (
		<main className='Register'>
			<form className='form' onSubmit={submitForm}>
        <h1>Register</h1>
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
						required
            placeholder='e.g. Doe'
            onChange={handleChange}
            value={formData.lname}
          />
        </div>
				<div className="item">
          <label htmlFor="address" className='required'> Street Address</label>
          <input
            type="text"
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
            placeholder='e.g. 123 Main Street'
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
            pattern='\d{4,7}'
            onChange={handleChange}
            value={formData.zip}
          />
        </div>
				<div className="item">
          <label htmlFor="phone" className='required'>Phone #</label>
          <input
            type="text"
            id="phone"
						required
            placeholder='(###) ###-####'
            pattern="\(\d{3}\) \d{3}-\d{4}"
            onChange={handleChange}
            value={formData.phone}
          />
        </div>
				<div className="item">
          <label htmlFor="email" className='required'>Email</label>
          <input
            type="text"
            id="email"
						required
            placeholder='e.g. johndoe@email.com'
            onChange={handleChange}
            value={formData.email}
          />
        </div>
        <div className="item">
  <label htmlFor="username" className='required'>Username</label>
  <input
    type="text"
    id="username"
    required
    onChange={handleChange}
    value={formData.username}
  />
  {message.class === 'failed' && (
    <div className="error-message">
      {message.text}
    </div>
  )}
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
				<button>Submit</button>
      </form>
		</main>
	)
}

export default Register