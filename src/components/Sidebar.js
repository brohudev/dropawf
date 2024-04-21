import React from 'react';
import { useState, useEffect } from "react"

import "../css/Sidebar.css"

const Sidebar = ({ links, role }) => {
  const [checkBox, setCheckBox] = useState(false)
  const activeClassName = 'active'

	useEffect(() => {
		function changeSize() {
			const vw = window.innerWidth
			document.documentElement.style.setProperty("--hamburger-width", `${vw}px`)
		}

		changeSize()

		window.addEventListener("resize", changeSize)
		return () => window.removeEventListener("resize", changeSize)
	}, [])

	function handleChange(e) {
		const {checked} = e.target
		setCheckBox(checked)
	}

  function lockScroll() {
		const body = document.body.style
		checkBox ? body.overflow = "hidden" : body.overflow = "auto"
	}

	function handleClick() {
		setCheckBox(false)
		document.documentElement.scrollTop = 0
	}

	lockScroll()

  return (
    <aside className='sidebar'>
      <input
				type="checkbox"
				id="sidebar-toggle"
				checked={checkBox}
				onChange={handleChange}
			/>
			<label className="sidebar-button-container" htmlFor="sidebar-toggle">
				<div className="sidebar-button-top"></div>
				<div className="sidebar-button-middle"></div>
				<div className="sidebar-button-bottom"></div>
			</label>

      <ul className="sidebar-items" onClick={handleClick}>
				{links}
			</ul>
    </aside>
  );
};

export default Sidebar;