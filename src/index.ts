import { GatewayIntentBits } from "discord.js";
import { token } from "../data/config.json";
import { loadSlashCommands } from "./commands";
import { MyClient } from "./client";
import { loadEventDefinitions } from "./events";
import { GuildQueueEvent, Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SpotifyExtractor } from "@discord-player/extractor";
import { spotifyClientId, spotifyClientSecret } from "../data/config.json";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { getTrackRecommendations, SpotifyApiError } from "./spotify_client";

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
    // TODO: capture this type in metadata somehow?
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

    const autoplayStatus = client.autoplayStates[channel.guildId];
    if (!autoplayStatus) {
        return;
    }

    if (client.autoplaySpotifyTracks[channel.guildId] === undefined) {
        client.autoplaySpotifyTracks[channel.guildId] = [];
    }

    if (client.autoplaySpotifyTracks[channel.guildId].length == 0) {
        // Update autoplay tracks based on last song played.
        const lastPlayedTrack = queue.history.previousTrack;
        if (!lastPlayedTrack) {
            queue.metadata.channel.send(
                "Please add a couple of songs so that we can autoplay.",
            );
            return;
        }

        // Query for recommendations here
        getTrackRecommendations(
            lastPlayedTrack.cleanTitle,
            lastPlayedTrack.author,
            spotify_api,
        )
            .then((tracks) => {
                tracks.forEach((track) => {
                    client.autoplaySpotifyTracks[channel.guildId].push(track);
                });

                const nextAutoPlayTrack =
                    client.autoplaySpotifyTracks[channel.guildId].pop()!;
                player
                    .search(nextAutoPlayTrack.external_urls.spotify)
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
                if (error instanceof SpotifyApiError) {
                    queue.metadata.channel.send(
                        "Cannot find more songs for autoplay. " +
                            "Please add songs manually or try again later.",
                    );
                    return;
                } else {
                    console.error("Unexpected error:", error);
                    queue.metadata.channel.send(
                        "An unexpected error occurred.",
                    );
                    return;
                }
            });
    } else {
        const nextAutoPlayTrack =
            client.autoplaySpotifyTracks[channel.guildId].pop()!;
        player
            .search(nextAutoPlayTrack.external_urls.spotify)
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
    }
});

client.login(token).catch(() => {});
