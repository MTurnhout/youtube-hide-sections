const gulp = require("gulp");
const zip = require("gulp-zip");

exports.default = () =>
  gulp
    .src(["src/**", "!src/**/*.ts"])
    .pipe(zip("archive.zip"))
    .pipe(gulp.dest("dist"));
