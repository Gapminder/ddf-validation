import { parse } from 'csv-parse/sync';
import { readFileSync } from 'node:fs'


// fs.createReadStream(path.resolve(__dirname, 'assets', 'parse.csv'))
//     .pipe(csv.parse({ headers: true }))
//     .on('error', error => console.error(error))
//     .on('data', row => console.log(row))
//     .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));


export function readCsvImpl(filepath) {

    let csvLine = readFileSync(filepath, { encoding: "utf-8" })

    return parse(csvLine, {
        bom: true,
        quote: '"',
        columns: false,
        relax_column_count: true,
        // We will skip the records that have different field numbers from headers.
        // MAYBE: move the checking to purescript code and log it with other errors
        // on_record: (record, { lines, error }) => {
        //     if (error) {
        //         console.log(`Warning: ${filepath}: skipped row because ${error.message}`);
        //         return null
        //     } else {
        //         return { "line": lines, "record": record }
        //     }
        // }
    });
}

// console.log(readCsvImpl("../../test/datasets/test1/ddf--concepts.csv"))