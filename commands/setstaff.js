const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../database/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setstaff")
        .setDescription("הגדרת רול צוות")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("בחר את רול הצוות")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const role = interaction.options.getRole("role");

        const exists = db.prepare(
            "SELECT * FROM staff_roles WHERE guild_id = ? AND role_id = ?"
        ).get(
            interaction.guild.id,
            role.id
        );

        if (exists) {
            return interaction.reply({
                content: "⚠️ הרול הזה כבר מוגדר כצוות",
                ephemeral: true
            });
        }

        db.prepare(`
            INSERT INTO staff_roles (guild_id, role_id)
            VALUES (?, ?)
        `).run(
            interaction.guild.id,
            role.id
        );

        await interaction.reply(
            `✅ הרול ${role} הוגדר כרול צוות`
        );
    }
};