# StaffStat

A powerful Discord bot designed to help server owners manage their staff, moderation, security, economy, and server activity.

## ✨ Features

* 🛡️ Anti-Nuke protection
* 👮 Staff management and statistics
* ⚠️ Warnings and moderation
* 🔨 Ban / Kick / Unban commands
* 🔒 Server lockdown
* 💰 Server economy and coins
* 🛒 Shop system
* 🎁 Giveaways
* 📊 Staff leaderboards
* 👋 Welcome system
* 📝 Server logging
* 💾 Database support
* 🔐 Security and permission management

## 📋 Requirements

Before installing StaffStat, make sure you have:

* [Node.js](https://nodejs.org/) 18 or newer
* A Discord account
* A Discord application/bot
* A Discord server where you have permission to add bots

## 🚀 Installation

### 1. Download StaffStat

Clone the repository:

```bash
git clone https://github.com/almavsagi-svg/StaffStat.git
cd StaffStat
```

Or download the repository as a ZIP file from GitHub.

### 2. Install dependencies

Run:

```bash
npm install
```

### 3. Configure the bot

Create a file named:

```text
.env
```

Copy the contents of `.env.example` into `.env` and fill in your own values.

Example:

```env
TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_CLIENT_ID
OWNER_ID=YOUR_DISCORD_USER_ID
```

### 4. Create your Discord Bot

Go to the Discord Developer Portal:

https://discord.com/developers/applications

Create a new application and add a Bot.

Copy the bot token and put it in:

```env
TOKEN=YOUR_BOT_TOKEN
```

Copy your application's Client ID and put it in:

```env
CLIENT_ID=YOUR_CLIENT_ID
```

Set `OWNER\_ID` to your own Discord User ID.

> Never share your bot token with anyone or upload it to GitHub.

### 5. Invite the bot

Generate an OAuth2 invite link for your bot from the Discord Developer Portal.

Make sure you select the required bot permissions and scopes.

For slash commands, make sure the following scope is included:

```text
bot
applications.commands
```

Then open the generated URL and select your Discord server.

### 6. Start StaffStat

Run:

```bash
node index.js
```

If everything is configured correctly, the bot should connect to Discord.

## ⚙️ Configuration

StaffStat uses environment variables for sensitive configuration.

| Variable    | Description                          |
| ----------- | ------------------------------------ |
| `TOKEN`     | Your Discord bot token               |
| `CLIENT\_ID` | Your Discord application's Client ID |
| `OWNER\_ID`  | Your Discord User ID                 |

## 🛡️ Security

**Never upload your `.env` file to GitHub.**

Your `.gitignore` should contain:

```gitignore
node_modules/
.env
.env.*
!.env.example
database/*.db
*.log
```

If you accidentally publish your bot token, immediately reset the token in the Discord Developer Portal.

## 🔄 Updating StaffStat

To update an existing installation:

```bash
git pull
npm install
node index.js
```

Always check the release notes before updating to a major version.

## 📦 Releases

Official releases are published on GitHub.

Version format:

```text
v1.0.0
v1.1.0
v1.2.0
v2.0.0
```

Major versions may contain breaking changes.

## 🐛 Bug Reports

Found a bug?

Open a GitHub Issue and include:

* StaffStat version
* Node.js version
* Error message
* Steps to reproduce the issue

**Never include your Discord bot token or other secrets in an issue.**

## 🤝 Contributing

Contributions are welcome!

You can:

* Report bugs
* Suggest features
* Improve documentation
* Submit pull requests

Please keep pull requests focused and explain what was changed.

## 📄 License

See the `LICENSE` file for the license used by this project.

---

Made with ❤️ for Discord server owners.