import { Events } from "discord.js";

export type EventExport = {
    name: Events;
    once: boolean;
    execute: (...args) => void;
};
