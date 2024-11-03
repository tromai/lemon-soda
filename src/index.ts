import { GatewayIntentBits } from "discord.js";
import { loadSlashCommands } from "./commands";
import { MyClient } from "./client";
import { loadEventDefinitions } from "./events";
import { GuildQueueEvent, Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SpotifyExtractor } from "@discord-player/extractor";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const token = process.env.TOKEN;
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!token) {
    throw new Error("Missing required environment variable: TOKEN");
}

if (!spotifyClientId) {
    throw new Error("Missing required environment variable: SPOTIFY_CLIENT_ID");
}

if (!spotifyClientSecret) {
    throw new Error(
        "Missing required environment variable: SPOTIFY_CLIENT_SECRET",
    );
}

const spotify_api = SpotifyApi.withClientCredentials(
    spotifyClientId,
    spotifyClientSecret,
);

const client = new MyClient(
    { intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] },
    loadSlashCommands(),
    loadEventDefinitions(),
    spotify_api,
);

const player = new Player(client);
player.extractors.register(YoutubeiExtractor, {});
player.extractors.register(SpotifyExtractor, {});

player.events.on(GuildQueueEvent.PlayerStart, (queue, track) => {
    if (!queue.metadata) {
        return;
    }
    queue.metadata.channel.send(`Started playing **${track.title}**!`);
});

player.events.on(GuildQueueEvent.EmptyQueue, (queue) => {
    const channel = queue.channel;
    if (!channel) {
        console.log(
            `Cannot find channel in ${GuildQueueEvent.EmptyQueue} event.`,
        );
        return;
    }

    const client = channel.client as MyClient;
    if (!client) {
        console.log(
            `Cannot find client in ${GuildQueueEvent.EmptyQueue} event.`,
        );
        return;
    }

    const isAutoPlayOn = client.isAutoPlayOn(channel.guildId);
    if (!isAutoPlayOn) {
        return;
    }

    const lastPlayedTrack = queue.history.previousTrack;
    if (!lastPlayedTrack) {
        queue.metadata.channel.send(
            "Please add a couple of songs so that we can autoplay.",
        );
        return;
    }

    client
        .getNextAutoPlaySpotifyTrack(channel.guildId, lastPlayedTrack)
        .then((autoplaySpotifyTrack) => {
            player
                .search(autoplaySpotifyTrack.external_urls.spotify)
                .then((result) => {
                    if (!result.hasTracks()) {
                        queue.metadata.channel.send(
                            "An unexpected error occurred.",
                        );
                        return;
                    }
                    queue.addTrack(result.tracks.pop()!);
                    queue.node.play();
                    return;
                });
        })
        .catch((error) => {
            console.log(error);
            queue.metadata.channel.send(
                "Cannot find more songs for autoplay. " +
                    "Please add songs manually or try again later.",
            );
            return;
        });
});

client.login(token).catch(() => {});
