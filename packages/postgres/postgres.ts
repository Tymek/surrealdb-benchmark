import { batch, processCSV, test, title_basics } from "@im-db-benchmark/common";
import postgres from "postgres";

const sql = postgres(
	process.env.POSTGRES_URL ||
		"postgres://postgres:postgres@127.0.0.1:5432/postgres",
);

const initialize = async () => {
	await sql`SELECT 1;`;
	await sql`
	    DROP TABLE IF EXISTS title_basics;
	`;
	await sql`
	    CREATE TABLE title_basics (
	        tconst VARCHAR(255) NOT NULL PRIMARY KEY,
	        title_type VARCHAR(50),
	        primary_title VARCHAR(1024),
	        original_title VARCHAR(1024),
	        is_adult BOOLEAN,
	        start_year INT,
	        end_year INT,
	        runtime_minutes INT,
	        genres TEXT[]
	    );
	`;
};

const insertTitles = async (start: number, end?: number) => {
	const csvIterator = processCSV("dataset/title.basics.tsv", { start, end });

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
					tconst,
					title_type: titleType,
					primary_title: primaryTitle,
					original_title: originalTitle,
					is_adult: isAdult,
					start_year: startYear,
					end_year: endYear,
					runtime_minutes: runtimeMinutes,
					genres,
				}),
			);
		await sql`INSERT INTO title_basics ${sql(objects)}`;
	}
};

let i = 100;

const queryTitles = {
	get50: async () => sql`SELECT * FROM title_basics LIMIT 50`,
	getById: async () =>
		sql`SELECT * FROM title_basics WHERE tconst = ${`tt0000${i++}`}`,
	countByYear: async () =>
		sql`SELECT start_year, COUNT(*) AS count_of_titles FROM title_basics GROUP BY start_year;`,
};

const close = async () => {
	await sql.end();
};

console.log(
	await test({
		initialize,
		insertTitles,
		queryTitles,
		close,
	}),
);
