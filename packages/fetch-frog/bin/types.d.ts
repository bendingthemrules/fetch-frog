export type CommandArgs = {
	/** Path or http(s) URL of the schema */
	input: string;
	/** Absolute path of the file to write */
	output: string;
};

export type Command = (args: CommandArgs) => Promise<void> | void;
