const {
    SlashCommandBuilder
} = require("discord.js");

const { hasPermission } = require("../utils/permissions");


// אותו Cache של clear.js
const clearCache = require("./clear").clearCache;


module.exports = {

    data: new SlashCommandBuilder()

        .setName("clearselect")

        .setDescription("מחיקת הודעות לפי מספרים")

        .addIntegerOption(option =>
            option
                .setName("message1")
                .setDescription("מספר הודעה ראשון")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("message2")
                .setDescription("מספר הודעה שני")
                .setRequired(false)
        )

        .addIntegerOption(option =>
            option
                .setName("message3")
                .setDescription("מספר הודעה שלישי")
                .setRequired(false)
        ),



    async execute(interaction) {


        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );


        if (!allowed) {

            return interaction.reply({

                content:
                "❌ אין לך הרשאה",

                ephemeral:true

            });

        }



        const key =
            `${interaction.guild.id}-${interaction.user.id}`;



        const data =
            clearCache.get(key);



        if (!data) {

            return interaction.reply({

                content:
                "❌ אין רשימת מחיקה פעילה. תעשה קודם /clear",

                ephemeral:true

            });

        }



        const messages =
            data.messages;



        const numbers = [

            interaction.options.getInteger("message1"),

            interaction.options.getInteger("message2"),

            interaction.options.getInteger("message3")

        ].filter(Boolean);



        let deleted = 0;



        for (const number of numbers) {


            const message =
                messages[number - 1];


            if (!message) continue;



            await message.delete()
                .catch(()=>{});


            deleted++;

        }



        clearCache.delete(key);



        await interaction.reply(
`
✅ הסתיים ניקוי

נמחקו:
${deleted} הודעות

בוצע על ידי:
${interaction.user}
`
        );


    }

};