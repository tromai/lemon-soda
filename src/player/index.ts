import { useMainPlayer } from "discord-player";
import { CommandInteraction } from "discord.js";

export class QueueError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "QueueError";
    }
}

/**
 * This method returns the queue corresponding to the guild where the interaction
 * was fired from.
 * @param interaction
 * @returns
 */
export async function getQueueFromCommandInteraction(
    interaction: CommandInteraction,
) {
    const player = useMainPlayer();

    const guildId = interaction.commandGuildId;
    if (!guildId) {
        throw new QueueError("Error: Cannot find target channel.");
    }

    const queue = player.queues.get(guildId);
    if (!queue || !queue.isPlaying()) {
        throw new QueueError("There is nothing playing");
    }

    return queue;
}
