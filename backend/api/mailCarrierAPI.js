const pool = require("../Server/database");

/** @brief Expects a json object sent in the body with the following keys: EventType, EmployeeID (sent from the session cookie), AddressID, ParcelID */
async function postCarrierAction(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, parcelInfo } = data;
      const { eventType, streetAddress, city, state, zipCode, parcelID } =
        parcelInfo; // get necessary bits from response

      if (
        !["Received", "In Transit", "Delivered", "Lost"].includes(eventType)
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "sql error: event type was not one of the enumerated types.",
          })
        );
      }
      pool.query(
        `START TRANSACTION;

                SELECT EmployeeID INTO @employeeID
                FROM employees
                WHERE UserID = '${userID}';

                CALL InsertAddressIfNew('${streetAddress}', '${city}', '${state}', '${zipCode}', @addressID);

                INSERT INTO parcel_event (EventID, EventTimeStamp, EventType, EmployeeID, AddressID, ParcelID) 
                VALUES (UUID(), NOW(), '${eventType}', @employeeID, @addressID, '${parcelID}');
                
                COMMIT;`,
        (error, results) => {
          if (error) {
            //send error
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "Internal server error",
                sqlError: error.message,
              })
            );
          } else {
            //send 201
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Parcel event inserted successfully" })
            );
          }
        }
      );
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

async function updateBoxInfo(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const {
        EventID,
        EventTimeStamp,
        EventType,
        EmployeeID,
        AddressID,
        ParcelID,
        parcelStatus,
        parcelId,
      } = data;

      pool.query(
        //heres the sql bits
        `INSERT INTO parcel_event (EventID, EventTimeStamp, EventType, EmployeeID, AddressID, ParcelID) 
                VALUES (?, ?, ?, ?, ?, ?);
                
                UPDATE parcels SET status = ? WHERE parcel_id = ?;`,
        [
          EventID,
          EventTimeStamp,
          EventType,
          EmployeeID,
          AddressID,
          ParcelID,
          parcelStatus,
          parcelId,
        ],

        (error, results) => {
          //handle sql errors
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "Internal server error",
                sqlError: error.message,
              })
            );
          } else {
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Parcel info updated successfully" })
            );
          }
        }
      );
    });
  } catch (error) {
    //handle connection errors
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: "Internal server error: Error updating box information",
      })
    );
  }
}

async function getOfficeList(req, res) {
  console.log("entering...");
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      console.log(data);

      const query = `
      SELECT p.OfficeName, a.StreetAddress, a.City, a.State, a.ZipCode
      FROM post_offices as p, addresses as a
      WHERE p.AddressID = a.AddressID AND
      p.Deleted = 0;`;

      pool.query(query, (error, results) => {
        console.log(results);
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Internal server error",
              sqlError: error.message,
            })
          );
        } else {
          console.log("write");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ results }));
        }
      });
    });
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Internal server error",
        sqlError: error.message,
      })
    );
  }
}

module.exports = {
  postCarrierAction,
  updateBoxInfo,
  getOfficeList,
};
