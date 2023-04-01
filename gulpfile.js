const gulp = require("gulp");
const gulp_remove_logging = require("gulp-remove-logging");
const zip = require("gulp-zip");
const pjson = require("./package.json");

exports.default = () =>
  gulp
    .src(["src/**", "!src/**/*.ts"])
    .pipe(gulp_remove_logging())
    .pipe(zip(`v${pjson.version}.zip`))
    .pipe(gulp.dest("dist"));
