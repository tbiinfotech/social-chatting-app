"use strict";
const fs = require("fs"),
  path = require("path");
const connectDB = require("./db/connect");
require("dotenv");
require("dotenv").config({
  path: __dirname + "/.env",
});
const bodyParser = require("body-parser");

// Set Global
global.appRoot = __dirname;

const express = require("express");
const cors = require("cors");

// initiate App with express module.
let app = express();
app.use(cors());
connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Include Services API File
app.use(require("./src/Services"));


// app.use(express.static(path.join(__dirname, "./react/dist")));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./react/dist/index.html"));
// });

/*** Create HTTPs server. ***/
let http_options = {};
let https = require("https");

console.log("SITE_ENVIRONMENT", process.env.SITE_ENVIRONMENT);

/*** Get port from environment and store in Express. ***/

if (false) {
  console.log("production Environment");
  http_options = {
    ...http_options,
    key: fs.readFileSync("/etc/apache2/ssl/private.key"),
    cert: fs.readFileSync("/etc/apache2/ssl/STAR_brstdev_com.crt"),
    ca: [fs.readFileSync("/etc/apache2/ssl/My_CA_Bundle.ca-bundle")],
  };

  /** Create an HTTPS service identical to the HTTP service. **/
  const https_port = process.env.HTTPS_PORT || "6092";
  var httpsServer = https.createServer(http_options, app);
  httpsServer.listen(https_port, () => {
    console.log(`httpsServer App started on port ${https_port}`);
  });
} else {
  console.log("Developement Environment");
  const http_port = process.env.HTTP_PORT || 8000;
  const httpServer = require("http").Server(app);
  httpServer.listen(http_port, function () {
    console.log(`httpServer App started on port ${http_port}`);
  });
}

