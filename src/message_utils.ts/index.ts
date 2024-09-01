import { EmbedBuilder } from "discord.js";

export function splitMessage(message: string, chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < message.length; i += chunkSize) {
        chunks.push(message.slice(i, i + chunkSize));
    }
    return chunks;
}

// https://discordjs.guide/popular-topics/embeds.html#embed-limits
// each field value is 1024 characters max.
// Try to paginate using ``linesPerPage``. However, we can reduce the number of
// lines if the total character exceed 1024.
// We assume each line doesn't exceed 1024;
export function createPagesEmbeds(lines: string[], linesPerPage: number = 5) {
    const result = [];
    let lineCount = 0;
    let currentBatch = "";
    for (let i = 0; i < lines.length; i++) {
        const current = lines[i];
        if (
            currentBatch.length + current.length > 1024 ||
            lineCount == linesPerPage
        ) {
            result.push(currentBatch);
            currentBatch = lines[i];
            lineCount = 1;
            continue;
        }
        currentBatch = currentBatch.concat(lines[i]);
        lineCount++;
    }

    const embeds = [];
    for (let i = 0; i < result.length; i++) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Upcoming tracks")
            .addFields({ name: `Page ${i + 1}/${result.length}`, value: result[i] })
            .setTimestamp();
        embeds.push(embed);
    }

    return embeds;
}
