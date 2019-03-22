import { parse } from 'papaparse';

export function stripBom(s) {
  if (s.charCodeAt(0) === 0xFEFF) {
    return s.slice(1);
  }

  return s;
}

export function csvToJsonByString(jsonStr, cb) {
  (parse as any)(stripBom(jsonStr), {
    header: true,
    quotes: true,
    skipEmptyLines: true,
    complete: result => {
      cb(null, result.data);
    },
    error: cb
  });
}
