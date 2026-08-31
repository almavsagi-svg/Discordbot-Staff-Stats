const {
    AuditLogEvent
} = require("discord.js");

const db = require("../database/db");


module.exports = {

    name: "ר",

    async execute(channel) {


        if (!channel.guild) return;


        const settings = db.prepare(
            `
            SELECT *
            FROM antinuke_settings
            WHERE guild_id = ?
            `
        ).get(
            channel.guild.id
        );


        if (!settings || settings.enabled === 0) {
            return;
        }



        const logs =
            await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelDelete,
                limit: 1
            });



        const entry =
            logs.entries.first();



        if (!entry) return;



        const executor =
            entry.executor;



        if (!executor) return;



        // לא לפגוע בבעל השרת
        if (executor.id === channel.guild.ownerId) {
            return;
        }



        console.log(
            `🚨 Anti-Nuke: ${executor.tag} deleted ${channel.name}`
        );



        const member =
            await channel.guild.members
            .fetch(executor.id)
            .catch(() => null);



        if (!member) return;



        // שליחת הודעה פרטית

        try {

            await executor.send(
`
🛡️ **Anti-Nuke Protection**

קיבלת הרחקה מהשרת.

סיבה:
מחיקת ערוץ ללא הרשאה

עונש:
Ban ל־48 שעות

שרת:
${channel.guild.name}
`
            );


        } catch {

            console.log(
                "לא ניתן לשלוח DM למשתמש"
            );

        }



        // כרגע זה באן רגיל
        // בהמשך נוסיף מערכת Unban אוטומטית אחרי 48 שעות

        await member.ban({

            reason:
            "Anti-Nuke: Unauthorized channel deletion"

        });


    }

};