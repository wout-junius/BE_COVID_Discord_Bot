const Discord = require("discord.js");
const fetch = require("node-fetch");

const bot = new Discord.Client();

require("dotenv").config();

const env = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX
};

let belgiumCases = {
  Antwerpen: 0,
  VlaamsBrabant: 0,
  WestVlaanderen: 0,
  OostVlaanderen: 0,
  Limburg: 0,
  Hainaut: 0,
  BrabantWallon: 0,
  Namur: 0,
  Luxembourg: 0,
  Brussels: 0
};

const baseEmbed = new Discord.MessageEmbed()
.setColor("#0099ff")
.setTitle("Covid info")
.setThumbnail(
  "https://info.girbau.com/hubfs/COVID_pckLogo-200.png"
)
.setTimestamp()
.setFooter(
  "Made whit the EpiStat API",
  "https://healthdata.sciensano.be/sites/default/files/logo-hr.png"
);

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
  bot.user.setPresence({ activity: { name: `for help type ${env.prefix}help` , type: "WATCHING"}, status: 'online' })
});

bot.on("message", msg => {
  if (msg.content.startsWith(env.prefix)) {
    let args = msg.content
      .substring(env.prefix.length, msg.content.length)
      .split(" ");
    let command = args[0].toLowerCase();
    switch (command) {
      case "covid":
        covidCommand(msg.channel, args);
        break;
      case "help":
        let helpEmbed = new Discord.MessageEmbed()
          .setColor("#0099ff")
          .setTitle("Help")
          .setDescription("every command starts with `" + env.prefix + "covid`")
          .addFields(
            {
              name: "cases",
              value:
                "Gives the covid cases for each province. \nProvince can be specified at the end"
            },
            {
              name: "hospitalisations",
              value:
                "Gives the covid hospitalisations for each province.\nProvince can be specified at the end"
            },
            {
              name: "vaccines",
              value:
                "Gives the covid first and second vacinations for each region."
            }
          )
          .setThumbnail("https://info.girbau.com/hubfs/COVID_pckLogo-200.png")
          .setFooter(
            "Made by woutyboy3#1234 \nhttps://github.com/wout-junius",
            "https://avatars.githubusercontent.com/u/17813748?v=4"
          );
        msg.channel.send(helpEmbed);
        break;
    }
  }
});

bot.login(env.token);

