// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import {token} from "../data/config.json";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token).catch(() => {});
