import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useLoginCookies } from "../cookies";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { setCookie } = useLoginCookies();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await fetch(process.env.REACT_APP_BASE_URL + "/user/validate-login", {
      method: "POST",
      //mode: 'no-cors',
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

          // window.location.href = '../dashboard';
          navigate("/dashboard");
        } else {
          setErrorMessage("Incorrect username or password");
        }
      });
  };

  function register() {
    navigate("/register");
  }

  return (
    <main className="Login">
      <div
        className="LoginPage"
        style={{ display: "flex", justifyContent: "center", paddingTop: "5em" }}
      >
        <Card className="form">
          <Card.Body>
            <div className="m-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicUsername">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      name="username"
                      value={loginData.username}
                      onChange={handleInputChange}
                      required
                      style={{ width: "200px", padding: "1em" }}
                      className="form-control-sm"
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Form.Text
                      className="text-muted"
                      style={{ padding: "10px" }}
                    >
                      Please enter your username.
                    </Form.Text>
                  </div>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      required
                      style={{ width: "200px", padding: "1em" }}
                      className="form-control-sm"
                    />
                  </div>
                </Form.Group>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "10px",
                  }}
                >
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    type="submit"
                  >
                    Submit
                  </Button>
                </div>
                {errorMessage && (
                  <div
                    style={{
                      color: "red",
                      textAlign: "center",
                      paddingTop: "10px",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}
              </Form>
            </div>
          </Card.Body>
          <div style={{ display: "flex", justifyContent: "left" }}>
            <span>
              {" "}
              Don't have an account yet?{" "}
              <a onClick={register}> Sign up now! </a>
            </span>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;