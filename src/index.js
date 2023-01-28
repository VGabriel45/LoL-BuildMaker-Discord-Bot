const {Client, IntentsBitField, Collection, Events} = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '',
});
const openai = new OpenAIApi(configuration);

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.on('ready', (c) => {
    console.log(`🤖 ${c.user.username} bot is running !`);
})

client.on('messageCreate', async (msg) => {
    if(msg.author.bot) {
        return;
    }
    if(msg.content.startsWith('/build_for_')){
        msg.reply('Let me think ... 🤔') 
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Genereate the best build for the following champion from League 
            of Legends and a short description of why this build is powerful to use. Show the items in a list format and then below add the information.
            : ${msg.content.split('_')[2]}`,
            temperature: 0.5,
            max_tokens: 500,
            });
       msg.reply(response.data.choices[0].text) 
    }
})

client.login('');

