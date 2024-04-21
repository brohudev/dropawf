const pool = require('../Server/database');

async function shipPackage(req, res) {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString(); // Convert buffer to string
      });
  
      req.on("end", async () => {
        const data = JSON.parse(body);
        const {
          senderShippingInfo,
          recipientShippingInfo,
          packagingInfo,
          paymentInfo,
          shippingCost,
          userID
        } = data;
  
        const {
          senderfname,
          senderlname,
          senderemail,
          senderstreetaddress,
          sendercity,
          senderstate,
          senderzipcode,
        } = senderShippingInfo;
  
        const {
          recfname,
          reclname,
          recemail,
          recstreetaddress,
          reccity,
          recstate,
          reczipcode,
        } = recipientShippingInfo;
  
        const { packagingtype, weight, length, width, height } = packagingInfo;
  
        const {
          CardHolderFirstName,
          CardHolderLastName,
          CardNumber,
          paymentexpirationmonth,
          paymentexpirationyear,
          paymentcvv,
        } = paymentInfo;
  
        query = `START TRANSACTION;

        SELECT p.AddressID INTO @officeAddressID
        FROM post_offices as p, employees as e
        WHERE e.UserID = '${userID}' AND
          e.OfficeID = p.OfficeID;

        SELECT EmployeeID INTO @employeeID
        FROM employees
        WHERE UserID = '${userID}';
        
        -- sender
        CALL InsertAddressIfNew('${senderstreetaddress}', '${sendercity}', '${senderstate}', '${senderzipcode}', @currentSenderAddressID);
        
        CALL ShippingInsertCustomerIfNew('${senderfname}', '${senderlname}','${senderemail}', @currentSenderAddressID, @currentSenderCustomerID);
  
        -- receiver
        CALL InsertAddressIfNew('${recstreetaddress}', '${reccity}', '${recstate}', '${reczipcode}', @currentReceiverAddressID);
        
        CALL ShippingInsertCustomerIfNew('${recfname}', '${reclname}', '${recemail}', @currentReceiverAddressID, @currentReceiverCustomerID);
  
        CALL CheckAndInsertPaymentInfo('${CardNumber}', '${paymentcvv}', '${CardHolderFirstName}', '${CardHolderLastName}', '${paymentexpirationmonth}', '${paymentexpirationyear}', @currentPaymentInfoID);
        
        CALL InsertParcelToCorrespondingTable('${packagingtype}', @currentSenderCustomerID, @currentReceiverCustomerID, @officeAddressID, @currentReceiverAddressID, '${height}', '${length}', '${width}', '${weight}', @ParcelID);
  
        SET @newParcelUUID = UUID();
  
        INSERT INTO parcels (ParcelID, ParcelType, ReferenceID)
        VALUES(@newParcelUUID, '${packagingtype}', @ParcelID);      

        INSERT INTO parcel_event (EventID, EventTimeStamp, EventType, EmployeeID, AddressID, ParcelID)
        VALUES (UUID(), NOW(), 'Received', @employeeID, @officeAddressID, @newParcelUUID);
  
        INSERT INTO transactions (TransactionID, TransactionDate, PaymentInfoID, Amount, ParcelID)
        VALUES (UUID(), CURDATE(), @currentPaymentInfoID, ${shippingCost}, @newParcelUUID);
  
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
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Order added successfully" }));
          }
        });
      });
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: "Internal server error: Error updating box information",
        })
      );
    }
  }

  async function getProductList(req, res) {
    try {
      let query = `SELECT ProductName, Price FROM products;`;
  
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

  async function updateInventory(userID, items) {
    try {
      const [officeIdResult] = await executeQueryAsync(
        `SELECT p.OfficeID
         FROM post_offices AS p
         INNER JOIN employees AS e ON p.OfficeID = e.OfficeID
         WHERE e.UserID = ?`,
        [userID]
      );
  
      if (!officeIdResult || !officeIdResult.OfficeID) {
        throw new Error('Office not found for the specified user');
      }
  
      const { OfficeID } = officeIdResult;

      for (const itemName in items) {
        const quantityToSubtract = parseInt(items[itemName]);

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
  
        const [inventoryIDResult] = await executeQueryAsync (
          `SELECT InventoryID, Quantity
          FROM inventory
          WHERE ProductID = ?
          AND OfficeID = ?`,
          [ProductID, OfficeID]
        );
  
        const {InventoryID, Quantity } = inventoryIDResult;

        if (Quantity < quantityToSubtract) {
          const error = new Error('Insufficient Inventory');
          error.errno = 3819;
          throw error;
        }
  
        if (!inventoryIDResult || !inventoryIDResult.InventoryID) {
          throw new Error(`Inventory ID not found`);
        }
  
        await executeQueryAsync(
          `UPDATE inventory
           SET quantity = quantity - ?
           WHERE inventoryID = ?
           AND ProductID = ?`,
          [quantityToSubtract, InventoryID, ProductID]
        );
      }
  
    } catch (error) {
      return { error: 'Updating inventory', status: 409 };
    }
  }
  
  

  async function postPlaceOrder(req,res){
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
  
      req.on("end", async () => {
        const data = JSON.parse(body);
        const { userID, personalInfo, totalCost, paymentInfo, items } = data
  
        const { 
          firstname,
          lastname,
          email,
        } = personalInfo
  
        const {
          paymentfirstname,
          paymentlastname,
          paymentcard,
          expmonth,
          expyear,
          paymentcvv
        } = paymentInfo;

        const {
          ...products
        } = items

        const inventoryUpdateResult = await updateInventory(userID, products);

        if (inventoryUpdateResult && inventoryUpdateResult.error) {
          const { error, status } = inventoryUpdateResult;
          const response = { status, error };
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
          return;
        }
  
        query = `START TRANSACTION;
  
  
        CALL CheckAndInsertPaymentInfo('${paymentcard}', '${paymentcvv}', '${paymentfirstname}', '${paymentlastname}', '${expmonth}', '${expyear}', @currentPaymentInfoID);
  
  
        SELECT CustomerID INTO @customerID
        FROM customers
        WHERE FirstName = '${firstname}' AND
          LastName = '${lastname}' AND
          EmailAddress = '${email}';

        SELECT EmployeeID INTO @employeeID
        FROM employees
        WHERE UserID = '${userID}';
    
        INSERT INTO product_purchases (PurchaseID, CustomerID, PaymentInfoID, PurchaseDate, Amount, OfficeClerkID)
        VALUES (UUID(), @customerID, @currentPaymentInfoID, NOW(), ${totalCost}, @employeeID);
        
        COMMIT;`;
  
        pool.query(query, (error, results) => {
          if (error) {
            console.log(error);
            let statusCode = 500;
            let errorMessage = "Internal Server Error";

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
    } catch(error) {
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

  async function getCustomerPayment(req, res) {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
  
      req.on("end", async () => {
        const data = JSON.parse(body);
        const { Email } = data;
  
        if (!Email) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Sender Email is required" }));
          return;
        }
  
        pool.query(
          `SELECT p.PaymentInfoID, p.CardNumber, p.CVV, p.CardHolderFirstName, p.CardHolderLastName, p.ExpMonth, p.ExpYear 
          FROM payment_info as p
          INNER JOIN customers AS c ON c.PaymentInfoID = p.PaymentInfoID
          WHERE c.EmailAddress = '${Email}'`,
          [Email],
          (error, results, fields) => {
            if (error) {
              res.writeHead(500, { "Content-Type": "application/jso\n" });
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
    postPlaceOrder,
    getProductList,
    shipPackage,
    getCustomerPayment
  };