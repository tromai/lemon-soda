import { Client, ClientOptions, Collection } from "discord.js";
import { SlashCommandExport } from "../commands/type";
import { EventExport } from "../events/type";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { Track as SpotifyTrack } from "@spotify/web-api-ts-sdk";

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
     * name
     */
    public addAutoPlayTracks(tracks: Track[], guildId: string) {
        if (this.autoplaySpotifyTracks[guildId] === undefined) {
            this.autoplaySpotifyTracks[guildId] = [];
        }

        tracks.forEach((ele) => this.autoplaySpotifyTracks[guildId].push(ele));
    }
}
