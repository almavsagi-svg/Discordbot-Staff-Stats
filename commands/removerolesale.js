const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");

const {
    hasPermission
} = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("removerolesale")

        .setDescription("הורדת רול מהחנות")

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("הרול להורדה מהמכירה")
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
                "❌ רק מנהלים יכולים להסיר רולים מהחנות",

                ephemeral:true

            });


        }





        const role =
            interaction.options.getRole("role");





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





        if(!exists) {


            return interaction.reply({

                content:
                "❌ הרול לא נמצא בחנות",

                ephemeral:true

            });


        }





        db.prepare(`

            DELETE FROM shop_roles

            WHERE guild_id = ?

            AND role_id = ?

        `)
        .run(

            interaction.guild.id,

            role.id

        );





        return interaction.reply({

            content:

`
✅ הרול ירד מהחנות

🎭 רול:
${role}
`

        });


    }


};