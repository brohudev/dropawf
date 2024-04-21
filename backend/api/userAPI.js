const pool = require("../Server/database");

async function validateUser(req, res) {
  let data = "";

  // Collect data from the request body
  req.on("data", (chunk) => {
    data += chunk.toString();
  });

  // Parse JSON data when request ends
  req.on("end", () => {
    const jsonData = JSON.parse(data);
    const { username, password } = jsonData;

    const query = `START TRANSACTION;
            SELECT u.userID, u.role, c.FirstName
            FROM user_logins as u
            INNER JOIN customers as c on c.UserID = u.UserID
            WHERE u.Username = '${username}' AND 
                u.Pwd = '${password}'
                
            UNION
            
            SELECT u.userID, u.role, e.FirstName
            FROM user_logins as u
            INNER JOIN employees as e on e.UserID = u.UserID
            WHERE username = '${username}' AND 
                pwd = '${password}';
            
            COMMIT;`;

    pool.query(query, (error, results, fields) => {
      if (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Error retrieving data from database" })
        );
      } else {
        // Send the results back to the client
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      }
    });
  });
}

async function register(req, res) {
  let data = "";

  req.on("data", (chunk) => {
    data += chunk.toString();
  });

  req.on("end", () => {
    const jsonData = JSON.parse(data);
    const {
      fname,
      minit,
      lname,
      address,
      city,
      state,
      zip,
      phone,
      email,
      username,
      password,
    } = jsonData;

    // Check if the username already exists
    pool.query(
      `SELECT COUNT(*) AS count FROM user_logins WHERE Username = '${username}'`,
      async (error, results) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: "Error retrieving data from database" })
          );
        } else {
          const count = results[0].count;
          if (count > 0) {
            // Username already exists, return an error
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "That user already exists. Please select another name",
              })
            );
          } else {
            // Username does not exist, proceed with registration
            const query = `START TRANSACTION;
                    CALL InsertAddressIfNew('${address}', '${city}', '${state}', '${zip}', @addressID);
                    SET @newUserID = UUID();
                    INSERT INTO user_logins (UserID, Username, Pwd, Role)
                    VALUES (@newUserID, '${username}', '${password}', 'customer');
                    INSERT INTO customers (CustomerID, FirstName, MiddleInitial, LastName, AddressID, PhoneNumber, EmailAddress, UserID)
                    VALUES (UUID(), '${fname}', '${minit}', '${lname}', @addressID, '${phone}', '${email}', @newUserID);
                    COMMIT;`;

            pool.query(query, (error, results, fields) => {
              if (error) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Error executing SQL query" }));
              } else {
                // Send the results back to the client
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
              }
            });
          }
        }
      }
    );
  });
}

async function updateUserDetails(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, Username, Password } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      pool.query(
        `SELECT UserID FROM user_logins WHERE Username = ? AND UserID != ?`,
        [Username, userID],
        (error, results) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error querying the database" }));
            return;
          }
          if (results.length > 0) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Username is already in use" }));
            return;
          }

          pool.query(
            `UPDATE user_logins
            SET Username = '${Username}', Pwd = '${Password}'
            WHERE UserID = '${userID}'`,
            [userID],
            (updateError, updateResults) => {
              if (updateError) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    error: "Error updating data in the database",
                  })
                );
                return;
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(updateResults));
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function getActions(req, res) {
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

      //   console.log("Received data:", userID);

      query = `START TRANSACTION;
  
            SELECT e.EmployeeID INTO @employeeID
            FROM employees as e
            WHERE e.UserID = '${userID}';
  
            SELECT p.EventTimeStamp, p.EventType, p.parcelID
            FROM parcel_event as p
            WHERE p.EmployeeID = @employeeID
            ORDER BY p.EventTimeStamp DESC;
  
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
        error: "Internal server error: Error getting actions",
      })
    );
  }
}

async function checkRole(req, res) {
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

      //   console.log("Received data:", userID);

      query = `START TRANSACTION;
  
      select JobTitle from employees where userId = '${userID}';
  
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
        error: "Internal server error: Error getting actions",
      })
    );
  }
}

