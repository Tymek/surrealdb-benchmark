export * from "./dataset";
export * from "./utils";

const measure = async (action?: Promise<void>) => {
	const start = [performance.now(), process.memoryUsage().heapUsed];
	await action;
	const time = performance.now() - start[0];
	const mem = process.memoryUsage().heapUsed - start[1];
	return { time, mem };
};

type DBClient = {
	initialize?: () => Promise<void>;
	insertTitles: (start: number, end?: number) => Promise<void>;
	queryTitles: {
		// biome-ignore lint/suspicious/noExplicitAny:
		get50: () => Promise<any>;
		// biome-ignore lint/suspicious/noExplicitAny:
		getById: () => Promise<any>;
		// biome-ignore lint/suspicious/noExplicitAny:
		countByYear: () => Promise<any>;
	};
	close?: () => Promise<void>;
};

export const test = async (client: DBClient) => {
	const datasetSizes = [
		1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000, 200_000, 500_000,
		1_000_000, 2_000_000, 5_000_000, 10_000_000, 11_042_233,
	];

	const results = [];

	await client.initialize?.();

	for (let i = 0; i < datasetSizes.length - 1; i++) {
		const start = datasetSizes[i];
		const end = datasetSizes[i + 1];

		console.log(`Testing ${start}-${end} items`);

		try {
			// Measure the insert time
			const insertResult = await measure(client.insertTitles(start + 1, end));

			// Measure the query times
			const query50Result = await measure(client.queryTitles.get50());
			const queryByIdResult = await measure(client.queryTitles.getById());
			const countByYearResult = await measure(client.queryTitles.countByYear());

			// Store the results as a row for the table
			results.push({
				"Dataset Size": end,
				"Inserted items": end - start, // Off-by-one, whatever
				"Insert (ms)": insertResult.time.toFixed(2),
				"Query 50 (ms)": query50Result.time.toFixed(2),
				"Query By ID (ms)": queryByIdResult.time.toFixed(2),
				"Count By Year (ms)": countByYearResult.time.toFixed(2),
			});
		} catch (e) {
			console.error(
				results.push({
					"Dataset Size": "D.N.F",
					"Inserted items": "D.N.F",
					"Insert (ms)": "D.N.F",
					"Query 50 (ms)": "D.N.F",
					"Query By ID (ms)": "D.N.F",
					"Count By Year (ms)": "D.N.F",
				}),
			);
		}
	}

	await client.close?.();

	console.table(results);
};
