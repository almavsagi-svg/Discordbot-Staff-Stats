const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { hasPermission } = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

    .setName("trollmessage")

    .setDescription("שליחת הודעה עם שם ותמונה של משתמש")

    .addUserOption(option =>
        option
        .setName("user")
        .setDescription("השם שיופיע")
        .setRequired(true)
    )


    .addChannelOption(option =>
        option
        .setName("channel")
        .setDescription("איפה לשלוח")
        .setRequired(true)
    )


    .addStringOption(option =>
        option
        .setName("message")
        .setDescription("הודעה")
        .setRequired(true)
    ),



    async execute(interaction) {


        const allowed =
            await hasPermission(
                interaction.member,
                "MANAGER"
            );



        if(!allowed) {


            return interaction.reply({

                content:
                "❌ רק צוות ומנהלים יכולים להשתמש",

                ephemeral:true

            });

        }



        const user =
            interaction.options.getUser("user");


        const channel =
            interaction.options.getChannel("channel");


        const message =
            interaction.options.getString("message");




        const embed = new EmbedBuilder()

        .setAuthor({

            name: user.username,

            iconURL: user.displayAvatarURL({
                dynamic:true,
                size:1024
            })

        })

        .setDescription(message)

        .setFooter({

            text:
            "Troll Message"

        })

        .setTimestamp();




        await channel.send({

            embeds:[
                embed
            ]

        });



        return interaction.reply({

            content:
            "✅ ההודעה נשלחה",

            ephemeral:true

        });


    }


};