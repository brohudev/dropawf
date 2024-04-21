const pool = require('../Server/database');

/** @brief returns all the tuples of deliveryRoutes that match the parcelID passed into the link. */
async function handleTrackPackageRequest(req, res) {

  try {
    const { packageId } = req.body; //get id

    let sqlquery = 'SELECT * FROM parcel_event WHERE ParcelID = ?';
    try {
      pool.query(sqlquery, [packageId], (error, results) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error', message : error.message }));
        } else {
          if (results.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results[0]));
            
          } else {//sql didnt find anything. 
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Package not found' }));
          }
        }
      });
    } catch (error) { //there was a network issue
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  } catch (error) { //didnt get the right JSON in request body. 
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Request Body does not contain the right parameters or is empty. Please send packageId as JSON in the request body.'}));
  }
 
}

module.exports = {
  handleTrackPackageRequest
};