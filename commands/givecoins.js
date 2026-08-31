const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");

const {
    hasPermission
} = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("givecoins")

        .setDescription("נתינת מטבעות למשתמש")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("למי לתת מטבעות")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("כמות המטבעות")
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
                "❌ רק מנהלים יכולים לתת מטבעות",

                ephemeral:true

            });


        }




        const user =
            interaction.options.getUser("user");


        const amount =
            interaction.options.getInteger("amount");





        if (amount <= 0) {


            return interaction.reply({

                content:
                "❌ הכמות חייבת להיות מעל 0",

                ephemeral:true

            });


        }






        const exists =
            db.prepare(`

                SELECT *

                FROM coins

                WHERE user_id = ?

                AND guild_id = ?

            `)
            .get(

                user.id,

                interaction.guild.id

            );






        if (exists) {


            db.prepare(`

                UPDATE coins

                SET amount = amount + ?

                WHERE user_id = ?

                AND guild_id = ?

            `)
            .run(

                amount,

                user.id,

                interaction.guild.id

            );



        } else {



            db.prepare(`

                INSERT INTO coins

                (

                    user_id,

                    guild_id,

                    amount,

                    last_daily

                )

                VALUES (?, ?, ?, ?)

            `)
            .run(

                user.id,

                interaction.guild.id,

                amount,

                0

            );


        }





        return interaction.reply({

            content:

`
💰 נוספו מטבעות!

👤 משתמש:
${user}

➕ כמות:
${amount} מטבעות
`

        });


    }


};