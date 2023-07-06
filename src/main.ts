// Import required modules
import express from "express"; // Express web framework
import bodyParser from "body-parser"; // Middleware for parsing incoming request bodies
import { conf } from "./settings"; // Configuration settings
import * as CcController from "./constant-combinator-controller"; // Controller for handling requests related to constant combinators

// Define pollingTargetIds and eventEmitter variables
export const pollingTargetIds: number[] = conf.pollingTargetIds; // Array of constant combinator IDs to poll for signals
export const eventEmitter = new (require('events').EventEmitter)(); // Event emitter for signaling updates to constant combinator signals

import "./mqtt-publisher"; // Import and initialize MQTT publisher module

// Create an instance of the Express app
const app = express();

// Middleware to parse incoming request bodies as JSON
app.use(bodyParser.json());

// Middleware to set response headers for cross-origin resource sharing (CORS)
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.header("Access-Control-Allow-Methods", "*"); // Allow all HTTP methods
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  ); // Allow the specified headers
  next(); // Move on to the next middleware function
});

// Endpoint to get signals from a specific constant combinator
app.get("/cc/:id/signals", (req, res) => {
  CcController.getSignals(req, res).catch((err) => { // Call the CcController to get signals from a specific constant combinator, and handle any errors
    res.status(500);
    res.send(err);
  });
});

// Endpoint to get a specific signal from a specific constant combinator
app.get("/cc/:id/signal/:signalSlot", (req, res) => {
  CcController.getSignalSlot(req, res).catch((err) => { // Call the CcController to get a specific signal from a specific constant combinator, and handle any errors
    res.status(500);
    res.send(err);
  });
});

// Endpoint to set a specific signal in a specific constant combinator
app.post("/cc/:id/signal/:signalSlot", (req, res) => {
  CcController.setSignalSlot(req, res).catch((err) => { // Call the CcController to set a specific signal in a specific constant combinator, and handle any errors
    res.status(500);
    res.send(err);
  });
});

// Endpoint to delete a specific signal from a specific constant combinator
app.delete("/cc/:id/signal/:signalSlot", (req, res) => {
  CcController.deleteSignalSlot(req, res).catch((err) => { // Call the CcController to delete a specific signal from a specific constant combinator, and handle any errors
    res.status(500);
    res.send(err);
  });
});

// Endpoint to update the polling speed
app.post('/pollingSpeed/:speedMs', (req, res) => {
  // Parse the requested polling speed in milliseconds from the URL parameter
  const pollingSpeedmInMs = parseInt(req.params.speedMs);
  if (pollingSpeedmInMs > 100) {
    // Update the polling speed configuration if it's above the minimum value
    conf.pollingSpeedmInMs = pollingSpeedmInMs;
    // Emit a 'reinitialize' event to reset the polling with the new speed
    eventEmitter.emit('reinitialize');
    // Send a successful response with the new polling speed value
    res.status(200).send([conf.pollingSpeedmInMs]);
  } else {
    // Send a client error response if the requested polling speed is invalid
    res.status(400).send('Provided polling speed is not a valid number or below the minimum of 100 ms')
  }
});

// Endpoint to get the current pollingTargetIds
app.get('/pollingTargetIds', (req, res) => {
  // Send the current polling target IDs array as a response
  res.send(pollingTargetIds);
});

// Endpoint to trigger a reinitialization of the polling with the current configuration
app.post('/reinitialize', (req, res) => {
  // Emit a 'reinitialize' event to reset the polling
  eventEmitter.emit('reinitialize');
  // Send a successful response with the current polling target IDs array
  res.status(200).send(pollingTargetIds);
});

// Endpoint to add a new ID to the pollingTargetIds array
app.post('/pollingTargetId/:id', (req, res) => {
  // Parse the new ID from the URL parameter
  const newId = parseInt(req.params.id);
  // Check if the new ID is valid and not already in the polling target IDs array
  if (newId && !pollingTargetIds.includes(newId)) {
    // Add the new ID to the polling target IDs array
    pollingTargetIds.push(newId);
    // Emit a 'newId' event to signal the addition of a new ID to the polling
    eventEmitter.emit('newId', newId);
    // Send a successful response with the updated polling target IDs array
    res.status(200).send(pollingTargetIds);
  } else {
    // Send a client error response if the new ID is invalid or already exists in the polling target IDs array
    res.status(400).send('Invalid or duplicate id provided');
  }
});


// Endpoint to delete an id from the pollingTargetIds
app.delete('/pollingTargetId/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id); // Parse the ID from the request parameters and convert it to an integer
  const index = pollingTargetIds.indexOf(idToDelete); // Find the index of the ID in the pollingTargetIds array
  if (index > -1) { // If the ID exists in the array
    eventEmitter.emit('deleteId', idToDelete); // Emit the 'deleteId' event with the ID to be deleted
    res.status(200).send(pollingTargetIds); // Send a 200 OK response with the updated pollingTargetIds array
  } else { // If the ID doesn't exist in the array
    res.status(404).send('Id not found in the array'); // Send a 404 Not Found response with an error message
  }
});


app
  .listen(conf.server_port, () => { // Start listening on the server port specified in the configuration
    console.log(`Server listening at ${conf.server_port}`); // Log a message to indicate that the server is listening
  })
  .on("error", (err) => console.error(err)); // Handle any errors that occur during server startup