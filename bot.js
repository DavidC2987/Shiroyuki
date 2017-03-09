const Eris = require("eris");
var googl = require('goo.gl');
var fs = require('fs');

googl.setKey(''); //google API Key


var bot = new Eris(""); //This is your discord bot token

var request = require('request')
var username = '' //enter in your {API Key} here
var password = '' //Leave this blank
var options = {
  url: 'https://www.example.com/api/index.php?/forums/topics&sortBy=date&sortDir=desc', //replace example.com with your domain name
  auth: {
    user: username,
    password: password
  }
}

var options2 = {
  url: 'https://www.example.com/api/index.php?/forums/posts&sortBy=date&sortDir=desc', //replace example.com with your domain name
  auth: {
    user: username,
    password: password
  }
}

var latestThread = {
    title: 'unknown',
    id: -1,
    author: 'unknown',
    url: 'unknown',
	content: 'none',
	date: 'none'
}

var latestPost = {
    id: -1,
    author: 'unknown',
    url: 'unknown',
	content: 'none',
	date: 'none'
}

var forumActivityChannel = ""; //Forum-Activity Channel
var announcementsChannel = ""; //Announcements Channel

var commands = {
    "ping": {
        usage: "",
        description: "Returns time bot takes to respond.",
        process: function (bot, msg, suffix, callback) {
            var t = new Date();
            bot.createMessage(msg.channel.id, "<@" + msg.author.id + "> pong (" + (t.getTime() - msg.timestamp) + "ms)")
            if (suffix) {
                bot.createMessage(msg.channel.id, "(Note) B-baka! This command doesnt need anything else but the command!");
            }
        }
    },
	"addNewTag": {
		usage: "",
		hidden: true,
		process: function (bot, msg, suffix, callback) {
            var splittedSuffix = suffix.split(" ");
			if(msg.author.id != "282235475484475392" && msg.author.id != "136256776013086720")
			{
				return;
			}
			fs.readFile("userTags.json", "utf8", function(err, out) {
				if (err) {
					throw err;
				}
				var obj = JSON.parse(out);
				if (!(splittedSuffix[0] in obj)) {
					obj[splittedSuffix[0]] = {};
					obj[splittedSuffix[0]].userTag = splittedSuffix[1];
					console.log(obj[splittedSuffix[0]]);
					fs.writeFile("userTags.json", JSON.stringify(obj, null, 4), function(err) {
                    if (err) {
                        throw err;
					}
					bot.createMessage(msg.channel.id, "New user added");
                    });
				}
			});
        }                               
	}
};


bot.on("ready", () => {
    console.log("Ready!");


    ShiroyukiLatestThread();
    ShiroyukiLatestPost();

    setInterval(ShiroyukiLatestThread, 9000);  //Sends a request every 9 seconds
    setInterval(ShiroyukiLatestPost, 10000); //Sends a request every ten seconds
});

bot.on("messageCreate", (msg) => { // When a message is created

    var prefix;

    if (msg.channel.type == 1) return;

    var guildId = msg.channel.guild.id;
    prefix = "|";

    if (msg.author.id != bot.user.id && msg.content.slice(0, prefix.length) == prefix) {
        var cmdTxt = msg.content.split(" ")[0].substring(prefix.length);
        var suffix = msg.content;//.substring(prefix.length+4);
        var asuffix = suffix.split(" ");
        var suffix = asuffix;
        
        suffix.shift();
        suffix.join(":");
        suffix = "" + suffix;
        suffix = suffix.replace(",", " ");

        //Help command
        if (cmdTxt === "help") {
            var i;
            var helpArray = "";
            
            for (var cmd in commands) {
                var info = prefix + cmd;
                var usage = commands[cmd].usage;
                var description = commands[cmd].description;
                var hidden = commands[cmd].hidden;
                var command;

                if (hidden) continue;

                if (usage !== "") { command = info + " (Usage: " + usage + ") - " + description + "\n"; } else {
                    command = info + " - " + description + "\n";
                }

                helpArray += command;
            }

            bot.getDMChannel(msg.author.id).then(privateChannel => {
            bot.createMessage(privateChannel.id, "" + helpArray);
            });

        } else {
            var cmd = commands[cmdTxt];
            if (cmd === undefined) return;
            cmd.process(bot, msg, suffix);

        }


    }

});

function ShiroyukiLatestThread()
{
    request(options, function(err, res, body) {
        if (err)
        {
            console.dir(err)
            return
        }

        var jsonBody = JSON.parse(body);
		latestThread.date = jsonBody["results"][0]['firstPost']['date'];
		latestThread.content = jsonBody['results'][0]['firstPost']['content'];

        if (jsonBody["results"][0]['id'] != latestThread.id && latestThread.id != -1)
        {
            latestThread.title = jsonBody["results"][0]['title'];
            latestThread.id = jsonBody["results"][0]['id'];
            latestThread.author = jsonBody["results"][0]['firstPost']['author']['name'];
            latestThread.url = jsonBody["results"][0]['url'];

            
            if (jsonBody["results"][0]['forum']['name'] == "Announcements"){
                AnnounceAnnouncement();
            } else {
                AnnounceLatestThread();
            }

        }
        if (jsonBody["results"][0]['id'] != latestThread.id && latestThread.id == -1){
            latestThread.title = jsonBody["results"][0]['title'];
            latestThread.id = jsonBody["results"][0]['id'];
            latestThread.author = jsonBody["results"][0]['firstPost']['author']['name'];
            latestThread.url = jsonBody["results"][0]['url'];
        }
    })
}

