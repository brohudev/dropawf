const url = require("url");
const pool = require("../Server/database");

async function addEmployee(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const {
        fname,
        minit,
        lname,
        title,
        ssn,
        address,
        city,
        state,
        zip,
        hiredDate,
        phone,
        email,
        salary,
        username,
        password,
        userID,
      } = data;

      query = `START TRANSACTION;
      SET @newUserID = UUID();

      SELECT OfficeID into @officeID
      FROM employees
      WHERE UserID = '${userID}'; 

      INSERT INTO user_logins (UserID, Username, Pwd, Role)
      VALUES (@newUserID, '${username}', '${password}', '${title}');

      CALL InsertAddressIfNew('${address}', '${city}', '${state}', '${zip}', @addressID);

      INSERT INTO employees (EmployeeID, FirstName, MiddleInitial, LastName, JobTitle, SSN, AddressID, HiredoN, PhoneNumber, EmailAddress, OfficeID, ActivelyEmployed, Salary, UserID)
      VALUES (UUID(), '${fname}', '${minit}', '${lname}', '${title}', '${ssn}', @addressID, '${hiredDate}', '${phone}', '${email}', @officeID, 1, '${salary}', @newUserID);

      COMMIT;`;

      pool.query(query, (error, results) => {
        if (error) {
          let statusCode = 500;
          let errorMessage = "Internal server error";

          // Check if the error is due to a duplicate entry (error code 1062)
          if (error.errno === 1062) {
            statusCode = 409; // Conflict status code
            errorMessage = "Duplicate entry. This record already exists.";
          }

          res.writeHead(statusCode, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: errorMessage, sqlError: error.message })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ results }));
        }
      });
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
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
        `SELECT fn.ParcelID, cf.ConcernType, pn.PMNotificationID
        FROM feedback_notifications AS fn
        INNER JOIN customer_feedback AS cf ON fn.FeedbackID = cf.FeedbackID
        INNER JOIN postmaster_notifications as pn on pn.ReferenceID = fn.NotificationID
        INNER JOIN employees as e on pn.PostMasterID = e.EmployeeID
        WHERE e.UserID = '${userID}' AND pn.MessageRead = 0;`,
        [userID],
        (error, results) => {
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

async function getInventoryNotifs(req, res) {
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
        `SELECT p.ProductName
        FROM inventory_notifications as i, employees as e, products as p
        WHERE i.PostMasterID = e.EmployeeID AND
        e.UserID = '${userID}' AND
        i.ProductID = p.ProductID AND
        i.MessageRead = 0;`,
        [userID],
        (error, results) => {
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

async function closeNotifs(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, notifID } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      pool.query(
        `START TRANSACTION;
  
        UPDATE postmaster_notifications AS pn
        SET pn.MessageRead = 1
        WHERE pn.PMNotificationID = '${notifID}';
        
        COMMIT;`,
        [notifID],
        (error, results) => {
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

async function updateEmployeeDetails(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { employeeID, ...employeeData } = data; //extract data.

      let query = `START TRANSACTION;\n`; // Start a transaction

      // Construct the UPDATE query for the employee table
      query += `UPDATE employees SET `;
      const updates = Object.keys(employeeData)
        .map((key) => `${key} = ?`)
        .join(", ");
      query += `${updates} WHERE EmployeeID = ?;\n`;

      const values = Object.values(employeeData); // Get values from employeeData
      values.push(employeeID); // Add the employee ID to the values array

      query += `COMMIT;`; // Commit the transaction

      pool.query(query, values, (error, results) => {
        //execute querry and handle sql errors
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Internal server error",
              sqlError: error.message,
            })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Employee details updated successfully" })
          );
        }
      });
    });
  } catch (error) {
    //handle server connection errors
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Internal server error", message: error.message })
    );
  }
}

