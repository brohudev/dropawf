import React from "react";
import "../css/Card.css";

const Card = ({ name, position, imageUrl }) => {
  return (
    <div className="card">
      <img src={imageUrl} alt={name} className="card-image" />
      <h2>{name}</h2>
      <p>{position}</p>
    </div>
  );
};

export default Card;
