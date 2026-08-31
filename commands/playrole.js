const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("playrole")
        .setDescription("בקשת רול זמני")

        .addRoleOption(option =>
            option
            .setName("role")
            .setDescription("איזה רול אתה רוצה?")
            .setRequired(true)
        )

        .addIntegerOption(option =>
            option
            .setName("minutes")
            .setDescription("לכמה דקות?")
            .setRequired(true)
        ),


    async execute(interaction) {


        const role =
            interaction.options.getRole("role");


        const minutes =
            interaction.options.getInteger("minutes");



        const managerRole =
            interaction.guild.roles.cache.find(
                r => r.permissions.has(
                    PermissionFlagsBits.Administrator
                )
            );


        if(!managerRole){

            return interaction.reply({
                content:"❌ לא נמצא מנהל לקבלת הבקשה",
                ephemeral:true
            });

        }



        const manager =
            interaction.guild.members.cache.find(
                m => m.roles.cache.has(managerRole.id)
            );



        if(!manager){

            return interaction.reply({
                content:"❌ אין מנהל מחובר כרגע",
                ephemeral:true
            });

        }



        const buttons =
        new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()

            .setCustomId(
                `approve_role_${interaction.user.id}_${role.id}_${minutes}`
            )

            .setLabel("✅ אישור")

            .setStyle(
                ButtonStyle.Success
            ),



            new ButtonBuilder()

            .setCustomId(
                `deny_role_${interaction.user.id}`
            )

            .setLabel("❌ דחייה")

            .setStyle(
                ButtonStyle.Danger
            )

        );




        await manager.send({

            content:
`
🎭 **בקשת רול חדשה**

👤 משתמש:
${interaction.user}

🎭 רול:
${role}

⏰ זמן:
${minutes} דקות
`,

            components:[
                buttons
            ]

        });



        return interaction.reply({

            content:
            "✅ הבקשה נשלחה למנהל",

            ephemeral:true

        });


    }

};