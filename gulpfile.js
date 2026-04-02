const gulp = require('gulp')
const uglify = require('gulp-uglify')
const clean = require('gulp-clean')

// 清空输出目录
gulp.task('clean', function () {
  return gulp
    .src('./dist/', { read: false, allowEmpty: true })
    .pipe(clean())
})

// 压缩 JS
gulp.task('build', function () {
  return gulp
    .src('./src/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
})

// 复制资源文件
gulp.task('move', function () {
  return gulp
    .src(['./src/package.json', './src/README.md', './src/config.json'])
    .pipe(gulp.dest('./dist/'))
})

// 默认任务
gulp.task('default', gulp.series('clean', 'build', 'move'))
