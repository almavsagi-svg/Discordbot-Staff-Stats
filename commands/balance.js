const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("balance")

        .setDescription("בדיקת כמות המטבעות שלך"),



    async execute(interaction) {


        const user = db.prepare(`

            SELECT amount

            FROM coins

            WHERE user_id = ?

            AND guild_id = ?

        `)
        .get(

            interaction.user.id,

            interaction.guild.id

        );



        if (!user) {


            return interaction.reply({

                content:
                "💰 אין לך עדיין מטבעות.",

                ephemeral:true

            });


        }



        return interaction.reply({

            content:

`
💳 היתרה שלך:

💰 ${user.amount} מטבעות
`

        });


    }


};