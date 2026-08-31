const {
    SlashCommandBuilder
} = require("discord.js");

const db = require("../database/db");

const { hasPermission } = require("../utils/permissions");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("lockdown")

        .setDescription("נעילת השרת לצוות והנהלה בלבד"),



    async execute(interaction) {



        const allowed =
            await hasPermission(
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





        await interaction.reply({

            content:
            "🚨 מפעיל מצב נעילה..."

        });





        const everyone =
            interaction.guild.roles.everyone;



        // מוצא מנהלים

        const managers =
            db.prepare(`

                SELECT role_id
                FROM manager_roles
                WHERE guild_id = ?

            `)
            .all(
                interaction.guild.id
            );





        // מוצא צוות

        const staff =
            db.prepare(`

                SELECT role_id
                FROM staff_roles
                WHERE guild_id = ?

            `)
            .all(
                interaction.guild.id
            );





        const allowedRoles = [

            ...managers.map(r => r.role_id),

            ...staff.map(r => r.role_id)

        ];





        let locked = 0;




        for (const [, channel] of interaction.guild.channels.cache) {



            if (!channel.permissionOverwrites) {
                continue;
            }




            try {



                // חוסם כולם

                await channel.permissionOverwrites.edit(

                    everyone,

                    {

                        ViewChannel:false,

                        SendMessages:false,

                        Connect:false,

                        Speak:false

                    }

                );





                // פותח לצוות ומנהלים

                for (const roleId of allowedRoles) {


                    const role =
                        interaction.guild.roles.cache.get(
                            roleId
                        );



                    if (!role) continue;




                    await channel.permissionOverwrites.edit(

                        role,

                        {

                            ViewChannel:true,

                            SendMessages:true,

                            Connect:true,

                            Speak:true

                        }

                    );


                }





                console.log(
                    "🔒 Locked:",
                    channel.name
                );


                locked++;



            } catch(error) {


                console.log(

                    "❌ Failed:",

                    channel.name,

                    error.message

                );


            }


        }





        await interaction.followUp({

            content:

`
🚨 **Lockdown הופעל**

🔒 חדרים שננעלו:
${locked}

👑 צוות והנהלה בלבד יכולים לראות ולכתוב.
`

        });



    }


};