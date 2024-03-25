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
    const message = interaction.options.getString('message')
    
    await interaction.deferReply()
    await interaction.deleteReply()

    await interaction.channel.send(message)
  }
}
