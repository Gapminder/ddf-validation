import { runMain } from "../dist/lib.js";

function validate(fp = "./") {
  runMain(fp)();
}

export {
  validate
}
