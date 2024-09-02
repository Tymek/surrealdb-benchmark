import { batch, processCSV, test, title_basics } from "@im-db-benchmark/common";
import { RecordId, Surreal } from "surrealdb.js";

const db = new Surreal();

const initialize = async () => {
	await db.connect(process.env.SURREALDB_URL || "http://127.0.0.1:8000/rpc");
	await db.use({ namespace: "test", database: "test" });
	await db.signin({
		username: "root",
		password: "root",
	});
	await db.ping();

	await db.query_raw("REMOVE TABLE IF EXISTS title_basics;");
	await db.query_raw(`
		DEFINE TABLE title_basics SCHEMAFULL;

		DEFINE FIELD tconst ON title_basics TYPE string;
		DEFINE FIELD titleType ON title_basics TYPE option<string>;
		DEFINE FIELD primaryTitle ON title_basics TYPE option<string>;
		DEFINE FIELD originalTitle ON title_basics TYPE option<string>;
		DEFINE FIELD isAdult ON title_basics TYPE option<bool>;
		DEFINE FIELD startYear ON title_basics TYPE option<int>;
		DEFINE FIELD endYear ON title_basics TYPE option<int>;
		DEFINE FIELD runtimeMinutes ON title_basics TYPE option<int>;
		DEFINE FIELD genres ON title_basics TYPE option<array<string>>;

		DEFINE INDEX unique_title_basics_tconst ON title_basics FIELDS tconst UNIQUE;
	`);
};

const insertTitles = async (start: number, end?: number) => {
	const csvIterator = processCSV("dataset/title.basics.tsv", {
		start,
		end,
	});

	for await (const data of batch(csvIterator, 1_000)) {
		const objects = data
			.map(title_basics)
			.map(
				({
					tconst,
					titleType,
					primaryTitle,
					originalTitle,
					isAdult,
					startYear,
					endYear,
					runtimeMinutes,
					genres,
				}) => ({
					id: new RecordId("title_basics", tconst),
					tconst,
					...(titleType && { titleType }),
					...(primaryTitle && { primaryTitle }),
					...(originalTitle && { originalTitle }),
					...(isAdult && { isAdult }),
					...(startYear && { startYear }),
					...(endYear && { endYear }),
					...(runtimeMinutes && { runtimeMinutes }),
					...(genres && { genres }),
				}),
			);
		await db.insert<(typeof objects)[number]>("title_basics", objects);
	}
};

let i = 100;

const queryTitles = {
	get50: async () => db.query_raw("SELECT * FROM title_basics LIMIT 50;"),
	getById: async () => {
		return db.select(new RecordId("title_basics", `tt0000${i++}`));
	},
	countByYear: async () =>
		db.query_raw(
			"SELECT startYear, COUNT() AS count_of_titles FROM title_basics GROUP BY startYear;",
		),
};

const teardown = async () => {
	await db.query_raw("DELETE TABLE title_basics;");
};

const close = async () => {
	await db.close();
};

console.log(
	await test({
		initialize,
		insertTitles,
		queryTitles,
		close,
	}),
);
