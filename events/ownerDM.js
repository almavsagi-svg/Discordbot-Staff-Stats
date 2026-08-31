const {
    ChannelType
} = require("discord.js");


module.exports = {

    name: "messageCreate",


    async execute(message) {


        // רק הודעות פרטיות
        if (message.guild) return;


        // מתעלם מבוטים
        if (message.author.bot) return;



        // בדיקת בעלים
        if (message.author.id !== process.env.OWNER_ID) {

            return message.reply(
                "❌ אין לך גישה למערכת הזאת"
            );

        }



        const args =
            message.content.split(" ");



        const command =
            args.shift().toLowerCase();



        if (command === "addroom") {


            const roomName =
                args.join(" ");



            if (!roomName) {

                return message.reply(
                    "❌ צריך לתת שם לחדר"
                );

            }



            // לוקח את השרת הראשון שהבוט נמצא בו
            const guild =
                message.client.guilds.cache.first();



            if (!guild) {

                return message.reply(
                    "❌ הבוט לא נמצא באף שרת"
                );

            }



            await guild.channels.create({

                name: roomName,

                type: ChannelType.GuildText

            });



            return message.reply(
                `✅ נוצר חדר בשם: ${roomName}`
            );

        }



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


    }

};