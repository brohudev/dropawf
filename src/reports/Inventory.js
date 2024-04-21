// This component encompasses forms/reports relating to inventory

import React from 'react'
import { useState } from 'react'
import ViewInventory from './ViewInventory'
import { AddInventory } from '../forms'

const Inventory = () => {
	const [currentForm, setCurrentForm] = useState();
	const [activeComponent, setActiveComponent] = useState("");

	const components = {
    ViewInventory: ViewInventory,
		AddInventory: AddInventory
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
				<a id='ViewInventory' onClick={handleClick}>View Inventory</a>
				<div className="line"></div>
				<a id='AddInventory' onClick={handleClick}>Add Inventory</a>
			</div>
			{currentForm && currentForm}
		</section>
	)
}

export default Inventory