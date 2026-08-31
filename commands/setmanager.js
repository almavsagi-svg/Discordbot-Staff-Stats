const { 
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const db = require("../database/db");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("setmanager")
        .setDescription("הגדרת רול מנהלים")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("בחר רול מנהל")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),


    async execute(interaction) {

        console.log("setmanager started");

        try {

            await interaction.deferReply({
                ephemeral: true
            });


            if (interaction.user.id !== process.env.OWNER_ID) {

                return interaction.editReply(
                    "❌ אין לך גישה לפקודה הזאת"
                );
            }


            const role = interaction.options.getRole("role");


            const exists = db.prepare(
                `
                SELECT * FROM manager_roles
                WHERE guild_id = ?
                AND role_id = ?
                `
            ).get(
                interaction.guild.id,
                role.id
            );


            if (exists) {

                return interaction.editReply(
                    "⚠️ הרול כבר מוגדר כמנהל"
                );
            }


            db.prepare(
                `
                INSERT INTO manager_roles
                (guild_id, role_id)
                VALUES (?, ?)
                `
            ).run(
                interaction.guild.id,
                role.id
            );


            console.log("manager role saved");


            await interaction.editReply(
                `👑 הרול ${role} הוגדר כרול מנהלים`
            );


        } catch (error) {

            console.error(
                "SETMANAGER ERROR:",
                error
            );


            if (interaction.deferred) {

                await interaction.editReply(
                    "❌ קרתה שגיאה"
                );

            }
        }
    }
};