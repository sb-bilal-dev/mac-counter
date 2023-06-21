console.log("Hello Xanavi");

const { error } = require("console");
const express = require("express");
const fs = require("fs");
const app = express();

// Path to the JSON file for storing the data
const DATA_FILE_PATH = "automobiles.json";

// Read the existing data from the JSON file
let automobiles = initDB();

function initDB() {
    try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify({}));
    }
    
    const data = fs.readFileSync(DATA_FILE_PATH, "utf8");
    return JSON.parse(data);
    } catch (err) {
      console.error("Failed to read data from the file:", err);
      return {}
    }
}

// Configure the route to handle GET requests
app.get("/", (req, res) => {
  const { model, mac_address } = req.query;

  if (model && mac_address) {
    // Store the mac_address in the automobiles object
    if (!automobiles[model]) {
      automobiles[model] = [];
    }

    if (automobiles[model].includes(mac_address)) {
        res.status(202).send(`Mac Address: ${mac_address} for model: ${model} already exist`)
    } else {
        automobiles[model].push(mac_address);
        var quantity = automobiles[model].length;
    
        // Write the updated data to the JSON file
        try {
          fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(automobiles, null, 2), "utf8");
        } catch (err) {
          console.error("Failed to write data to the file:", err);
          res.status(500).send("Failed to store the mac_address.\n");
          return;
        }
    
        // Send a response indicating successful storage
        var responseBody = `Successfully stored mac_address "${mac_address}", #${quantity} for model "${model}".\n`
        res
          .status(200)
          .send(responseBody);
          console.log(responseBody)    
    }
  } else {
    // Send an error response for invalid requests
    res.status(400).send("Invalid request.\n");
  }
});

app.get("/delete_all", (_, res) => {
    try {
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify({}));
        res.status(200).send("SUCCESS, all data cleared")        
    } catch(err) {
        console.error(err)
        res.status(500).send("Unknown error occured: ", error)
    }
})

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server is listening on port 3000.");
});
