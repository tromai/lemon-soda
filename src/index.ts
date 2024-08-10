import { GatewayIntentBits } from "discord.js";
import { token } from "../data/config.json";
import { loadSlashCommands } from "./commands";
import { MyClient } from "./client/client";
import { loadEventDefinitions } from "./events";

const client = new MyClient(
    { intents: [GatewayIntentBits.Guilds] },
    loadSlashCommands(),
    loadEventDefinitions(),
);

client.login(token).catch(() => {});
