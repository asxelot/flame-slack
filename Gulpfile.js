var gulp       = require('gulp'),
    ngAnnotate = require('gulp-ng-annotate'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify     = require('gulp-uglify'),
    concat     = require('gulp-concat'),
    livereload = require('gulp-livereload')

var paths = {
  src: {
    html: ['views/*.html', 'index.html'],
    js  : 'app/**/*.js'
  },
  dist: {
    css: 'css',
    js: 'js'
  }
}

function onError(err) {
  console.error('\007', err.toString())
  this.emit('end')
}

gulp.task('html', function() {
  return gulp.src(paths.src.html)
    .pipe(livereload())
})

gulp.task('minjs', function() {
  return gulp.src(paths.src.js)
    .pipe(sourcemaps.init())
      .pipe(ngAnnotate().on('error', onError))
      .pipe(concat('app.min.js'))
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dist.js))
    .pipe(livereload())
})

gulp.task('default', ['minjs'], function() {
  livereload.listen()
  gulp.watch(paths.src.html, ['html'])
  gulp.watch(paths.src.js, ['minjs'])
})