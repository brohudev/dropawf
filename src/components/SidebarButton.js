import React from 'react'

const SidebarButton = ({ id, text, handleClick }) => {
  return (
    <li id={id} onClick={handleClick}>{text}</li>
  )
}

export default SidebarButton