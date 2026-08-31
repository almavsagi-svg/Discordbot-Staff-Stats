const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("daily")

        .setDescription("קבלת 5 מטבעות יומיים"),



    async execute(interaction) {


        const userId =
            interaction.user.id;


        const guildId =
            interaction.guild.id;



        const now =
            Date.now();



        const cooldown =
            2 * 60 * 60 * 1000; // שעתיים




        let user =
            db.prepare(`

                SELECT *

                FROM coins

                WHERE user_id = ?

                AND guild_id = ?

            `)
            .get(
                userId,
                guildId
            );





        // אם אין למשתמש חשבון מטבעות

        if (!user) {


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

                userId,

                guildId,

                5,

                now

            );



            return interaction.reply({

                content:

`
💰 קיבלת 5 מטבעות!

💳 יתרה:
5 💰

⏰ תחזור בעוד שעתיים לעוד מטבעות
`

            });


        }





        const timePassed =
            now - user.last_daily;





        if (timePassed < cooldown) {


            const remaining =
                cooldown - timePassed;



            const minutes =
                Math.ceil(
                    remaining / 60000
                );



            return interaction.reply({

                content:

`
❌ כבר לקחת את המטבעות היומיים שלך.

⏰ תחזור בעוד:
${minutes} דקות
`,

                ephemeral:true

            });


        }






        db.prepare(`

            UPDATE coins

            SET

            amount = amount + 5,

            last_daily = ?

            WHERE user_id = ?

            AND guild_id = ?

        `)
        .run(

            now,

            userId,

            guildId

        );





        user =
            db.prepare(`

                SELECT amount

                FROM coins

                WHERE user_id = ?

                AND guild_id = ?

            `)
            .get(

                userId,

                guildId

            );





        return interaction.reply({

            content:

`
💰 קיבלת 5 מטבעות!

💳 יש לך עכשיו:
${user.amount} 💰

⏰ תחזור בעוד שעתיים לעוד מטבעות
`

        });


    }


};