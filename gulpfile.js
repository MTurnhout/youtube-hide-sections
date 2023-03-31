const gulp = require("gulp");
const zip = require("gulp-zip");
const pjson = require("./package.json");

exports.default = () =>
  gulp
    .src(["src/**", "!src/**/*.ts"])
    .pipe(zip(`v${pjson.version}.zip`))
    .pipe(gulp.dest("dist"));
