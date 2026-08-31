const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");

const {
    hasPermission
} = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("setroletime")

        .setDescription("שינוי זמן רול בחנות לזמן מוגבל")

        .addRoleOption(option =>
            option
            .setName("role")
            .setDescription("הרול לשינוי")
            .setRequired(true)
        )

        .addIntegerOption(option =>
            option
            .setName("duration")
            .setDescription("כמה דקות הרול יהיה למשתמש")
            .setRequired(true)
        )

        .addIntegerOption(option =>
            option
            .setName("time")
            .setDescription("לכמה דקות השינוי פעיל")
            .setRequired(true)
        ),



    async execute(interaction) {



        const allowed =
            await hasPermission(
                interaction.member,
                "MANAGER"
            );



        if(!allowed) {


            return interaction.reply({

                content:
                "❌ רק מנהלים יכולים להשתמש בזה",

                ephemeral:true

            });


        }




        const role =
            interaction.options.getRole("role");


        const duration =
            interaction.options.getInteger("duration");


        const time =
            interaction.options.getInteger("time");




        if(duration <= 0 || time <= 0) {


            return interaction.reply({

                content:
                "❌ המספרים חייבים להיות מעל 0",

                ephemeral:true

            });


        }




        const expires =
            Date.now() + (time * 60 * 1000);






        db.prepare(`

            DELETE FROM shop_times

            WHERE guild_id = ?

            AND role_id = ?

        `)
        .run(

            interaction.guild.id,

            role.id

        );






        db.prepare(`

            INSERT INTO shop_times

            (

                guild_id,

                role_id,

                duration,

                expires_at

            )

            VALUES (?, ?, ?, ?)

        `)
        .run(

            interaction.guild.id,

            role.id,

            duration,

            expires

        );





        return interaction.reply({

            content:

`
⏰ זמן רול עודכן!

🎭 רול:
${role}

⌛ זמן קבלה:
${duration} דקות

🕒 תקף למשך:
${time} דקות
`

        });


    }


};