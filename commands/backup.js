const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("backup")

        .setDescription("מערכת גיבוי שרת")

        .addSubcommand(sub =>
            sub
                .setName("create")
                .setDescription("יצירת Backup אחרון")
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



        await interaction.deferReply({
            ephemeral:true
        });



        const guild = interaction.guild;


        // טעינת מידע לפני גיבוי
        await guild.roles.fetch();
        await guild.channels.fetch();
        await guild.members.fetch();



        const backup = {


            roles:

                guild.roles.cache

                .filter(role =>
                    role.name !== "@everyone"
                )

                .map(role => ({

                    id: role.id,

                    name: role.name,

                    color: role.color,

                    permissions:
                    role.permissions.bitfield.toString(),

                    position:
                    role.position

                })),





            channels:

                guild.channels.cache

                .map(channel => ({


                    id:
                    channel.id,


                    name:
                    channel.name,


                    type:
                    channel.type,


                    parent:
                    channel.parent?.name || null,



                    permissions:


                    channel.permissionOverwrites ?

                    channel.permissionOverwrites.cache.map(overwrite => ({


                        id:
                        overwrite.id,


                        type:
                        overwrite.type,


                        allow:
                        overwrite.allow.bitfield.toString(),


                        deny:
                        overwrite.deny.bitfield.toString()


                    })) : []


                })),







            members:


                guild.members.cache

                .map(member => ({


                    id:
                    member.id,



                    roles:


                        member.roles.cache

                        .filter(role =>
                            role.name !== "@everyone"
                        )

                        .map(role => ({


                            id:
                            role.id,


                            name:
                            role.name


                        }))



                }))



        };





        db.prepare(`

            INSERT INTO server_backup

            (

                guild_id,

                data,

                updated_at

            )

            VALUES (?, ?, ?)


            ON CONFLICT(guild_id)

            DO UPDATE SET


            data = excluded.data,


            updated_at = excluded.updated_at


        `).run(


            guild.id,


            JSON.stringify(backup),


            new Date().toISOString()


        );







        await interaction.editReply({


            content:

`
✅ Backup נשמר בהצלחה

📅 זמן:
${new Date().toLocaleString()}

נשמר:

🎭 רולים

👤 רולי משתמשים

📁 חדרים

🔐 הרשאות חדרים
`

        });



    }

};