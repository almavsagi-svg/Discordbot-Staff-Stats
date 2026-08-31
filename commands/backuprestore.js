const {
    SlashCommandBuilder,
    ChannelType
} = require("discord.js");

const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("backuprestore")

        .setDescription("שחזור Backup אחרון"),



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



        await interaction.deferReply({
            ephemeral:true
        });



        await interaction.guild.roles.fetch();
        await interaction.guild.channels.fetch();



        const saved =
            db.prepare(`
                SELECT *
                FROM server_backup
                WHERE guild_id = ?
            `)
            .get(
                interaction.guild.id
            );



        if (!saved) {

            return interaction.editReply(
                "❌ לא נמצא Backup לשרת"
            );

        }



        const backup =
            JSON.parse(saved.data);



        let rolesCreated = 0;
        let rolesAdded = 0;
        let categoriesCreated = 0;
        let channelsCreated = 0;
        let permissionsRestored = 0;



        const roleMap = new Map();



        // ==========================
        // שחזור רולים
        // ==========================

        for (const oldRole of backup.roles) {


            let role =
                interaction.guild.roles.cache.find(
                    r => r.name === oldRole.name
                );



            if (!role) {


                role =
                await interaction.guild.roles.create({

                    name: oldRole.name,

                    color: oldRole.color,

                    permissions:
                    BigInt(oldRole.permissions || 0)

                })
                .catch(error=>{

                    console.log(
                        "Role create error:",
                        error.message
                    );

                    return null;

                });



                if(role){

                    rolesCreated++;

                }


            }



            if(role){

                roleMap.set(
                    oldRole.name,
                    role
                );

            }


        }





        // ==========================
        // שחזור קטגוריות
        // ==========================


        const categoryMap = new Map();



        for(const oldChannel of backup.channels){


            if(
                oldChannel.type !== ChannelType.GuildCategory
            ) continue;



            let category =
                interaction.guild.channels.cache.find(
                    c =>
                    c.name === oldChannel.name &&
                    c.type === ChannelType.GuildCategory
                );



            if(!category){


                category =
                await interaction.guild.channels.create({

                    name:
                    oldChannel.name,

                    type:
                    ChannelType.GuildCategory

                })
                .catch(()=>null);



                if(category){

                    categoriesCreated++;

                }


            }



            if(category){

                categoryMap.set(
                    oldChannel.name,
                    category.id
                );

            }


        }





        // ==========================
        // שחזור חדרים
        // ==========================


        for(const oldChannel of backup.channels){


            if(
                oldChannel.type === ChannelType.GuildCategory
            )
            continue;



            let channelExists =
                interaction.guild.channels.cache.find(
                    c =>
                    c.name === oldChannel.name
                );



            if(channelExists)
            continue;



            const newChannel =
            await interaction.guild.channels.create({

                name:
                oldChannel.name,

                type:
                oldChannel.type,

                parent:
                categoryMap.get(oldChannel.parent) || null

            })
            .catch(error=>{

                console.log(
                    "Channel error:",
                    error.message
                );

                return null;

            });



            if(!newChannel)
            continue;



            channelsCreated++;




            // הרשאות חדרים

            if(oldChannel.permissions){


                for(const perm of oldChannel.permissions){


                    let target = perm.id;



                    await newChannel.permissionOverwrites.create(

                        target,

                        {

                            allow:
                            BigInt(perm.allow || 0),

                            deny:
                            BigInt(perm.deny || 0)

                        }

                    )
                    .catch(()=>{});



                    permissionsRestored++;

                }


            }



        }





        // ==========================
        // החזרת רולים למשתמשים
        // ==========================


        for(const savedMember of backup.members){


            const member =
            await interaction.guild.members.fetch(
                savedMember.id
            )
            .catch(()=>null);



            if(!member)
            continue;



            for(const savedRole of savedMember.roles){



                const role =
                    roleMap.get(
                        savedRole.name
                    );



                if(!role)
                continue;



                if(
                    !member.roles.cache.has(role.id)
                ){


                    await member.roles.add(role)
                    .catch(()=>{});



                    rolesAdded++;


                }


            }


        }





        await interaction.editReply(

`
♻️ השחזור הסתיים בהצלחה

🎭 רולים שנוצרו:
${rolesCreated}

👤 רולים שהוחזרו:
${rolesAdded}

📁 קטגוריות:
${categoriesCreated}

💬 חדרים:
${channelsCreated}

🔐 הרשאות:
${permissionsRestored}

👮 בוצע על ידי:
${interaction.user}
`

        );


    }

};