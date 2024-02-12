const { Service } = require('node-windows')

const path = require('path')

const service = new Service({
  name: 'TSBot',
  description: 'discord bot',
  script: path.join(__dirname, 'index.js')
})

service.on('install', () => service.start())

service.install()
