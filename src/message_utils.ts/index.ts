import { EmbedBuilder } from "discord.js";

/**
 * Split a string message into strings with length of ``chunkSize`` characters.
 * TODO: enforce chunkSize to be a natural number.
 * @param message
 * @param chunkSize
 * @returns
 */
export function splitMessage(message: string, chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < message.length; i += chunkSize) {
        chunks.push(message.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Return an array of pages represented by Embed instances. Each page contains maximum
 * of ``linesPerPage`` lines. And each page's content must be at most 1024 characters
 * according to https://discordjs.guide/popular-topics/embeds.html#embed-limits
 * and we store the content in a field value.
 * If adding a line exceeds the 1024 characters max. That line will be trimmed and
 * replaced with "...".
 * @param lines
 * @param linesPerPage
 * @returns
 */
export function createPagesEmbeds(lines: string[], linesPerPage: number = 5) {
    const result = splitLines(lines, linesPerPage, 1024);

    const embeds = [];
    for (let i = 0; i < result.length; i++) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Upcoming tracks")
            .addFields({
                name: `Page ${i + 1}/${result.length}`,
                value: result[i],
            })
            .setTimestamp();
        embeds.push(embed);
    }

    return embeds;
}

/**
 * Split an array of lines into an array of paragraphs. Each paragraph contains maximum
 * ``linesPerPage`` from the original array. Each paragraph contains maximum ``maxSize``
 * characters.
 * If a paragraph exceeds ``maxSize``, it will be trimmed down and the last 3 characters
 * are replaced with "...".
 * We assume that maxSize is always > 3.
 * @param lines
 * @param linesPerPage
 * @returns
 */
export function splitLines(
    lines: string[],
    linesPerPage: number,
    maxSize: number,
) {
    const result = [];
    let lineCount = 0;
    let currentBatch = "";
    for (let i = 0; i < lines.length; i++) {
        const current = lines[i];
        currentBatch = currentBatch.concat(current);
        lineCount++;

        // Only ends the paragraph if either two of these conditions meet.
        if (currentBatch.length < maxSize && lineCount < linesPerPage) {
            continue;
        }

        if (currentBatch.length > maxSize) {
            // 3 is the size of "..."
            currentBatch = currentBatch.substring(0, maxSize - 3) + "...";
        }

        result.push(currentBatch);
        currentBatch = "";
        lineCount = 0;
    }

    // Add the remaining lines.
    if (!(currentBatch.length == 0)) {
        result.push(currentBatch);
    }
    return result;
}
