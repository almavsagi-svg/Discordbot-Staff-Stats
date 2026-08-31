const {
    SlashCommandBuilder,
    ChannelType
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("setwelcome")

        .setDescription("הגדרת חדר ברוכים הבאים")

        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("בחר חדר לשליחת הברוכים הבאים")
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

                content:
                "❌ אין לך הרשאה להשתמש בפקודה הזאת",

                ephemeral: true

            });

        }



        const channel =
            interaction.options.getChannel("channel");



        db.prepare(`
            INSERT INTO welcome_settings
            (guild_id, channel_id)

            VALUES (?, ?)

            ON CONFLICT(guild_id)
            DO UPDATE SET channel_id = excluded.channel_id

        `).run(

            interaction.guild.id,
            channel.id

        );



        await interaction.reply(
`
✅ מערכת ברוכים הבאים הופעלה

חדר:
${channel}
`
        );


    }

};