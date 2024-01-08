const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js')
const { Pagination } = require('pagination.djs')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Shows full user profile.')
    .addBooleanOption(option =>
      option
        .setName('server_avatar')
        .setDescription('Display your server profiles avatar')
    )
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Select the user')
    ),
  async execute (interaction) {
    const pagination = new Pagination(interaction)
    const selectUser = interaction.options.getMember('user') ||
    interaction.options.getUser('user')
    const member = selectUser || interaction.member

    const serverOrSelectUserAvatar = member.displayAvatarURL({ size: 4096 })
    const avatar = selectUser
      ? serverOrSelectUserAvatar
      : member.user.displayAvatarURL({ size: 4096 })
    const defaultAvatar = member.defaultAvatarURL
    const displayServerAvatar = interaction.options.getBoolean('server_avatar')
    const thumbnail = displayServerAvatar
      ? serverOrSelectUserAvatar
      : avatar || defaultAvatar

    const roles = member.roles?.cache.map(role => role.name).join(', ')
    const permissions = member.permissions?.toArray().join(', ')
    const avatarType = displayServerAvatar ? 'server' : 'discord'
    const fetchUser = await member.user?.fetch()
    const banner = fetchUser?.bannerURL({ size: 4096 })
    const createdAt = member.user?.createdAt || member.createdAt

    let infoEmbed = new EmbedBuilder()
      .setColor(0x94BFE9)
      .setThumbnail(thumbnail)
      .setTitle(`${member.displayName}'s profile`)
      .addFields({
        name: 'user info',
        value: `**id**: ${member.id}
        **joined server**: ${time(member.joinedAt)}
        **joined discord**: ${time(createdAt)}`
      })

    if (roles && permissions) {
      infoEmbed = infoEmbed
        .addFields({
          name: 'roles',
          value: roles
        })
        .addFields({
          name: 'permissions',
          value: permissions
        })
    }

    const avatarEmbed = new EmbedBuilder()
      .setColor(0x94BFE9)
      .setTitle(`${member.displayName}'s avatar`)
      .setDescription(`this is their ${avatarType}'s avatar`)
      .setImage(thumbnail)

    const bannerEmbed = banner
      ? new EmbedBuilder()
        .setColor(0x94BFE9)
        .setTitle(`${member.displayName}'s banner`)
        .setImage(banner)
      : null

    const embeds = [infoEmbed, avatarEmbed, bannerEmbed].filter(x => x)

    pagination.setEmbeds(embeds, (embed, index, array) => {
      return embed.setFooter({ text: `Page ${index + 1}/${array.length}` })
    })

    pagination.render()
  }
}
