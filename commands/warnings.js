const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/db");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("warnings")
        .setDescription("הצגת האזהרות של משתמש")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("בחר משתמש")
                .setRequired(true)
        ),



    async execute(interaction) {


        const user =
            interaction.options.getUser("user");


        const warnings = db.prepare(
            `
            SELECT *
            FROM warnings
            WHERE guild_id = ?
            AND user_id = ?
            ORDER BY id DESC
            `
        ).all(
            interaction.guild.id,
            user.id
        );



        if (warnings.length === 0) {

            return interaction.reply(
                `✅ ל-${user} אין אזהרות`
            );

        }



        const embed = new EmbedBuilder()

            .setTitle(
                `📋 אזהרות של ${user.username}`
            )

            .setThumbnail(
                user.displayAvatarURL()
            )

            .setColor("Orange");



        let text = "";


        warnings.forEach((warn, index) => {

            text +=
`
⚠️ **אזהרה #${index + 1}**

סיבה:
${warn.reason}

ניתן על ידי:
<@${warn.moderator_id}>

תאריך:
${new Date(warn.date).toLocaleString("he-IL")}

----------------
`;

        });



        embed.setDescription(text);



        await interaction.reply({
            embeds: [embed]
        });

    }

};