const pool = require("../Server/database");

async function getSentPackagesHistory(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID } = data;
      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      query = `START TRANSACTION;
      SELECT CustomerID INTO @customerID
      FROM customers as c
      WHERE c.UserID = '${userID}';
    
      SELECT t.TransactionDate, p.ParcelID, r.FirstName, r.LastName, a.StreetAddress, a.City, a.State, a.ZipCode
      FROM letters as l, customers as r, parcels as p, transactions as t, addresses as a
      WHERE l.SenderID = @customerID AND
        r.CustomerID = l.ReceiverID AND
        l.LetterID = p.ReferenceID AND
        p.ParcelID = t.ParcelID AND
        l.EndLocationID = a.AddressID AND
        p.Deleted = 0
      
      UNION
      
      SELECT t.TransactionDate, p.ParcelID, r.FirstName, r.LastName, a.StreetAddress, a.City, a.State, a.ZipCode
      FROM boxes as b, customers as r, parcels as p, transactions as t, addresses as a
      WHERE b.SenderID = @customerID AND
        r.CustomerID = b.ReceiverID AND
        b.BoxID = p.ReferenceID AND
        p.ParcelID = t.ParcelID AND
        b.EndLocationID = a.AddressID AND
        p.Deleted = 0;

      COMMIT;`;

      pool.query(query, (error, results) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Error Internal server error",
              sqlError: error.message,
            })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ results }));
        }
      });
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: "Internal server error: Error getting sent packages",
      })
    );
  }
}

async function getRecivingPackages(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      query = `START TRANSACTION;
      SELECT CustomerID INTO @customerID
      FROM customers as c
      WHERE c.UserID = '${userID}';
    
      SELECT t.TransactionDate, p.ParcelID, s.FirstName, s.LastName, a.StreetAddress, a.City, a.State, a.ZipCode
      FROM letters as l, customers as s, parcels as p, transactions as t, addresses as a
      WHERE l.ReceiverID = @customerID AND
        s.CustomerID = l.SenderID AND
        l.LetterID = p.ReferenceID AND
        p.ParcelID = t.ParcelID AND
        l.StartLocationID = a.AddressID
        AND p.Deleted = 0

        
      UNION
      
      SELECT t.TransactionDate, p.ParcelID, s.FirstName, s.LastName, a.StreetAddress, a.City, a.State, a.ZipCode
      FROM boxes as b, customers as s, parcels as p, transactions as t, addresses as a
      WHERE b.ReceiverID = @customerID AND
        s.CustomerID = b.SenderID AND
        b.BoxID = p.ReferenceID AND
        p.ParcelID = t.ParcelID AND
        b.StartLocationID = a.AddressID
        AND p.Deleted = 0;

      COMMIT;`;

      pool.query(query, (error, results) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Error Internal server error",
              sqlError: error.message,
            })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ results }));
        }
      });
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: "Internal server error: Error getting sent packages",
      })
    );
  }
}

async function getNumNotif(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }
      pool.query(
        `SELECT * 
          FROM customer_notifications AS cn
          INNER JOIN customers AS c ON cn.CustomerID = c.CustomerID
          WHERE c.UserID = '${userID}' AND cn.MessageRead = 0 `,
        [userID],
        (error, results, fields) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Error retrieving data from database" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
          }
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function readNotif(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      pool.query(
        `UPDATE customer_notifications AS cn
          INNER JOIN customers AS c ON cn.CustomerID = c.CustomerID
          SET MessageRead = 1
          WHERE c.UserID = '${userID}'`,
        [userID],
        (error, results, fields) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Error updating data in the database" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
          }
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function postCustomerReview(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);

      const { tracking, complaint, userID } = data;

      query = `
      START TRANSACTION;
      
      SELECT CustomerID into @customerID
      FROM Customers
      WHERE UserID = '${userID}';

      INSERT INTO customer_feedback (FeedbackID, CustomerID, FeedbackDate, ConcernType, ParcelID)
      VALUES (UUID(), @customerID, CURDATE(), '${complaint}', '${tracking}');
      
      COMMIT;`;

      pool.query(query, (error, results) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Error Internal server error",
              sqlError: error.message,
            })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ results }));
        }
      });
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: "Internal server error: Error getting sent packages",
      })
    );
  }
}

