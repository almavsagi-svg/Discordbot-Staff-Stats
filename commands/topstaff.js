const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("topstaff")
        .setDescription("הצג טבלת צוות"),

    async execute(interaction) {
        await interaction.reply("פקודת topstaff עובדת!");
    }
};