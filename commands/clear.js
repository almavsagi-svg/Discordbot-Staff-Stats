const {
    SlashCommandBuilder,
    ChannelType
} = require("discord.js");

const { hasPermission } = require("../utils/permissions");

const clearCache = new Map();


module.exports = {

    data: new SlashCommandBuilder()

        .setName("clear")

        .setDescription("מציג הודעות למחיקה לפי תאריך, חדר ומשתמש")

        .addStringOption(option =>
            option
                .setName("date")
                .setDescription("תאריך לדוגמה 08/07/2026")
                .setRequired(true)
        )

        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("בחר חדר")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("בחר משתמש")
                .setRequired(true)
        ),



    async execute(interaction) {


        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );


        if (!allowed) {

            return interaction.reply({

                content: "❌ אין לך הרשאה",

                ephemeral: true

            });

        }



        const date =
            interaction.options.getString("date");


        const channel =
            interaction.options.getChannel("channel");


        const user =
            interaction.options.getUser("user");



        const messages =
            await channel.messages.fetch({
                limit: 100
            });



        const found = [];



        for (const message of messages.values()) {


            const d =
                `${String(message.createdAt.getDate()).padStart(2,"0")}/` +
                `${String(message.createdAt.getMonth()+1).padStart(2,"0")}/` +
                `${message.createdAt.getFullYear()}`;



            if (
                d === date &&
                message.author.id === user.id
            ) {

                found.push(message);

            }

        }



        if (found.length === 0) {

            return interaction.reply({

                content:
                "❌ לא נמצאו הודעות בתאריך הזה",

                ephemeral: true

            });

        }



        // שמירת הרשימה זמנית
        const key =
            `${interaction.guild.id}-${interaction.user.id}`;


        clearCache.set(key, {

            messages: found,

            channel: channel.id,

            user: user.id,

            date: date

        });



        let text =
`🧹 נמצאו ${found.length} הודעות:

`;



        found.forEach((msg,index)=>{


            let content =
                msg.content || "[ללא טקסט]";


            if(content.length > 80){

                content =
                content.substring(0,80) + "...";

            }



            text +=
`${index + 1}️⃣ ${content}\n`;

        });



        text +=
`
כדי למחוק בחר מספרים:

/clearselect

לדוגמה:
message1:1
message2:3
`;



        await interaction.reply({

            content: text,

            ephemeral: true

        });


    },


    clearCache

};