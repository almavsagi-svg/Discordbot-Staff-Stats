const db = require("../database/db");

const {
    ChannelType
} = require("discord.js");


// שמירת הודעות לספאם
const spamMap = new Map();



module.exports = {


    name: "messageCreate",



    async execute(message) {



        // לא לספור בוטים
        if (message.author.bot) return;





        // ==========================
        // Owner DM Control
        // ==========================

        if (!message.guild) {


            if (message.author.id !== process.env.OWNER_ID) {

                return message.reply(
                    "❌ אין לך גישה למערכת הזאת"
                );

            }



            const args =
                message.content.split(" ");



            const command =
                args.shift().toLowerCase();




            if (command === "help") {

                return message.reply(
`
🤖 Owner Commands:

addroom <name>
יצירת חדר חדש

help
הצגת פקודות
`
                );

            }





            if (command === "addroom") {


                const roomName =
                    args.join(" ");




                if (!roomName) {

                    return message.reply(
                        "❌ צריך לתת שם לחדר"
                    );

                }





                const guild =
                    message.client.guilds.cache.first();




                if (!guild) {

                    return message.reply(
                        "❌ הבוט לא נמצא בשרת"
                    );

                }





                await guild.channels.create({

                    name: roomName,

                    type: ChannelType.GuildText

                });




                return message.reply(
                    `✅ נוצר חדר בשם ${roomName}`
                );


            }


            return;


        }







        // ==========================
        // Anti Virus Links
        // ==========================


        const badLinks = [

            "free-nitro",
            "nitro-free",
            "discord-nitro",
            "free-robux",
            "robux-free",
            "steam-gift",
            "gift-steam",
            "password",
            "login",
            ".xyz",
            ".top",
            ".click",
            ".tk",
            ".ml",
            ".ga"

        ];





        const text =
            message.content.toLowerCase();




        const dangerous =
            badLinks.some(word =>
                text.includes(word)
            );





        if (dangerous) {


            await message.delete()
            .catch(()=>{});



            await message.author.send(
`
⚠️ ההודעה שלך נמחקה

סיבה:
קישור חשוד או מסוכן

נא לא לשלוח קישורים כאלה.
`
            )
            .catch(()=>{});



            return;

        }







        // ==========================
        // Anti Spam
        // ==========================


        const now = Date.now();



        if (!spamMap.has(message.author.id)) {


            spamMap.set(
                message.author.id,
                []
            );

        }



        const messages =
            spamMap.get(
                message.author.id
            );



        messages.push(now);




        // רק 5 שניות אחרונות

        const recent =
            messages.filter(
                time =>
                now - time < 5000
            );



        spamMap.set(
            message.author.id,
            recent
        );




        if (recent.length >= 5) {


            await message.delete()
            .catch(()=>{});



            await message.author.send(
`
⚠️ זוהה ספאם

נא להאט עם שליחת הודעות.
`
            )
            .catch(()=>{});



            return;

        }








        // ==========================
        // Staff Stats
        // ==========================



        const member =
            message.member;



        const staffRoles =
            db.prepare(
`
SELECT role_id
FROM staff_roles
WHERE guild_id = ?
`
            )
            .all(
                message.guild.id
            );





        const isStaff =
            staffRoles.some(role =>
                member.roles.cache.has(role.role_id)
            );





        if (!isStaff) return;






        const today =
            new Date()
            .toISOString()
            .split("T")[0];





        const oldData =
            db.prepare(
`
SELECT *
FROM message_stats
WHERE guild_id = ?
AND user_id = ?
AND date = ?
`
            )
            .get(

                message.guild.id,

                message.author.id,

                today

            );





        if (oldData) {


            db.prepare(
`
UPDATE message_stats
SET messages = messages + 1
WHERE id = ?
`
            )
            .run(
                oldData.id
            );



        } else {



            db.prepare(
`
INSERT INTO message_stats
(
guild_id,
user_id,
date,
messages
)

VALUES (?, ?, ?, 1)
`
            )
            .run(

                message.guild.id,

                message.author.id,

                today

            );


        }



    }


};