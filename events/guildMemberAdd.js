const {
    EmbedBuilder
} = require("discord.js");

const db = require("../database/db");


module.exports = {

    name: "guildMemberAdd",


    async execute(member) {


        const settings =
            db.prepare(`
                SELECT *
                FROM welcome_settings
                WHERE guild_id = ?
            `)
            .get(member.guild.id);



        if (!settings) return;



        const channel =
            member.guild.channels.cache.get(
                settings.channel_id
            );



        if (!channel) return;



        const embed = new EmbedBuilder()

            .setTitle("👋 ברוכים הבאים לשרת!")

            .setDescription(
`
שלום ${member} ❤️

אנחנו שמחים שהצטרפת ל־**${member.guild.name}**

תהנה מהשרת ותכיר את הקהילה 😊
`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true,
                    size: 512
                })
            )

            .addFields(
                {
                    name: "👤 משתמש",
                    value: `${member.user.tag}`,
                    inline: true
                },
                {
                    name: "📅 הצטרף בתאריך",
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
                    inline: true
                }
            )

            .setFooter({
                text: "ברוכים הבאים ❤️"
            })

            .setTimestamp();



        await channel.send({

            content: `${member}`,

            embeds: [embed]

        });


    }

};