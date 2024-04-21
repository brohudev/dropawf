import React from "react";
import { useLoginCookies } from "../cookies";

import "../css/WelcomeMessage.css"

const WelcomeMessage = () => {
  const { cookies, setCookie } = useLoginCookies();

  const userRole = {
    postmaster: "Postmaster",
    mailcourier: "Mail Courier",
    officeclerk: "Office Clerk"
  }

  return (
    <section className="WelcomeMessage">
      <h2>Welcome, {cookies.userFirstName}!</h2>
    </section>
  );
};

export default WelcomeMessage;