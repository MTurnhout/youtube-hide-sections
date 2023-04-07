const { src, dest } = require("gulp");
const gulp_remove_logging = require("gulp-remove-logging");
const zip = require("gulp-zip");
const pjson = require("./package.json");

exports.default = () =>
  src("src/**/*.js")
    .pipe(gulp_remove_logging())
    .pipe(src(["src/**", "!src/**/*.ts", "!src/**/*.js"]))
    .pipe(zip(`v${pjson.version}.zip`))
    .pipe(dest("dist"));
