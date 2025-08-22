import { Arguments } from 'yargs-parser';

export type Command = (flags: Arguments, args: string[]) => Promise<void> | void;
