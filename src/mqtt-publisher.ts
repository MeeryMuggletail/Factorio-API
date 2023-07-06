import mqtt from 'mqtt';
import { conf } from "./settings";
import { pollingTargetIds, eventEmitter } from './main';

// Initialize variables
let pollInterval = conf.pollingSpeedmInMs;
let pollingIntervals: { [id: number]: NodeJS.Timeout } = {};

// Connect to MQTT broker
const mqttClient = mqtt.connect(conf.mqtt_address, {
  port: conf.mqtt_port,
  username: conf.mqtt_user,
  password: conf.mqtt_password,
});

// Define a function to set up a polling loop for a given ID
function setupPolling(id: number) {
  pollingIntervals[id] = setInterval(async () => {
    try {
      // Fetch data from API
      const response = await fetch(`http://localhost:8080/cc/${id}/signals`);
      const jsonData = await response.json();
      
      // Publish data to MQTT broker
      mqttClient.publish(`${id}/`, JSON.stringify(modifyJSONStructure(jsonData)));
    } catch (error) {
      // Handle errors
      deletePolling(id);
      console.error(`Error while polling URL for id ${id}:`, error);
    }
  }, pollInterval);
  
  // Log when polling starts for an ID
  console.log(`Started polling id: ${id} - interval: ${pollInterval}ms`)
}

// Define a function to reinitialize all polling instances
function reinitializePolling() {
  // Reset poll interval to default
  pollInterval = conf.pollingSpeedmInMs;
  
  // Clear all existing polling intervals
  Object.values(pollingIntervals).forEach((interval) => clearInterval(interval));
  pollingIntervals = {};

  // Loop over the ID array and set up polling loops for each ID
  pollingTargetIds.forEach((id) => {
    setupPolling(id);
  });
}

// Define a function to delete polling for a given ID
function deletePolling(idToDelete: number) {
  const index = pollingTargetIds.indexOf(idToDelete);
  if (index > -1) {
    // Remove ID from array
    pollingTargetIds.splice(index, 1);
    
    // Clear polling interval for ID
    clearInterval(pollingIntervals[idToDelete]);
    delete pollingIntervals[idToDelete];
    
    // Log when polling is deleted for an ID
    console.log(`Deleted id: ${idToDelete}`)
  }
}

function modifyJSONStructure (json: any): any {
  type Signal = {
    signalName: string;
    signalType: string;
    signalCount: string;
  }
  
  type SignalByColor = {
    [key: string]: {
      [key: string]: {
        [key: string]: string
      }
    }
  }
    
  const modifiedJson: SignalByColor = {};
  
  Object.keys(json).forEach((color: string) => {
    modifiedJson[color] = {};
    json[color].forEach((signal: Signal) => {
      modifiedJson[color][signal.signalType] = {
        [signal.signalName]: signal.signalCount
      }
    });
  });
  return modifiedJson;
}

// Loop over the initial ID array and set up polling loops for each ID
pollingTargetIds.forEach((id) => {
  setupPolling(id);
});

// Listen for the 'newId' event and set up a polling loop for the new ID
eventEmitter.on('newId', (newId: number) => {
  setupPolling(newId);
});

// Listen for the 'deleteId' event and delete polling for the specified ID
eventEmitter.on('deleteId', (deletedId: number) => {
  deletePolling(deletedId);
});

// Listen for the 'reinitialize' event and reinitialize all polling instances
eventEmitter.on('reinitialize', () => {
  reinitializePolling();
});
