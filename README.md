# Shiroyuki JavaScript IPB to Discord Bot.

### Summary:

This is a JavaScript bot developed using Node.JS which connects to discord via the Eris library. This bot uses REST API to grab information like the latest threads, posts, and users from Invision Power Boards. This is only a basic bot and as such can only post latest threads, authors, and posts but I will be expanding it in future to include many other useful things.

### Features

1. Uses REST API to grab Latest Thread
2. Uses REST API to grab Latest Post
3. Uses REST API to grab username of aforementioned things, and posts it in discord.
4. URL Shortener (using https://goo.gl/)
5. Syncing usernames on Discord with IPB Usernames (currently done with JSON file and a command)

### To be implemented:

1. automatic syncing of names.

### Installation

1. Download LTS Version of NodeJS from [NodeJS](https://nodejs.org/en/)
2. Download files from github and extract them to wherever you like.
3. Open Node.JS in your favorite editor eg Notepad++, Sublime, Atom etc.
4. Edit the following sections and replace them with your own information.

Replace:
```
googl.setKey('');
```
with your own API from Goo.gl in this section

Replace:
```
var bot = new Eris(""); //This is your discord bot token
```
with your own token which can be gotten from [Discord Developers](https://discordapp.com/developers/applications/me)

Replace: 

```
var username = '' //enter in your {API Key} here
var password = '' //Leave this blank
```
with your REST API key which you can make by going to IP Board Admin Control Panel -> System -> REST API
and leave the password section blank. Otherwise this will not work as the API uses a basic authentication method.

```
url: 'https://www.example.com/api/index.php?/forums/topics&sortBy=date&sortDir=desc', //replace example.com with your domain name
url: 'https://www.example.com/api/index.php?/forums/posts&sortBy=date&sortDir=desc', //replace example.com with your domain name
```
Replace the both of these with your URL to your forum software. The /forums/posts&sortBy=date&sortDir=desc part is the end point (Forums) which allows you to grab Posts, members and Threads. For further documentation on the REST API I recommend you check [IPB4 REST Api](https://invisionpower.com/4guides/developing-plugins-and-applications/rest-api_370/sending-your-first-request-r167/)

Finally replace:

```
bot.createMessage(forumActivityChannel, ":regional_indicator_n: :regional_indicator_e::regional_indicator_w: :snowflake: :regional_indicator_t: :regional_indicator_h::regional_indicator_r::regional_indicator_e: :regional_indicator_a::regional_indicator_d: \n" + latestThread.url + " by " + latestThread.author );
```

with whatever you want the bot to say when a thread/post is posted on the forums. At the moment it'll post something like this.

![Example Image](http://i.imgur.com/LpNTnTE.png)

Some of the text was removed for security, and because I felt like removing it.

After you've edited the file to suit the needs of your Discord and IPB Forums go to cmd and navigate to the location of your bot. Eg cd C:\Users\<Your Username>\Desktop\Discord-Bot and type npm install goo.gl and npm install fs. After those two are installed you can simply run the bot by typing node bot.js

##### To sync users 

go to your discord channel and type |addNewTag FORUMUSERNAME @discorname What this will do is whenever "FORUMUSERNAME" makes a thread and or post it'll automatically grab the forum username and if it matches with a predistinguished discord name (via the use of the command (|addNewTag FORUMUSERNAME @discorname) it will change FORUMNAME into the discord name.

### Issues

1. On new thread it does the announcement for "New Thread" and "New Post" which causes it to more or less post the same thing twice.
