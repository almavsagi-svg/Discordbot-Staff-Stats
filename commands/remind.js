const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("remind")

        .setDescription("יצירת תזכורת בפרטי")

        .addIntegerOption(option =>
            option
                .setName("minutes")
                .setDescription("בעוד כמה דקות להזכיר לך")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("מה להזכיר לך")
                .setRequired(true)
        ),



    async execute(interaction) {



        const minutes =
            interaction.options.getInteger("minutes");


        const message =
            interaction.options.getString("message");



        if (minutes <= 0) {

            return interaction.reply({

                content:
                "❌ הזמן חייב להיות מעל 0 דקות",

                ephemeral:true

            });

        }





        // בדיקה שיש לו פחות מ-5 תזכורות היום

        const today =
            Date.now() - (24 * 60 * 60 * 1000);



        const count =
            db.prepare(`

                SELECT COUNT(*) AS amount

                FROM reminders

                WHERE user_id = ?

                AND created_at > ?

            `)
            .get(
                interaction.user.id,
                today
            );





        if (count.amount >= 5) {


            return interaction.reply({

                content:
                "❌ הגעת למקסימום של 5 תזכורות ביום",

                ephemeral:true

            });


        }





        const remindTime =
            Date.now() + (minutes * 60 * 1000);





        db.prepare(`

            INSERT INTO reminders

            (

                user_id,

                guild_id,

                message,

                remind_time,

                created_at

            )

            VALUES (?, ?, ?, ?, ?)

        `)
        .run(

            interaction.user.id,

            interaction.guild.id,

            message,

            remindTime,

            Date.now()

        );





        return interaction.reply({

            content:

`
✅ שמרתי לך תזכורת!

⏰ בעוד:
${minutes} דקות

📝 הודעה:
${message}
`,

            ephemeral:true

        });


    }


};