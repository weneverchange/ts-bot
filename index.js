const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')
const { token } = require('./config.json')
const fs = require('node:fs')
const path = require('node:path')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ]
})

client.commands = new Collection()

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs.readdirSync(commandsPath).filter(
    (file) => file.endsWith('.js')
  )
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command)
    } else {
      console.log(`[WARNING] The command at ${filePath} ` +
      'is missing a required "data" or "execute" property.')
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
  }

  try {
    if (interaction.isChatInputCommand()) {
      await command.execute(interaction)
    } else if (interaction.isAutocomplete()) {
      await command.autocomplete(interaction)
    }
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error ' +
       'while executing the command!',
        ephemeral: true
      })
    }
  }
})

client.once(Events.ClientReady, (ready) => console.log(
  `Ready ${ready.user.tag}`)
)

client.login(token)
