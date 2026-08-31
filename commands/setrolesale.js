const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");

const { hasPermission } = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("setrolesale")

        .setDescription("הוספת רול לחנות")

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("הרול למכירה")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("price")
                .setDescription("מחיר הרול במטבעות")
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
                "❌ רק מנהלים יכולים להוסיף רולים לחנות",

                ephemeral:true

            });

        }




        const role =
            interaction.options.getRole("role");


        const price =
            interaction.options.getInteger("price");




        if (price <= 0) {


            return interaction.reply({

                content:
                "❌ המחיר חייב להיות מעל 0",

                ephemeral:true

            });


        }





        const exists =
            db.prepare(`

                SELECT *

                FROM shop_roles

                WHERE guild_id = ?

                AND role_id = ?

            `)
            .get(

                interaction.guild.id,

                role.id

            );





        if (exists) {


            return interaction.reply({

                content:
                "❌ הרול כבר נמצא בחנות",

                ephemeral:true

            });


        }






        db.prepare(`

            INSERT INTO shop_roles

            (

                guild_id,

                role_id,

                price

            )

            VALUES (?, ?, ?)

        `)
        .run(

            interaction.guild.id,

            role.id,

            price

        );





        return interaction.reply({

            content:

`
✅ הרול נוסף לחנות!

🎭 רול:
${role}

💰 מחיר:
${price} מטבעות
`

        });



    }


};