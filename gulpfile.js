// 基础库
const gulp = require('gulp')
// ES6 转 ES5
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
// 文件重命名
const rename = require('gulp-rename')
// 清空文件夹
const clean = require('gulp-clean')

// 删除文件夹
gulp.task('clean', function () {
  return gulp
    // read：是否读取文件，true 读取， false 不读取，加快程序
    // allowEmpty：允许文件夹为空或不存在，要不然会报错
    .src('./dist/', { read: false, allowEmpty: true })
    .pipe(clean());
})

// 打包 JS 任务
gulp.task('build', function () {
  return gulp
    .src('./src/*.js')               // 定位需要压缩的 JS 文件
    // .pipe(babel({                // ES6 转 ES5，看需求而定
    //   presets: ['@babel/env']
    // }))
    .pipe(uglify())                 // 文件压缩
    // .pipe(rename(function (path) {  // 文件重命名
    //   path.basename = 'index'
    //   path.extname = ".min.js"
    // }))
    .pipe(gulp.dest('./dist/'))     // 输出
})

// 发布文件移动
// gulp.task('move', function () {
//   return gulp
//     .src('./js/*')
//     .pipe(gulp.dest('./dist/'))
// })
gulp.task('move1', function () {
  return gulp
    .src('./src/package.json')
    .pipe(gulp.dest('./dist/'))
})
gulp.task('move2', function () {
  return gulp
    .src('./src/README.md')
    .pipe(gulp.dest('./dist/'))
})
gulp.task('move3', function () {
  return gulp
    .src('./src/config.json')
    .pipe(gulp.dest('./dist/'))
})

// 配置默认任务
// module.exports.default = gulp.series('clean', 'build')
gulp.task('default', gulp.series('clean', 'build', 'move1', 'move2', 'move3'))

