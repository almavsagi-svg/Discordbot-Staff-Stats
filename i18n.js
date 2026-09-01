const fs = require("fs");
const path = require("path");

const localesPath = path.join(__dirname, "locales");

const locales = {
    en: JSON.parse(
        fs.readFileSync(path.join(localesPath, "en.json"), "utf8")
    ),
    he: JSON.parse(
        fs.readFileSync(path.join(localesPath, "he.json"), "utf8")
    ),
    ar: JSON.parse(
        fs.readFileSync(path.join(localesPath, "ar.json"), "utf8")
    )
};

function getLocale(language = "en") {
    return locales[language] || locales.en;
}

function getText(language, key) {
    const locale = getLocale(language);

    const value = key
        .split(".")
        .reduce((obj, part) => obj?.[part], locale);

    return value ?? key;
}

module.exports = {
    getLocale,
    getText
};