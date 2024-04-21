import React from 'react'
import { useState } from 'react'
import axios from 'axios'

const UpdatePayment = () => {
	const initialFormData = {
    name: "",
		cardNumber: "",
		expDate: "",
		cvv: ""
  }
  const initialMessageData = {
		class: "",
		text: ""
	}

  const [formData, setFormData] = useState(initialFormData)
  const [message, setMessage] = useState(initialMessageData)

  function handleChange(event) {
    const { id, value } = event.target
		setFormData(oldFormData => ({
			...oldFormData,
			[id]: value
		}))
  }

  async function submitForm(event) {
    await postSubmission()
  }

  async function postSubmission() {
		const payload = {
			...formData
		}

		try {
			await axios.post(process.env.REACT_APP_BASE_URL + "/customer/post-customer-payment-info", payload)
			setMessage({
				class: 'success',
				text: 'Payment method added.'
			})
			setFormData(initialFormData)
		} catch(error) {
			setMessage({
				class: 'failed',
				text: 'Failed to add payment method. Please try again.'
			})
		}
	}

  return (
    <section>
      <form className='form' onSubmit={submitForm}>
        <h1>Payment Information</h1>
        <div className="item">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            onChange={handleChange}
            value={formData.name}
          />
        </div>
        <div className="item">
          <label htmlFor="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            onChange={handleChange}
            value={formData.cardNumber}
          />
        </div>
        <div className="item">
          <label htmlFor="expDate">Expiration Date</label>
          <input
            type="date"
            id="expDate"
            onChange={handleChange}
            value={formData.expDate}
          />
        </div>
				<div className="item">
          <label htmlFor="cvv">CVV</label>
          <input
            type="text"
            id="cvv"
            onChange={handleChange}
            value={formData.cvv}
          />
        </div>
        <button>Submit</button>
        {message.class.length > 0 &&
          <div className={`message ${message.class}`}>
            <div>{message.text}</div>
          </div>
        }
      </form>
    </section>
  )
}

export default UpdatePayment