const url = require("url");
const mysql = require("mysql");
const pool = require("../Server/database");

async function getEmployeeReport(req, res) {
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

      query = `START TRANSACTION;

  SELECT OfficeID INTO @officeID
      FROM post_offices 
      WHERE PostMasterID = (SELECT EmployeeID FROM employees WHERE userID = '${userID}');
  
      SELECT E.employeeID, E.FirstName, E.LastName, E.JobTitle, E.OfficeID, P.EventType, P.ParcelID, P.EventTimeStamp
      FROM employees AS E
      INNER JOIN parcel_event AS P ON E.employeeID = P.EmployeeID
      WHERE E.officeID = @officeID AND P.EventTimeStamp BETWEEN '${start}' AND '${end}'
      ORDER BY E.employeeID, P.EventTimeStamp DESC;
      
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

async function getOrderReport(req, res) {
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

      query = `START TRANSACTION;
      
      SELECT OfficeID INTO @officeID
      FROM post_offices 
      WHERE PostMasterID = (SELECT EmployeeID FROM employees WHERE userID = '${userID}');
        
      SELECT 
          p.ParcelType, 
          t.TransactionDate, 
          p.ParcelID, 
          s.FirstName AS SenderFirstName, 
          s.LastName AS SenderLastName, 
          sa.StreetAddress AS SenderStreetAddress, 
          sa.City AS SenderCity, 
          sa.State AS SenderState, 
          sa.ZipCode AS SenderZipCode,
          r.FirstName AS ReceiverFirstName, 
          r.LastName AS ReceiverLastName, 
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
          po.OfficeID = @officeID AND p.Deleted = 0 AND pe.EventType = 'Received' AND t.TransactionDate BETWEEN '${start}' AND '${end}'

      UNION DISTINCT

      SELECT DISTINCT
          p.ParcelType, 
          t.TransactionDate, 
          p.ParcelID,
          s.FirstName AS SenderFirstName, 
          s.LastName AS SenderLastName, 
          sa.StreetAddress AS SenderStreetAddress, 
          sa.City AS SenderCity, 
          sa.State AS SenderState, 
          sa.ZipCode AS SenderZipCode,
          r.FirstName AS ReceiverFirstName, 
          r.LastName AS ReceiverLastName, 
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
          po.OfficeID = @officeID AND pe.EventType = 'Received' AND t.TransactionDate BETWEEN '${start}' AND '${end}';



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

async function getRevenueReport(req, res) {
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
      FROM post_offices 
      WHERE PostMasterID = (SELECT EmployeeID FROM employees WHERE userID = '${userID}');
      
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

async function getAdminRevenueReport(req, res) {
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
      WHERE pp.purchaseDate BETWEEN '${start}' AND '${end}'
      
      UNION 
      
      SELECT t.transactionDate, t.Amount, 'transactions' AS TableName
      FROM transactions AS t 
      WHERE t.transactionDate BETWEEN '${start}' AND '${end}' AND parcelID IN (
          SELECT DISTINCT parcelID 
          FROM parcel_event
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

async function getRevenueTotal(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, start, end, type } = data;

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
      
      SELECT sum(pp.Amount) AS ProductPurchasesAmount, 'product_purchases' AS TableName
      FROM product_purchases AS pp 
      WHERE OfficeClerkID IN (SELECT employeeID FROM employees WHERE officeID = @officeID) 
      AND pp.purchaseDate BETWEEN '${start}' AND '${end}'
      
      UNION 
      
      SELECT sum(t.Amount), 'transactions' AS TableName
      FROM transactions AS t 
      WHERE parcelID IN (
      SELECT DISTINCT parcelID 
      FROM parcel_event
      WHERE EmployeeID IN (SELECT EmployeeID FROM employees WHERE OfficeID = @officeID)) 
      AND t.transactionDate BETWEEN '${start}' AND '${end}';
      
      
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

async function getAdminRevenueTotal(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { userID, start, end, type } = data;

      if (!userID) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User ID is required" }));
        return;
      }

      // console.log("Received data:", userID, start, end); // Log received data

      query = `START TRANSACTION;      
      SELECT sum(pp.Amount) AS ProductPurchasesAmount, 'product_purchases' AS TableName
      FROM product_purchases AS pp 
      WHERE OfficeClerkID IN (SELECT employeeID FROM employees) 
      AND pp.purchaseDate BETWEEN '${start}' AND '${end}'
      
      UNION 
      
      SELECT sum(t.Amount), 'transactions' AS TableName
      FROM transactions AS t 
      WHERE parcelID IN (
      SELECT DISTINCT parcelID 
      FROM parcel_event
      WHERE EmployeeID IN (SELECT EmployeeID FROM employees)) 
      AND t.transactionDate BETWEEN '${start}' AND '${end}';
      
      
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

async function getAdminRevenueReportByOffice(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { poName, start, end } = data;

      // console.log("Received data:", userID, start, end); // Log received data
      query = `START TRANSACTION;
      SELECT OfficeID INTO @officeID
      FROM post_offices
      WHERE OfficeName = '${poName}';
            
      SELECT pp.purchaseDate, pp.Amount, 'product_purchases' AS TableName
      FROM product_purchases AS pp 
      WHERE OfficeClerkID IN (SELECT employeeID FROM employees WHERE OfficeID = @officeID)
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

async function getAdminRevenueTotalByOffice(req, res) {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on("end", async () => {
      const data = JSON.parse(body);
      const { poName, start, end } = data;

      // console.log("Received data:", userID, start, end); // Log received data

      query = `START TRANSACTION;
      SELECT OfficeID INTO @officeID
      FROM post_offices 
      WHERE OfficeName = '${poName}';
      
      SELECT sum(pp.Amount) AS ProductPurchasesAmount, 'product_purchases' AS TableName
      FROM product_purchases AS pp 
      WHERE OfficeClerkID IN (SELECT employeeID FROM employees WHERE officeID = @officeID) 
      AND pp.purchaseDate BETWEEN '${start}' AND '${end}'
      
      UNION 
      
      SELECT sum(t.Amount), 'transactions' AS TableName
      FROM transactions AS t 
      WHERE parcelID IN (
      SELECT DISTINCT parcelID 
      FROM parcel_event
      WHERE EmployeeID IN (SELECT EmployeeID FROM employees WHERE OfficeID = @officeID)) 
      AND t.transactionDate BETWEEN '${start}' AND '${end}';
      COMMIT;`;

      pool.query(query, (error, results) => {
        console.log(results);
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
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: "Internal server error: Error getting sent packages",
      })
    );
  }
}

async function getRevenueByClerk(req, res) {
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

      query = `START TRANSACTION;
  
     
      SELECT OfficeID INTO @officeID
      FROM post_offices 
      WHERE PostMasterID = (SELECT EmployeeID FROM employees WHERE userID = '${userID}');


      SELECT CONCAT(e.FirstName, " ", e.Lastname) AS Name, 
            e.employeeID, 
            e.jobTitle, 
            SUM(pp.Amount) AS TotalAmount,
            COUNT(pp.Amount) AS Occurances
      FROM employees AS e
      JOIN product_purchases AS pp ON e.EmployeeID = pp.OfficeClerkID
      WHERE e.jobTitle = 'officeclerk' 
      AND e.officeID = @officeID 
      GROUP BY e.FirstName, e.Lastname, e.employeeID, e.jobTitle

      UNION 

      SELECT CONCAT(e.FirstName, " ", e.Lastname) AS Name, 
            e.employeeID, 
            e.jobTitle, 
            0 AS TotalAmount,
            0 AS Occurances
      FROM employees AS e
      WHERE e.jobTitle = 'officeclerk' 
      AND e.officeID = @officeID 
      AND e.EmployeeID NOT IN (
          SELECT pp.OfficeClerkID
          FROM product_purchases AS pp
          WHERE pp.Amount > 0
      )
      GROUP BY e.FirstName, e.Lastname, e.employeeID, e.jobTitle;
            
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

async function getRevenueByCourier(req, res) {
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

      query = `START TRANSACTION;

      SELECT OfficeID INTO @officeID
      FROM post_offices 
      WHERE PostMasterID = (
          SELECT EmployeeID 
          FROM employees 
          WHERE userID = '${userID}'
      );

      WITH RankedEvents AS (
          SELECT 
              pe.eventID,
              pe.parcelID,
              pe.employeeID,
              CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName,
              pe.EventTimeStamp,
              t.amount AS TransactionAmount,
              ROW_NUMBER() OVER(PARTITION BY pe.parcelID ORDER BY pe.EventTimeStamp ASC) AS rn
          FROM courier.parcel_event AS pe
          JOIN transactions AS t ON pe.parcelID = t.ParcelID
          JOIN employees AS e ON pe.employeeID = e.employeeID
          WHERE e.OfficeID = @OfficeID
      )

      SELECT 
          employeeID,
          EmployeeName,
          COUNT(employeeID) AS Occurrences,
          SUM(TransactionAmount) AS TotalAmount
      FROM RankedEvents
      WHERE rn = 1
      GROUP BY employeeID, EmployeeName

      UNION 

      SELECT 
          e.employeeID, 
          CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName,
          0 AS Occurrences, 
          0 AS TotalAmount
      FROM employees AS e 
      WHERE e.employeeID NOT IN (
          SELECT employeeID
          FROM RankedEvents
          WHERE rn = 1
      ) AND e.officeID = @officeID AND e.employeeID <> (SELECT EmployeeID 
          FROM employees 
          WHERE userID = '${userID}')
      ORDER BY TotalAmount DESC;
         
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

module.exports = {
  getEmployeeReport,
  getOrderReport,
  getRevenueReport,
  getRevenueTotal,
  getRevenueByClerk,
  getRevenueByCourier,
  getAdminRevenueReport,
  getAdminRevenueTotal,
  getAdminRevenueReportByOffice,
  getAdminRevenueTotalByOffice,
};
