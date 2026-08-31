const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/db");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("topcoins")

        .setDescription("מציג את האנשים עם הכי הרבה מטבעות"),



    async execute(interaction) {



        const users =
            db.prepare(`

                SELECT *

                FROM coins

                WHERE guild_id = ?

                ORDER BY amount DESC

                LIMIT 10

            `)
            .all(
                interaction.guild.id
            );



        if (!users.length) {


            return interaction.reply({

                content:
                "❌ עדיין אין משתמשים עם מטבעות",

                ephemeral:true

            });


        }





        let text = "";



        let place = 1;



        for (const user of users) {


            const member =
                await interaction.guild.members
                .fetch(user.user_id)
                .catch(()=>null);



            const name =
                member
                ? member.user.username
                : "משתמש שעזב";



            let medal = "";



            if(place === 1) medal = "🥇";
            if(place === 2) medal = "🥈";
            if(place === 3) medal = "🥉";



            text +=
`
${medal} **${place}. ${name}**
💰 ${user.amount} מטבעות

`;

            place++;

        }





        const embed =
            new EmbedBuilder()

            .setTitle(
                "🏆 טבלת המטבעות"
            )

            .setDescription(
                text
            )

            .setTimestamp();





        return interaction.reply({

            embeds:[
                embed
            ]

        });



    }


};