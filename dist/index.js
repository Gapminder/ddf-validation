import { runMain } from "./lib.js";

function validate(fp = "./") {
  runMain(fp)();
}

export {
  validate
}