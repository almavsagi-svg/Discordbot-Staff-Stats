const {
    SlashCommandBuilder,
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("setsecurity")

        .setDescription("הגדרת חדר אימות חוקים")

        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("חדר החוקים")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("הרול שמקבלים אחרי אישור")
                .setRequired(true)
        ),



    async execute(interaction) {


        const allowed = await hasPermission(
            interaction.member,
            "MANAGER"
        );


        if (!allowed) {

            return interaction.reply({
                content:"❌ אין לך הרשאה",
                ephemeral:true
            });

        }



        const channel =
            interaction.options.getChannel("channel");


        const role =
            interaction.options.getRole("role");



        const rules =
`@everyone

📜 אלה החוקים החדשים לשרת:

1. לא לקלל
2. לא להספים
3. לא לעשות סקאמים
4. להתנהג בצורה הולמת ומכובדת
5. אין להפריע לצוות/להנהלה ללא צורך
6. להתנהג יפה ולא להרוס את החוויה ואת הכיף לכולם!

תודה והמשך יום נעים 😀

בברכה,
צוות והמנהלים`;



        // הגדרת הרשאות לחדר החוקים
        await channel.permissionOverwrites.edit(
            interaction.guild.roles.everyone,
            {
                ViewChannel: true,
                SendMessages: false
            }
        );



        // חסימת שאר החדרים לכולם ומתן גישה לרול המאומת
        for (const ch of interaction.guild.channels.cache.values()) {


            if (ch.type !== ChannelType.GuildText) continue;


            if (ch.id === channel.id) continue;



            await ch.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                {
                    ViewChannel: false
                }
            )
            .catch(() => {});



            await ch.permissionOverwrites.edit(
                role,
                {
                    ViewChannel: true,
                    SendMessages: true
                }
            )
            .catch(() => {});

        }



        const embed =
            new EmbedBuilder()

            .setTitle("📜 חוקי השרת")

            .setDescription(rules)

            .setFooter({
                text:"יש לאשר את החוקים כדי לקבל גישה"
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
            INSERT INTO security_settings
            (
                guild_id,
                channel_id,
                role_id,
                rules,
                message_id
            )

            VALUES (?, ?, ?, ?, ?)

            ON CONFLICT(guild_id)
            DO UPDATE SET

            channel_id = excluded.channel_id,
            role_id = excluded.role_id,
            rules = excluded.rules,
            message_id = excluded.message_id

        `).run(

            interaction.guild.id,
            channel.id,
            role.id,
            rules,
            msg.id

        );



        await interaction.reply({

            content:
            "✅ מערכת האבטחה הופעלה בהצלחה",

            ephemeral:true

        });


    }

};