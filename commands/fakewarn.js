const {
    SlashCommandBuilder
} = require("discord.js");

const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("fakewarn")
        .setDescription("שליחת הודעת בדיקת מערכת למשתמש")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("בחר משתמש")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("סיבת הבדיקה")
                .setRequired(true)
        ),



    async execute(interaction) {


        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );


        if (!allowed) {

            return interaction.reply({
                content: "❌ אין לך הרשאה להשתמש בפקודה הזאת",
                ephemeral: true
            });

        }



        const user =
            interaction.options.getUser("user");


        const reason =
            interaction.options.getString("reason");



        try {

            await user.send({

                content:
`
⚠️ **הודעת בדיקה**

זאת אינה אזהרה אמיתית.

בוצעה בדיקת מערכת על ידי:
${interaction.user}

סיבה:
${reason}

🛡️ מערכת Staff Stat
`

            });


            await interaction.reply({

                content:
`✅ נשלחה הודעת בדיקה אל ${user}`,

                ephemeral: true

            });


        } catch {

            await interaction.reply({

                content:
`❌ לא ניתן לשלוח הודעה פרטית ל-${user}`,

                ephemeral: true

            });

        }

    }

};