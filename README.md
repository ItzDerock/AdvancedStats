# Advanced Stats » A statistic tracking Discord Bot.

Public already hosted version of the bot can be invited [here](https://discord.com/oauth2/authorize?client_id=743120187565539339&permissions=8&scope=bot)
- Wiki for public bot can be found [here](https://wiki.advancedstats.xyz/en/home)
- Support Discord: https://discord.gg/dstRcACk9U

## Requirements
- A MongoDB host.
- A InfluxDB 3.X host.
- A discord bot application.
    - With the following intents enabled.
    - `PRESENCE INTENT`
    - `SERVER MEMBERS INTENT`
- A working Internet connection.
- Node.js v14+
    - With the accompanying `npm` version.
- [A working node-canvas installation](https://github.com/Automattic/node-canvas)
    - Most likely you will be able to use a prebuilt binary, but in the case that your OS or processor architecture is unsupported, node-canvas will be built on your system, meaning you will need the dependencies listed under the **Compiling** section on the node-canvas Readme.md

## Installation
1. Clone this repository.
2. Change your directory to the directory of the bot. (where the `index.js` file is located)
3. Run `npm install --production`
4. Whilst everything installs, head over to the [Configuration section](#configuration)
5. Run the bot with `node .`

## Configuration
1. Copy the [config.example.json](./config.example.json) file and rename it to `config.json`.
2. Edit the [configuration options](#configuration-options).

### Configuration Options
|Key|Description (value)|Type|
|---|---|---|
|token|Your bot token|String|
|prefix|The bot's prefix|String|
|database.influx.host|The InfluxDB 2.X host url|String|
|database.influx.token|The InfluxDB 2.X token|String|
|database.influx.organization|The InfluxDB 2.X organization|String|
|database.influx.bucket|The InfluxDB 2.X bucket name|String|
|database.influx.nowrite|***OPTIONAL*** Disables writing to the database|Boolean|
|database.mongodb.host|The MongoDB host|String|
|database.mongodb.username|The MongoDB Username|String|
|database.mongodb.password|The MongoDB Password|String|
|database.mongodb.database|The MongoDB Database|String|
|customization.primaryEmbed|Change the primary embed's look|[Embed Object](https://discord.com/developers/docs/resources/channel#embed-object)|
|customization.errorEmbed|Change the error embed's look|[Embed Object](https://discord.com/developers/docs/resources/channel#embed-object)|
