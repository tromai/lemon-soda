import { EmbedBuilder } from "discord.js";

/**
 * Split a string ``message`` into strings with length of ``chunkSize`` characters.
 * We assume that ``chunkSize`` is a natural number.
 *
 * @param message The original message
 * @param chunkSize The size of each chunk
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
 * Return an array of {@link EmbedBuilder} as pages.
 * Each page contains maximum of ``linesPerPage`` lines.
 * And each page's content must be at most 1024 characters
 * according to https://discordjs.guide/popular-topics/embeds.html#embed-limits
 * If adding a line exceeds the 1024 characters max. That line will be trimmed and
 * replaced with "...".
 *
 * @param {string} lines The input message lines.
 * @param linesPerPage The maximum number of lines per page.
 */
export function createPagesEmbeds(
    lines: string[],
    linesPerPage: number = 5,
): EmbedBuilder[] {
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
 * Split an array of lines into an array of paragraphs.
 * Each paragraph is a string, which:
 *     * contains maximum ``linesPerPage`` lines from the original array
 *     * contains maximum ``maxSize`` characters.
 * If adding a line into a paragraph exceeds ``maxSize`` characters, that line will be trimmed down
 * and the last 3 characters are replaced with "...".
 * We assume that maxSize is always > 3.
 *
 * @param lines The original array of lines.
 * @param linesPerPage The maximum number of lines per page.
 */
export function splitLines(
    lines: string[],
    linesPerPage: number,
    maxSize: number,
) {
    const result = [];
    let lineCount = 0;
    let currentParagraph = "";
    for (let i = 0; i < lines.length; i++) {
        const current = lines[i];
        currentParagraph = currentParagraph.concat(current);
        lineCount++;

        // Only ends the paragraph if NEITHER of these conditions meet.
        if (currentParagraph.length < maxSize && lineCount < linesPerPage) {
            continue;
        }

        // Trim the paragraph down to 1024 characters and replace the last
        // 3 characters with "..." if the paragraph exceeds the 1024 characters limit.
        if (currentParagraph.length > maxSize) {
            currentParagraph =
                currentParagraph.substring(0, maxSize - 3) + "...";
        }

        result.push(currentParagraph);
        currentParagraph = "";
        lineCount = 0;
    }

    // Add whatever is remained in the paragraph.
    // It's sure that this paragraph will be within the char and line limit.
    if (!(currentParagraph.length == 0)) {
        result.push(currentParagraph);
    }
    return result;
}