function ShiroyukiLatestPost()
{
    request(options2, function(err, res, body) {
        if (err){
            console.dir(err)
            return
        }

        var jsonBody = JSON.parse(body);

        if (jsonBody["results"][0]['id'] != latestPost.id && latestPost.id != -1 && latestThread.date != jsonBody["results"][0]['date'] && latestThread.content != jsonBody["results"][0]['content']){
            latestPost.id = jsonBody["results"][0]['id'];
            latestPost.author = jsonBody["results"][0]['author']['name'];
            latestPost.url = jsonBody["results"][0]['url'];
            AnnounceLatestPost();
        }

        if (jsonBody["results"][0]['id'] != latestPost.id && latestPost.id == -1) {
            latestPost.id = jsonBody["results"][0]['id'];
            latestPost.author = jsonBody["results"][0]['author']['name'];
            latestPost.url = jsonBody["results"][0]['url'];
        }
    })
}

function AnnounceLatestThread(link){
    bot.createMessage(forumActivityChannel, ":regional_indicator_n: :regional_indicator_e::regional_indicator_w: :snowflake: :regional_indicator_t: :regional_indicator_h::regional_indicator_r::regional_indicator_e: :regional_indicator_a::regional_indicator_d: \n" + link + " by " + latestThread.author );
	GetShortLink(latestThread.url, 1)
}

function AnnounceAnnouncement(link){
	GetShortLink(latestThread.url, 2)
}

function AnnounceLatestPost(link){
	GetShortLink(latestPost.url, 3)
}


function GetShortLink(urlToShorten, whatIsShortening) {
	googl.shorten(urlToShorten)
		.then(function (shortUrl) {
			switch(whatIsShortening) {
				case 1: 
					fs.readFile("userTags.json", "utf8", function(err, out) {
						 if (err) {
							throw err;
						}
						var obj = JSON.parse(out);
						if ((latestThread.author in obj)) {
							bot.createMessage(forumActivityChannel, ":regional_indicator_n: :regional_indicator_e::regional_indicator_w: :snowflake: :regional_indicator_t: :regional_indicator_h::regional_indicator_r::regional_indicator_e: :regional_indicator_a::regional_indicator_d: \n" + shortUrl + " by " + obj[latestThread.author].userTag );
						} else {
							bot.createMessage(forumActivityChannel, ":regional_indicator_n: :regional_indicator_e::regional_indicator_w: :snowflake: :regional_indicator_t: :regional_indicator_h::regional_indicator_r::regional_indicator_e: :regional_indicator_a::regional_indicator_d: \n" + shortUrl + " by " + latestThread.author );
						}
					});
					break;
				case 2:
					fs.readFile("userTags.json", "utf8", function(err, out) {
						 if (err) {
							throw err;
						}
						var obj = JSON.parse(out);
						if ((latestThread.author in obj)) {
							bot.createMessage(forumActivityChannel, ":regional_indicator_n: :regional_indicator_e::regional_indicator_w: :snowflake: :regional_indicator_t: :regional_indicator_h::regional_indicator_r::regional_indicator_e: :regional_indicator_a::regional_indicator_d: \n " + shortUrl + " by " +obj[latestThread.author].userTag);
						} else {
							bot.createMessage(forumActivityChannel, ":regional_indicator_n: :regional_indicator_e::regional_indicator_w: :snowflake: :regional_indicator_t: :regional_indicator_h::regional_indicator_r::regional_indicator_e: :regional_indicator_a::regional_indicator_d: \n " + shortUrl + " by " +latestThread.author);
						}
					});
					break;
				case 3:
					fs.readFile("userTags.json", "utf8", function(err, out) {
						 if (err) {
							throw err;
						}
						var obj = JSON.parse(out);
						if ((latestPost.author in obj)) {
							bot.createMessage(forumActivityChannel, ":regional_indicator_n: :regional_indicator_e: :regional_indicator_w: :snowflake: :regional_indicator_p:  :regional_indicator_o: :regional_indicator_s: :regional_indicator_t: \n" + shortUrl + " by " + obj[latestPost.author].userTag);
						} else {
							bot.createMessage(forumActivityChannel, ":regional_indicator_n: :regional_indicator_e: :regional_indicator_w: :snowflake: :regional_indicator_p:  :regional_indicator_o: :regional_indicator_s: :regional_indicator_t: \n" + shortUrl + " by " + latestPost.author);
						}
					});
					break;
				default: 
					console.log("GetShortLink() wasn't called properly.");
					break;
			}
		})
		.catch(function (err) {
			console.error(err.message);
	});
}



bot.connect(); // Get the bot to connect to Discord
