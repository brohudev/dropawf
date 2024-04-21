import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserIDCookie } from '../cookies';
import '../css/Register.css';

/**
 * PurchaseProduct component renders a multi-step purchasing form.
 * It collects personal info and payment info.
 * The form progresses through different steps and finally submits the purchase details.
 */
const PurchaseProduct = () => {
  const initialPersonalFormData = {
    firstname: '',
    lastname: '',
    email: ''
  };

  const initialProductFormData = {
    envelope: 0,
    stamp: 0,
    box: 0
  };

  const initialPaymentFormData = {
    paymentfirstname: '',
    paymentlastname: '',
    paymentcard: '',
    expmonth: '',
    expyear: '',
    paymentcvv: ''
  };

  const { cookies } = useUserIDCookie();
  const [inventoryList, setInventoryList] = useState([]);
  const [personalFormData, setPersonalFormData] = useState(initialPersonalFormData);
  const [productFormData, setProductFormData] = useState(initialProductFormData);
  const [paymentFormData, setPaymentFormData] = useState(initialPaymentFormData);
  const [message, setMessage] = useState({ class: '', text: '' });
  const [step, setStep] = useState(1); // Step 1: Personal info, Step 2: Product selection, Step 3: Payment info, Step 4: Confirmation, Step 5: Success
  const [totalCost, setTotalCost] = useState(0); // State to store total cost


  const expirationMonths = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const expirationYears = ["2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034"];

  // Fetch product inventory list from the server when the component mounts
  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    try {
      const response = await axios.get(process.env.REACT_APP_BASE_URL + "/office-clerk/get-product-list");
      const fetchedInventoryList = response.data.inventoryList || [];
      setInventoryList(fetchedInventoryList);

      // Initialize formData based on inventoryList
      const initialProductFormData = {};
      fetchedInventoryList.forEach((item) => {
        const key = item.ProductName;
        initialProductFormData[key] = 0; // Set initial value to 0 (or any default value)
      });
      setProductFormData(initialProductFormData);
    } catch (error) {
      console.error(error);
    }
  }

  const handleChange = (event, formDataSetter) => {
    const { id, value } = event.target;
    formDataSetter((prevFormData) => ({
      ...prevFormData,
      [id]: value
    }));
  };

  const handleContinueToProductSelection = (event) => {
    event.preventDefault();
    setStep(2); 
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1); 
    } else if (step === 3) {
      setStep(2); 
    } else if (step === 4) {
      setMessage({ class: ']', text: '' });
      setStep(3);
    }
  };

  const handleContinueToPayment = (event) => {
    event.preventDefault();
    setTotalCost(calculateOrderCost());
    setStep(3); 
  };

  const handleConfirmOrder = (event) => {
    event.preventDefault();
    setStep(4); 
    const cleanedValue = paymentFormData.paymentcard.replace(/\D/g, '');
    setPaymentFormData(prevState => ({
        ...prevState,
        paymentcard: cleanedValue
    }));
  };

  const handlePurchase = async (event) => {
    event.preventDefault();

    const payload = {
      userID: cookies.userID,
      personalInfo: personalFormData,
      items: productFormData,
      totalCost: parseFloat(totalCost),
      paymentInfo: paymentFormData
    };

    try {
      await axios.post(process.env.REACT_APP_BASE_URL + '/office-clerk/post-place-order', payload);
      setMessage({ class: 'success', text: 'Purchase successful!' });
      setStep(5); // Proceed to success screen after successful purchase
    } catch (error) {
      const status = error.response.status;
      if (status === 409) {
        setMessage({ class: 'failed', text: 'Failed to purchase. Insufficient inventory, please wait for restock.' });
      } else {
        setMessage({ class: 'failed', text: 'Failed to purchase. Please try again later.' });
      }  
            
      setStep(4);
    }
  };

  const calculateOrderCost = () => {
    let totalCost = 0;
    Object.keys(productFormData).forEach((productName) => {
      const quantity = productFormData[productName];
      const productInfo = inventoryList.find((item) => item.ProductName === productName);
      if (productInfo) {
        totalCost += quantity * productInfo.Price;
      }
    });
    return totalCost.toFixed(2);
  };

  return (
    <section>
      {step === 1 && (
        <form className="form" onSubmit={handleContinueToProductSelection}>
          <h1>Personal Information</h1>
          <div className="item">
            <label htmlFor="firstname" className='required'>First Name</label>
            <input
              type="text"
              id="firstname"
              placeholder='e.g. John'
              onChange={(e) => handleChange(e, setPersonalFormData)}
              value={personalFormData.firstname}
              required
            />
          </div>
          <div className="item">
            <label htmlFor="lastname" className='required'>Last Name</label>
            <input
              type="text"
              id="lastname"
              placeholder='e.g. Doe'
              onChange={(e) => handleChange(e, setPersonalFormData)}
              value={personalFormData.lastname}
              required
            />
          </div>
          <div className="item">
            <label htmlFor="email" className='required'>Email Address</label>
            <input
              type="text"
              id="email"
              placeholder='e.g. johndoe@example.com'
              onChange={(e) => handleChange(e, setPersonalFormData)}
              value={personalFormData.email}
              required
            />
          </div>
          <button type="submit">Next: Select Items</button>
        </form>
      )}

      {step === 2 && (
        <form className="form" onSubmit={handleContinueToPayment}>
          <h1>Select Items</h1>
          {inventoryList.map((item) => (
          <div key={item.ProductName} className="item">
            <label htmlFor={item.ProductName}>{item.ProductName}: ${item.Price}</label>
            <input
              type="number"
              id={item.ProductName}
              onChange={(e) => handleChange(e, setProductFormData)}
              value={productFormData[item.ProductName]}
              min='0'
            />
          </div>
        ))}
          <p>Total Cost: ${calculateOrderCost()}</p>
          <button type="submit">Next: Proceed to Payment</button>
          <button onClick={handleBack}>Back</button>
        </form>
      )}

      {step === 3 && (
        <form className="form" onSubmit={handleConfirmOrder}>
          <h1>Payment Information</h1>
          <div className="item">
             <label htmlFor="paymentfirstname" className='required'>First Name</label>
             <input
               type="text"
               id="paymentfirstname"
               placeholder='e.g. John'
               onChange={(e) => handleChange(e, setPaymentFormData)}
               value={paymentFormData.paymentfirstname}
               required
             />
           </div>
           <div className="item">
             <label htmlFor="paymentlastname" className='required'>Last Name</label>
             <input
               type="text"
               id="paymentlastname"
               placeholder='e.g. Doe'
               onChange={(e) => handleChange(e, setPaymentFormData)}
               value={paymentFormData.paymentlastname}
               required
             />
           </div>
           <div className="item">
             <label htmlFor="paymentcard" className='required'>Card Number</label>
             <input
               type="text"
               id="paymentcard"
               placeholder='#### #### #### ####'
               onChange={(e) => handleChange(e, setPaymentFormData)}
               value={paymentFormData.paymentcard}
               required
             />
           </div>
           <div className="item">
             <label htmlFor="expmonth" className='required'>Expiration Month</label>
             <select
               style={{ padding: '1em' }}
               id="expmonth"
               onChange={(e) => handleChange(e, setPaymentFormData)}
               value={paymentFormData.expmonth || ''}
               required
             >
               <option value="">Expiration Months</option>
                 {expirationMonths.map((expirationMonths) => (
               <option key={expirationMonths} value={expirationMonths}>{expirationMonths}</option>))}
             </select>
           </div>
           <div className="item">
             <label htmlFor="expyear" className='required'>Expiration Year</label>
             <select
               style={{ padding: '1em' }}
               id="expyear"
               onChange={(e) => handleChange(e, setPaymentFormData)}
               value={paymentFormData.expyear || ''}
               required
             >
               <option value="">Expiration Year</option>
               {expirationYears.map((expirationYears) => (
                 <option key={expirationYears} value={expirationYears}>
                   {expirationYears}
                 </option>
               ))}
             </select>
           </div>
           <div className="item">
             <label htmlFor="paymentcvv" className='required'>CVV</label>
             <input
               type="text"
               id="paymentcvv"
               onChange={(e) => handleChange(e, setPaymentFormData)}
               value={paymentFormData.paymentcvv}
               required
             />
           </div>          <button type="submit">Confirm Order</button>
          <button onClick={handleBack}>Back</button>
        </form>
      )}

      {step === 4 && (
        <div className="confirmation" style={{ textAlign: "center" }}>
          <h1>Confirm Order</h1>
          <p>Total Cost: ${totalCost}</p>

          <h2>Payment Information</h2>
          <p>First Name: {paymentFormData.paymentfirstname}</p>
          <p>Last Name: {paymentFormData.paymentlastname}</p>
          <p>Card Number: {paymentFormData.paymentcard}</p>
          <p>Expiration Month: {paymentFormData.expmonth}</p>
          <p>Expiration Year: {paymentFormData.expyear}</p>
          <p>CVV: {paymentFormData.paymentcvv}</p>

          {message.class === 'failed' && (
            <p className="error-message" style={{display: "inline-block"}}>{message.text}</p>
          )}
          <div>
            <button onClick={handleBack}>Back</button>
            <button onClick={handlePurchase}>Confirm Purchase</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="success-screen">
          <h1>Success!</h1>
          <p>Your purchase was successful.</p>
        </div>
      )}
    </section>
  );
};

export default PurchaseProduct;
