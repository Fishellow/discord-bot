const Discord = require('discord.js'),
    client = new Discord.Client({
        fetchAllMembers: true
    }),
    config = require('./config.json'),
    fs = require('fs')
 
client.login(config.token)
client.commands = new Discord.Collection()
client.db = require('./db.json')
 
fs.readdir('./commands', (err, files) => {
    if (err) throw err
    files.forEach(file => {
        if (!file.endsWith('.js')) return
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    })
})
 
client.on('message', message => {
    if (message.type !== 'DEFAULT' || message.author.bot) return
 
    const args = message.content.trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()
    if (!commandName.startsWith(config.prefix)) return
    const command = client.commands.get(commandName.slice(config.prefix.length))
    if (!command) return
    if (command.guildOnly && !message.guild) return message.channel.send('Cette commande ne peut être utilisé que dans un serveur')
    command.run(message, args, client)
})
 
client.on('guildMemberAdd', member => {
    member.guild.channels.cache.get(config.greeting.channel).send(`${member} 🎉`, new Discord.MessageEmbed()
        .setDescription(`${member} a rejoint le serveur. Nous sommes désormais ${member.guild.memberCount} ! 🎉`)
        .setColor('#00ff00')
        .setImage('https://cdn.discordapp.com/attachments/726159390343954552/831585010137956362/tenor_6.gif'))
    member.roles.add(config.greeting.role)
    member.roles.add(config.greeting.role2)
})
 
client.on('guildMemberRemove', member => {
    member.guild.channels.cache.get(config.greeting.channel).send(new Discord.MessageEmbed()
        .setDescription(`${member.user.tag} a quitté le serveur... 😢`)
        .setColor('#ff0000')
        .setImage('https://cdn.discordapp.com/attachments/726159390343954552/831598439174635540/tumblr_90015a77a02e1f505db0b26de876b142_ff1b931a_540.gif'))

})

client.on('ready', () => {
    const statues = [
        'Exorciser des fléaux...',
        'regarder twitch.tv/fishellow',
        'la PlayStation avec Gojo'
    ]
    let i = 0
    setInterval(() => {
        client.user.setActivity(statues[i], {type: 'PLAYING'})
        i = ++i% statues.length
    }, 1e4)
})
 
client.on('channelCreate', channel => {
    if (!channel.guild) return
    const muteRole = channel.guild.roles.cache.find(role => role.name === 'Muted')
    if (!muteRole) return
    channel.createOverwrite(muteRole, {
        SEND_MESSAGES: false,
        CONNECT: false,
        ADD_REACTIONS: false
    })
})

client.login(process.env.TOKEN);