async function getProductList(req, res) {
  //done
  try {
    let query = `SELECT ProductName FROM products;`;

    pool.query(query, (error, results) => {
      if (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      } else {
        const inventoryList = results.map((row) => ({
          ProductName: row.ProductName,
          Price: row.Price,
        }));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ inventoryList }));
      }
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function getInventory(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID } = data;

      query = `SELECT i.Quantity, p.ProductName
      FROM inventory as i
      INNER JOIN products as p on p.ProductID = i.ProductID
      INNER JOIN employees as e on e.OfficeID = i.OfficeID
      WHERE e.UserID = '${userID}';`;

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

async function updateInventory(userID, items) {
  try {
    // Retrieve inventoryID for the provided userID
    const [officeIdResult] = await executeQueryAsync(
      `SELECT p.OfficeID
       FROM post_offices AS p
       INNER JOIN employees AS e ON p.PostMasterID = e.EmployeeID
       WHERE e.UserID = ?`,
      [userID]
    );

    if (!officeIdResult || !officeIdResult.OfficeID) {
      throw new Error("Office not found for the specified user");
    }

    const { OfficeID } = officeIdResult;

    // Process each item in the requestD
    for (const itemName in items) {
      const quantityToAdd = items[itemName];

      // Retrieve ProductID for the current item name
      const [productResult] = await executeQueryAsync(
        `SELECT ProductID
         FROM products
         WHERE ProductName = ?`,
        [itemName]
      );

      if (!productResult || !productResult.ProductID) {
        throw new Error(`Product '${itemName}' not found`);
      }

      const { ProductID } = productResult;

      const [inventoryIDResult] = await executeQueryAsync(
        `SELECT InventoryID
        FROM inventory
        WHERE ProductID = ?
        AND OfficeID = ?`,
        [ProductID, OfficeID]
      );

      const { InventoryID } = inventoryIDResult;

      if (!inventoryIDResult || !inventoryIDResult.InventoryID) {
        throw new Error(`Inventory ID not found`);
      }

      await executeQueryAsync(
        `UPDATE inventory
         SET quantity = quantity + ?
         WHERE inventoryID = ?
         AND ProductID = ?`,
        [quantityToAdd, InventoryID, ProductID]
      );
    }
  } catch (error) {
    throw error;
  }
}

async function addInventory(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, ...items } = data;

      await updateInventory(userID, items);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ message: "Employee details updated successfully" })
      );
    });
  } catch (error) {
    //handle server connection errors
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Internal server error", message: error.message })
    );
  }
}

function executeQueryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

