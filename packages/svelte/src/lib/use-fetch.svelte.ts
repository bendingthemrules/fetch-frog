import { defu } from 'defu';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

type ApiResponse =
	| {
			data: unknown;
			error: null;
	  }
	| {
			data: null;
			error: unknown;
	  };

type ReactiveApiOptions = {
	immediate?: boolean;
	watch?: boolean;
};

export type ReactiveApiFacade<T extends ApiResponse> = {
	data: T['data'] | null;
	error: T['error'] | null;
	status: LoadingState;
	refresh: () => Promise<void>;
};

export function createReactiveApi<T extends ApiResponse>(
	promise: () => Promise<T>,
	options: ReactiveApiOptions = {}
): ReactiveApiFacade<T> & Promise<ReactiveApiFacade<T>> {
	const defaultOptions: ReactiveApiOptions = {
		immediate: true,
		watch: true
	};
	options = defu(options, defaultOptions);

	let status = $state<LoadingState>(options.immediate ? 'loading' : 'idle');
	let data: T['data'] | null = $state(null);
	let error: T['error'] | null = $state(null);
	let activated = $state(options.immediate!);

	let fetchId = 0;
	// Settles once the most recent fetch has settled.
	let latest: Promise<void> = Promise.resolve();

	$effect(() => {
		if (!options.watch || !activated) {
			return;
		}

		run();
	});

	/**
	 * Start a fetch and resolve once the newest fetch has settled, also when a
	 * later fetch superseded this one. `promise()` is called synchronously so
	 * the effect above tracks its dependencies.
	 */
	function run(): Promise<void> {
		const id = ++fetchId;
		const isCurrent = () => id === fetchId;

		status = 'loading';
		error = null;

		let pending: Promise<T>;
		try {
			pending = promise();
		} catch (thrown) {
			pending = Promise.reject(thrown);
		}

		latest = pending
			.then(
				(result) => {
					if (isCurrent()) applyResult(result);
				},
				(thrown: unknown) => {
					if (!isCurrent()) return;
					error = thrown as T['error'];
					status = 'error';
				}
			)
			.then(() => (isCurrent() ? undefined : latest));

		return latest;
	}

	function refresh(): Promise<void> {
		activated = true;
		return run();
	}

	// Success is signalled by the absence of an error, not by truthy data:
	// a 204 or a falsy body (0, false, '') is still a successful response.
	function applyResult(result: T) {
		if (result.error == null) {
			data = result.data;
			status = 'success';
		} else {
			error = result.error;
			status = 'error';
		}
	}

	const facade: ReactiveApiFacade<T> = {
		get data() {
			return data;
		},
		get error() {
			return error;
		},
		get status() {
			return status;
		},
		refresh
	};

	// Awaiting waits for the current fetch, or starts one if none has run yet.
	// It resolves with `facade`, which has no `then`, so awaiting can't loop.
	const thenable = {
		// oxlint-disable-next-line no-thenable
		then(resolve: (value: ReactiveApiFacade<T>) => void, reject: (reason: unknown) => void) {
			(fetchId > 0 ? latest : refresh()).then(() => resolve(facade), reject);
		}
	};

	return Object.defineProperties(
		thenable,
		Object.getOwnPropertyDescriptors(facade)
	) as unknown as ReactiveApiFacade<T> & Promise<ReactiveApiFacade<T>>;
}
