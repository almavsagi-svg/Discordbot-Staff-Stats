const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("antinuke")

        .setDescription("ניהול מערכת Anti-Nuke")

        .addStringOption(option =>
            option
                .setName("action")
                .setDescription("פעולה")
                .setRequired(true)
                .addChoices(
                    {
                        name: "הפעל",
                        value: "on"
                    },
                    {
                        name: "כבה",
                        value: "off"
                    },
                    {
                        name: "מצב",
                        value: "status"
                    }
                )
        ),



    async execute(interaction) {


        if (!interaction.guild) {

            return interaction.reply({

                content:
                "❌ הפקודה זמינה רק בשרת",

                ephemeral:true

            });

        }



        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );



        if (!allowed) {

            return interaction.reply({

                content:
                "❌ אין לך הרשאה להשתמש בפקודה הזאת",

                ephemeral:true

            });

        }



        await interaction.deferReply({
            ephemeral:true
        });





        let settings =
            db.prepare(`
                SELECT *
                FROM antinuke_settings
                WHERE guild_id = ?
            `)
            .get(
                interaction.guild.id
            );





        if (!settings) {


            db.prepare(`
                INSERT INTO antinuke_settings
                (
                    guild_id,
                    enabled
                )

                VALUES (?, ?)
            `)
            .run(
                interaction.guild.id,
                0
            );



            settings =
                db.prepare(`
                    SELECT *
                    FROM antinuke_settings
                    WHERE guild_id = ?
                `)
                .get(
                    interaction.guild.id
                );


        }





        const action =
            interaction.options.getString("action");





        if (action === "on") {


            db.prepare(`
                UPDATE antinuke_settings

                SET enabled = 1

                WHERE guild_id = ?
            `)
            .run(
                interaction.guild.id
            );



            return interaction.editReply(
                "🛡️ Anti-Nuke הופעל בהצלחה"
            );


        }





        if (action === "off") {


            db.prepare(`
                UPDATE antinuke_settings

                SET enabled = 0

                WHERE guild_id = ?
            `)
            .run(
                interaction.guild.id
            );



            return interaction.editReply(
                "🔴 Anti-Nuke כובה"
            );


        }





        if (action === "status") {


            return interaction.editReply(
`
🛡️ Anti-Nuke Status

מצב:
${settings.enabled ? "🟢 פעיל" : "🔴 כבוי"}
`
            );


        }


    }

};