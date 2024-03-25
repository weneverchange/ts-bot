const { SlashCommandBuilder, PermissionFlagsBits, Colors, EmbedBuilder } = require("discord.js");

class ConditionalBuilder {
  #conditions = [];

  addCondition(condition, callback) {
    this.#conditions.push({ condition, callback });
    return this;
  }

  evaluate(options, obj) {
    for (const { condition, callback } of this.#conditions) {
      if (condition(options)) {
        callback(obj);
      }
    }
  }
}

function exists(value) {
  return value != null && (typeof value !== 'string' || value.trim() !== '');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Builds an embed with the selected options.')
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Embed description.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('Embed title.')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('URL to be browsed when click on title.')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('color')
        .setDescription('Discord embed colors.')
        .setRequired(false)
        .addChoices(
          { name: 'White', value: "White" },
          { name: 'Aqua', value: "Aqua" },
          { name: 'Green', value: "Green" },
          { name: 'Blue', value: "Blue" },
          { name: 'Yellow', value: "Yellow" },
          { name: 'Purple', value: "Purple" },
          { name: 'LuminousVividPink', value: "LuminousVividPink" },
          { name: 'Fuchsia', value: "Fuchsia" },
          { name: 'Gold', value: "Gold" },
          { name: 'Orange', value: "Orange" },
          { name: 'Red', value: "Red" },
          { name: 'Grey', value: "Grey" },
          { name: 'Navy', value: "Navy" },
          { name: 'DarkAqua', value: "DarkAqua" },
          { name: 'DarkGreen', value: "DarkGreen" },
          { name: 'DarkBlue', value: "DarkBlue" },
          { name: 'DarkPurple', value: "DarkPurple" },
          { name: 'DarkVividPink', value: "DarkVividPink" },
          { name: 'DarkGold', value: "DarkGold" },
          { name: 'DarkOrange', value: "DarkOrange" },
          { name: 'DarkRed', value: "DarkRed" },
          { name: 'Blurple', value: "Blurple" },
          { name: 'Greyple', value: "Greyple" },
          { name: 'DarkButNotBlack', value: "DarkButNotBlack" },
          { name: 'NotQuiteBlack', value: "NotQuiteBlack" }
        )
    )
    .addBooleanOption(option =>
      option
        .setName('timestamp')
        .setDescription('Current date and time displayed on footer')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('footericon')
        .setDescription('Icon (URL) placed next to the footer text.')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('footer')
        .setDescription('Text placed on footer.')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('thumbnail')
        .setDescription('Image (URL) displayed on the right side.')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('image')
        .setDescription('Image (URL) vertically end displayed.')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('authorname')
        .setDescription('Author is the embed header.')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('authorurl')
        .setDescription('URL to be browsed when click on author.')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('authoricon')
        .setDescription('Image (URL) placed next to the author.')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const description = interaction.options.getString('description')

    const title = interaction.options.getString('title')

    const url = interaction.options.getString('url')

    const color = interaction.options.getString('color')

    const timestamp = interaction.options.getBoolean('timestamp')

    const footerIcon = interaction.options.getString('footericon')

    const footer = interaction.options.getString('footer')

    const thumbnail = interaction.options.getString('thumbnail')

    const image = interaction.options.getString('image')

    const authorName = interaction.options.getString('authorname')

    const authorUrl = interaction.options.getString('authorurl')

    const authorIcon = interaction.options.getString('authoricon')

    const conditionalBuilder = new ConditionalBuilder()

    const resultEmbed = new EmbedBuilder()
      .setDescription(description)

    const { [color]: colorValue } = Colors;

    const condtionalOptions = {
      hasTitle: exists(title),
      hasUrl: exists(url),
      hasColor: exists(color),
      hasTimestamp: exists(timestamp),
      hasFooterIcon: exists(footerIcon),
      hasFooter: exists(footer),
      hasThumbnail: exists(thumbnail),
      hasImage: exists(image),
      hasAuthorName: exists(authorName),
      hasAuthorUrl: exists(authorUrl),
      hasAuthorIcon: exists(authorIcon)
    }

    conditionalBuilder
    .addCondition(
      (options) => options.hasTitle,
      (embed) => embed.setTitle(title)
    )
    .addCondition(
      (options) => options.hasUrl,
      (embed) => embed.setURL(url)
    )
    .addCondition(
      (options) => options.hasColor,
      (embed) => embed.setColor(colorValue)
    )
    .addCondition(
      (options) => options.hasTimestamp,
      (embed) => embed.setTimestamp(Date.now())
    )
    .addCondition(
      (options) => options.hasFooterIcon && options.hasFooter,
      (embed) => embed.setFooter({ text: footer, iconURL: footerIcon })
    )
    .addCondition(
      (options) => options.hasThumbnail,
      (embed) => embed.setThumbnail(thumbnail)
    )
    .addCondition(
      (options) => options.hasImage,
      (embed) => embed.setImage(image)
    )
    .addCondition(
      (options) => options.hasAuthorName
        && options.authorUrl && options.HasAuthorUrl,
      (embed) => embed.setAuthor(
        { name: authorName, url: authorUrl, iconURL: authorIcon }
      )
    )
    
    conditionalBuilder.evaluate(condtionalOptions, resultEmbed)

    await interaction.deferReply()
    await interaction.deleteReply()

    await interaction.channel.send({ embeds: [resultEmbed] })
  }
}
