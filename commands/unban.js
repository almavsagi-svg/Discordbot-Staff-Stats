const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("unban")

        .setDescription("הורדת באן למשתמש")

        .addStringOption(option =>
            option
                .setName("userid")
                .setDescription("ID של המשתמש")
                .setRequired(true)
        ),

    async execute(interaction) {

        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );

        if (!allowed) {

            return interaction.reply({

                content: "❌ אין לך הרשאה",

                ephemeral: true

            });

        }

        await interaction.deferReply({
            ephemeral: true
        });

        const userId =
            interaction.options.getString("userid");

        let bans;

        try {

            bans = await interaction.guild.bans.fetch();

        } catch {

            return interaction.editReply(
                "❌ לא הצלחתי לקבל את רשימת הבאנים."
            );

        }

        const bannedUser = bans.get(userId);

        if (!bannedUser) {

            return interaction.editReply(
                "❌ המשתמש הזה לא נמצא בבאן."
            );

        }

        try {

            await interaction.guild.members.unban(userId);

        } catch {

            return interaction.editReply(
                "❌ לא הצלחתי להוריד את הבאן."
            );

        }

        db.prepare(`
            DELETE FROM temp_bans
            WHERE user_id = ?
            AND guild_id = ?
        `).run(
            userId,
            interaction.guild.id
        );

        await interaction.editReply(
`
✅ הבאן בוטל בהצלחה

👤 משתמש:
${bannedUser.user.tag}

👮 מנהל:
${interaction.user}
`
        );

    }

};