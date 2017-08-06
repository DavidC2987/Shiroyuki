// Authors: Elm & Tenshi

const Eris    			= require("eris");
const googl   			= require('goo.gl');
const mysql   			= require('mysql');
const request 			= require('request');
let erisAPI  			= "replace with your discord bot token";
let config 			= {};
let latestThreadRequest 	= {};
let latestPostRequest   	= {};

const bot = new Eris(erisAPI);

//DO NOT EDIT BELOW THIS LINE IF YOU DON'T KNOW WHAT YOU ARE DOING

let latestThread = {
    title: 'unknown',
    id: -1,
    author: 'unknown',
    authorId: 'none',
    url: 'unknown',
    content: 'none',
    date: 'none'
}

let latestPost = {
    id: -1,
    author: 'unknown',
    authorId: 'none',
    url: 'unknown',
    content: 'none',
    date: 'none'
}

let connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'ipb'
});

connection.connect();

connection.query('SELECT * FROM config', function (error, results, fields) {
	if (error) throw error;
	config = {
		googlAPI: results[0].googlAPI,
		ipbAPI: results[0].ipbAPI,
		domain: results[0].domain,
		botPrefix: results[0].botPrefix,
		postMessage: results[0].postMessage,
		threadMessage: results[0].threadMessage,
		activityChannel: results[0].activityChannel,
		admins: results[0].admins.split(","),
		welcome: results[0].welcomeChannel,
		autoRoleEnabled: results[0].autoRoleEnabled,
		roleID: results[0].roleId
	}
});

bot.connect();

bot.on("ready", () => {
	console.log("Bot connected");
	googl.setKey(config.googlAPI);
	latestThreadRequest = {
		url: `https://${config.domain}/api/index.php?/forums/topics&sortBy=date&sortDir=desc`,
		auth: {
			user: config.ipbAPI,
			password: ""
		}
	};
	latestPostRequest = {
		url: `https://${config.domain}/api/index.php?/forums/posts&sortBy=date&sortDir=desc`,
		auth: {
			user: config.ipbAPI,
			password: ""
		}
	};
	GetLatestThread();
    GetLatestPost();

    setInterval(GetLatestPost, 9000);  //Sends a request every 9 seconds
    setInterval(GetLatestPost, 10000); //Sends a request every ten seconds
    setInterval(GetLatestThread, 9000);  //Sends a request every 9 seconds
    setInterval(GetLatestThread, 10000); //Sends a request every ten seconds
});

bot.on("guildMemberAdd", (guild, member) => { // When a member joins a guild

	if(!config.autoRoleEnabled) return;
    let response = `Welcome ${member.mention} to ${guild.name}! Please visit our forum if you haven't already! (${config.domain})`;
    let reason = 'Automated by Bot.';
	guild.addMemberRole(member.id, config.roleID, reason);
    bot.createMessage(config.welcome, response);
    
});

function GetLatestThread()
{
    request(latestThreadRequest, function(err, res, body) {
        if (err)
        {
            console.dir(err)
            return
        }

        let jsonBody = JSON.parse(body);
        latestThread.date = jsonBody["results"][0]['firstPost']['date'];
        latestThread.content = jsonBody['results'][0]['firstPost']['content'];

        if (jsonBody["results"][0]['id'] != latestThread.id && latestThread.id != -1)
        {
            latestThread.title = jsonBody["results"][0]['title'];
            latestThread.id = jsonBody["results"][0]['id'];
            latestThread.author = jsonBody["results"][0]['firstPost']['author']['name'];
            latestThread.url = jsonBody["results"][0]['url'];
            latestThread.authorId = jsonBody["results"][0]["firstPost"]["author"]["customFields"]["1"]["fields"]["2"]["value"];
            AnnounceLatestThread();

        }
        if (jsonBody["results"][0]['id'] != latestThread.id && latestThread.id == -1){
            latestThread.title = jsonBody["results"][0]['title'];
            latestThread.id = jsonBody["results"][0]['id'];
            latestThread.author = jsonBody["results"][0]['firstPost']['author']['name'];
            latestThread.url = jsonBody["results"][0]['url'];
            latestThread.authorId = jsonBody["results"][0]["firstPost"]["author"]["customFields"]["1"]["fields"]["2"]["value"];
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

        let jsonBody = JSON.parse(body);

        if (jsonBody["results"][0]['id'] != latestPost.id && latestPost.id != -1 && latestThread.date != jsonBody["results"][0]['date'] && latestThread.content != jsonBody["results"][0]['content']){
            latestPost.id = jsonBody["results"][0]['id'];
            latestPost.author = jsonBody["results"][0]['author']['name'];
            latestPost.url = jsonBody["results"][0]['url'];
            latestPost.authorId = jsonBody["results"][0]["author"]["customFields"]["1"]["fields"]["2"]["value"];
            AnnounceLatestPost();
        }

        if (jsonBody["results"][0]['id'] != latestPost.id && latestPost.id == -1) {
            latestPost.id = jsonBody["results"][0]['id'];
            latestPost.author = jsonBody["results"][0]['author']['name'];
            latestPost.url = jsonBody["results"][0]['url'];
            latestPost.authorId = jsonBody["results"][0]["author"]["customFields"]["1"]["fields"]["2"]["value"];
        }
    })

}

function AnnounceLatestThread(link){
    GetShortLink(latestThread.url, 1)
}

function AnnounceLatestPost(link){
    GetShortLink(latestPost.url, 2)
}

function GetShortLink(urlToShorten, whatIsShortening) {
    googl.shorten(urlToShorten)
        .then(function (shortUrl) {
			if(whatIsShortening == 1)
			{
				connection.query(`SELECT * FROM usertags WHERE userName='${latestThread.author}'`, function (error, results, fields) {
					if (error) throw error;
					if(results.length != 0) {
						bot.createMessage(config.activityChannel, `${config.threadMessage}\n${shortUrl} by <@${results[0].discordId}>`);
					} else {
						if(!latestThread.authorId) {
							bot.createMessage(config.activityChannel, `${config.threadMessage}\n${shortUrl} by ${latestThread.author}`);
						} else {
							bot.createMessage(config.activityChannel, `${config.threadMessage}\n${shortUrl} by <@${latestThread.authorId}>`);						
						}
					}
				});	
			} 
			else if(whatIsShortening == 2) 
			{ 
				connection.query(`SELECT * FROM usertags WHERE userName='${latestPost.author}'`, function (error, results, fields) {
					if (error) throw error;
					if(results.length != 0) {
						bot.createMessage(config.activityChannel, `${config.postMessage}\n${shortUrl} by <@${results[0].discordId}>`);
					} else {
						if(!latestPost.authorId) {
							bot.createMessage(config.activityChannel, `${config.postMessage}\n${shortUrl} by ${latestPost.author}`);
						} else {
							bot.createMessage(config.activityChannel, `${config.postMessage}\n${shortUrl} by <@${latestPost.authorId}>`);
						}
					}
				});				
			}
	});
}
