import { GatewayIntentBits } from "discord.js";
import { token } from "../data/config.json";
import { loadSlashCommands } from "./commands";
import { MyClient } from "./client";
import { loadEventDefinitions } from "./events";
import { GuildQueueEvent, Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { SpotifyExtractor } from "@discord-player/extractor";

const client = new MyClient(
    { intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] },
    loadSlashCommands(),
    loadEventDefinitions(),
);

const player = new Player(client);
player.extractors.register(YoutubeiExtractor, {});
player.extractors.register(SpotifyExtractor, {});

player.events.on(GuildQueueEvent.PlayerStart, (queue, track) => {
    queue.metadata.channel.send(`Started playing **${track.title}**!`);
});

client.login(token).catch(() => {});
