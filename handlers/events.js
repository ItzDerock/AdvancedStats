const fs = require("fs").promises;
const Discord = require("discord.js");
const logger = require("../utils/logger")

/**
 * 
 * @param {Discord.Client} client 
 */
module.exports = async (client) => {

    logger.log("> Loading Events")

    const folder = await fs.readdir('./events')

    for (const file of folder) {
        try {
            const event = require('../events/' + file);
            client.on(event.event, event.run);
            logger.log(`Loaded event ${file.replace('.js', '')}`)
        } catch (error) {
            logger.error("Failed to load " + file + "\n" + error)
        }
    }

}