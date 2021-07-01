const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
    /**
     * 
     * @param {Date} date
     */
    formatTime: date => {
        if(!date) date = new Date();

        let hh = date.getHours();
        let mm = date.getMinutes();
        let ss = date.getSeconds();

        if(mm < 10) mm = `0${mm}`
        if(hh < 10) hh = `0${hh}`
        if(ss < 10) ss = `0${ss}`

        return `${hh}:${mm}:${ss}`
    },

    primaryEmbed: (title, description) => new Discord.MessageEmbed({ title, description, ...config.customization.primaryEmbed }),
    errorEmbed: (title, description) => new Discord.MessageEmbed({ title, description, ...config.customization.errorEmbed })
}