function covidCommand(channel, args) {
  baseEmbed.fields = [];
  switch (args[1].toLowerCase()) {
    case "cases":
      if (args.length <= 2) {
        fetch(`https://epistat.sciensano.be/Data/COVID19BE_CASES_MUNI_CUM.json`)
          .then(res => res.json())
          .then(json => {
            baseEmbed
              .setTimestamp()
              .setFooter(
                "Made whit the EpiStat API",
                "https://healthdata.sciensano.be/sites/default/files/logo-hr.png"
              );
            let total = 0;
            for (var key in belgiumCases) {
              if (belgiumCases.hasOwnProperty(key)) {
                belgiumCases[key] = 0;
              }
            }
            json.forEach(element => {
              total += parseInt(element.CASES);
              for (var key in belgiumCases) {
                if (belgiumCases.hasOwnProperty(key)) {
                  if (key == element.PROVINCE)
                    belgiumCases[key] += parseInt(element.CASES);
                }
              }
            });
            baseEmbed.setDescription(`Current cases in Belgium \n ${total}`);

            for (var key in belgiumCases) {
              if (belgiumCases.hasOwnProperty(key)) {
                baseEmbed.addField(key, belgiumCases[key], true);
              }
            }

            channel.send(baseEmbed);
          });
      } else {
        fetch(`https://epistat.sciensano.be/Data/COVID19BE_CASES_MUNI_CUM.json`)
          .then(res => res.json())
          .then(json => {
            baseEmbed
              .setDescription(`Current cases by province`)
              .setTimestamp()
            let cases = 0;
            json.forEach(element => {
              if (element.PROVINCE == args[2]) {
                cases += parseInt(element.CASES);
              }
            });

            baseEmbed.addField(args[2], cases, true);

            channel.send(baseEmbed);
          });
      }
      break;
    case "hospitalisations":
      if (args.length <= 2) {
        fetch(`https://epistat.sciensano.be/Data/COVID19BE_HOSP.json`)
          .then(res => res.json())
          .then(json => {
            const exampleEmbed = new Discord.MessageEmbed()
              .setColor("#0099ff")
              .setTitle("Covid info")
              .setThumbnail(
                "https://info.girbau.com/hubfs/COVID_pckLogo-200.png"
              )
              .setTimestamp()
              .setFooter(
                "Made whit the EpiStat API",
                "https://healthdata.sciensano.be/sites/default/files/logo-hr.png"
              );
            let total = 0;
            let today = new Date();
            for (var key in belgiumCases) {
              if (belgiumCases.hasOwnProperty(key)) {
                belgiumCases[key] = 0;
              }
            }
            json.forEach(element => {
              if (element.DATE == json[json.length - 1].DATE) {
                total += parseInt(element.TOTAL_IN);
                for (var key in belgiumCases) {
                  if (belgiumCases.hasOwnProperty(key)) {
                    if (key == element.PROVINCE) {
                      belgiumCases[key] += parseInt(element.TOTAL_IN);
                    }
                  }
                }
              }
            });
            exampleEmbed.setDescription(
              `hospitalisations in Belgium as of ${
                json[json.length - 1].DATE
              }\n ${total}`
            );

            for (var key in belgiumCases) {
              if (belgiumCases.hasOwnProperty(key)) {
                exampleEmbed.addField(key, belgiumCases[key], true);
              }
            }

            channel.send(exampleEmbed);
          });
      } else {
        let exist = false;
        for (var key in belgiumCases) {
          if (belgiumCases.hasOwnProperty(key)) {
            if (key == args[2]) exist = true;
          }
        }
        if (exist) {
          fetch(`https://epistat.sciensano.be/Data/COVID19BE_HOSP.json`)
            .then(res => res.json())
            .then(json => {
              baseEmbed
                .setDescription(
                  `hospitalisations by province as of ${
                    json[json.length - 1].DATE
                  }`
                )
                .setTimestamp()
              let cases = 0;
              json.forEach(element => {
                if (
                  element.PROVINCE == args[2] &&
                  element.DATE == json[json.length - 1].DATE
                ) {
                  cases += parseInt(element.TOTAL_IN);
                }
              });

              baseEmbed.addField(args[2], cases, true);

              channel.send(baseEmbed);
            });
        }else {

        }
      }
      break;

    case "vaccines":
      if (args.length <= 2) {
        fetch(`https://epistat.sciensano.be/Data/COVID19BE_VACC.json`)
          .then(res => res.json())
          .then(json => {
            baseEmbed
              .setTimestamp()
            let totalA = 0;
            let totalB = 0;
            let today = new Date();
            let vaccineByRegion = {
              Wallonia: [0, 0],
              Flanders: [0, 0],
              Brussels: [0, 0]
            };
            json.forEach(element => {
              for (var key in vaccineByRegion) {
                if (vaccineByRegion.hasOwnProperty(key)) {
                  if (key == element.REGION) {
                    if (element.DOSE == "A") {
                      totalA += parseInt(element.COUNT);
                      vaccineByRegion[key][0] += parseInt(element.COUNT);
                    } else if (element.DOSE == "B") {
                      totalB += parseInt(element.COUNT);
                      vaccineByRegion[key][1] += parseInt(element.COUNT);
                    }
                  }
                }
              }
            });
            baseEmbed.setDescription(
              `Current first dose vaccinated in Belgium \n **First**: ${totalA}   **Second**: ${totalB}\n \n **First dose** \n -----------`
            );

            for (var key in vaccineByRegion) {
              if (vaccineByRegion.hasOwnProperty(key)) {
                baseEmbed.addField(key, vaccineByRegion[key][0], true);
              }
            }
            baseEmbed.addField("\u200B", "\u200B");
            baseEmbed.addField("Second dose", "-----------");
            for (var key in vaccineByRegion) {
              if (vaccineByRegion.hasOwnProperty(key)) {
                baseEmbed.addField(key, vaccineByRegion[key][1], true);
              }
            }

            channel.send(baseEmbed);
          });
      }

      break;
  }
}
