var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    ngAnnotate = require('gulp-ng-annotate'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify     = require('gulp-uglify'),
    concat     = require('gulp-concat'),
    livereload = require('gulp-livereload')

function onError(msg) {
  console.log(msg)
  gutil.beep()
}

var src = {
  html: ['views/*.html', 'index.html'],
  js  : 'app/**/*.js'
}

gulp.task('html', function() {
  gulp.src('index.html')
      .pipe(livereload())
})

gulp.task('js', function() {
  gulp.src(src.js)
      .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(ngAnnotate().on('error', onError))
        .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('js'))
      .pipe(livereload())
})

gulp.task('default', function() {
  livereload.listen()
  gulp.watch(src.html, ['html'])
  gulp.watch(src.js, ['js'])
})