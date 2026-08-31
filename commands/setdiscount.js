const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");

const {
    hasPermission
} = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("setdiscount")

        .setDescription("הוספת הנחה לרול בחנות")

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("הרול להנחה")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("percent")
                .setDescription("אחוז הנחה")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("time")
                .setDescription("לכמה דקות ההנחה")
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


        const percent =
            interaction.options.getInteger("percent");


        const time =
            interaction.options.getInteger("time");





        if(percent <= 0 || percent >= 100) {


            return interaction.reply({

                content:
                "❌ אחוז ההנחה חייב להיות בין 1 ל־99",

                ephemeral:true

            });


        }




        if(time <= 0) {


            return interaction.reply({

                content:
                "❌ הזמן חייב להיות מעל 0",

                ephemeral:true

            });


        }





        const expires =
            Date.now() + (time * 60 * 1000);





        db.prepare(`

            DELETE FROM shop_discounts

            WHERE guild_id = ?

            AND role_id = ?

        `)
        .run(

            interaction.guild.id,

            role.id

        );






        db.prepare(`

            INSERT INTO shop_discounts

            (

                guild_id,

                role_id,

                percent,

                expires_at

            )

            VALUES (?, ?, ?, ?)

        `)
        .run(

            interaction.guild.id,

            role.id,

            percent,

            expires

        );






        return interaction.reply({

            content:

`
🏷️ ההנחה הופעלה!

🎭 רול:
${role}

📉 הנחה:
${percent}%

⏰ זמן:
${time} דקות
`

        });


    }


};