import { defu } from 'defu';

export type LoadingState = 'loading' | 'success' | 'error';

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

export class ReactiveApi<T extends ApiResponse> {
	status = $state<LoadingState>('loading');
	data: T['data'] | null = $state(null);
	error: T['error'] | null = $state(null);

	// private
	#promiseFn: (() => Promise<T>) | null = $state(null);

	constructor(promise: () => Promise<T>, options: ReactiveApiOptions = {}) {
		const defaultOptions: ReactiveApiOptions = {
			immediate: true,
			watch: true
		};
		options = defu(options, defaultOptions);

		this.#promiseFn = promise;

		$effect(() => {
			if (!options.watch) {
				return;
			}

			if (!options.immediate) {
				options.immediate = true;
				return;
			}

			this.refresh();
		});
	}

	refresh = async () => {
		if (!this.#promiseFn) {
			return;
		}

		this.status = 'loading';
		this.error = null;

		const { data, error } = await this.#promiseFn();

		if (data) {
			this.data = data;
			this.status = 'success';
		} else {
			this.error = error;
			this.status = 'error';
		}
	};
}

/** @deprecated use ReactiveApi instead*/
export function createReactiveApi<T extends ApiResponse>(promise: () => Promise<T>) {
	let status = $state<LoadingState>('loading');
	let data: T['data'] | null = $state(null);
	let error: T['error'] | null = $state(null);

	$effect(() => {
		refresh();
	});

	async function refresh() {
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
		value: () => ({ data, error, status }),
		refresh
	};
}
