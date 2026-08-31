const fs = require("fs");
const path = require("path");


module.exports = (client) => {


    const commandsPath =
        path.join(
            __dirname,
            "../commands"
        );



    const commandFiles =
        fs.readdirSync(commandsPath)
        .filter(file =>
            file.endsWith(".js")
        );



    for (const file of commandFiles) {


        try {


            const command =
                require(
                    path.join(
                        commandsPath,
                        file
                    )
                );



            if (!command.data || !command.execute) {


                console.log(
                    `⚠️ Skipped ${file} - not a valid command`
                );


                continue;

            }



            client.commands.set(
                command.data.name,
                command
            );



            console.log(
                `Loaded command: ${command.data.name}`
            );



        } catch(error) {


            console.log(
                `❌ Failed loading ${file}`
            );


            console.error(error);


        }


    }


};