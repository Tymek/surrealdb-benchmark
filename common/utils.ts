export const option = (value: string) =>
	!value || value === "\\N" ? null : value;
export const list = (value: string) => option(value)?.split(",") || null;
export const numeric = (value: string) =>
	option(value) ? Number.parseInt(value, 10) : null;
export const bool = (value: string) => {
	if (value === "1") return true;
	if (value === "0") return false;
	return null;
};

type RemoveNulls<T> = {
	[K in keyof T]: T[K] extends null ? never : T[K];
};

export const removeNulls = <T extends Record<string, unknown>>(
	obj: T,
): RemoveNulls<T> =>
	Object.fromEntries(
		Object.entries(obj).filter(([_, value]) => value !== null),
	) as RemoveNulls<T>;

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
	? `${T extends Lowercase<T> ? "" : "_"}${Lowercase<T>}${CamelToSnakeCase<U>}`
	: S;

type CamelToSnake<T> = {
	[K in keyof T as CamelToSnakeCase<string & K>]: T[K] extends Record<
		string,
		unknown
	>
		? CamelToSnake<T[K]>
		: T[K];
};

export const camelToSnake = <T extends Record<string, unknown>>(
	obj: T,
): CamelToSnake<T> =>
	Object.fromEntries(
		Object.entries(obj).map(([key, value]) => [
			key.replace(/([A-Z])/g, "_$1").toLowerCase(),
			value instanceof Object && !Array.isArray(value)
				? camelToSnake(value as Record<string, unknown>)
				: value,
		]),
	) as CamelToSnake<T>;

export async function* mapAsyncIterator<T, U>(
	asyncIterable: AsyncIterableIterator<T>,
	callback: (val: Awaited<T>, i?: number) => U,
) {
	let i = 0;
	for await (const val of asyncIterable) yield callback(val, i++);
}

export const interpolate = (
	x: number,
	from: [number, number],
	to: [number, number],
): number => {
	return to[0] + ((x - from[0]) * (to[1] - to[0])) / (from[1] - from[0]);
};
