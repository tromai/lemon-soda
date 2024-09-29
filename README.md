# lemon-soda

A very simple music playing bot, with an autoplay feature backed by Spotify track recommendation system.

# Development

## Prerequisites

-   Ubuntu 22.04
-   Node v20.17.0
-   [ffmpeg](https://www.ffmpeg.org/download.html). For Ubuntu you can install it with `apt install ffmpeg`.

## Install dependencies

```
npm install
```

## Running the bot

### Credentials

The final credentials will be store within `./data/config.json` from the root of this repository. The content of that file can be somewhat like this:

```
{
    "token": "...",
    "clientId": "...",
    "guildId": "...",
    "spotifyClientSecret": "..."
}
```

#### Discord setup

-   [Setup 2-factor authentication for your Discord account](https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Multi-Factor-Authentication)
-   [Enable developer mode on your Discord client](https://discord.com/developers/docs/activities/building-an-activity#step-0-enable-developer-mode)
-   [Creating your bot in Discord developer portal](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
-   [Adding your bot to your server](https://discordjs.guide/preparations/adding-your-bot-to-servers)

After you finish those instructions, you will be able to obtain:

-   `token` - The Discord bot token.
-   `clientId` - from the Discord developer portal.
-   `guildId` (aka your channel's ID) - Make sure developer mode is enabled. Right click on the channel's title -> `Copy Server ID`.

#### Spotify API

[Spotify API](https://developer.spotify.com/documentation/web-api) is used for obtaining song recommendations. It requires a token to query from it.

Follow these instructions to obtain `spotifyClientId` and `spotifyClientSecret`:

-   [Create a Spotify app](https://developer.spotify.com/documentation/web-api/tutorials/getting-started#create-an-app)
-   [Obtain the client Id and sercret from the Spotify Dashboard](https://developer.spotify.com/documentation/web-api/tutorials/getting-started#request-an-access-token) (note: you don't need to obtain the access token by yourselves, the client Id and sercret is enough) - These 2 correspond to `spotifyClientId` and `spotifyClientSecret` respectively.

### Registering the slash commands of the bot to Discord

Reference: https://discord.com/developers/docs/interactions/application-commands#registering-a-command

```
npm run deploy-commands
```

### Running the bot with `tsx`

You can use tsx to run the bot directly without compiling:

```
npx tsx src/index.
```

### Compile and run

```
npm run build
npm run start
```

## Tests

```
npm run test
```

## Linting and Styling

```
npm run style
```
