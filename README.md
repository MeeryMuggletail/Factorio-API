# BEWARE: This is a proof of concept!

## TODO

- Allow use of SSL Certificates
- Improve performance
- Increase useability 

# Factorio Circuit API

This lets you control factorio constant combinators via a simple REST API and publish circuit networks to MQTT.
It is a combination of the work done by: https://github.com/DirkHeinke/factorio-constant-combinator-rest-api,
and: https://mods.factorio.com/mod/CircuitHUD-V2. With the addition of combining the two and publishing to MQTT. Then after some development the CircuitHUD-V2 was removed again in favor of RCON to read the circuits

## Setup

- Install Typescript
  - This application is only tested with the Node.js implementation using Node.js and npm to install the required packages. In theory NuGet or Visual Studio implementations should also work but change the way to run the application.
  - For the Node.js version, install a LTS version, for example from https://nodejs.org/en/download
- Install a MQTT Broker like RabbitMQ
- Enable RCON in Factorio
  - hold `Ctrl` + `Alt` and click on Settings in the Factorio menu
  - go to "The Rest"
  - set `local-rcon-socket` and `local-rcon-password`
  - start a new multiplayer game (single player has no rcon)
- Rename `settings_sample.ts` to `settings.ts`
- Adjust settings to reflect your passwords and configuration
- run `npm install` and `npx ts-node-dev src/main.ts ` from the main folder

## API

The constant combinators are identified by the signal R set in slot 20. In the image below you would use `/cc/995/signals`

![Constant Combinator with id R01](/doc/img/cc_r01.png)

GET `/cc/:id/signals` - Get all signals of the circuit network connected to this combinator

GET `/cc/:id/signal/:signalSlot` - Get `signalSlot`

POST `/cc/:id/signal/:signalSlot` - Set `signalSlot`. Body must formatted like this

```
{
    "signalName": "iron-plate",
    "signalType": "item",
    "signalCount": "1"
}
```

DELETE `/cc/:id/signal/:signalSlot` - Unset `signalSlot`

## MQTT

We can modify which constant combinators (again identified by the signal R set in slot 20 of the constant combinator) to publish to MQTT using the following API calls

GET `/pollingTargetIds` - Get all circuits which are being published

POST `/pollingTargetId/:id` - Adds the id to the list and returns the new list

DELETE `/pollingTargetId/:id` - Removes the id from the list and returns the new list

POST `/pollingSpeed/:speedMs` - Sets the new polling speed for all circuits in miliseconds

POST `/reinitialize` - Resets the polling connections

- It is possible to set a default polling array in the settings file using the `pollingTargetIds` property.
- It is possible to change the default pollingSpeed in the settings file.

The hooked up circuit will be published as a JSON object, for example:

```
{
  "green": {
    "item" : {
      "iron-plate": 1,
      "copper-plate": 10,
    },
    "virtual-signal": {
      "signal-r": 2
    }
  }
}

```

## Changelog

- 2023-07-06
  - Circuit-HUD-exporter mod removed in favor of RCON to read data
