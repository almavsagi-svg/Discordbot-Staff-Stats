const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("changerules")

        .setDescription("שינוי חוקי השרת")

        .addStringOption(option =>
            option
                .setName("rules")
                .setDescription("כתוב את החוקים החדשים")
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



        const newRules =
            interaction.options.getString("rules");



        const settings = db.prepare(`
            SELECT *
            FROM security_settings
            WHERE guild_id = ?
        `).get(
            interaction.guild.id
        );



        if (!settings) {

            return interaction.reply({

                content:
                "❌ מערכת האבטחה לא הוגדרה עדיין",

                ephemeral:true

            });

        }



        // הורדת רול האימות מכל המשתמשים
        const members =
            await interaction.guild.members.fetch();



        for (const member of members.values()) {


            if (member.roles.cache.has(settings.role_id)) {


                await member.roles.remove(
                    settings.role_id
                )
                .catch(() => {});


            }

        }



        const channel =
            interaction.guild.channels.cache.get(
                settings.channel_id
            );



        if (!channel) {

            return interaction.reply({

                content:
                "❌ חדר החוקים לא נמצא",

                ephemeral:true

            });

        }



        // מחיקת הודעת החוקים הישנה
        if (settings.message_id) {


            const oldMessage =
                await channel.messages.fetch(
                    settings.message_id
                )
                .catch(() => null);



            if (oldMessage) {

                await oldMessage.delete()
                .catch(() => {});

            }

        }



        const rulesText =
`
@everyone

📜 **אלה החוקים החדשים לשרת:**

${newRules}

תודה והמשך יום נעים 😀

בברכה,
צוות והמנהלים
`;



        const embed =
            new EmbedBuilder()

            .setTitle("📜 חוקי השרת")

            .setDescription(rulesText)

            .setFooter({
                text:
                "יש לאשר את החוקים כדי לקבל גישה"
            });



        const button =
            new ButtonBuilder()

            .setCustomId("accept_rules")

            .setLabel("✅ אישרתי שקראתי את החוקים")

            .setStyle(ButtonStyle.Success);



        const row =
            new ActionRowBuilder()

            .addComponents(button);



        const msg =
            await channel.send({

                embeds:[embed],

                components:[row]

            });



        db.prepare(`
            UPDATE security_settings

            SET rules = ?,
            message_id = ?

            WHERE guild_id = ?

        `).run(

            rulesText,

            msg.id,

            interaction.guild.id

        );



        await interaction.reply({

            content:
`
✅ החוקים עודכנו

🔻 כל המשתמשים יצטרכו לאשר מחדש כדי לקבל גישה.
`,

            ephemeral:true

        });


    }

};