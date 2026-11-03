export type Flags = {
	input?: string;
	output?: string;
};

export type Command = (flags: Flags, positionals: string[]) => Promise<void> | void;
