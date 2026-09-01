const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("View information about a user")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to view")
                .setRequired(false)
        ),

    async execute(interaction) {

        const user =
            interaction.options.getUser("user") ||
            interaction.user;

        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle(`👤 ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: "🆔 User ID",
                    value: user.id,
                    inline: false
                },
                {
                    name: "📅 Account Created",
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: false
                }
            )
            .setTimestamp();

        if (member) {
            embed.addFields({
                name: "📅 Joined Server",
                value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                inline: false
            });
        }

        await interaction.reply({
            embeds: [embed]
        });
    }
};