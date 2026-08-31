const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("kick")

        .setDescription("הוצאת משתמש מהשרת")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("בחר משתמש")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("סיבת הקיק")
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



        // שליחת הודעה פרטית

        await user.send(
`
👢 קיבלת קיק מהשרת

📍 שרת:
${interaction.guild.name}

📝 סיבה:
${reason}

👮 בוצע על ידי:
${interaction.user}
`
        )
        .catch(()=>{});



        // ביצוע קיק

        await member.kick(reason)
        .catch(()=>null);



        // שליחת לוג

        const log =
            db.prepare(`
                SELECT channel_id
                FROM kick_logs
                WHERE guild_id = ?
            `)
            .get(
                interaction.guild.id
            );



        if (log) {


            const channel =
                interaction.guild.channels.cache.get(
                    log.channel_id
                );



            if (channel) {


                channel.send(
`
👢 **Kick Log**

👤 משתמש:
${user}

👮 מבצע:
${interaction.user}

📝 סיבה:
${reason}

💬 חדר:
${interaction.channel}

🕒 זמן:
${new Date().toLocaleString()}
`
                )
                .catch(()=>{});


            }

        }



        await interaction.reply({

            content:
`
✅ ${user} קיבל קיק

📝 סיבה:
${reason}
`,

            ephemeral:true

        });


    }

};