var gulp = require('gulp')
var bower = require('gulp-bower')
var merge = require('merge-stream')
var less = require('gulp-less')
var minifyCSS = require('gulp-csso')
var plumber = require('gulp-plumber')
var clean = require('gulp-clean')
var minifyJS = require('gulp-uglify')
var babel = require('gulp-babel')
var watch = require('gulp-watch')

var __src = 'src'
var __fronted = 'public'
var __backend = ''
var __build = 'build'

gulp.task('lib', function () {
  return merge(
    bower('bower_components')
    .pipe(gulp.dest(`${__build}/${__fronted}/src/lib`)),
    gulp.src(`${__src}/${__fronted}/src/lib/*`)
    .pipe(gulp.dest(`${__build}/${__fronted}/src/lib`))
  )
})

gulp.task('css', function () {
  return merge(
    gulp.src(`${__src}/${__fronted}/src/css/*.less`)
    .pipe(plumber())
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(gulp.dest(`${__build}/${__fronted}/src/css`)),
    gulp.src(`${__src}/${__fronted}/src/css/themes/*.less`)
    .pipe(plumber())
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(gulp.dest(`${__build}/${__fronted}/src/css/themes`))
  )
})

gulp.task('frontedJS', function () {
  return gulp.src(`${__src}/${__fronted}/src/js/*.js`)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(minifyJS())
    .pipe(gulp.dest(`${__build}/${__fronted}/src/js`))
})

gulp.task('image', function () {
  return merge(
    gulp.src(`${__src}/${__fronted}/src/image/*`)
    .pipe(gulp.dest(`${__build}/${__fronted}/src/image`)),
    gulp.src(`${__src}/${__fronted}/src/image/file/*`)
    .pipe(gulp.dest(`${__build}/${__fronted}/src/image/file`))
  )
})

gulp.task('html', function () {
  return gulp.src(`${__src}/${__fronted}/*.html`)
    .pipe(gulp.dest(`${__build}/${__fronted}`))
})

gulp.task('fronted', ['lib', 'frontedJS', 'html', 'css', 'image'])

gulp.task('backendJS', function () {
  return merge(
    gulp.src(`${__src}/${__backend}/controller/*.js`)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(minifyJS())
    .pipe(gulp.dest(`${__build}/${__backend}/controller`)),
    gulp.src(`${__src}/${__backend}/database/*.js`)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(minifyJS())
    .pipe(gulp.dest(`${__build}/${__backend}/database`)),
    gulp.src(`${__src}/${__backend}/worker/*.js`)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(minifyJS())
    .pipe(gulp.dest(`${__build}/${__backend}/worker`)),
    gulp.src(`${__src}/${__backend}/*.js`)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(minifyJS())
    .pipe(gulp.dest(`${__build}/${__backend}`))
  )
})

gulp.task('backend', ['backendJS'])

gulp.task('clean', function () {
    return merge(
      gulp.src(__build, {read: false})
        .pipe(clean())
    )
})

gulp.task('build', ['fronted', 'backend'])
