const {
    SlashCommandBuilder,
    ChannelType
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("restoreclear")

        .setDescription("שחזור הודעות שנמחקו")

        .addStringOption(option =>
            option
                .setName("date")
                .setDescription("תאריך לדוגמה 08/07/2026")
                .setRequired(true)
        )

        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("בחר חדר")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("בחר משתמש")
                .setRequired(true)
        ),



    async execute(interaction) {


        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );


        if (!allowed) {

            return interaction.reply({
                content:
                "❌ אין לך הרשאה להשתמש בפקודה הזאת",
                ephemeral: true
            });

        }



        const date =
            interaction.options.getString("date");


        const channel =
            interaction.options.getChannel("channel");


        const user =
            interaction.options.getUser("user");



        const messages = db.prepare(
            `
            SELECT *
            FROM deleted_messages
            WHERE guild_id = ?
            AND channel_id = ?
            AND author_id = ?
            `
        ).all(
            interaction.guild.id,
            channel.id,
            user.id
        );



        const filtered =
            messages.filter(msg => {

                const d = new Date(msg.date);

                const msgDate =
                    `${String(d.getDate()).padStart(2,"0")}/` +
                    `${String(d.getMonth()+1).padStart(2,"0")}/` +
                    `${d.getFullYear()}`;

                return msgDate === date;

            });



        if (filtered.length === 0) {

            return interaction.reply({

                content:
                "❌ לא נמצאו הודעות לשחזור",

                ephemeral: true

            });

        }



        await interaction.reply(
            "♻️ מתחיל שחזור הודעות..."
        );



        let restored = 0;



        for (const msg of filtered) {


            await channel.send(
`
♻️ **הודעה משוחזרת**

👤 משתמש מקורי:
<@${msg.author_id}>

💬 תוכן:
${msg.content}

♻️ שוחזר על ידי:
${interaction.user}
`
            );


            restored++;

        }



        db.prepare(
            `
            DELETE FROM deleted_messages
            WHERE guild_id = ?
            AND channel_id = ?
            AND author_id = ?
            `
        ).run(
            interaction.guild.id,
            channel.id,
            user.id
        );



        await interaction.followUp(
`
✅ השחזור הסתיים

חדר:
${channel}

משתמש:
${user}

שוחזרו:
${restored} הודעות

בוצע על ידי:
${interaction.user}
`
        );


    }

};