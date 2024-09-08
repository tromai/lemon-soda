import { splitLines, splitMessage } from ".";

describe("Test split messages", () => {
    test.each([
        [
            "aaaaaabbbbbbccccccdddddd",
            6,
            ["aaaaaa", "bbbbbb", "cccccc", "dddddd"],
        ],
        ["aaaa", 6, ["aaaa"]],
        ["", 6, []],
    ])("test", (content, chunkSize, expected) => {
        expect(splitMessage(content, chunkSize)).toEqual(expected);
    });
});

describe("Test split lines", () => {
    test.each([
        [["aa", "bb", "ccc", "dddd"], 2, 10, ["aabb", "cccdddd"]],
        [["aa", "bb", "ccc", "dddd"], 2, 5, ["aabb", "cc..."]],
        [["aa", "bb", "ccc", "dd"], 2, 5, ["aabb", "cccdd"]],
        [["aaaaa", "bb", "ccc", "dd"], 2, 5, ["aaaaa", "bbccc", "dd"]],
        [["aaaa", "bb", "ccc", "dd"], 2, 5, ["aa...", "cccdd"]],
        [["aaaaaaaaaa", "bb", "ccc", "dd"], 2, 5, ["aa...", "bbccc", "dd"]],
    ])("test", (lines, linesPerPage, maxSize, expected) => {
        expect(splitLines(lines, linesPerPage, maxSize)).toEqual(expected);
    });
});