async function getTrackingDetails(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { parcelID } = data;

      if (!parcelID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Parcel ID is required" }));
        return;
      }

      pool.query(
        `SELECT pe.ParcelID, pe.EventTimeStamp, a.StreetAddress, pe.EventType, a.City, a.State, a.ZipCode
          FROM parcel_event as pe
          INNER JOIN addresses AS a ON pe.AddressID = a.AddressID
          WHERE pe.ParcelID = '${parcelID}'
          ORDER BY pe.EventTimeStamp DESC;`,
        [parcelID],
        (error, results, fields) => {
          if (error) {
            console.log(error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Error finding data in the database" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
          }
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function postPlaceOrder(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, items, totalCost, shippingInfo, paymentInfo } = data;

      const { envelope, stamp, box } = items;

      const { fname, lname, streetaddress, city, state, zipcode } =
        shippingInfo;

      const {
        paymentfirstname,
        paymentlastname,
        paymentcard,
        expmonth,
        expyear,
        paymentcvv,
      } = paymentInfo;

      query = `START TRANSACTION;

      CALL UpdateProductQuantity(${stamp}, 'Stamp');
      CALL UpdateProductQuantity(${box}, 'Box');
      CALL UpdateProductQuantity(${envelope}, 'Envelope');


      CALL CheckAndInsertPaymentInfo('${paymentcard}', '${paymentcvv}', '${paymentfirstname}', '${paymentlastname}', '${expmonth}', '${expyear}', @currentPaymentInfoID);


      SELECT CustomerID INTO @customerID
      FROM customers
      WHERE userID = '${userID}';

      CALL InsertAddressIfNew('${streetaddress}', '${city}', '${state}', '${zipcode}', @addressID);

      INSERT INTO product_purchases (PurchaseID, NumBoxes, NumStamps, NumEnvelopes, CustomerID, PaymentInfoID, PurchaseDate, Amount, AddressID)
      VALUES (UUID(), ${box}, ${stamp}, ${envelope}, @customerID, @currentPaymentInfoID, NOW(), ${totalCost}, @addressID);
      
      COMMIT;`;

      pool.query(query, (error, results) => {
        if (error) {
          let statusCode = 500;
          let errorMessage = "Internal Server Error";

          if (error.errno === 3819) {
            statusCode = 409;
            errorMessage = "Insufficient Inventory";
          }

          const response = {
            status: statusCode,
            error: errorMessage,
          };

          res.writeHead(statusCode, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ results }));
        }
      });
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: "Internal server error: Error placing order",
      })
    );
  }
}

async function getCustomerProfile(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      pool.query(
        `SELECT c.FirstName, c.MiddleInitial, c.LastName, c.PhoneNumber, c.EmailAddress, c.AddressID, a.StreetAddress, a.City, a.State, a.ZipCode, ul.Username, ul.Pwd
          FROM customers as c
          INNER JOIN addresses AS a ON a.AddressID = c.AddressID
          INNER JOIN user_logins AS ul ON c.UserID = ul.UserID
          WHERE c.UserID = '${userID}'`,
        [userID],
        (error, results, fields) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Error updating data in the database" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
          }
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function getPaymentProfile(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      pool.query(
        `SELECT p.CardNumber, p.CVV, p.CardHolderFirstName, p.CardHolderLastName, p.ExpMonth, p.ExpYear 
          FROM payment_info as p
          INNER JOIN customers AS c ON c.PaymentInfoID = p.PaymentInfoID
          WHERE c.UserID = '${userID}'`,
        [userID],
        (error, results, fields) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Error updating data in the database" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
          }
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function updateAccountDetails(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const {
        userID,
        FirstName,
        MiddleInitial,
        LastName,
        PhoneNumber,
        EmailAddress,
      } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      pool.query(
        `UPDATE customers
          SET FirstName = '${FirstName}', MiddleInitial = '${MiddleInitial}', LastName = '${LastName}', PhoneNumber = '${PhoneNumber}', EmailAddress = '${EmailAddress}'
          WHERE UserID = '${userID}'`,
        [userID],
        (error, results, fields) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Error updating data in the database" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
          }
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function updateShippingDetails(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { AddressID, StreetAddress, City, State, ZipCode } = data;

      if (!AddressID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Address ID is required" }));
        return;
      }

      pool.query(
        `UPDATE addresses
          SET StreetAddress = '${StreetAddress}', City = '${City}', State = '${State}', ZipCode = '${ZipCode}'
          WHERE AddressID = '${AddressID}'`,
        [AddressID],
        (error, results, fields) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Error updating data in the database" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
          }
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function updatePaymentDetails(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, UnformattedCardNumber, CardHolder, Expiration, CVV } =
        data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      const [CardHolderFirstName, CardHolderLastName] = CardHolder.split(" ");
      const [ExpMonth, ExpYear] = Expiration.split("/");

      pool.query(
        `SET @currentPaymentID = UUID();

        INSERT INTO payment_info
        VALUES (@currentPaymentID, '${UnformattedCardNumber}', '${CVV}', '${CardHolderFirstName}', '${CardHolderLastName}', '${ExpMonth}', '${ExpYear}');
        
        UPDATE customers
        SET PaymentInfoID = @currentPaymentID
        WHERE UserID = '${userID}';`,
        [userID],
        (error, results, fields) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Error updating data in the database" })
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
          }
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = {
  getSentPackagesHistory,
  // postPlaceOrder,
  postCustomerReview,
  getTrackingDetails,
  getNumNotif,
  readNotif,
  getCustomerProfile,
  getPaymentProfile,
  updateAccountDetails,
  updateShippingDetails,
  getRecivingPackages,
  updatePaymentDetails,
};
