# Shiroyuki JavaScript IPB to Discord Bot.

### Summary:

This is a JavaScript bot developed using Node.JS which connects to discord via the Eris library. This bot uses REST API to grab information like the latest threads, posts, and users from Invision Power Boards. This is only a basic bot and as such can only post latest threads, authors, and posts but I will be expanding it in future to include many other useful things.

### Features

1. Uses REST API to grab Latest Thread
2. Uses REST API to grab Latest Post
3. Uses REST API to grab username of aforementioned things, and posts it in discord.
4. URL Shortener (using https://goo.gl/)
5. Syncing usernames on Discord with IPB Usernames (done via profile field on forums)

### To be implemented:

1. automatic syncing of names.

### Installation

1. Download LTS Version of NodeJS from NodeJS
2. Download files.
3. Setup your REST API.
4. Setup Wamp or Xampp server as this new version uses MySQL (if you're not running this on your webhost)
5. Open bot.js in your favorite editor eg Notepad++, Sublime, Atom etc.
6. Edit the following sections and replace them with your own information.

## Setting up REST API: 

Go to your Admin Control Panel -> System -> Underneath Site Features click "REST API" -> Create New and make it according to the image below. In regards to "Posts" Do the same as Topics with 4 Endpoints for it to gather information from. I just couldn't crop it out nicely and added this text as a result.

![Example Image](https://webflake.sx/applications/core/interface/imageproxy/imageproxy.php?img=http://i.imgur.com/d0c2ENf.png&key=a201a9d9ce24e63ed478c7c9100a32cc3ecc993a60da92477dfa2dfeeafb14ee)

## Setting up the bot:

# Prerequisite Modules:

open CMD and navigate to the directory of your bot.

And type the following command(s) in:

```npm install eris && npm install goo.gl && npm install mysql && npm install request```

Now Replace in (bot.js): 

``` let erisAPI              = "replace with your discord bot token"; //only replace the part in quotation marks. ```

with your own token which can be gotten from ---> [Discord Developers](https://discordapp.com/developers/applications/me) <---

# Setting up Back end of Bot: 

Step 1: Go to http://127.0.0.1/phpmyadmin and log into your mysql database.
Step 2: Create a database called ipb then import the SQL file in the zipped folder. 
Step 3: Go into the Config Table
Step 4: Copy this code into your code editor and replace the information as needed

```INSERT INTO `config` (`googlAPI`, `erisAPI`, `ipbAPI`, `domain`, `botPrefix`, `postMessage`, `threadMessage`, `activityChannel`, `admins`, `welcomeChannel`, `autoRoleEnabled`, `roleId`) VALUES ('replace goo.gl api here', 'put discord bot token here', 'put ipb rest api here', 'your domain here', '!', 'your new post message here', 'your new thread message here', 'channel ID where bot posts about new threads and posts', 'admin id (your discord id)', 'Place where bot welcomes new members', '1 for yes 0 for no', 'member role id') ```

Step 5: Go back to your PHPMyAdmin and click SQL
Step 6: Paste your version of the code that you made in step 4
Step 7: Press Go.
Step 8: Done.

Running the bot:

Step 1: Open command prompt.
Step 2: Go to the location of the bot eg C:\Users\YourUsername\Desktop\IPB_to_Discord in command prompt via the CD command or just go to the folder normally press shift and right click and open it that way. (Assuming windows 7 windows 10 users will have to do it the long way)
Step 3: type node bot.js
Step 4: Congratulations your bot should now post something like the image below.

![Example Image](http://i.imgur.com/LpNTnTE.png)

Some of the text was removed for security, and because I felt like removing it.

### Issues

1. At the current time: NONE
