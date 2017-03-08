const Eris = require("eris");

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
    url: 'unknown'
}

var latestPost = {
    id: -1,
    author: 'unknown',
    url: 'unknown'
}

var forumActivityChannel = ""; //Enter in your forum-activity channel id here.
var announcementsChannel = ""; //Enter in your announcements channel id here.

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
    }
};


bot.on("ready", () => {
    console.log("Ready!");

    ShiroyukiLatestThread();
    ShiroyukiLatestPost();

    setInterval(ShiroyukiLatestThread, 10000);  //Sends a request every ten seconds
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

        if (jsonBody["results"][0]['id'] != latestThread.id && latestThread.id != -1)
        {
            latestThread.title = jsonBody["results"][0]['title'];
            latestThread.id = jsonBody["results"][0]['id'];
            latestThread.author = jsonBody["results"][0]['firstPost']['author']['name'];
            latestThread.url = jsonBody["results"][0]['url'];
            
            if (jsonBody["results"][0]['forum']['name'] == "Announcements"){
                AnnounceAnnouncament();
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

        if (jsonBody["results"][0]['id'] != latestPost.id && latestPost.id != -1){
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

function AnnounceLatestThread(){
    bot.createMessage(forumActivityChannel, "New thread has been posted! Title: '" + latestThread.title + "' by " + latestThread.author + ' (' + latestThread.url + ')');
}

function AnnounceAnnouncament(){
    bot.createMessage(forumActivityChannel, "New announcament has been posted! Title: '" + latestThread.title + "' by " + latestThread.author + ' (' + latestThread.url + ')');
}

function AnnounceLatestPost(){
    bot.createMessage(forumActivityChannel, "New post has been posted! By " + latestPost.author + ' (' + latestPost.url + ')');
}


bot.connect(); // Get the bot to connect to Discord
