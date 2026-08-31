const db = require("../database/db");

const voiceJoin = new Map();

module.exports = {
    name: "voiceStateUpdate",

    async execute(oldState, newState) {

        const member = newState.member || oldState.member;

        if (!member || member.user.bot) return;


        // כניסה לחדר קול
        if (!oldState.channel && newState.channel) {

            voiceJoin.set(member.id, Date.now());

        }


        // יציאה מחדר קול
        if (oldState.channel && !newState.channel) {

            const joinTime = voiceJoin.get(member.id);

            if (!joinTime) return;


            const seconds = Math.floor(
                (Date.now() - joinTime) / 1000
            );


            const today = new Date()
                .toISOString()
                .split("T")[0];


            const existing = db.prepare(
                `
                SELECT * FROM voice_stats
                WHERE guild_id = ?
                AND user_id = ?
                AND date = ?
                `
            ).get(
                oldState.guild.id,
                member.id,
                today
            );


            if (existing) {

                db.prepare(
                    `
                    UPDATE voice_stats
                    SET seconds = seconds + ?
                    WHERE id = ?
                    `
                ).run(
                    seconds,
                    existing.id
                );

            } else {

                db.prepare(
                    `
                    INSERT INTO voice_stats
                    (guild_id,user_id,date,seconds)
                    VALUES (?,?,?,?)
                    `
                ).run(
                    oldState.guild.id,
                    member.id,
                    today,
                    seconds
                );

            }


            voiceJoin.delete(member.id);
        }
    }
};