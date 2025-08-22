import type { Ref } from 'vue';

export type ComputedOptions<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends Function
		? T[K]
		: T[K] extends Record<string, any>
		? ComputedOptions<T[K]> | Ref<T[K]> | T[K]
		: Ref<T[K]> | T[K];
};

export type ComputedMethodOption<M, P> = 'get' extends keyof P
	? ComputedOptions<{ method?: M }>
	: ComputedOptions<{ method: M }>;
