const db = require("../database/db");

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {

        console.log(`✅ ${client.user.tag} is online`);

        setInterval(async () => {

            const bans = db.prepare(`
                SELECT *
                FROM temp_bans
                WHERE expires_at <= ?
            `).all(Date.now());

            for (const ban of bans) {

                const guild = client.guilds.cache.get(ban.guild_id);

                if (!guild) continue;

                await guild.members.unban(ban.user_id).catch(() => {});

                db.prepare(`
                    DELETE FROM temp_bans
                    WHERE user_id = ?
                    AND guild_id = ?
                `).run(
                    ban.user_id,
                    ban.guild_id
                );

                console.log(`✅ Unbanned ${ban.user_id}`);

            }

        }, 60000);

    }
};