const db = require("../database/db");
const { hasPermission } = require("../utils/permissions");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");


module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {


        try {

// ==========================
// בחירת חדרים להשאיר נעולים
// ==========================

if (interaction.isChannelSelectMenu()) {


    if (interaction.customId === "unlock_keep_locked") {


        interaction.client.unlockChannels =
            interaction.values;



        return interaction.reply({

            content:

`
✅ נשמרה הבחירה.

🔒 חדרים שיישארו נעולים:
${interaction.values.length}

לחץ עכשיו על:
🔓 פתח חדרים
`,

            ephemeral:true

        });


    }

}
            // ==========================
            // כפתורים
            // ==========================

            if (interaction.isButton()) {


                console.log("BUTTON:", interaction.customId);
                // ==========================
// הצטרפות להגרלה
// ==========================

if (interaction.customId === "join_giveaway") {


    const giveaway = db.prepare(`

        SELECT *

        FROM giveaways

        WHERE message_id = ?

    `)
    .get(
        interaction.message.id
    );



    if (!giveaway) {


        return interaction.reply({

            content:
            "❌ ההגרלה לא נמצאה",

            ephemeral:true

        });


    }





    let participants =
        JSON.parse(
            giveaway.participants
        );





    if(participants.includes(interaction.user.id)) {


        return interaction.reply({

            content:
            "❌ כבר הצטרפת להגרלה",

            ephemeral:true

        });


    }





    participants.push(
        interaction.user.id
    );





    db.prepare(`

        UPDATE giveaways

        SET participants = ?

        WHERE id = ?

    `)
    .run(

        JSON.stringify(participants),

        giveaway.id

    );





    return interaction.reply({

        content:
`
🎉 נכנסת להגרלה!

👥 מספר משתתפים:
${participants.length}
`,

        ephemeral:true

    });



}
                // ==========================
// בדיקת יתרה מהחנות
// ==========================

if (interaction.customId === "check_balance") {


    const coins =
        db.prepare(`

            SELECT amount

            FROM coins

            WHERE user_id = ?

            AND guild_id = ?

        `)
        .get(

            interaction.user.id,

            interaction.guild.id

        );



    return interaction.reply({

        content:

`
💰 היתרה שלך:

${coins ? coins.amount : 0} מטבעות
`,

        ephemeral:true

    });


}
                // ==========================
// קניית רול מהחנות
// ==========================

if (interaction.customId.startsWith("buy_role_")) {


    const roleSaleId =
        interaction.customId.split("_")[2];



    const sale =
        db.prepare(`

            SELECT *

            FROM shop_roles

            WHERE id = ?

        `)
        .get(
            roleSaleId
        );



    if (!sale) {


        return interaction.reply({

            content:
            "❌ הרול לא נמצא בחנות",

            ephemeral:true

        });


    }





    const coins =
        db.prepare(`

            SELECT *

            FROM coins

            WHERE user_id = ?

            AND guild_id = ?

        `)
        .get(

            interaction.user.id,

            interaction.guild.id

        );





    let finalPrice = sale.price;



const discount =
    db.prepare(`

        SELECT *

        FROM shop_discounts

        WHERE guild_id = ?

        AND role_id = ?

    `)
    .get(

        interaction.guild.id,

        sale.role_id

    );



if (discount && discount.expires_at > Date.now()) {


    finalPrice =
        Math.floor(
            sale.price * (100 - discount.percent) / 100
        );


}



if (!coins || coins.amount < finalPrice) {


    return interaction.reply({

        content:

`
❌ אין לך מספיק מטבעות

💰 מחיר:
${finalPrice}

💳 יש לך:
${coins ? coins.amount : 0}
`,

        ephemeral:true

    });


}




    const role =
        interaction.guild.roles.cache.get(
            sale.role_id
        );
        if (interaction.member.roles.cache.has(role.id)) {


    return interaction.reply({

        content:
        `
❌ יש לך כבר את הרול הזה

🎭 רול:
${role}
`,

        ephemeral:true

    });


}



    if (!role) {


        return interaction.reply({

            content:
            "❌ הרול לא קיים",

            ephemeral:true

        });


    }






    // הורדת כסף

    db.prepare(`

        UPDATE coins

        SET amount = amount - ?

        WHERE user_id = ?

        AND guild_id = ?

    `)
    .run(

        finalPrice,

        interaction.user.id,

        interaction.guild.id

    );





    // הוספת רול

    await interaction.member.roles.add(role);





    await interaction.reply({

        content:

`
✅ קנית את הרול!

🎭 רול:
${role}

⏰ זמן:
10 דקות

💰 מחיר:
${finalPrice}
`

    });





    // הסרה אחרי 10 דקות

    setTimeout(async()=>{


        await interaction.member.roles.remove(role)
        .catch(()=>{});



    },10 * 60 * 1000);



}
                // ==========================
// כפתור סיום תזכורת
// ==========================

if (interaction.customId.startsWith("reminder_done_")) {


    const reminderId =
        interaction.customId.split("_")[2];



    if (client.reminders && client.reminders[reminderId]) {


        client.reminders[reminderId].stop();


        delete client.reminders[reminderId];


    }



    db.prepare(`

        DELETE FROM reminders

        WHERE id = ?

    `)
    .run(
        reminderId
    );



    return interaction.update({

        content:
`
✅ התזכורת סומנה כנקראה.

🔕 לא תקבל יותר תזכורות ממנה.
`,

        components:[]

    });


}
                // ==========================
// אישור פתיחת חדרים
// ==========================

if (interaction.customId === "unlock_confirm") {


    const lockedChannels =
        interaction.client.unlockChannels || [];



    await interaction.deferUpdate();



    let unlocked = 0;



    for (const [, channel] of interaction.guild.channels.cache) {


        if (!channel.permissionOverwrites) {
            continue;
        }



        if (lockedChannels.includes(channel.id)) {


            console.log(
                "🔒 נשאר נעול:",
                channel.name
            );


            continue;

        }




        await channel.permissionOverwrites.edit(

            interaction.guild.roles.everyone,

            {

                ViewChannel:null,

                SendMessages:null,

                Connect:null,

                Speak:null

            }

        )

        .then(()=>{


            console.log(
                "🔓 נפתח:",
                channel.name
            );


            unlocked++;


        })

        .catch(error=>{


            console.log(
                "❌ שגיאה:",
                channel.name,
                error.message
            );


        });


    }




    return interaction.editReply({

        content:

`
🔓 פתיחת חדרים הסתיימה

✅ חדרים שנפתחו:
${unlocked}

🔒 חדרים שנשארו נעולים:
${lockedChannels.length}
`,

        components:[]

    });


}



                // ==========================
                // אישור חוקים
                // ==========================

                if (interaction.customId === "accept_rules") {


                    const settings = db.prepare(`
                        SELECT *
                        FROM security_settings
                        WHERE guild_id = ?
                    `).get(
                        interaction.guild.id
                    );


                    if (!settings) {

                        return interaction.reply({
                            content:"❌ מערכת האבטחה לא מוגדרת",
                            ephemeral:true
                        });

                    }



                    const role =
                        interaction.guild.roles.cache.get(
                            settings.role_id
                        );



                    if (!role) {

                        return interaction.reply({
                            content:"❌ הרול לא נמצא",
                            ephemeral:true
                        });

                    }



                    if (interaction.member.roles.cache.has(role.id)) {

                        return interaction.reply({
                            content:"✅ כבר אישרת את החוקים",
                            ephemeral:true
                        });

                    }



                    await interaction.member.roles.add(role);



                    return interaction.reply({

                        content:
`✅ אישרת את חוקי השרת!

קיבלת את הרול:
${role}`,

                        ephemeral:true

                    });

                }





                // ==========================
                // אישור באן
                // ==========================


                if (interaction.customId.startsWith("approve_ban_")) {


                    const allowed =
                        await hasPermission(
                            interaction.member,
                            "MANAGER"
                        );


                    if (!allowed) {

                        return interaction.reply({

                            content:
                            "❌ רק מנהל יכול לאשר באן",

                            ephemeral:true

                        });

                    }



                    const userId =
                        interaction.customId.split("_")[2];



                    const user =
                        await interaction.client.users
                        .fetch(userId)
                        .catch(()=>null);



                    if (!user) {

                        return interaction.reply({

                            content:
                            "❌ המשתמש לא נמצא",

                            ephemeral:true

                        });

                    }



                    await interaction.guild.members.ban(
                        user.id,
                        {
                            reason:"Ban approved"
                        }
                    )
                    .catch(()=>{});



                    await user.send(
`
🔨 קיבלת באן מהשרת

📍 שרת:
${interaction.guild.name}

👮 אושר על ידי:
${interaction.user}
`
                    )
                    .catch(()=>{});



                    return interaction.update({

                        content:
`✅ הבאן אושר

👤 משתמש:
${user}

👮 מאשר:
${interaction.user}`,

                        components:[]

                    });


                }





                // ==========================
                // ביטול באן
                // ==========================


                if (interaction.customId.startsWith("cancel_ban_")) {


                    return interaction.update({

                        content:
                        "❌ הבאן בוטל",

                        components:[]

                    });

                }





                // ==========================
                // NUKE
                // ==========================


                if (interaction.customId === "confirm_nuke") {


                    const allowed =
                        await hasPermission(
                            interaction.member,
                            "MANAGER"
                        );


                    if (!allowed) {

                        return interaction.reply({

                            content:
                            "❌ רק מנהלים יכולים להפעיל מצב חירום",

                            ephemeral:true

                        });

                    }



                    await interaction.deferUpdate();
                    await interaction.followUp({
    content:"🚨 מתחיל מצב חירום, נועל חדרים...",
    ephemeral:true
});



                    db.prepare(`
                        INSERT INTO nuke_settings
                        (
                            guild_id,
                            active
                        )
                        VALUES (?,1)

                        ON CONFLICT(guild_id)

                        DO UPDATE SET active = 1

                    `)
                    .run(
                        interaction.guild.id
                    );



                    let locked = 0;



                    for (
                        const channel of interaction.guild.channels.cache.values()
                    ) {


                        if (!channel.permissionOverwrites) {
                            continue;
                        }



                        await channel.permissionOverwrites.edit(

                            interaction.guild.roles.everyone,

                            {
                                ViewChannel:false,
                                SendMessages:false,
                                Connect:false
                            }

                        )
                        .then(()=>{

                            console.log(
                                "🔒 Locked:",
                                channel.name
                            );

                            locked++;

                        })
                        .catch(error=>{

                            console.log(
                                "❌ Failed:",
                                channel.name,
                                error.message
                            );

                        });


                    }



try {

    await interaction.editReply({

        content:
`
🚨 מצב חירום הופעל

🔒 חדרים שננעלו:
${locked}

👑 מנהלים עדיין יכולים להשתמש בשרת
`,

        components:[]

    });

} catch(error) {

    console.log(
        "Failed updating button:",
        error.message
    );

}


return;

}



// ==========================
// ביטול NUKE
// ==========================

                if (interaction.customId === "cancel_nuke") {


                    return interaction.update({

                        content:
                        "❌ מצב החירום בוטל",

                        components:[]

                    });


                }


// ==========================
// אישור בקשת רול
// ==========================

if (interaction.customId.startsWith("approve_role_")) {


    const allowed =
        await hasPermission(
            interaction.member,
            "MANAGER"
        );


    if (!allowed) {

        return interaction.reply({
            content:"❌ רק מנהלים יכולים לאשר רולים",
            ephemeral:true
        });

    }


    const data =
        interaction.customId.split("_");


    const userId = data[2];
    const roleId = data[3];
    const minutes = Number(data[4]);


    const member =
        await interaction.guild.members.fetch(userId)
        .catch(()=>null);


    const role =
        interaction.guild.roles.cache.get(roleId);


    if (!member || !role) {

        return interaction.reply({
            content:"❌ המשתמש או הרול לא נמצאו",
            ephemeral:true
        });

    }


    await member.roles.add(role);


    member.send(
`
✅ בקשת הרול שלך אושרה!

🎭 רול:
${role}

⏰ זמן:
${minutes} דקות
`
    )
    .catch(()=>{});


    setTimeout(async()=>{

        await member.roles.remove(role)
        .catch(()=>{});


        member.send(
`
⌛ הזמן נגמר.

הרול ${role.name} הוסר.
`
        )
        .catch(()=>{});


    }, minutes * 60 * 1000);



    return interaction.update({

        content:
`✅ הרול אושר

👤 משתמש:
${member}

🎭 רול:
${role}

⏰ זמן:
${minutes} דקות`,

        components:[]

    });


}


// ==========================
// דחיית בקשת רול
// ==========================

if (interaction.customId.startsWith("deny_role_")) {


    const userId =
        interaction.customId.split("_")[2];


    const user =
        await interaction.client.users.fetch(userId)
        .catch(()=>null);



    if(user){

        user.send(
`
❌ בקשת הרול שלך נדחתה.
`
        )
        .catch(()=>{});

    }


    return interaction.update({

        content:"❌ בקשת הרול נדחתה",

        components:[]

    });


}
                return;

            }





            // ==========================
            // סלאשים
            // ==========================


            if (!interaction.isChatInputCommand()) return;



            console.log(
                "Command received:",
                interaction.commandName
            );





            // ==========================
            // לוג פקודות
            // ==========================


            if (interaction.guild) {


                const logSettings =
                    db.prepare(`
                        SELECT channel_id
                        FROM command_logs
                        WHERE guild_id = ?
                    `)
                    .get(
                        interaction.guild.id
                    );



                if (logSettings) {


                    const logChannel =
                        interaction.guild.channels.cache.get(
                            logSettings.channel_id
                        );



                    if (logChannel) {


                        logChannel.send(
`
📌 **Command Used**

👤 משתמש:
${interaction.user}

⚙️ פקודה:
\`/${interaction.commandName}\`

💬 חדר:
${interaction.channel}

🕒 זמן:
${new Date().toLocaleString()}

📍 שרת:
${interaction.guild.name}
`
                        )
                        .catch(()=>{});


                    }

                }

            }







            const command =
                client.commands.get(
                    interaction.commandName
                );



            if (!command) {


                console.log(
                    "Command not found"
                );


                return;

            }






            try {


                await command.execute(interaction, client)
    interaction,
    client
;


            } catch(error) {


                console.error(
                    "COMMAND ERROR:",
                    error
                );



                if (interaction.replied || interaction.deferred) {


                    await interaction.followUp({

                        content:
                        "❌ קרתה שגיאה בזמן ביצוע הפקודה",

                        ephemeral:true

                    })
                    .catch(()=>{});



                } else {


                    await interaction.reply({

                        content:
                        "❌ קרתה שגיאה בזמן ביצוע הפקודה",

                        ephemeral:true

                    })
                    .catch(()=>{});


                }


            }


        } catch(error) {


            console.error(
                "INTERACTION ERROR:",
                error
            );



            if (!interaction.replied && !interaction.deferred) {


                await interaction.reply({

                    content:
                    "❌ הבוט נתקל בשגיאה",

                    ephemeral:true

                })
                .catch(()=>{});


            }


        }


    }

};