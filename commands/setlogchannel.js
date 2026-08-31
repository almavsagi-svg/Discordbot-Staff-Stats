const {
    SlashCommandBuilder,
    ChannelType
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("setlogchannel")
        .setDescription("הגדרת ערוץ לוגים")

        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("בחר ערוץ לוגים")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),


    async execute(interaction) {


        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );


        if (!allowed) {

            return interaction.reply({
                content: "❌ אין לך הרשאה",
                ephemeral: true
            });

        }



        const channel =
            interaction.options.getChannel("channel");



        db.prepare(
            `
            UPDATE antinuke_settings
            SET log_channel = ?
            WHERE guild_id = ?
            `
        ).run(
            channel.id,
            interaction.guild.id
        );



        await interaction.reply(
            `📋 ערוץ הלוגים נקבע ל־${channel}`
        );

    }

};