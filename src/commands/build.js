const { SlashCommandBuilder } = require('discord.js');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('build_for')
		.setDescription('Replies with a build for the desired champion')
        .addStringOption(option =>
            option
                .setName('champion')
                .setDescription('Build for this champion')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('role')
                .setDescription('The role of your champion')
                .addChoices(
                    { name: 'ADC', value: 'ad carry' },
                    { name: 'APC', value: 'ap carry' },
                    { name: 'Support', value: 'support' },
                    { name: 'Tank', value: 'tank' },
                    { name: 'Jungler', value: 'jungler' },
                )
                .setRequired(true)),
	async execute(interaction) {
        const champ = interaction.options.getString('champion');
        const role = interaction.options.getString('role');
        console.log(champ);
        await interaction.reply('Thinking ... 🤔');
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Genereate the best build for ${champ} champion from League 
            of Legends, I want the build to be for ${role}, only ${role} items for this champion build, and a short description of the build. 
            Show the items in a list format and then below add the information.
            `,
            temperature: 0.7,
            max_tokens: 200,
            });
		await interaction.editReply(`Ready ✅ \n ${response.data.choices[0].text}`);
	},
};