// This component renders a report showing available inventory at a
// specific post office.

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserIDCookie } from '../cookies';

const ViewInventory = () => {
  const { cookies } = useUserIDCookie();
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    getInventory();
  });

  async function getInventory() {
    const payload = { userID: cookies.userID };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/post-master/get-inventory`,
        payload
      );
      setInventory(response.data.results);
    } catch (error) {}
  }

  return (
    <section>
      <section className='form'>
        <h1>Inventory</h1>
        {inventory.map((item, index) => (
          <div className="item" key={index}>
            <label className='disabled' htmlFor={`item-${index}`}>{item.ProductName}</label>
            <input
              type="number"
              id={`item-${index}`}
              disabled
              value={item.Quantity}
            />
          </div>
        ))}
      </section>
    </section>
  );
};

export default ViewInventory;
