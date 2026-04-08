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

	let initialRefresh: Promise<void> | null = null;

	$effect(() => {
		if (!options.watch || !activated) {
			return;
		}

		initialRefresh = effectFetch();
	});

	async function effectFetch() {
		const id = ++fetchId;

		status = 'loading';
		error = null;

		const result = await promise();

		if (id !== fetchId) return;

		if (result.data) {
			data = result.data;
			status = 'success';
		} else {
			error = result.error;
			status = 'error';
		}
	}

	async function refresh() {
		if (!activated) activated = true;

		// invalidate any in-flight effect fetches
		fetchId++;

		status = 'loading';
		error = null;

		const result = await promise();

		if (result.data) {
			data = result.data;
			status = 'success';
		} else {
			error = result.error;
			status = 'error';
		}
	}

	return {
		get data() {
			return data;
		},
		get error() {
			return error;
		},
		get status() {
			return status;
		},
		refresh,

		// oxlint-disable-next-line no-thenable
		then(resolve: (value: ReactiveApiFacade<T>) => void, reject: (reason: unknown) => void) {
			(async () => {
				try {
					await (initialRefresh ?? refresh());

					resolve({
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
					} as ReactiveApiFacade<T>);
				} catch (error) {
					status = 'error';
					reject({
						get data() {
							return null;
						},
						get error() {
							return error;
						},
						get status() {
							return status;
						},
						refresh
					});
				}
			})();
		}
	} as ReactiveApiFacade<T> & Promise<ReactiveApiFacade<T>>;
}
