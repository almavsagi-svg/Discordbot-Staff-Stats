const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const {
    getLanguage,
    setLanguage
} = require("../languageManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("language")
        .setDescription("Change the language used by StaffStat"),

    async execute(interaction) {
        const currentLanguage = getLanguage(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setTitle("🌍 StaffStat Language")
            .setDescription(
                `Current language: **${getLanguageName(currentLanguage)}**\n\n` +
                "Select the language you want StaffStat to use for this server."
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("language_en")
                .setLabel("English")
                .setEmoji("🇺🇸")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("language_he")
                .setLabel("Hebrew")
                .setEmoji("🇮🇱")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("language_ar")
                .setLabel("Arabic")
                .setEmoji("🇸🇦")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};

function getLanguageName(language) {
    const names = {
        en: "🇺🇸 English",
        he: "🇮🇱 Hebrew",
        ar: "🇸🇦 Arabic"
    };

    return names[language] || names.en;
}