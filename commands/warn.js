const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("warn")
        .setDescription("לתת אזהרה למשתמש")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("המשתמש לקבלת אזהרה")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("סיבת האזהרה")
                .setRequired(true)
        ),



    async execute(interaction) {


        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );


        if (!allowed) {

            return interaction.reply({
                content: "❌ אין לך הרשאה לתת אזהרות",
                ephemeral: true
            });

        }



        const user =
            interaction.options.getUser("user");


        const reason =
            interaction.options.getString("reason");



        const today =
            new Date().toISOString();



        db.prepare(
            `
            INSERT INTO warnings
            (
                guild_id,
                user_id,
                moderator_id,
                reason,
                date
            )
            VALUES (?, ?, ?, ?, ?)
            `
        ).run(

            interaction.guild.id,
            user.id,
            interaction.user.id,
            reason,
            today

        );



        // שליחת DM למשתמש

        try {

            await user.send({

                content:
`
⚠️ **קיבלת אזהרה**

שרת:
${interaction.guild.name}

ניתן על ידי:
${interaction.user}

סיבה:
${reason}

תאריך:
${new Date().toLocaleString("he-IL")}
`

            });


        } catch {

            console.log(
                "לא ניתן לשלוח DM למשתמש"
            );

        }



        await interaction.reply({

            content:
`⚠️ ${user} קיבל אזהרה

סיבה:
${reason}`

        });


    }

};