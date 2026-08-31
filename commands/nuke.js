const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("nuke")

        .setDescription("מצב חירום לשרת")

        .addStringOption(option =>
            option
                .setName("action")
                .setDescription("בחר פעולה")
                .setRequired(true)

                .addChoices(

                    {
                        name: "🚨 הפעל מצב חירום",
                        value: "on"
                    },

                    {
                        name: "🔓 ביטול מצב חירום",
                        value: "off"
                    }

                )
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
                "❌ רק מנהלים יכולים להשתמש בפקודה",

                ephemeral:true

            });

        }



        const action =
            interaction.options.getString("action");





        // ======================
        // ביטול NUKE
        // ======================

        if(action === "off"){


            db.prepare(`

                INSERT INTO nuke_settings
                (
                    guild_id,
                    active
                )

                VALUES (?,0)

                ON CONFLICT(guild_id)

                DO UPDATE SET
                active = 0

            `)
            .run(
                interaction.guild.id
            );



            return interaction.reply({

                content:
`
🔓 מצב חירום בוטל

השרת חזר למצב רגיל.
`,

                ephemeral:true

            });

        }






        // ======================
        // אישור NUKE
        // ======================


        const buttons =
            new ActionRowBuilder()
            .addComponents(


                new ButtonBuilder()

                    .setCustomId("confirm_nuke")

                    .setLabel("🚨 אישור NUKE")

                    .setStyle(
                        ButtonStyle.Danger
                    ),



                new ButtonBuilder()

                    .setCustomId("cancel_nuke")

                    .setLabel("❌ ביטול")

                    .setStyle(
                        ButtonStyle.Secondary
                    )

            );





        await interaction.reply({

            content:
`
⚠️ **מצב חירום**

האם אתה בטוח?

לאחר אישור:

🔒 משתמשים רגילים יאבדו גישה לחדרים

👑 מנהלים ימשיכו לקבל גישה

`,

            components:[
                buttons
            ],

            ephemeral:true

        });


    }

};