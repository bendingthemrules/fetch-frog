export type Flags = {
	input?: string;
	output?: string;
	help?: boolean;
	version?: boolean;
};

export type Command = (flags: Flags, positionals: string[]) => Promise<void> | void;
