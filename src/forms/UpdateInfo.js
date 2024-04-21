import React, { useState } from 'react'
import { Form, Button, Card, Container } from "react-bootstrap";

const UpdateInfo = () => {
    const [showUpdateInfo, setShowUpdateInfo] = useState(false);

    const handleContinueToUpdate = (event) => {
      event.preventDefault();
      setShowUpdateInfo(true);
    }

    const [showSuccess, setShowSuccess] = useState(false);

    const handleContinueToSuccess = (event) => {
        event.preventDefault();
        setShowSuccess(true);
      }

    const [carrierInfo, setCarrierInfo] = useState({});

    const carrierChange = (event) => {
        const { name, value } = event.target;
        setCarrierInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    
    return (
    <Container>
        <div className="UpdateInfo" style={{display: 'flex', justifyContent: 'center', paddingTop: '2em' }}>
        <Card className='poform'>
            <Card.Body>
            { !showUpdateInfo ? (
                <Form onSubmit={handleContinueToUpdate}>
                <p style={{ display: 'flex', justifyContent: 'left', fontWeight: 'bold', fontSize: '20px', paddingLeft: '20px', paddingTop: '20px' }}> Update your Info! </p>
                <p style={{ display: 'flex', justifyContent: 'left', fontStyle: 'italic', paddingTop: '5px', paddingLeft: '20px' }}> Enter your 6 digit employee ID. </p>
                    <Form.Group>
                    <div style={{ display: 'flex', paddingLeft: '20px', paddingTop: '10px', paddingBottom: '20px' }}>
                        <Form.Control
                            type="text"
                            placeholder="Employee ID"
                            pattern="\d{6}"
                            name="employeeid"
                            id="employeeid"
                            required
                            style={{width:'500px', padding: '1em'}}
                        />
                        
                        <div style={{ display: 'flex', juistifyContent:'left', paddingLeft: '20px', paddingTop: '10px', paddingBottom: '10px' }}>
                            <Button variant="primary" type="submit" style={{ borderRadius: '100px', paddingLeft: '2em', paddingRight: '2em' }}>
                                Search
                            </Button>
                        </div>
                    </div>
                    </Form.Group>
                </Form>
                ) : !showSuccess ? (
                    <Form onSubmit={handleContinueToSuccess}>
                    <p style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}> Update your Info! </p>
                    <p style={{ display: 'flex', justifyContent: 'center', fontStyle: 'italic' }}> Fill in the fields below. </p>
                        <Form.Group>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1em', paddingTop: '20px' }}>
                            <Form.Control 
                                type="text"
                                placeholder="First Name"
                                name="FirstName"
                                id="FirstName"
                                onChange={carrierChange}
                                value={carrierInfo.FirstName || ''}
                                required
                                style={{ width: '250px', padding: '1em' }}
                            />
                            <Form.Control 
                                type="text"
                                placeholder="Middle Initial"
                                name="MiddleInitial"
                                id="MiddleInitial"
                                onChange={carrierChange}
                                value={carrierInfo.MiddleInitial || ''}
                                style={{ width: '150px', padding: '1em' }}
                            />
                            <Form.Control 
                                type="text"
                                placeholder="Last Name"
                                name="LastName"
                                id="LastName"
                                onChange={carrierChange}
                                value={carrierInfo.LastName || ''}
                                required
                                style={{ width: '250px', padding: '1em' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '20px' }}>
                            <Form.Control 
                                type="tel"
                                placeholder="Phone Number"
                                pattern="[0-9]{10}"
                                name="PhoneNumber"
                                id="PhoneNumber"
                                onChange={carrierChange}
                                value={carrierInfo.PhoneNumber || ''}
                                required
                                style={{ width: '330px', padding: '1em' }}
                            />
                            <Form.Control 
                                type="email"
                                placeholder="Email Address"
                                name="EmailAddress"
                                id="EmailAddress"
                                onChange={carrierChange}
                                value={carrierInfo.EmailAddress || ''}
                                required
                                style={{ width: '330px', padding: '1em' }}

                            />
                        </div>

                        <div style={{ display: 'flex', juistifyContent:'left', paddingTop: '10px', paddingBottom: '10px' }}>
                            <Button variant="primary" type="submit">
                                Update
                            </Button>
                        </div>
                        </Form.Group>
                    </Form>
                ) : (
                    <div style={{ textAlign: 'center', paddingTop: '2em', paddingBottom: '1em' }}>
                        <h3> Profile Info Updated Successfully! </h3>
                    </div>
                )}
            </Card.Body>
        </Card>
    </div>
    </Container>
    );
};

export default UpdateInfo;