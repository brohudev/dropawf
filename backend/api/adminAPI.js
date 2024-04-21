const pool = require("../Server/database");

//expects a JSON object with the following fields: City, State, ZipCode, Street, FirstName, LastName, OfficeName.
async function addPostOffice(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      // Construct the DELETE query for the post office table
      const query = `START TRANSACTION;

               -- Create address if not existing
               INSERT IGNORE INTO addresses (City, State, ZipCode, StreetAddress)
               VALUES (?, ?, ?, ?);               

               -- Retrieve the AddressID of the newly created or existing address
               SET @addressID = (SELECT AddressID FROM addresses WHERE City = ? AND State = ? AND ZipCode = ? AND StreetAddress = ?);

               -- Get the postmaster ID
               SET @postmasterID = (SELECT EmployeeID FROM employees WHERE FirstName = ? AND LastName = ?);
               
               -- Insert new row into post_offices if postmaster exists
               INSERT INTO post_offices (OfficeID, OfficeName, AddressID, PostMasterID)
               SELECT UUID(), ?, @addressID, @postmasterID FROM DUAL WHERE EXISTS (SELECT * FROM employees WHERE EmployeeID = @postmasterID);
               
               COMMIT;`;
      const values = [
        data.City,
        data.State,
        data.ZipCode,
        data.Street,
        data.City,
        data.State,
        data.ZipCode,
        data.Street,
        data.FirstName,
        data.LastName,
        data.OfficeName,
      ];

      pool.query(query, values, (error, results) => {
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
          console.log(results);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Post office added successfully" })
          );
        }
      });
    });
  } catch (error) {
    // Handle server connection errors
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Internal server error",
        message: "Incorrect request body.",
      })
    );
  }
}

//done
//expects a JSON object with the following fields: OfficeID, which can be sourced from getPostOfficeNames.
async function deletePostOffice(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { OfficeID } = data; // Extract OfficeID from request body

      // Construct the DELETE query for the post office table
      const query = `START TRANSACTION;
                              -- Check if there are employees with this officeid
                              SET @employeeCount = (SELECT COUNT(*) FROM employees WHERE OfficeID = ?);

                              -- If there are no employees, delete the post office
                              IF @employeeCount = 0 THEN
                                   UPDATE post_offices SET Deleted = 1 WHERE OfficeID = ?;
                              END IF;

                              COMMIT;`;

      pool.query(query, [OfficeID, OfficeID], (error, results) => {
        // Execute query and handle SQL errors
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
            JSON.stringify({ message: "Post office deleted successfully" })
          );
        }
      });
    });
  } catch (error) {
    // Handle server connection errors
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Internal server error",
        message: "Incorrect request body.",
      })
    );
  }
}

//done
async function getPostOfficeDetails(req, res) {
  try {
    const query = `
      SELECT 
        po.OfficeID, 
        po.OfficeName, 
        e.FirstName, 
        e.LastName, 
        a.StreetAddress, 
        a.City, 
        a.State, 
        a.ZipCode 
      FROM post_offices po
      INNER JOIN employees e ON po.PostMasterID = e.EmployeeID
      INNER JOIN addresses a ON po.AddressID = a.AddressID
      WHERE po.Deleted = 0 AND e.JobTitle = 'postmaster'
    `;
    pool.query(query, (error, results) => {
      if (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Internal server error",
            sqlError: error.message,
          })
        );
      } else {
        let offices = {};
        for (let i = 0; i < results.length; i++) {
          let row = results[i];
            offices[i] = {
            OfficeID: row.OfficeID,
            OfficeName: row.OfficeName,
            PostmasterName: row.FirstName + ' ' + row.LastName,
            Address: {
              Street: row.StreetAddress,
              City: row.City,
              State: row.State,
              Zip: row.ZipCode
            }
            };
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(offices));
      }
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Internal server error", message: error.message })
    );
  }
}

async function ensurePostOfficeEmpty(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { officeID } = data; // Extract officeID from request body
      const query = `SELECT COUNT(*) AS EmployeeCount
                     FROM employees
                     WHERE OfficeID = ? AND ActivelyEmployed = 1;`;
      pool.query(query, [officeID], (error, results) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Internal server error",
              sqlError: error.message,
            })
          );
        } else {
          if (results.length > 0) {
            res.writeHead(409, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "Conflict",
                message: "Office is not empty",
              })
            );
          } else {
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Office is empty" }));
          }
        }
      });
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Internal server error", message: error.message })
    );
  }
}

//done
//the OfficeID parameter expects the OfficeID of the post office
async function updatePostOffice(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { postmasterName, OfficeID, address, OfficeName } = data; // Extract data

      console.log(data);

      let query = `START TRANSACTION;\n`; // Start a transaction
      query += `UPDATE addresses SET City = ?, State = ?, ZipCode = ?, StreetAddress = ? WHERE AddressID = (SELECT AddressID FROM post_offices WHERE OfficeID = ?);\n`; // Update the address
      query += `UPDATE post_offices SET PostMasterID = (SELECT EmployeeID FROM employees WHERE FirstName = ? AND LastName = ?), OfficeName = ? WHERE OfficeID = ?;\n`; // Update post office tuple
      query += `COMMIT;`; // Commit the transaction

      const values = [
        address.City,
        address.State,
        address.ZipCode,
        address.Street,
        OfficeID,
        postmasterName.firstName,
        postmasterName.lastName,
        OfficeName,
        OfficeID,
      ];

      pool.query(query, values, (error) => {
        //execute querry and handle sql errors
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
          res.end(
            JSON.stringify({ message: "Post office details updated successfully" })
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

module.exports = {
  addPostOffice,
  deletePostOffice,
  updatePostOffice,
  getPostOfficeDetails,
  ensurePostOfficeEmpty,
};
