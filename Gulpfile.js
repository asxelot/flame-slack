var gulp       = require('gulp'),
    cssmin     = require('gulp-cssmin'),
    ngAnnotate = require('gulp-ng-annotate'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify     = require('gulp-uglify'),
    concat     = require('gulp-concat'),
    rename     = require('gulp-rename'),
    gutil      = require('gulp-util'),
    prefix     = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload')

var src = {
  css: ['css/*.css', '!css/*.min.css'],
  html: ['views/*.html', 'index.html'],
  js  : 'app/**/*.js'
}

function onError(err) {
  console.error(err)
  gutil.beep()
}

gulp.task('html', function() {
  gulp.src('index.html')
      .pipe(livereload())
})

gulp.task('css', function() {
  gulp.src(src.css)  
      .pipe(prefix())
      .pipe(cssmin())
      .pipe(gulp.dest('css'))
      .pipe(livereload())
})

gulp.task('js', function() {
  gulp.src(src.js)
      .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('js'))
        .pipe(ngAnnotate())
        .pipe(rename('app.min.js'))
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