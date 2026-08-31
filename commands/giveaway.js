const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/db");

const {
    hasPermission
} = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("giveaway")

        .setDescription("יצירת הגרלת מטבעות")

        .addIntegerOption(option =>
            option
            .setName("coins")
            .setDescription("כמות המטבעות לזוכה")
            .setRequired(true)
        )

        .addIntegerOption(option =>
            option
            .setName("time")
            .setDescription("זמן ההגרלה בדקות")
            .setRequired(true)
        ),



    async execute(interaction) {


        const allowed =
            await hasPermission(
                interaction.member,
                "MANAGER"
            );


        if(!allowed){

            return interaction.reply({

                content:
                "❌ רק מנהלים יכולים ליצור הגרלות",

                ephemeral:true

            });

        }



        const coins =
            interaction.options.getInteger("coins");


        const time =
            interaction.options.getInteger("time");



        if(coins <= 0 || time <= 0){

            return interaction.reply({

                content:
                "❌ המספרים חייבים להיות מעל 0",

                ephemeral:true

            });

        }




        const button =
            new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()

                .setCustomId("join_giveaway")

                .setLabel("🎉 השתתפות")

                .setStyle(ButtonStyle.Success)

            );




        const message =
            await interaction.channel.send({

                content:

`
🎉 **הגרלת מטבעות**

💰 פרס:
${coins} מטבעות

⏰ מסתיים בעוד:
${time} דקות

לחץ על הכפתור כדי להשתתף!
`,

                components:[
                    button
                ]

            });



        const endTime =
            Date.now() + (time * 60 * 1000);



        db.prepare(`

            INSERT INTO giveaways

            (

                guild_id,

                channel_id,

                message_id,

                coins,

                end_time,

                participants

            )

            VALUES (?, ?, ?, ?, ?, ?)

        `)
        .run(

            interaction.guild.id,

            interaction.channel.id,

            message.id,

            coins,

            endTime,

            JSON.stringify([])

        );



        await interaction.reply({

            content:
            "✅ ההגרלה נוצרה",

            ephemeral:true

        });



    }


};