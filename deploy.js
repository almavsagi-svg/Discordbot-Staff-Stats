require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");


const commands = [];

const commandsPath = path.join(
    __dirname,
    "commands"
);


const commandFiles = fs.readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));



for (const file of commandFiles) {


    try {


        const command =
            require(
                path.join(
                    commandsPath,
                    file
                )
            );



        if (!command.data) {

            console.log(
                `⚠️ Skipped ${file} - no command data`
            );

            continue;

        }



        commands.push(
            command.data.toJSON()
        );


        console.log(
            `Loaded for deploy: ${command.data.name}`
        );



    } catch(error) {


        console.log(
            `❌ Failed loading ${file}`
        );


        console.error(error);


    }


}




const rest = new REST({

    version:"10"

})
.setToken(
    process.env.TOKEN
);






(async()=>{


    try {


        console.log(
            "Registering global commands..."
        );



        await rest.put(

            Routes.applicationCommands(

                process.env.CLIENT_ID

            ),

            {

                body:commands

            }

        );



        console.log(
            `✅ Commands registered! (${commands.length})`
        );



    } catch(error) {


        console.error(
            "DEPLOY ERROR:",
            error
        );


    }



})();