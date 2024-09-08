import { useMainPlayer } from "discord-player";
import { CommandInteraction } from "discord.js";

/**
 * Raised when there is an error with managing the Queue for a particular guild.
 */
export class QueueError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "QueueError";
    }
}

/**
 * This method returns the queue corresponding to the guild where ``interaction``
 * was fired from.
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
