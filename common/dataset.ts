import datasetMeta from "./meta.json";
import { bool, interpolate, list, numeric, option } from "./utils";

const readLines = async function* (dataset: string): AsyncGenerator<string> {
	const file = Bun.file(dataset);
	const stream = file.stream();
	const decoder = new TextDecoder();
	const newLine = "\n";

	let previousChunk = "";
	for await (const chunk of stream as unknown as Iterable<Uint8Array>) {
		const textChunk = decoder.decode(chunk, { stream: true });
		previousChunk += textChunk;

		const lines = previousChunk.split(newLine);
		previousChunk = lines.pop() || ""; // Keep the last line in case it's incomplete

		for (const line of lines) {
			yield line;
		}
	}

	if (previousChunk) {
		yield previousChunk; // Yield the last line if it exists
	}
};

export const processCSV = async function* (
	dataset: string,
	params?: {
		start?: number;
		end?: number;
		logInterval?: number;
		separator?: string;
		quiet?: boolean;
	},
): AsyncGenerator<string[]> {
	const {
		start = 0,
		end = Number.POSITIVE_INFINITY,
		logInterval = 100_000,
		separator = "\t",
		quiet = false,
	} = params || {};

	const total: number =
		datasetMeta[dataset as keyof typeof datasetMeta]?.lines || 0;
	const effectiveEnd = Math.min(end, total);
	let i = 0;
	const log = (last = false) => {
		if (!quiet && (last || i % logInterval === 0)) {
			const percent = interpolate(
				Math.min(i, effectiveEnd),
				[start, effectiveEnd],
				[0, 100],
			).toFixed(2);
			process.stdout.write(
				`\rProcessing ${dataset} - ${percent}%${last ? "\n" : ""}`,
			);
		}
	};

	for await (const line of readLines(dataset)) {
		if (i < start) {
			i++;
			continue;
		}
		if (i > end) {
			break;
		}

		log();
		yield line.split(separator);
		i++;
	}

	if (i > 0) {
		log(true); // Ensure final log is displayed if there are lines processed
	}
};

export const batch = async function* <T>(
	iterator: AsyncIterableIterator<T>,
	size = 1_000,
): AsyncIterableIterator<T[]> {
	let batch: T[] = [];

	for await (const item of iterator) {
		batch.push(item);
		if (batch.length === size) {
			yield batch;
			batch = [];
		}
	}

	if (batch.length > 0) {
		yield batch;
	}
};

// === Schema ===

export const title_basics = (data: string[]) => ({
	tconst: data[0],
	titleType: option(data[1]),
	primaryTitle: option(data[2]),
	originalTitle: option(data[3]),
	isAdult: bool(data[4]),
	startYear: numeric(data[5]),
	endYear: numeric(data[6]),
	runtimeMinutes: numeric(data[7]),
	genres: list(data[8]),
});
