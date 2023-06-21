console.log("Hello Xanavi");

const express = require("express");
const fs = require("fs");
const app = express();

// Path to the JSON file for storing the data
const dataFilePath = "automobiles.json";

// Read the existing data from the JSON file
let automobiles = {};
try {
  const data = fs.readFileSync(dataFilePath, "utf8");
  automobiles = JSON.parse(data);
} catch (err) {
  console.error("Failed to read data from the file:", err);
}

// Configure the route to handle GET requests
app.get("/", (req, res) => {
  const { model, mac_address } = req.query;

  if (model && mac_address) {
    // Store the mac_address in the automobiles object
    if (!automobiles[model]) {
      automobiles[model] = [];
    }
    automobiles[model].push(mac_address);
    var quantity = automobiles[model].length;

    // Write the updated data to the JSON file
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(automobiles, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to write data to the file:", err);
      res.status(500).send("Failed to store the mac_address.\n");
      return;
    }

    // Send a response indicating successful storage
    var responseBody = `Successfully stored mac_address "${mac_address}", #${quantity} for model "${model}".\n`
    res
      .status(200)
      .send(resopnseBody);
      console.log(responseBody)
  } else {
    // Send an error response for invalid requests
    res.status(400).send("Invalid request.\n");
  }
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
