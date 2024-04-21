// This component encompasses forms/reports relating to employee management

import React from 'react'
import { useState } from 'react'
import { ManageEmployees, AddEmployee } from '../forms';

const Employees = () => {
	const [currentForm, setCurrentForm] = useState();
	const [activeComponent, setActiveComponent] = useState("");

	const components = {
    ManageEmployees: ManageEmployees,
		AddEmployee: AddEmployee
  };

	function handleClick(event) {
    const form = event.target.id;
    const MyComponent = components[form];
    setCurrentForm(<MyComponent />);

		if (activeComponent.length > 0) {
      // remove active class from component
      document.getElementById(activeComponent).classList.remove("active")
    }
    
    setActiveComponent(form)
    event.target.classList.add("active");
  }

	return (
		<section>
			<div className="miniNav">
				<a id='ManageEmployees' onClick={handleClick}>Find an employee</a>
				<div className="line"></div>
				<a id='AddEmployee' onClick={handleClick}>Add new employee</a>
			</div>
			{currentForm && currentForm}
		</section>
	)
}

export default Employees