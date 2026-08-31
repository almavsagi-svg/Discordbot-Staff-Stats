require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const commandHandler = require("./handlers/commandHandler");
require("./database/db");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

commandHandler(client);
const db = require("./database/db");
// סיום הגרלות אוטומטי

setInterval(async()=>{


    const giveaways =
        require("./database/db")
        .prepare(`

            SELECT *

            FROM giveaways

            WHERE end_time <= ?

        `)
        .all(
            Date.now()
        );



    for(const giveaway of giveaways){


        const db =
            require("./database/db");



        const participants =
            JSON.parse(
                giveaway.participants
            );



        const channel =
            client.channels.cache.get(
                giveaway.channel_id
            );



        if(!channel){

            db.prepare(`

                DELETE FROM giveaways

                WHERE id = ?

            `)
            .run(
                giveaway.id
            );

            continue;

        }





        const message =
            await channel.messages
            .fetch(giveaway.message_id)
            .catch(()=>null);





        // אין משתתפים

        if(participants.length === 0){



            if(message){

                await message.delete()
                .catch(()=>{});

            }




            db.prepare(`

                DELETE FROM giveaways

                WHERE id = ?

            `)
            .run(
                giveaway.id
            );


            continue;

        }






        // בחירת זוכה

        const winnerId =
            participants[
                Math.floor(
                    Math.random() * participants.length
                )
            ];



        const user =
            await client.users
            .fetch(winnerId)
            .catch(()=>null);





        if(user){


            const exists =
                db.prepare(`

                    SELECT *

                    FROM coins

                    WHERE user_id = ?

                    AND guild_id = ?

                `)
                .get(

                    winnerId,

                    giveaway.guild_id

                );




            if(exists){


                db.prepare(`

                    UPDATE coins

                    SET amount = amount + ?

                    WHERE user_id = ?

                    AND guild_id = ?

                `)
                .run(

                    giveaway.coins,

                    winnerId,

                    giveaway.guild_id

                );


            } else {


                db.prepare(`

                    INSERT INTO coins

                    (

                    guild_id,

                    user_id,

                    amount,

                    last_daily

                    )

                    VALUES (?, ?, ?, ?)

                `)
                .run(

                    giveaway.guild_id,

                    winnerId,

                    giveaway.coins,

                    0

                );


            }



        }







        if(message){


            await message.edit({

                content:

`
🎉 **ההגרלה הסתיימה!**

🏆 זוכה:
${user || "לא נמצא"}

💰 פרס:
${giveaway.coins} מטבעות
`,

                components:[]

            })
            .catch(()=>{});


        }







        db.prepare(`

            DELETE FROM giveaways

            WHERE id = ?

        `)
        .run(
            giveaway.id
        );



    }


}, 10000);


setInterval(async () => {


    const reminders = db.prepare(`

        SELECT *

        FROM reminders

        WHERE remind_time <= ?

    `)
    .all(
        Date.now()
    );



    for (const reminder of reminders) {


        try {


            const user =
                await client.users.fetch(
                    reminder.user_id
                );



            let stopped = false;



            const sendReminder = async () => {


                if (stopped) return;



                const message =
                await user.send({

                    content:
`
🔔 תזכורת!

<@${user.id}>

📝 ${reminder.message}
`,

                    components:[

                        {

                            type:1,

                            components:[

                                {

                                    type:2,

                                    label:"✅ ראיתי",

                                    style:3,

                                    custom_id:
                                    `reminder_done_${reminder.id}`

                                }

                            ]

                        }

                    ]

                });



            };





            await sendReminder();



            const interval =
                setInterval(async ()=>{


                    if(stopped) return;


                    await user.send(
`
🔔 עדיין מחכה לך תזכורת!

<@${user.id}>

📝 ${reminder.message}
`
                    )
                    .catch(()=>{});


                },30000);





            // שמירת האינטרוול בזיכרון

            client.reminders =
                client.reminders || {};



            client.reminders[reminder.id] = {

                stop:()=>{

                    stopped=true;

                    clearInterval(interval);

                }

            };





        } catch(error){


            console.log(
                "Reminder error:",
                error.message
            );


        }



        // מוחק מהמסד כדי שלא ישלח שוב אחרי ריסט

        db.prepare(`

            DELETE FROM reminders

            WHERE id = ?

        `)
        .run(
            reminder.id
        );


    }



},10000);


// טעינת Events
const eventFiles = fs.readdirSync("./events");

for (const file of eventFiles) {

    const event = require(`./events/${file}`);

    if (event.name) {

        client.on(
            event.name,
            (...args) => event.execute(...args, client)
        );

        console.log(`Loaded event: ${event.name}`);
    }
}


client.login(process.env.TOKEN);