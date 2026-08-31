const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(__dirname, "database.db")
);

// טבלת רולי צוות
db.prepare(`
    CREATE TABLE IF NOT EXISTS staff_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        role_id TEXT NOT NULL
    )
`).run();
// טבלת רולי מנהלים
db.prepare(`
    CREATE TABLE IF NOT EXISTS manager_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        role_id TEXT NOT NULL
    )
`).run();
// טבלת הודעות
db.prepare(`
    CREATE TABLE IF NOT EXISTS message_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        messages INTEGER DEFAULT 0
    )
`).run();
// טבלת זמן קול
db.prepare(`
    CREATE TABLE IF NOT EXISTS voice_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        seconds INTEGER DEFAULT 0
    )
`).run();
// טבלת אזהרות
db.prepare(`
    CREATE TABLE IF NOT EXISTS warnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        date TEXT NOT NULL
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS antinuke_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        enabled INTEGER DEFAULT 0,
        log_channel TEXT
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS deleted_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    deleted_by TEXT NOT NULL
)
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS welcome_settings (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS security_settings (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        role_id TEXT NOT NULL,
        rules TEXT NOT NULL,
        message_id TEXT
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS server_backup (
        guild_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS command_logs (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS ban_logs (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS kick_logs (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL
    )
`).run();
db.prepare(`
    CREATE TABLE IF NOT EXISTS nuke_settings (
        guild_id TEXT PRIMARY KEY,
        active INTEGER DEFAULT 0
    )
`).run();


db.prepare(`
    CREATE TABLE IF NOT EXISTS nuke_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        role_id TEXT,
        type TEXT,
        allow TEXT,
        deny TEXT
    )
`).run();
// טבלת תזכורות
db.prepare(`
    CREATE TABLE IF NOT EXISTS reminders (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id TEXT NOT NULL,

        guild_id TEXT NOT NULL,

        message TEXT NOT NULL,

        remind_time INTEGER NOT NULL,

        created_at INTEGER NOT NULL

    )
`).run();
// טבלת מטבעות
db.prepare(`

    CREATE TABLE IF NOT EXISTS coins (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id TEXT NOT NULL,

        guild_id TEXT NOT NULL,

        amount INTEGER DEFAULT 0,

        last_daily INTEGER DEFAULT 0

    )

`).run();
// טבלת רולים בחנות
db.prepare(`

    CREATE TABLE IF NOT EXISTS shop_roles (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        guild_id TEXT NOT NULL,

        role_id TEXT NOT NULL,

        price INTEGER NOT NULL

    )

`).run();
// הנחות לחנות
db.prepare(`

CREATE TABLE IF NOT EXISTS shop_discounts (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    guild_id TEXT NOT NULL,

    role_id TEXT NOT NULL,

    percent INTEGER NOT NULL,

    expires_at INTEGER NOT NULL

)

`).run();



// זמני רולים בחנות

db.prepare(`

CREATE TABLE IF NOT EXISTS shop_times (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    guild_id TEXT NOT NULL,

    role_id TEXT NOT NULL,

    duration INTEGER NOT NULL,

    expires_at INTEGER NOT NULL

)

`).run();
// טבלת הגרלות
db.prepare(`

CREATE TABLE IF NOT EXISTS giveaways (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    guild_id TEXT NOT NULL,

    channel_id TEXT NOT NULL,

    message_id TEXT NOT NULL,

    coins INTEGER NOT NULL,

    end_time INTEGER NOT NULL,

    participants TEXT NOT NULL

)

`).run();



// טבלת לוג אנטי ספאם

db.prepare(`

CREATE TABLE IF NOT EXISTS anti_spam (

    guild_id TEXT PRIMARY KEY,

    enabled INTEGER DEFAULT 1

)

`).run();
// הגדרות אנטי ספאם וקישורים

db.prepare(`

CREATE TABLE IF NOT EXISTS security_protection (

    guild_id TEXT PRIMARY KEY,

    enabled INTEGER DEFAULT 1,

    log_channel TEXT

)

`).run();
db.prepare(`
CREATE TABLE IF NOT EXISTS temp_bans (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    expires_at INTEGER NOT NULL
)
`).run();

console.log("✅ Database connected");

module.exports = db;