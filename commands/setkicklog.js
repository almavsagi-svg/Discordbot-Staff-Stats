const {
    SlashCommandBuilder,
    ChannelType
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("setkicklog")

        .setDescription("הגדרת חדר לוג קיקים")

        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("בחר חדר ללוג קיקים")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),



    async execute(interaction) {


        const allowed =
            await hasPermission(
                interaction.member,
                "MANAGER"
            );


        if (!allowed) {

            return interaction.reply({

                content:
                "❌ אין לך הרשאה",

                ephemeral:true

            });

        }



        const channel =
            interaction.options.getChannel("channel");



        db.prepare(`
            INSERT INTO kick_logs
            (
                guild_id,
                channel_id
            )

            VALUES (?, ?)

            ON CONFLICT(guild_id)

            DO UPDATE SET

            channel_id = excluded.channel_id

        `).run(

            interaction.guild.id,

            channel.id

        );



        await interaction.reply({

            content:
            `✅ חדר לוג קיקים הוגדר:

${channel}`,

            ephemeral:true

        });


    }

};