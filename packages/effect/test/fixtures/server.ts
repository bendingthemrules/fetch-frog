import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

export type Reply = { status: number; body?: unknown } | 'hang';

/**
 * Starts a local HTTP server that answers every request with whatever
 * `reply` returns for its method + path. `'hang'` never answers, and counts
 * the request in `aborted` once the client gives up on it.
 */
export async function startServer(reply: (method: string, path: string) => Reply): Promise<{
	baseUrl: string;
	close: () => Promise<void>;
	aborted: () => number;
}> {
	let aborted = 0;
	const server: Server = createServer((req, res) => {
		const answer = reply(req.method ?? 'GET', req.url ?? '/');
		if (answer === 'hang') {
			res.on('close', () => aborted++);
			return;
		}
		const { status, body } = answer;
		if (body === undefined) {
			res.writeHead(status).end();
			return;
		}
		res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));
	});

	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	const { port } = server.address() as AddressInfo;

	return {
		baseUrl: `http://127.0.0.1:${port}`,
		close: () =>
			new Promise((resolve) => {
				server.closeAllConnections();
				server.close(() => resolve());
			}),
		aborted: () => aborted
	};
}

/** A base URL nothing is listening on, for network failures. */
export async function deadBaseUrl(): Promise<string> {
	const { baseUrl, close } = await startServer(() => ({ status: 200 }));
	await close();
	return baseUrl;
}
