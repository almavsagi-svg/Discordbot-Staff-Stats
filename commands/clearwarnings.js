const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("clearwarnings")

        .setDescription("מחיקת כל האזהרות של משתמש")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("בחר משתמש")
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



        const user =
            interaction.options.getUser("user");



        const result = db.prepare(
            `
            DELETE FROM warnings
            WHERE guild_id = ?
            AND user_id = ?
            `
        ).run(

            interaction.guild.id,
            user.id

        );



        if (result.changes === 0) {

            return interaction.reply({

                content:
                `⚠️ ל-${user} אין אזהרות למחיקה`,

                ephemeral: true

            });

        }



        await interaction.reply(
`
🗑️ נמחקו כל האזהרות של ${user}

בוצע על ידי:
${interaction.user}
`
        );


    }

};