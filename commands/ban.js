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

        .setName("ban")

        .setDescription("בקשת באן למשתמש")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("בחר משתמש")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("סיבת הבאן")
                .setRequired(true)
        ),



    async execute(interaction) {


        // בדיקת מנהל
        const manager =
            await hasPermission(
                interaction.member,
                "MANAGER"
            );



        // בדיקת צוות
        const staffRoles =
            db.prepare(`
                SELECT role_id
                FROM staff_roles
                WHERE guild_id = ?
            `)
            .all(
                interaction.guild.id
            );



        const isStaff =
            staffRoles.some(role =>
                interaction.member.roles.cache.has(
                    role.role_id
                )
            );



        if (!manager && !isStaff) {

            return interaction.reply({

                content:
                "❌ אין לך הרשאה",

                ephemeral:true

            });

        }



        const user =
            interaction.options.getUser("user");



        const reason =
            interaction.options.getString("reason");



        const member =
            await interaction.guild.members
            .fetch(user.id)
            .catch(()=>null);



        if (!member) {

            return interaction.reply({

                content:
                "❌ המשתמש לא נמצא בשרת",

                ephemeral:true

            });

        }



        const row =
        new ActionRowBuilder()
        .addComponents(


            new ButtonBuilder()

                .setCustomId(
                    `approve_ban_${user.id}_${interaction.user.id}`
                )

                .setLabel("✅ אישור באן")

                .setStyle(
                    ButtonStyle.Danger
                ),



            new ButtonBuilder()

                .setCustomId(
                    `cancel_ban_${user.id}_${interaction.user.id}`
                )

                .setLabel("❌ ביטול")

                .setStyle(
                    ButtonStyle.Secondary
                )

        );



        await interaction.reply({

            content:
`
⚠️ **בקשת באן**

👤 משתמש:
${user}

📝 סיבה:
${reason}

👮 מבקש:
${interaction.user}

💬 חדר:
${interaction.channel}

רק מנהל יכול לאשר:
`,

            components:[
                row
            ]

        });


    }

};