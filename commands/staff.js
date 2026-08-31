const { 
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/db");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("staff")
        .setDescription("הצג סטטיסטיקות של איש צוות")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("בחר משתמש")
                .setRequired(true)
        ),


    async execute(interaction) {

        const user = interaction.options.getUser("user");


        const today = new Date()
            .toISOString()
            .split("T")[0];


        const stats = db.prepare(
            `
            SELECT * FROM message_stats
            WHERE guild_id = ?
            AND user_id = ?
            AND date = ?
            `
        ).get(
            interaction.guild.id,
            user.id,
            today
        );


        const messages = stats ? stats.messages : 0;


        const member = await interaction.guild.members.fetch(user.id);


        const staffRole = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .first();


        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("📊 Staff Statistics")
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                {
                    name: "👤 User",
                    value: `${user}`,
                    inline: true
                },
                {
                    name: "💬 Messages Today",
                    value: `${messages}`,
                    inline: true
                },
                {
                    name: "🛡 Role",
                    value: staffRole ? staffRole.toString() : "אין",
                    inline: true
                }
            )
            .setFooter({
                text: "Staff Stat"
            })
            .setTimestamp();


        await interaction.reply({
            embeds: [embed]
        });

    }
};