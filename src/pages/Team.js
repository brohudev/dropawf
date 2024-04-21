// Team.js
import React from "react";
import Card from "../components/Card";
import "../css/Team.css";
import Bluey from "../assets/images/Bluey.png";
import Bingo from "../assets/images/Bingo.png";
import Dad from "../assets/images/dad.png";
import Mom from "../assets/images/mom.png";
import Grandad from "../assets/images/Grandad.png";

const employees = [
  { name: "Bluey", position: "CEO", imageUrl: Bluey },
  { name: "Bingo", position: "CTO", imageUrl: Bingo },
  {
    name: "Dad",
    position: "Mail Courier",
    imageUrl: Dad,
  },
  {
    name: "Mom",
    position: "PostMaster",
    imageUrl: Mom,
  },
  {
    name: "Grandpa",
    position: "Mail Courier",
    imageUrl: Grandad,
  },
];

const Team = () => {
  return (
    <div className="team">
      <h1>Meet the Team</h1>
      <div className="card-container">
        {employees.map((employee, index) => (
          <Card
            key={index}
            name={employee.name}
            position={employee.position}
            imageUrl={employee.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default Team;
