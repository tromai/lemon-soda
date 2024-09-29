import { Client, ClientOptions, Collection } from "discord.js";
import { SlashCommandExport } from "../commands/type";
import { EventExport } from "../events/type";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { Track as SpotifyTrack } from "@spotify/web-api-ts-sdk";
import { Track as DiscordTrack } from "discord-player";
import { getTrackRecommendations } from "../spotify_client";

export class MyClient extends Client<true> {
    public commands: Collection<string, SlashCommandExport>;
    public spotify_api: SpotifyApi;
    public autoplayStates: { [guildId: string]: boolean } = {};
    public autoplaySpotifyTracks: { [guildId: string]: SpotifyTrack[] } = {};
    public isUserPaused: boolean = false;

    constructor(
        options: ClientOptions,
        commands: Collection<string, SlashCommandExport>,
        events: Collection<string, EventExport>,
        spotify_api: SpotifyApi,
    ) {
        super(options);
        this.commands = commands;
        this.spotify_api = spotify_api;

        // Registering events.
        for (const event of events.values()) {
            if (event.once) {
                this.once(event.name.toString(), (...args) =>
                    event.execute(...args),
                );
            } else {
                this.on(event.name.toString(), (...args) =>
                    event.execute(...args),
                );
            }
        }
    }

    /**
     * Returns the autoplay status of a guild.
     * @param guildId The Id of that guild as string.
     * @returns true if autoplay is ON else false.
     */
    public isAutoPlayOn(guildId: string): boolean {
        if (this.autoplayStates[guildId] === undefined) {
            this.autoplayStates[guildId] = false;
        }
        const isAutoPlayOn = this.autoplayStates[guildId];
        return isAutoPlayOn;
    }

    /**
     * Return the next autoplay track as a Spotify Track instance.
     * Note: the return value of this function must be "converted" into a Track instance
     * of discord-player.
     * @param guildId
     * @param lastPlayedTrack
     * @throws Will throw an SpotifyError if error happened while fetching song recs from SpotifyAPI.
     * @returns
     */
    public async getNextAutoPlaySpotifyTrack(
        guildId: string,
        lastPlayedTrack: DiscordTrack,
    ) {
        if (this.autoplaySpotifyTracks[guildId] === undefined) {
            this.autoplaySpotifyTracks[guildId] = [];
        }

        if (this.autoplaySpotifyTracks[guildId].length == 0) {
            // This function call can throw error.
            const trackRecs = await getTrackRecommendations(
                lastPlayedTrack.cleanTitle,
                lastPlayedTrack.author,
                this.spotify_api,
            );

            this.autoplaySpotifyTracks[guildId] =
                this.autoplaySpotifyTracks[guildId].concat(trackRecs);
        }

        return this.autoplaySpotifyTracks[guildId].pop()!;
    }

    public clearAutoPlayList(guildId: string) {
        this.autoplaySpotifyTracks[guildId] = [];
    }
}
