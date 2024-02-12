const { SlashCommandBuilder, time, ActivityType } = require('discord.js')
const { clientId, clientSecret, spotifyBaseUrl } = require('../../appsettings.json')
const { writeFile, readFile } = require('fs')
const path = require('path')
const { promisify } = require('util')
const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)

async function getToken (token) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: !token
      ? new URLSearchParams({
        grant_type: 'client_credentials'
      })
      : new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token,
        client_id: clientId
      })
  })

  return await response.json()
}

async function fetchWithRetry (url, options, maxRetries = 3) {
  let retries = 0
  let token

  const appSettingsPath = path.join(__dirname, '../../appsettings.json')

  try {
    const data = await readFileAsync(appSettingsPath, 'utf8')
    const parsedData = JSON.parse(data)
    token = parsedData.spotifyToken
  } catch (error) {
    console.error('Error reading token from file:', error)
  }

  const storeTokenIfNeeded = async (newToken) => {
    try {
      const data = await readFileAsync(appSettingsPath, 'utf8')
      const parsedData = JSON.parse(data)
      if (parsedData.spotifyToken !== newToken.access_token) {
        parsedData.spotifyToken = newToken.access_token
        await writeFileAsync(appSettingsPath, JSON.stringify(parsedData, null, 2))
        console.log('Token stored')
      } else {
        console.log('Token not changed. Skipping storage.')
      }
    } catch (error) {
      console.error('Couldn\'t store token due to some error:', error)
    }
  }

  try {
    while (retries < maxRetries) {
      options.headers = { Authorization: 'Bearer ' + token }
      const response = await fetch(url, options)

      if (response.status === 401) {
        console.log('401. Retrying...')
        retries++
        token = await getToken() // Get new token
        await storeTokenIfNeeded(token)
      } else {
        return response
      }
    }
  } catch (error) {
    console.error('Error whilst fetching:', error)
  }
}

async function getTracks (track) {
  const response = await fetchWithRetry(spotifyBaseUrl + `search?q=${encodeURIComponent(track)}&type=track&limit=25`, {
    method: 'GET'
  })

  return await response.json()
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sotw')
    .setDescription('Shows your selected song of the week.')
    .addBooleanOption(option =>
      option
        .setName('remove_timestamp')
        .setDescription('Remove timestamp from message')
    )
    .addStringOption(option =>
      option
        .setName('track')
        .setDescription('Tracks name to be searched in Spotify')
        .setAutocomplete(true)
    ),
  async autocomplete (interaction) {
    let track = await interaction.options.getFocused()
    if (!track) {
      const member = await interaction?.guild?.members?.fetch(interaction.user.id)
      const memberActivity = member.presence?.activities?.find(a => a.type === ActivityType.Listening)
      if (memberActivity) {
        track = memberActivity.details
      }
    }
    const tracksObject = await getTracks(track)
    const tracks = tracksObject?.tracks?.items?.map(
      (i) => ({ name: i.name, value: i.external_urls.spotify })
    )
    await interaction.respond(
      !tracks ? [{ name: 'Not found', value: '' }] : tracks
    )
  },
  async execute (interaction) {
    const removeTimestamp = interaction.options.getBoolean('remove_timestamp')
    const timestamp = time(new Date(), 'R')
    const trackUri = interaction.options.getString('track')
    await interaction.deferReply()
    await interaction.deleteReply()
    await interaction.channel.send(`${!removeTimestamp ? timestamp : ''}\n${trackUri}`)
  }
}
