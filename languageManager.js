const db = require("./database/db");

const SUPPORTED_LANGUAGES = ["en", "he", "ar"];

function getLanguage(guildId) {
    const row = db
        .prepare(`
            SELECT language
            FROM server_languages
            WHERE guild_id = ?
        `)
        .get(guildId);

    return row?.language || "en";
}

function setLanguage(guildId, language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        throw new Error(`Unsupported language: ${language}`);
    }

    db.prepare(`
        INSERT INTO server_languages (guild_id, language)
        VALUES (?, ?)
        ON CONFLICT(guild_id)
        DO UPDATE SET language = excluded.language
    `).run(guildId, language);

    return language;
}

function isSupportedLanguage(language) {
    return SUPPORTED_LANGUAGES.includes(language);
}

module.exports = {
    getLanguage,
    setLanguage,
    isSupportedLanguage,
    SUPPORTED_LANGUAGES
};