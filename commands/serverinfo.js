const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("View information about the server"),

    async execute(interaction) {

        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setTitle(`🖥️ ${guild.name}`)
            .addFields(
                {
                    name: "👑 Owner",
                    value: `<@${guild.ownerId}>`,
                    inline: true
                },
                {
                    name: "👥 Members",
                    value: `${guild.memberCount}`,
                    inline: true
                },
                {
                    name: "📅 Created",
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                    inline: false
                },
                {
                    name: "📝 Server ID",
                    value: guild.id,
                    inline: false
                }
            )
            .setTimestamp();

        if (guild.iconURL()) {
            embed.setThumbnail(guild.iconURL({ dynamic: true }));
        }

        await interaction.reply({
            embeds: [embed]
        });
    }
};