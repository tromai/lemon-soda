import { MyClient } from "../../client";

import { Events } from "discord.js";

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: MyClient) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};
