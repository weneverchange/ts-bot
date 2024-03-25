const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Repeats a message.')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message to be repeated by the bot.')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute (interaction) {
    let message = interaction.options.getString('message')

    message = message.includes('\\n') ?
      message.split('\\n').join('\n') : message
    
    await interaction.deferReply()
    await interaction.deleteReply()

    await interaction.channel.send(message)
  }
}