async function getOfficeReport(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, start, end } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      // console.log("Received data:", userID, start, end); // Log received data

      query = `START TRANSACTION;
      
      SELECT pp.purchaseDate, pp.Amount, 'product_purchases' AS TableName
      FROM product_purchases AS pp 
      WHERE OfficeClerkID IN (SELECT employeeID FROM employees WHERE officeID = @officeID)
      AND pp.purchaseDate BETWEEN '${start}' AND '${end}'
      
      UNION 
      
      SELECT t.transactionDate, t.Amount, 'transactions' AS TableName
      FROM transactions AS t 
      WHERE t.transactionDate BETWEEN '${start}' AND '${end}' AND parcelID IN (
          SELECT DISTINCT parcelID 
          FROM parcel_event
          WHERE EmployeeID IN (SELECT EmployeeID FROM employees WHERE OfficeID = @officeID)
      );
      
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
        error: "Internal server error: Error getting revenueß",
      })
    );
  }
}

async function getOrdersThroughOffice(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, start, end } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      // console.log("Received data:", userID, start, end); // Log received data

      query = `START TRANSACTION;
      
      SELECT OfficeID INTO @officeID
      FROM employees
      WHERE userID = '${userID}';
        
      SELECT 
          p.ParcelType, 
          t.TransactionDate, 
          p.ParcelID, 
          CONCAT(s.FirstName, " ",s.LastName) AS SenderName,
          sa.StreetAddress AS SenderStreetAddress, 
          sa.City AS SenderCity, 
          sa.State AS SenderState, 
          sa.ZipCode AS SenderZipCode,
          CONCAT(r.FirstName, " ",r.LastName) AS ReceiverName,
          ra.StreetAddress AS ReceiverStreetAddress, 
          ra.City AS ReceiverCity, 
          ra.State AS ReceiverState, 
          ra.ZipCode AS ReceiverZipCode,
          pe.EventType AS ParcelStatus
      FROM 
          post_offices AS po
      INNER JOIN 
          addresses AS sa ON po.AddressID = sa.AddressID
      LEFT JOIN 
          (letters AS l
          INNER JOIN 
              customers AS s ON l.SenderID = s.CustomerID
          INNER JOIN 
              customers AS r ON l.ReceiverID = r.CustomerID
          INNER JOIN 
              addresses AS ra ON l.EndLocationID = ra.AddressID
          INNER JOIN 
              parcels AS p ON p.ReferenceID = l.LetterID
          INNER JOIN 
              transactions AS t ON t.ParcelID = p.ParcelID
          LEFT JOIN 
              parcel_event AS pe ON p.ParcelID = pe.ParcelID) 
          ON po.AddressID = l.StartLocationID
      WHERE 
          po.OfficeID = @officeID AND p.Deleted = 0 AND pe.EventType = 'Received' -- AND t.TransactionDate BETWEEN '${start}' AND '${end}'

      UNION DISTINCT

      SELECT DISTINCT
          p.ParcelType, 
          t.TransactionDate, 
          p.ParcelID,
          CONCAT(s.FirstName, " ",s.LastName) AS SenderName,
          sa.StreetAddress AS SenderStreetAddress, 
          sa.City AS SenderCity, 
          sa.State AS SenderState, 
          sa.ZipCode AS SenderZipCode,
          CONCAT(r.FirstName, " ",r.LastName) AS ReceiverName,
          ra.StreetAddress AS ReceiverStreetAddress, 
          ra.City AS ReceiverCity, 
          ra.State AS ReceiverState, 
          ra.ZipCode AS ReceiverZipCode,
          pe.EventType AS ParcelStatus
      FROM 
          post_offices AS po
      INNER JOIN 
          addresses AS sa ON po.AddressID = sa.AddressID
      LEFT JOIN 
          (boxes AS b
          INNER JOIN 
              customers AS s ON b.SenderID = s.CustomerID
          INNER JOIN 
              customers AS r ON b.ReceiverID = r.CustomerID
          INNER JOIN 
              addresses AS ra ON b.EndLocationID = ra.AddressID
          INNER JOIN 
              parcels AS p ON p.ReferenceID = b.BoxID
          INNER JOIN 
              transactions AS t ON t.ParcelID = p.ParcelID
          LEFT JOIN 
              parcel_event AS pe ON p.ParcelID = pe.ParcelID) 
          ON po.AddressID = b.StartLocationID
      WHERE 
          po.OfficeID = @officeID AND p.Deleted = 0 AND pe.EventType = 'Received'; -- AND t.TransactionDate BETWEEN '${start}' AND '${end}';


      
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
        error: "Internal server error: Error getting revenueß",
      })
    );
  }
}

async function editShippingInfo(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { parcelID } = data;

      const query = `
        START TRANSACTION;
        
        SELECT r.FirstName, r.LastName, a.StreetAddress, a.City, a.State, a.ZipCode, r.EmailAddress
        FROM parcels as p, letters as l, customers as r, addresses as a
        WHERE p.ParcelID = '${parcelID}' AND
          p.ReferenceID = l.LetterID AND
          r.CustomerID = l.ReceiverID AND
          a.AddressID = l.EndLocationID
          
        UNION 
        
        SELECT r.FirstName, r.LastName, a.StreetAddress, a.City, a.State, a.ZipCode, r.EmailAddress
        FROM parcels as p, boxes as b, customers as r, addresses as a
        WHERE p.ParcelID = '${parcelID}' AND
          p.ReferenceID = b.BoxID AND
          r.CustomerID = b.ReceiverID AND
          a.AddressID = b.EndLocationID;`;

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

async function updateShippingInfo(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      console.log(data);
      const { recipientShippingInfo, parcelID } = data;
      const {
        FirstName,
        LastName,
        StreetAddress,
        City,
        State,
        ZipCode,
        EmailAddress,
      } = recipientShippingInfo;

      const query = `
        START TRANSACTION;

        SELECT 
        CASE 
            WHEN p.ParcelType = 'Letter' THEN l.LetterID
            WHEN p.ParcelType = 'Box' THEN b.BoxID
        END AS ReferenceID
        INTO @refID
        FROM parcels p
        LEFT JOIN letters as l ON p.ReferenceID = l.LetterID AND p.ParcelType = 'Letter'
        LEFT JOIN boxes as b ON p.ReferenceID = b.BoxID AND p.ParcelType = 'Box'
        WHERE p.ParcelID = '${parcelID}';

        CALL InsertAddressIfNew('${StreetAddress}', '${City}', '${State}', '${ZipCode}', @addressID);

        CALL ShippingInsertCustomerIfNew('${FirstName}', '${LastName}', '${EmailAddress}', @addressID, @recID);

        UPDATE letters 
        SET ReceiverID = @recID, EndLocationID = @addressID
        WHERE LetterID = @refID;
        
        -- Update boxes table if ReferenceID exists in boxes table
        UPDATE boxes 
        SET ReceiverID = @recID, EndLocationID = @addressID
        WHERE BoxID = @refID;
        
      COMMIT;`;

      pool.query(query, (error) => {
        if (error) {
          console.log(error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Internal server error",
              sqlError: error.message,
            })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Order added successfully" }));
        }
      });
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = {
  validateUser,
  register,
  updateUserDetails,
  getActions,
  checkRole,
  getOfficeReport,
  getOrdersThroughOffice,
  editShippingInfo,
  updateShippingInfo,
};
