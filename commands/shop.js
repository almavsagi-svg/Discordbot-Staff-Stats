const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/db");


module.exports = {


    data: new SlashCommandBuilder()

        .setName("shop")

        .setDescription("פתיחת חנות הרולים"),



    async execute(interaction) {


        const roles = db.prepare(`

            SELECT *

            FROM shop_roles

            WHERE guild_id = ?

        `)
        .all(
            interaction.guild.id
        );



        if (roles.length === 0) {


            return interaction.reply({

                content:
                "🛒 החנות ריקה כרגע",

                ephemeral:true

            });


        }




        const embed =
            new EmbedBuilder()

            .setTitle("🛒 חנות רולים")

            .setDescription(
                "בחר רול שאתה רוצה לקנות 👇"
            );




        const buttons = [];




        for (const item of roles) {



            const role =
                interaction.guild.roles.cache.get(
                    item.role_id
                );



            if (!role) continue;




            let price = item.price;
let discountText = "";

const discount =
    db.prepare(`

        SELECT *

        FROM shop_discounts

        WHERE guild_id = ?

        AND role_id = ?

    `)
    .get(

        interaction.guild.id,

        role.id

    );



if (discount) {


    if (discount.expires_at > Date.now()) {


        price =
            Math.floor(
                item.price * (100 - discount.percent) / 100
            );


        discountText =
`
🏷️ הנחה:
${discount.percent}%

💰 מחיר אחרי הנחה:
${price} מטבעות
`;



    } else {


        db.prepare(`

            DELETE FROM shop_discounts

            WHERE id = ?

        `)
        .run(
            discount.id
        );


    }


}



embed.addFields({

    name:
    `🎭 ${role.name}`,

    value:
`
💰 מחיר:
${discountText || price + " מטבעות"}

⏰ זמן: 10 דקות
`,

    inline:true

});





            buttons.push(

                new ButtonBuilder()

                .setCustomId(
                    `buy_role_${item.id}`
                )

                .setLabel(
                    `קנה ${role.name}`
                )

                .setStyle(
                    ButtonStyle.Success
                )

            );



        }




        // מקסימום 8 כפתורים בשורה אחת
buttons.push(

    new ButtonBuilder()

    .setCustomId(
        "check_balance"
    )

    .setLabel(
        "💰 בדיקת יתרה"
    )

    .setStyle(
        ButtonStyle.Primary
    )

);
        const rows = [];



        for (
            let i = 0;
            i < buttons.length;
            i += 8
        ) {


            rows.push(

                new ActionRowBuilder()

                .addComponents(

                    buttons.slice(
                        i,
                        i + 8
                    )

                )

            );


        }




        await interaction.reply({

            embeds:[
                embed
            ],

            components:
            rows.slice(0,5)

        });


    }


};