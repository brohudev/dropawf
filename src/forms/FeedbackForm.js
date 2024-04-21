import React, { useState } from 'react'
import { useCookies } from "react-cookie";
import axios from 'axios';

const FeedbackForm = () => {
  const [feedbackInfo, setFeedbackInfo] = useState({});

  const [cookies] = useCookies(['userID']);

  const feedbackChange = (event) => {
      const { name, value } = event.target;
      setFeedbackInfo(prevState => ({
          ...prevState,
          [name]: value
      }));
  };

  const [showSuccessForm, setShowSuccessForm] = useState(false);

  const handleContinueToSuccess = async (event) => {
      event.preventDefault();
      setShowSuccessForm(true);

      const feedbackWithUserID = {
          ...feedbackInfo,
          userID: cookies.userID 
      };

      try {
          await axios.post(process.env.REACT_APP_BASE_URL + '/customer/post-customer-review', feedbackWithUserID);
      } catch (error) {
          console.error('Error submitting feedback: ', error);
      }
  };

  const complaints = ["Customer Service", "Shipping Delay", "Product Damage"]
  return (
    <section className="FeedbackForm">
      <div style={{display: 'flex', justifyContent: 'center' }}>
        {!showSuccessForm ? (
          <form className='form' onSubmit={handleContinueToSuccess}>
              <h2>Feedback</h2>
              <div className='item'>
                <label htmlFor="trackingnumber" className='required'>Tracking Number</label>
                <input
                  type="text"
                  placeholder="Tracking Number"
                  name="tracking"
                  id="tracking"
                  pattern=".{36}"
                  onChange={feedbackChange}
                  value={feedbackInfo.tracking || ''}
                  required
                />
              </div>
              <div className='item'>
                <label htmlFor="complaint" className='required'> Complaint</label>
                <select
                  required
                  name="complaint"
                  id="complaint"
                  onChange={feedbackChange}
                  value={feedbackInfo.complaint || ''}
                > 
                  <option value=""></option>
                  {complaints.map(complaints => (
                    <option key={complaints} value={complaints}>{complaints}</option>
                  ))}
                </select>
              </div>
              <button type="submit">Submit</button>
          </form>
        ) : (
          <div className='form'>
            <h3>Thank you for your feedback!</h3>
            <p>Your feedback has been submitted successfully!</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default FeedbackForm