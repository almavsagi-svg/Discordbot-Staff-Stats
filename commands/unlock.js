const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ChannelSelectMenuBuilder,
    ChannelType,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { hasPermission } = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("unlock")

        .setDescription("פתיחת חדרים עם בחירה של חדרים להשאיר נעולים"),



    async execute(interaction) {



        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );



        if (!allowed) {

            return interaction.reply({

                content:
                "❌ אין לך הרשאה להשתמש בפקודה הזאת",

                ephemeral:true

            });

        }





        const menu = new ChannelSelectMenuBuilder()

            .setCustomId("unlock_keep_locked")

            .setPlaceholder("בחר חדרים להשאיר נעולים")

            .setMinValues(0)

            .setMaxValues(25)

            .addChannelTypes(
                ChannelType.GuildText,
                ChannelType.GuildVoice
            );





        const button = new ButtonBuilder()

            .setCustomId("unlock_confirm")

            .setLabel("🔓 פתח חדרים")

            .setStyle(ButtonStyle.Success);





        const row1 = new ActionRowBuilder()

            .addComponents(menu);



        const row2 = new ActionRowBuilder()

            .addComponents(button);





        await interaction.reply({

            content:

`
🔓 **מערכת פתיחת חדרים**

בחר את החדרים שאתה רוצה **להשאיר נעולים**.

אחרי הבחירה לחץ על:
✅ פתח חדרים
`,

            components:[
                row1,
                row2
            ],

            ephemeral:true

        });


    }


};