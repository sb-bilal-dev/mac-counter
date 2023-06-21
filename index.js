console.log("Hello Xanavi");

const express = require("express");
const app = express();
const Nano = require("nano");

// Connection URL and database name
const couchURL = "http://localhost:5984"; // Replace with your CouchDB URL
const dbName = "your-database-name"; // Replace with your database name

// Initialize CouchDB client and connect to the database
const nano = Nano(couchURL);
const db = nano.db.use(dbName);

// Middleware to ensure the database connection is established before handling requests
app.use((req, res, next) => {
  if (nano.config.url !== couchURL) {
    nano.config.url = couchURL;
    db = nano.db.use(dbName);
  }
  next();
});

// Configure the route to handle GET requests
app.get("/", (req, res) => {
  const { model, mac_address } = req.query;

  if (model && mac_address) {
    const designDoc = "automobiles";
    const viewName = "by_model_and_mac_address";

    // Check if the mac_address already exists for the model
    db.view(designDoc, viewName, { key: [model, mac_address] }, (err, body) => {
      if (err) {
        console.error("Failed to find existing data:", err);
        res.status(500).send("Failed to store the mac_address.\n");
        return;
      }

      const existingData = body.rows[0] && body.rows[0].value;

      if (existingData) {
        console.log("Duplicate mac received: ", mac_address);
        res
          .status(202)
          .send(`Mac Address: ${mac_address} for model: ${model} already exists.`);
      } else {
        // Store the mac_address in the database
        db.insert({ model, mac_address }, (err, body) => {
          if (err) {
            console.error("Failed to insert document:", err);
            res.status(500).send("Failed to store the mac_address.\n");
            return;
          }

          // Send a response indicating successful storage
          db.view(designDoc, viewName, { key: model }, (err, body) => {
            if (err) {
              console.error("Failed to count documents:", err);
              res.status(500).send("Failed to store the mac_address.\n");
              return;
            }

            const quantity = body.rows.length;
            var responseBody = `Successfully stored mac_address "${mac_address}", #${quantity} for model "${model}".\n`;
            res.status(200).send(responseBody);
            console.log(responseBody);
          });
        });
      }
    });
  } else {
    // Send an error response for invalid requests
    res.status(400).send("Invalid request.\n");
  }
});

app.get("/count", (req, res) => {
  const { model } = req.query;

  if (model) {
    const designDoc = "automobiles";
    const viewName = "by_model";

    // Count the number of mac_addresses for the model
    db.view(designDoc, viewName, { key: model }, (err, body) => {
      if (err) {
        console.error("Failed to count documents:", err);
        res.status(500).send("Failed to retrieve the count.\n");
        return;
      }

      const quantity = body.rows.length;
      res.status(200).send(quantity.toString());
    });
  } else {
    res.status(400).send("Provide model.\n");
  }
});

app.get("/delete_all", (_, res) => {
  const designDoc = "automobiles";
  const viewName = "all_documents";

  // Delete all documents from the database
  db.view(designDoc, viewName, (err, body) => {
    if (err) {
      console.error("Failed to delete documents:", err);
      res.status(500).send("Failed to clear data.\n");
      return;
    }

    const docs = body.rows.map((row) => ({
      _id: row.id,
      _rev: row.value.rev,
      _deleted: true,
    }));

    db.bulk({ docs }, (err, body) => {
      if (err) {
        console.error("Failed to delete documents:", err);
        res.status(500).send("Failed to clear data.\n");
        return;
      }

      res.status(200).send("SUCCESS, all data cleared");
    });
  });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
