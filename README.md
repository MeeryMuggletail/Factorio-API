# Factorio Circuit API

This lets you control factorio constant combinators via a simple REST API amd publish circuit networks to MQTT.
It is a combination of the work done by: https://github.com/DirkHeinke/factorio-constant-combinator-rest-api,
and: https://mods.factorio.com/mod/CircuitHUD-V2. With the addition of combining the two and publishing to MQTT.

## Setup

- Move the Circuit-HUD-exporter folder to your Factorio mod folder
- Install a MQTT Broker like RabbitMQ
- Enable RCON in Factorio
  - hold `Ctrl` + `Alt` and click on Settings in the Factorio menu
  - go to "The Rest"
  - set `local-rcon-socket` and `local-rcon-password`
  - start a new multiplayer game (single player has no rcon)
- Rename `settings_sample.ts` to `settings.ts`
- Adjust settings
- run `npm install` and `npx ts-node-dev src/main.ts `

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

Hook the new constant combinator up to a network you want to publish to MQTT. You can name the combinator, this will be used as the MQTT Topic name for that network. You can have multiple combinators to publish to multiple topics. The combinator has many useful additional features like filtering. It is a copy of: https://mods.factorio.com/mod/CircuitHUD-V2.
The HUD display update time is also used as publishing interval (in game ticks)

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

## TODO

- Allow use of SSL Certificates
- Clean up the script-output folder on startup
- Improve performance
- Increase useability 