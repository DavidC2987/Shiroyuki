const Eris = require("eris");
var googl = require('goo.gl');
var fs = require('fs');
var request = require('request')

googl.setKey(''); // Your Goo.gl API key.
var bot = new Eris(""); // Discord bot account token.
var IPBAPI = ""; // Your Invision Power Board API key. (GET request)
var forumDomain = "www.example.com"; // Forum domain where Invision Power Board is located.
var botPrefix = "!"; // Prefix that bot will be called with.
var postMessage = "New post has been posted!"; // What message will come before linking to to new post.
var threadMessage = "New thread has been posted!"; // What message will come before linking to to new thread.
var forumActivityChannel = ""; // Channel where bot will post new threads and new posts.
var announcamentsChannel = ""; // Channel where bot will post new announcemenets.

var latestThreadRequest = {
  url: 'https://'+forumDomain+'/api/index.php?/forums/topics&sortBy=date&sortDir=desc',
  auth: {
    user: IPBAPI,
    password: ""
  }
}

var latestPostRequest = {
  url: 'https://'+forumDomain+'/api/index.php?/forums/posts&sortBy=date&sortDir=desc',
  auth: {
    user: IPBAPI,
    password: ""
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



var commands = {
    "ping": {
        usage: "",
        description: "Returns time bot takes to respond.",
        process: function (bot, msg, suffix, callback) {
            var t = new Date();
            bot.createMessage(msg.channel.id, "<@" + msg.author.id + "> pong (" + (t.getTime() - msg.timestamp) + "ms)")
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

    GetLatestThread();
    GetLatestPost();

    setInterval(GetLatestPost, 9000);  //Sends a request every 9 seconds
    setInterval(GetLatestPost, 10000); //Sends a request every ten seconds
});

bot.on("messageCreate", (msg) => {
    if (msg.channel.type == 1) return; // Bot will not react to messages sent in Direct Messages to avoid errors.

    var guildId = msg.channel.guild.id;

    if (msg.author.id != bot.user.id && msg.content.slice(0, botPrefix.length) == botPrefix) {
        var cmdTxt = msg.content.split(" ")[0].substring(botPrefix.length);
        var suffix = msg.content;
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
                var info = botPrefix + cmd;
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

function GetLatestThread()
{
    request(latestThreadRequest, function(err, res, body) {
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

function GetLatestPost()
{
    request(latestPostRequest, function(err, res, body) {
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
							bot.createMessage(forumActivityChannel, threadMessage+"\n" + shortUrl + " by " + obj[latestThread.author].userTag );
						} else {
							bot.createMessage(forumActivityChannel, threadMessage+"\n" + shortUrl + " by " + latestThread.author );
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
							bot.createMessage(forumActivityChannel, threadMessage+"\n " + shortUrl + " by " +obj[latestThread.author].userTag);
						} else {
							bot.createMessage(forumActivityChannel, threadMessage+" \n " + shortUrl + " by " +latestThread.author);
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
							bot.createMessage(forumActivityChannel, postMessage+"\n" + shortUrl + " by " + obj[latestPost.author].userTag);
						} else {
							bot.createMessage(forumActivityChannel, postMessage+"\n" + shortUrl + " by " + latestPost.author);
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
