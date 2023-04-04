import fs from 'fs';
import mqtt from 'mqtt';
import { conf } from "./settings";

function sanitizeTopic(topic: string): string {
  // Replace any character that's not a letter, number, underscore, hyphen, or forward slash with an underscore
  const sanitized = topic.replace(/[^A-Za-z0-9_\-/]/g, '_'); 
  // Replace any consecutive forward slashes with a single forward slash
  return sanitized.replace(/\/{2,}/g, '/'); 
}

const client = mqtt.connect(conf.mqtt_address, {
  port: conf.mqtt_port,
  username: conf.mqtt_user,
  password: conf.mqtt_password,
});

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  var actionDone: {[index: string]:any} = {} 
  fs.watch(conf.script_output_folder, { recursive: true }, (eventType, filename) => {
    if (eventType === 'change') {
      if (filename.endsWith('_mqtt.json')) {
	var fullPath = conf.script_output_folder + filename;
        var stats = fs.statSync(fullPath );
        let seconds = +stats.mtime;
        if(actionDone[filename] == seconds) return;
        actionDone[filename] = seconds

        const topic = `${conf.mqtt_topic_prefix}${sanitizeTopic(filename.slice(0, -10))}`;
        const data = fs.readFileSync(fullPath).toString();

        console.log(`Publishing to topic ${topic}: ${data}`);
        client.publish(topic, data);
      }
    }
  });
});

client.on('error', (err) => {
  console.error('Error connecting to MQTT broker:', err);
});