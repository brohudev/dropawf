import React, { useState, useEffect } from 'react';
import { useUserIDCookie } from '../cookies';
import axios from 'axios';
import '../css/Shipping.css';

/**
 * ShippingForm component renders a multi-step shipping form.
 * It collects sender info, recipient info, packaging details, and payment info.
 * The form progresses through different steps and finally submits the shipping details.
 */

const ShippingForm = () => {
    const { cookies } = useUserIDCookie();

    // State variables to manage form data and form step visibility    
    const [senderShippingInfo, setSenderShippingInfo] = useState({});
    const [recipientShippingInfo, setRecipientShippingInfo] = useState({});
    const [packagingInfo, setPackagingInfo] = useState({});
    const [paymentInfo, setPaymentInfo] = useState({});
    const [customerPayment, setCustomerPayment] = useState([]);
    const [shippingCost, setShippingCost] = useState(0); 
    

    useEffect(() => {
        if (customerPayment.length > 0) {
            setPaymentInfo(customerPayment[0]); 
        }
    }, [customerPayment]);
    

    const senderChange = (event) => {
        try{
            const { name, value } = event.target;
            setSenderShippingInfo(prevState => ({
                ...prevState,
                [name]: value
            }));
        } catch (error) {
        }
    };

    const recipientChange = (event) => {
        const { name, value } = event.target;
        setRecipientShippingInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const packageChange = (event) => {
        const { name, value } = event.target;
        setPackagingInfo(prevState => ({
            ...prevState,
            [name] : value
        }));
    }

    // Event handler to handle packaging type selection and show dimensions if packing type is 'Box'
    const packageSelect = (event) => {
        const { name, value } = event.target;
        setPackagingInfo(prevState => ({
            ...prevState,
            [name] : value
        }));

        if (value === 'Box') {
            setShowDimensionsFields(true);
        } else {
            setShowDimensionsFields(false);
        }
    }

    const paymentChange = (event) => {
        const { name, value } = event.target;
        setPaymentInfo(prevState => ({
            ...prevState,
            [name] : value
        }));
    }

    //handles rendering the different steps in the shipping process
    const [showReceiverForm, setShowReceiverForm] = useState(false);
    const [showPackageForm, setShowPackageForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showConfirmForm, setShowConfirmForm] = useState(false);
    const [showSuccessForm, setShowSuccessForm] = useState(false);
    const [showDimensionsFields, setShowDimensionsFields] = useState(false);

    const handleContinueToReciever = async (event) => {
        event.preventDefault();
        setShowReceiverForm(true);
        try {
        const response = await axios.post(
            process.env.REACT_APP_BASE_URL + "/office-clerk/get-customer-payment",
            { Email: senderShippingInfo.senderemail }
          );
          const data = response.data;
          console.log("customer payment: ", data);
          setCustomerPayment(data);
        } catch(error) {
            console.error('Error getting payment details:', error);
        }

    };

    const handleContinueToPackage = (event) => {
        event.preventDefault();
        setShowPackageForm(true);

    }

    const calculateShippingCost = () => {
        const packagingType = packagingInfo.packagingtype;
        const weight = parseInt(packagingInfo.weight);

        let cost = 0;

        if (packagingType === 'Letter') {
            cost = 8;
        } else if (packagingType === 'Box') {
            if (weight >= 1 && weight <= 5) {
                cost = 10;
            } else if (weight > 5 && weight <= 10) {
                cost = 12;
            } else if (weight > 10 && weight <= 20) {
                cost = 16;
            } else {
                cost = 25;
            }
        }

        return cost;
    };

    
    const handleContinueToPayment = (event) => {
        event.preventDefault();
        const cost = calculateShippingCost();
        setShippingCost(cost);
        setShowPaymentForm(true);
    }

    const handleContinueToConfirm = (event) => {
        event.preventDefault();
        setShowConfirmForm(true);
        const cleanedValue = paymentInfo.paymentcard.replace(/\D/g, '');
            setPaymentInfo(prevState => ({
                ...prevState,
                paymentcard: cleanedValue
            }));
    }

    const handleContinueToSuccess = async (event) => {
        event.preventDefault();
        setShowSuccessForm(true);

        const combinedShippingInfo = {
            senderShippingInfo,
            recipientShippingInfo,
            packagingInfo,
            paymentInfo,
            shippingCost,
            userID: cookies.userID
        };
        try {
            await fetch(process.env.REACT_APP_BASE_URL + '/office-clerk/ship-package', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(combinedShippingInfo)
            })
        } catch (error) {
            console.error(error);
        }
    }

    const states = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
        "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
        "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
        "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
      ];
      
    const packagingType = ["Letter", "Box"];
    const expirationMonths = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",]
    const expirationYears = ["2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034",]

    return (
        <section> 
            <div className="ShippingForm" style={{display: 'flex', justifyContent: 'center' }}>
                {!showReceiverForm ? (
                    <form className="form" onSubmit={handleContinueToReciever}>
                        <p style={{display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}> Hello! Where are you shipping from? </p>
                        <p style={{display: 'flex', justifyContent: 'right', fontStyle: 'italic'}}> *Required Field </p>
                            <div className="item">
                            <label htmlFor="fname" className='required'> First Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John"
                                    maxLength="100"
                                    required
                                    name="senderfname"
                                    onChange={senderChange}
                                    value={senderShippingInfo.senderfname || ''}
                                />
                            </div>
                            <div className="item">
                            <label htmlFor="lname" className='required'> Last Name</label>
                                <input
                                    type="text"
                                    maxLength="100"
                                    placeholder="e.g. Doe"
                                    required
                                    name="senderlname"
                                    onChange={senderChange}
                                    value={senderShippingInfo.senderlname || ''}
                                />
                            </div>
                            <div className="item">
                            <label htmlFor="email" className='required'> Email Address</label>
                                <input
                                    type="text"
                                    maxLength="500"
                                    placeholder="e.g. johndoe@email.com"
                                    required
                                    name="senderemail"
                                    onChange={senderChange}
                                    value={senderShippingInfo.senderemail|| ''}
                                />
                            </div>
                            <div className="item">
                            <label htmlFor="streetaddress" className='required'> Street Address </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 123 Main Street"
                                    maxLength="100"
                                    required
                                    name="senderstreetaddress"
                                    onChange={senderChange}
                                    value={senderShippingInfo.senderstreetaddress || ''}
                                />
                            </div>
                            <div className="item">
                            <label htmlFor="city" className='required'> City </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Anytown"
                                    maxLength="50"
                                    required
                                    name="sendercity"
                                    onChange={senderChange}
                                    value={senderShippingInfo.sendercity || ''}
                                />
                            </div>
                            <div className="item">
                            <label htmlFor="state" className='required'> State </label>
                                <select
                                    required
                                    name="senderstate"
                                    onChange={senderChange}
                                    value={senderShippingInfo.senderstate || ''}
                                    style={{ padding: '1em' }}
                                > 
                                    <option value=""> State </option>
                                    {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="item">
                            <label htmlFor="zipcode" className='required'> Zip Code </label>
                                <input
                                    type="number"
                                    placeholder="e.g. 12345"
                                    maxLength="9"
                                    required
                                    name="senderzipcode"
                                    pattern="\d{5}(-\d{4})?"
                                    onChange={senderChange}
                                    value={senderShippingInfo.senderzipcode || ''}
                                />
                            </div>
                                            
                        <div style={{ display: 'flex', justifyContent:'left', paddingTop: "1em"}}>
                            <button variant="primary" type="submit">
                                Continue
                            </button>
                        </div>
                    </form>
                ) : !showPackageForm ? ( 
                    <form className='form' onSubmit={handleContinueToPackage}> 
                        <p style={{display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px'}}> Where is your shipment going? </p>
                        <p style={{display: 'flex', justifyContent: 'right', fontStyle: 'italic'}}> *Required Field </p>
                        <div className="item"> 
                            <label htmlFor="recfname" className='required'> Recipient First Name</label>
                            <input
                                type="text"
                                maxLength="100"
                                placeholder="e.g. John"
                                required
                                name="recfname"
                                onChange={recipientChange}
                                value={recipientShippingInfo.recfname || ''}
                            />
                        </div>
                        <div className="item"> 
                            <label htmlFor="reclname" className='required'> Recipient Last Name </label>
                            <input
                                type="text"
                                maxLength="100"
                                placeholder="e.g. Doe"
                                required
                                name="reclname"
                                onChange={recipientChange}
                                value={recipientShippingInfo.reclname || ''}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="recemail" className='required'> Email Address</label>
                                <input
                                    type="text"
                                    maxLength="500"
                                    placeholder="e.g. johndoe@email.com"
                                    required
                                    name="recemail"
                                    onChange={recipientChange}
                                    value={recipientShippingInfo.recemail|| ''}
                                />
                            </div>
                        <div className="item"> 
                            <label htmlFor="recstreetaddress" className='required'> Recipient Street Address </label>
                            <input 
                                type="text"
                                placeholder="e.g. 123 Main Street"
                                maxLength="100"
                                required
                                name="recstreetaddress"
                                onChange={recipientChange}
                                value={recipientShippingInfo.recstreetaddress || ''}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="reccity" className='required'> Recipient City </label>
                            <input 
                                type="text"
                                placeholder="e.g. Anytown"
                                maxLength="50"
                                required
                                name="reccity"
                                onChange={recipientChange}
                                value={recipientShippingInfo.reccity || ''}
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="recstate" className='required'> Recipient State </label>
                            <select
                                required
                                name="recstate"
                                onChange={recipientChange}
                                value={recipientShippingInfo.recstate || ''}
                                style={{ padding: '1em' }}
                            > 
                                <option value=""> State </option>
                                {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="reczipcode" className='required'> Recipient Zip Code </label>
                            <input
                                type="number"
                                placeholder="e.g. 12345"
                                maxLength="9"
                                required
                                name="reczipcode"
                                pattern="\d{5}(-\d{4})?"
                                onChange={recipientChange}
                                value={recipientShippingInfo.reczipcode || ''}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent:'left', paddingTop: "1em"}}>
                            <button variant="primary" type="submit">
                                Continue
                            </button>
                        </div>
                    </form>
                ) : !showPaymentForm ? (
                    <form className='form' onSubmit={handleContinueToPayment}>
                        <p style={{display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}> What kind of packaging are you using? </p>
                        <p style={{display: 'flex', justifyContent: 'right', fontStyle: 'italic'}}> *Required Field </p>
                        <div className='item'>
                        <label htmlFor="packagingtype" className='required'> Packaging Type </label>
                            <select
                                required
                                name="packagingtype"
                                onChange={packageSelect}
                                value={packagingInfo.packagingtype || ''}
                                style={{width: '330px', padding: '1em'}}
                            > 
                                <option value=""> Packaging Type </option>
                                    {packagingType.map(packagingType => (
                                <option key={packagingType} value={packagingType}>{packagingType}</option> ))}
                            </select>
                        </div>
                            {showDimensionsFields && (
                            <div className='form'>
                                <div className='item'>
                                    <label htmlFor="weight" className='required'> Weight </label>
                                    <input
                                        type="number"
                                        placeholder="Weight (lbs)"
                                        required
                                        name="weight"
                                        min="1"
                                        max="150"
                                        onChange={packageChange}
                                        value={packagingInfo.weight || ''}
                                    />
                                </div>
                                <div className='item'>
                                    <label htmlFor="length" className='required'> Length </label>
                                    <input
                                        type="number"
                                        placeholder="Length (in.)"
                                        required
                                        name="length"
                                        pattern="[0-9]"
                                        min="1"
                                        max="108"
                                        onChange={packageChange}
                                        value={packagingInfo.length || ''}
                                    />
                                </div>
                                <div className='item'>
                                    <label htmlFor="width" className='required'> Width </label>
                                    <input
                                        type="number"
                                        placeholder="Width (in.)"
                                        required
                                        name="width"
                                        pattern="[0-9]"
                                        min="1"
                                        max="108"
                                        onChange={packageChange}
                                        value={packagingInfo.width || ''}
                                    />
                                </div>
                                <div className='item'>
                                    <label htmlFor="height" className='required'> Height </label>
                                    <input
                                        type="number"
                                        placeholder="Height (in.)"
                                        required
                                        name="height"
                                        min="1"
                                        max="108"
                                        onChange={packageChange}
                                        value={packagingInfo.height || ''}
                                    />
                                </div>
                            </div>
                            )}

                        <div style={{ display: 'flex', justifyContent:'left', paddingTop: "1em"}}>
                            <button variant="primary" type="submit">
                                Continue
                            </button>
                        </div>
                    </form>
                ) : !showConfirmForm ? (
                    <form className='form' onSubmit={handleContinueToConfirm}>
                    <p style={{display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px'}}> Please input your payment method! </p>
                    <p style={{display: 'flex', justifyContent: 'right', fontStyle: 'italic'}}> *Required Field </p>
                    {customerPayment.map((payment) => (
                        <div key={payment.PaymentInfoID} className="paymentForm">
                            <div className='item'>
                            <label htmlFor="CardHolderFirstName" className='required' style={{ width: '550px' }}> First Name </label>
                                <input 
                                    type="text"
                                    placeholder="e.g John"
                                    required
                                    name="CardHolderFirstName"
                                    max="50"
                                    onChange={paymentChange}
                                    className="inputBoxes"
                                    value={paymentInfo.CardHolderFirstName || payment.CardHolderFirstName}
                                />
                            </div>
                        <div className='item'>
                            <label htmlFor="CardHolderLastName" className='required' style={{ width: '550px' }}> Last Name </label>
                            <input
                                type="text"
                                placeholder="e.g Doe"
                                required
                                name="CardHolderLastName"
                                max="50"
                                onChange={paymentChange}
                                className="inputBoxes"
                                value={paymentInfo.CardHolderLastName || payment.CardHolderLastName}
                            />
                        </div>  
                        <div className='item'>
                            <label htmlFor="CardNumber" className='required' style={{ width: '550px' }}> Card Number </label>
                            <input
                                type="text"
                                placeholder="#### #### #### ####"
                                required
                                name="CardNumber"
                                pattern="^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$"
                                onChange={paymentChange}
                                className="inputBoxes"
                                value={paymentInfo.CardNumber || payment.CardNumber}                        
                            />
                        </div>             
                        <div className='item'>
                            <label htmlFor="paymentexpirationmonth" className='required' style={{ width: '550px' }}> Expiration Month </label>
                            <select
                                required
                                name="paymentexpirationmonth"
                                onChange={paymentChange}
                                value={paymentInfo.paymentexpirationmonth}
                                className="inputBoxes"
                                style={{ padding: '1em' }}
                            > 
                                <option value=""> Expiration Month </option>
                                    {expirationMonths.map(expirationMonths => (
                                <option key={expirationMonths} value={expirationMonths}>{expirationMonths}</option> ))}
                            </select>
                        </div>

                        <div className='item'>
                            <label htmlFor="paymentexpirationyear" className='required' style={{ width: '550px' }}> Expiration Year </label>
                            <select
                                required
                                name="paymentexpirationyear"
                                onChange={paymentChange}
                                value={paymentInfo.paymentexpirationyear}
                                className="inputBoxes"
                                style={{ padding: '1em'}}
                            > 
                                <option value=""> Expiration Year </option>
                                    {expirationYears.map(expirationYears => (
                                <option key={expirationYears} value={expirationYears}>{expirationYears}</option> ))}
                            </select>
                        </div>
                        <div className='item'>
                            <label htmlFor="paymentcvv" className='required' style={{ width: '550px' }}> CVV </label>
                            <input
                                type="text"
                                placeholder="e.g 123"
                                required
                                name="paymentcvv"
                                pattern="[0-9]{3,4}"
                                onChange={paymentChange}
                                className="inputBoxes"
                                value={paymentInfo.paymentcvv}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent:'left', paddingTop: "1em"}}>
                            <button variant="primary" type="submit">
                                Review
                            </button>
                        </div>
                    </div>
                ))}
                </form>
                ) : !showSuccessForm ? (
                    <form className='form' onSubmit={handleContinueToSuccess}>
                        <h2 style={{ display: 'flex', justifyContent: 'center' }}> Please confirm your information is correct! </h2>
                        <div className="json-section">
                            <h2>Sender Information</h2>
                            <ul>
                                <li><strong>First Name:</strong> {senderShippingInfo.senderfname}</li>
                                <li><strong>Last Name:</strong> {senderShippingInfo.senderlname}</li>
                                <li><strong>Email:</strong> {senderShippingInfo.senderemail}</li>
                                <li><strong>Street Address:</strong> {senderShippingInfo.senderstreetaddress}</li>
                                <li><strong>City:</strong> {senderShippingInfo.sendercity}</li>
                                <li><strong>State:</strong> {senderShippingInfo.senderstate}</li>
                                <li><strong>Zip Code:</strong> {senderShippingInfo.senderzipcode}</li>
                            </ul>
                        </div>

                        <div className="json-section">
                            <h2>Recipient Information</h2>
                            <ul>
                                <li><strong>First Name:</strong> {recipientShippingInfo.recfname}</li>
                                <li><strong>Last Name:</strong> {recipientShippingInfo.reclname}</li>
                                <li><strong>Email:</strong> {recipientShippingInfo.recemail}</li>
                                <li><strong>Street Address:</strong> {recipientShippingInfo.recstreetaddress}</li>
                                <li><strong>City:</strong> {recipientShippingInfo.reccity}</li>
                                <li><strong>State:</strong> {recipientShippingInfo.recstate}</li>
                                <li><strong>Zip Code:</strong> {recipientShippingInfo.reczipcode}</li>
                            </ul>
                        </div>

                        <div className='json-section'>
                            <h2>Payment Information</h2>
                            <ul>
                                <li><strong>First Name:</strong> {paymentInfo.CardHolderFirstName }</li>
                                <li><strong>Last Name:</strong> {paymentInfo.CardHolderLastName }</li>
                                <li><strong>Card Number:</strong> {paymentInfo.CardNumber }</li>
                                <li><strong>Expiration Month:</strong> {paymentInfo.paymentexpirationmonth}</li>
                                <li><strong>Expiration Year:</strong> {paymentInfo.paymentexpirationyear}</li>
                                <li><strong>CVV:</strong> {paymentInfo.paymentcvv}</li>
                            </ul>
                        </div>

                        <div className='json-section'>
                            <h2>Parcel Information</h2>
                            <ul>
                                <li><strong>Type:</strong> {packagingInfo.packagingtype}</li>
                                {packagingInfo.packagingtype ===  'Box' && (
                                    <>
                                        <li><strong>Weight:</strong> {packagingInfo.weight}</li>
                                        <li><strong>Length:</strong> {packagingInfo.length}</li>
                                        <li><strong>Width:</strong> {packagingInfo.width}</li>
                                        <li><strong>Height:</strong> {packagingInfo.height}</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div>
                            <h2><strong>Total Cost: $</strong>{shippingCost}.00</h2>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent:'left', paddingTop: "1em"}}>
                            <button variant="primary" type="submit">
                                Confirm
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className='form'>
                        <h3 style={{ display: 'flex', justifyContent: 'center' }}>Thank you for your order!</h3>
                        <p style={{ display: 'flex', justifyContent: 'center' }}>Your order has been submitted successfully.</p>
                    </div>
                )}
            </div>
        </section>
        
    );
};

export default ShippingForm;