async function getPostmasterProfile(req, res) {
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
        `SELECT e.FirstName, e.MiddleInitial, e.LastName, e.PhoneNumber, e.EmailAddress, e.JobTitle, e.AddressID, e.Salary, e.OfficeID, a.StreetAddress, a.City, a.State, a.ZipCode, ul.Username, ul.Pwd
          FROM employees as e
          INNER JOIN addresses AS a ON a.AddressID = e.AddressID
          INNER JOIN user_logins AS ul ON e.UserID = ul.UserID
          WHERE e.UserID = '${userID}'`,
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

async function closeInventory(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, productName } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      pool.query(
        `START TRANSACTION;

        SELECT e.EmployeeID INTO @employeeID
        FROM employees as e
        WHERE e.UserID = '${userID}';

        SELECT ProductID INTO @productID
        FROM products
        WHERE ProductName = '${productName}';

        UPDATE inventory_notifications
        SET MessageRead = 1
        WHERE ProductID = @productID AND
        PostMasterID = @employeeID;
        
        COMMIT;`,
        (error, results) => {
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

async function getPostmasterOffice(req, res) {
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
        `SELECT a.StreetAddress, a.City, a.State, a.ZipCode
          FROM employees as e
          INNER JOIN post_offices AS po ON e.OfficeID = po.OfficeID
          INNER JOIN addresses AS a ON po.AddressID = a.AddressID
          WHERE e.UserID = '${userID}'`,
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
      const { userID, PhoneNumber, EmailAddress } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      pool.query(
        `SELECT UserID FROM customers WHERE EmailAddress = ? AND UserID != ?`,
        [EmailAddress, userID],
        (error, results) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Error querying the database" }));
            return;
          }
          if (results.length > 0) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Email address is already in use" })
            );
            return;
          }

          pool.query(
            `UPDATE employees
          SET PhoneNumber = '${PhoneNumber}', EmailAddress = '${EmailAddress}'
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

async function getEmployeeProfile(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { employeeID } = data;

      if (!employeeID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Employee ID is required" }));
        return;
      }

      pool.query(
        `SELECT e.EmployeeID, e.FirstName, e.MiddleInitial, e.LastName, e.PhoneNumber, e.EmailAddress, e.JobTitle, e.AddressID, e.Salary, e.OfficeID, e.ActivelyEmployed, a.StreetAddress, a.City, a.State, a.ZipCode, ul.Username, ul.Pwd
          FROM employees as e
          INNER JOIN addresses AS a ON a.AddressID = e.AddressID
          INNER JOIN user_logins AS ul ON e.UserID = ul.UserID
          WHERE e.employeeID = '${employeeID}'`,
        [employeeID],
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

async function updateEmployeeAccountDetails(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { employeeID, FirstName, MiddleInitial, LastName } = data;

      if (!employeeID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Employee ID is required" }));
        return;
      }

      pool.query(
        `UPDATE employees
          SET FirstName = '${FirstName}', MiddleInitial = '${MiddleInitial}', LastName = '${LastName}'
          WHERE EmployeeID = '${employeeID}'`,
        [employeeID],
        (updateError, updateResults) => {
          if (updateError) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Error updating data in the database" })
            );
            return;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(updateResults));
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function getEmployeePostOffice(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { employeeID } = data;

      if (!employeeID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Employee ID is required" }));
        return;
      }

      pool.query(
        `SELECT a.StreetAddress, a.City, a.State, a.ZipCode
          FROM employees as e
          INNER JOIN post_offices AS po ON e.OfficeID = po.OfficeID
          INNER JOIN addresses AS a ON po.AddressID = a.AddressID
          WHERE e.employeeID = '${employeeID}'`,
        [employeeID],
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

async function updateEmployeeSalary(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { employeeID, Salary, Username } = data;

      if (!employeeID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Employee ID is required" }));
        return;
      }

      pool.query(
        `UPDATE employees AS e
          INNER JOIN user_logins AS ul ON ul.UserID = e.UserID
          SET Salary = '${Salary}', Username= '${Username}'
          WHERE EmployeeID = '${employeeID}'`,
        [employeeID],
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

async function fireEmployee(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { employeeID } = data;

      if (!employeeID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Employee ID is required" }));
        return;
      }

      pool.query(
        `UPDATE employees AS e
          INNER JOIN user_logins AS ul ON  ul.UserID = e.UserID
          SET ActivelyEmployed = '0', Username= null
          WHERE employeeID = '${employeeID}'`,
        [employeeID],
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
    console.error("Error processing request:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function rehireEmployee(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { employeeID } = data;

      if (!employeeID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Employee ID is required" }));
        return;
      }

      pool.query(
        `UPDATE employees
          SET ActivelyEmployed = '1'
          WHERE employeeID = '${employeeID}'`,
        [employeeID],
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
    console.error("Error processing request:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function getEmployeesUnder(req, res) {
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

      // console.log("Received data:", userID, start, end); // Log received data

      query = `START TRANSACTION;
  
      SELECT OfficeID INTO @officeID
      FROM post_offices 
      WHERE PostMasterID = (SELECT EmployeeID FROM employees WHERE userID = '${userID}');
      
      SELECT e.EmployeeID, CONCAT(e.FirstName, ' ', e.LastName) AS Name, e.JobTitle, e.EmailAddress
      FROM employees AS e
      WHERE e.officeID = @officeID AND e.ActivelyEmployed = 1 AND e.employeeID <> (SELECT EmployeeID FROM employees WHERE userID = '${userID}') ORDER BY e.JobTitle ASC;
      
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

async function deleteParcel(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { parcelID } = data;

      const query = `
        UPDATE parcels
        SET Deleted = 1
        WHERE ParcelID = '${parcelID}';`;

      pool.query(query, (error, results) => {
        if (error) {
          console.log(error);
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
    console.log(error);
  }
}

module.exports = {
  addEmployee,
  updateEmployeeDetails,
  getProductList,
  getNumNotif,
  closeNotifs,
  getInventory,
  addInventory,
  getPostmasterProfile,
  getPostmasterOffice,
  updateAccountDetails,
  updateShippingDetails,
  getEmployeeProfile,
  updateEmployeeAccountDetails,
  getEmployeePostOffice,
  updateEmployeeSalary,
  fireEmployee,
  getInventoryNotifs,
  closeInventory,
  rehireEmployee,
  getEmployeesUnder,
  deleteParcel,
};
