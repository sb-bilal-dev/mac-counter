console.log("Hello Xanavi");

const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");

// Connection URI and database name
const mongoURI = "mongodb://localhost:27017"; // Replace with your MongoDB connection URI
const dbName = "your-database-name"; // Replace with your database name

// Initialize MongoDB client and connect to the database
const client = new MongoClient(mongoURI);

// Middleware to ensure the database connection is established before handling requests
app.use((req, res, next) => {
  if (!client.isConnected) {
    client.connect()
      .then(() => {
        req.db = client.db(dbName);
        next();
      })
      .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
        res.status(500).send("Failed to connect to MongoDB.\n");
      });
  } else {
    req.db = client.db(dbName);
    next();
  }
});

// Configure the route to handle GET requests
app.get("/", (req, res) => {
  const { model, mac_address } = req.query;

  if (model && mac_address) {
    const collection = req.db.collection("automobiles");

    // Check if the mac_address already exists for the model
    collection.findOne({ model, mac_address })
      .then((existingData) => {
        if (existingData) {
          console.log("Duplicate mac received: ", mac_address);
          res.status(202).send(`Mac Address: ${mac_address} for model: ${model} already exists.`);
        } else {
          // Store the mac_address in the database
          collection.insertOne({ model, mac_address })
            .then(() => {
              // Send a response indicating successful storage
              collection.countDocuments({ model })
                .then((quantity) => {
                  var responseBody = `Successfully stored mac_address "${mac_address}", #${quantity} for model "${model}".\n`;
                  res.status(200).send(responseBody);
                  console.log(responseBody);
                })
                .catch((err) => {
                  console.error("Failed to count documents:", err);
                  res.status(500).send("Failed to store the mac_address.\n");
                });
            })
            .catch((err) => {
              console.error("Failed to insert document:", err);
              res.status(500).send("Failed to store the mac_address.\n");
            });
        }
      })
      .catch((err) => {
        console.error("Failed to find existing data:", err);
        res.status(500).send("Failed to store the mac_address.\n");
      });
  } else {
    // Send an error response for invalid requests
    res.status(400).send("Invalid request.\n");
  }
});

app.get("/count", (req, res) => {
  const { model } = req.query;
  
  if (model) {
    const collection = req.db.collection("automobiles");

    // Count the number of mac_addresses for the model
    collection.countDocuments({ model })
      .then((quantity) => {
        res.status(200).send(quantity.toString());
      })
      .catch((err) => {
        console.error("Failed to count documents:", err);
        res.status(500).send("Failed to retrieve the count.\n");
      });
  } else {
    res.status(400).send("Provide model.\n");
  }
});

app.get("/delete_all", (_, res) => {
  const collection = req.db.collection("automobiles");

  // Delete all documents from the collection
  collection.deleteMany({})
    .then(() => {
      res.status(200).send("SUCCESS, all data cleared");
    })
    .catch((err) => {
      console.error("Failed to delete documents:", err);
      res.status(500).send("Failed to clear data.\n");
    });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
