/**
 * Module Imports
 */
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX, LOCALE } = require("./util/EvobotUtil");
const path = require("path");
const i18n = require("i18n");
const { Message } = require('discord.js');
const Discord = require('discord.js');

const client = new Client({ 
  disableMentions: "everyone",
  restTimeOffset: 0,
  partials: ["MESSAGE", "CHANNEL", "REACTION"]
});
             

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

i18n.configure({
  locales: ["en", "es", "ko", "fr", "tr", "pt_br", "zh_cn", "zh_tw"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  objectNotation: true,
  register: global,

  logWarnFn: function (msg) {
    console.log("warn", msg);
  },

  logErrorFn: function (msg) {
    console.log("error", msg);
  },

  missingKeyFn: function (locale, value) {
    return value;
  },

  mustacheConfig: {
    tags: ["{{", "}}"],
    disable: false
  }
});

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  client.user.setActivity(`auf 4D Artworks`, { type: "PLAYING" });
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name })
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(i18n.__("common.errorCommend")).catch(console.error);
  }
});




 /* NEU NEU NEU NEU NEU NEU NEU NEU                                                                   */


client.on('guildMemberAdd', member => {
  const exampleEmbed = new Discord.MessageEmbed()
  .setTitle("Willkommen!")
  .setColor("GREEN")
  .setDescription(`Willkommen ${member} \n Bitte lies dir die <#814212140491735040> durch!`)
  .setImage("https://i.imgur.com/NHmfZtD.png")

  member.guild.channels.cache.get('818200768834175016').send(exampleEmbed);
})

 client.on('guildMemberAdd', guildMember =>{
  let welcomeRole = guildMember.guild.roles.cache.get('809490902418194529');

  guildMember.roles.add(welcomeRole);
});



client.on("message", async message => {
  if(message.content == '!sneertu'){
      let embed = new Discord.MessageEmbed()
      .setTitle('4D Artworks | Bestellung')
      .setDescription('Reagiere um eine Bestellung aufzugeben')
      .setColor('GREEN')
      .setFooter('4D Artworks')
      let msgEmbed = await message.channel.send(embed)
      msgEmbed.react('✅')
  }
})

client.on("messageReactionAdd", async (reaction, user, client, message, args) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if(user.bot) return;

  if (reaction.message.channel.id === "814211753197174845") {
      if (reaction.emoji.name === "✅"){
      const questions = [`Was benötigst du?`, `Hast du Wünsche für Farbe oder Aussehen?`, `Möchtest du dein Design animiert (teurer)`, `Wie hoch ist dein Geld Budget?`];
      const dmChannel = await user.send('**Willkommen, bitte beantworte die Fragen um eine Bestellung abzugeben.**');
      const collector = dmChannel.channel.createMessageCollector((msg) => msg.author.id == user.id);
      let i = 0;
      let prefix = `/`;
      const res = [];
      dmChannel.channel.send(questions[0])
      collector.on('collect', async(msg) => {
          if(questions.length == i) return collector.stop('MAX');
          const answer = msg.content;
          res.push({ question: questions[i], answer });
          i++;
          if(questions.length == i) return collector.stop('MAX');
          else {
              dmChannel.channel.send(questions[i]);
          }
      });
      collector.on('end', async(collected, reason) => {
          if(reason == 'MAX') {
              const embed = new Discord.MessageEmbed()
              .setTitle('Single Design Bestellung')
              .setDescription(`**<@&818191205640044555>** \n\n ${res.map(d => `**${d.question}** \n ${d.answer}`).join("\n\n")}\n\nVon: ${reaction.message.guild.members.cache.get(user.id)}`)
              .setColor('GREEN')
              .setFooter('4D Artworks')
              const data = reaction.message.guild.channels.cache.find(ch => ch.name.toLowerCase() == 'bestellungen' && ch.type == 'text');
              let msgEmbed = await data.send(embed)
              msgEmbed.react('✅')
              msgEmbed.react('❌')

                if (reaction.message.channel.id === "813887506256494692") {
                    if (reaction.emoji.name === "✅"){
                        reaction.message.guild.members.cache.get(user.id).send('Deine Bestellung wurde angenommen, du wirst bald von einem Designer kontaktiert.')
                    }
                  }
                
            
          }
      })
  }
}






if (reaction.message.channel.id === "814136748165955614") {
  if (reaction.emoji.name === "✅"){
  const questions = [`Welches Paket möchtest du?`, `Hast du Wünsche für Farbe oder Aussehen?`, `Möchtest du deine Designs animiert (teurer)`, `Wie hoch ist dein Geld Budget?`];
  const dmChannel = await user.send('**Willkommen, bitte beantworte die Fragen um eine Bestellung abzugeben.**');
  const collector = dmChannel.channel.createMessageCollector((msg) => msg.author.id == user.id);
  let i = 0;
  let prefix = `/`;
  const res = [];
  dmChannel.channel.send(questions[0])
  collector.on('collect', async(msg) => {
      if(questions.length == i) return collector.stop('MAX');
      const answer = msg.content;
      res.push({ question: questions[i], answer });
      i++;
      if(questions.length == i) return collector.stop('MAX');
      else {
          dmChannel.channel.send(questions[i]);
      }
  });
  collector.on('end', async(collected, reason) => {
      if(reason == 'MAX') {
          const embed = new Discord.MessageEmbed()
          .setTitle('Packet Design Bestellung')
          .setDescription(`**<@&818191205640044555>** \n\n ${res.map(d => `**${d.question}** \n ${d.answer}`).join("\n\n")}\n\nVon: ${reaction.message.guild.members.cache.get(user.id)}`)
          .setColor('GREEN')
          .setFooter('4D Artworks')
          const data = reaction.message.guild.channels.cache.get(ch => ch.name.toLowerCase() == 'bestellungen' && ch.type == '');
          await data.send(embed)
      }
  })
}
}




})



