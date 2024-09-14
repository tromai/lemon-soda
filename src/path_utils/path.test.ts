import { hasSuffix } from ".";

describe("Test has suffixes", () => {
    test.each([
        ["test.txt", [".txt", ".js", ".ts"], true],
        ["test", [".txt", ".js", ".ts"], false],
        ["testxt", [".txt", ".js", ".ts"], false],
        ["test.txt", [], false],
    ])("test", (content, suffixes, expected) => {
        expect(hasSuffix(content, suffixes)).toBe(expected);
    });
});
