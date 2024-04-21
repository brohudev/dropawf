import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserIDCookie } from '../cookies';

const AddInventory = () => {
  const initialMessageData = {
    class: '',
    text: ''
  };

  const { cookies } = useUserIDCookie();
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(initialMessageData);
  const [inventoryList, setInventoryList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Track if form has been submitted

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    try {
      const response = await axios.get(process.env.REACT_APP_BASE_URL + "/post-master/get-product-list");
      const fetchedInventoryList = response.data.inventoryList || [];
      setInventoryList(fetchedInventoryList);

      // Initialize formData based on inventoryList
      const initialFormData = {};
      fetchedInventoryList.forEach((item) => {
        const key = item.ProductName;
        initialFormData[key] = 0; // Set initial value to 0 (or any default value)
      });
      setFormData(initialFormData);
    } catch (error) {
    }
  }

  function handleChange(event) {
    const { id, value } = event.target;

    const intVal = value.trim() !== '' && !isNaN(value) ? parseInt(value) : 0;


    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: intVal
    }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = { ...formData, userID: cookies.userID };

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/post-master/add-inventory`, payload);
      setMessage({
        class: 'success',
        text: 'Inventory ordered.'
      });
      setIsSubmitted(true); // Set submitted state to true
      resetForm();
    } catch (error) {
      setMessage({
        class: 'failed',
        text: 'Failed to order inventory. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    const resetFormData = {};
    Object.keys(formData).forEach((key) => {
      resetFormData[key] = 0; // Reset each form field value to 0
    });
    setFormData(resetFormData);
  }

  function handleAnotherOrder() {
    setIsSubmitted(false); // Reset submitted state to false
    setMessage(initialMessageData); // Clear any message
  }

  return (
    <section>
      <form className="form" onSubmit={submitForm}>
        <h1>Order Inventory</h1>
        {inventoryList.map((item) => (
          <div key={item.ProductName} className="item">
            <label htmlFor={item.ProductName}>{item.ProductName}</label>
            <input
              type="number"
              id={item.ProductName}
              onChange={handleChange}
              value={formData[item.ProductName]}
              disabled={isSubmitting || isSubmitted}
              min='0'
            />
          </div>
        ))}
        {!isSubmitting && !isSubmitted && (
          <button type="submit">Submit Order</button>
        )}
        {isSubmitted && (
          <button type="button" onClick={handleAnotherOrder}>Submit Another Order</button>
        )}
        {message.class.length > 0 && (
          <div className={`message ${message.class}`}>
            <div>{message.text}</div>
          </div>
        )}
      </form>
      {isSubmitting && (
        <div className="message">
          <div>Submitting order...</div>
        </div>
      )}
    </section>
  );
};

export default AddInventory;
