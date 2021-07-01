const fs = require("fs").promises;
const Discord = require("discord.js");
const logger = require("../utils/logger")
const { commands, categories } = require("../utils/globals")

/**
 * 
 * @param {Discord.Client} client 
 */
module.exports = async (client) => {
    logger.log("> Loading Commands")

    const folder = await fs.readdir('./commands');

    for (const category of folder) {

        logger.log(`>> Loading category ${category}`)
        
        const categoryInfo = require('../commands/' + category + '/.init.js');
        categories.set(category, categoryInfo);

        const files = await fs.readdir('./commands/' + category + '/');

        for (const file of files) {
            if(file === ".init.js") continue;

            try {
                const command = require('../commands/' + category + '/' + file)
                commands.set(command.cmd, { ...command, category });
    
                if(command.alias)
                    for(const alias of command.alias)
                        commands.set(alias, { ...command, category, isCmdAlias: true });
    
                logger.log(`Loaded command: ${command.cmd}`);
            } catch (error) {
                logger.error(`Failed to load: ${file}\n${error}`)
            }
        }

        logger.log(`>> Finished loading category ${category} (${files.length} cmds)`)
    }
}