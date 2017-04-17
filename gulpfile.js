var path = require('path');
var del = require('del');
var gulp = require('gulp');
var less = require("gulp-less");
var runSequence = require('run-sequence');
var amdOptimize = require('gulp-amd-optimizer');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();


var requireConfig = {
    baseUrl: __dirname+"/js"
};
var options = {
    umd: false
};
// path 定义
var basedir = './'
var filepath = {
    'css': path.join(basedir, 'css/**/*.css'),
    'less': path.join(basedir, 'css/**/*.less'),
    'js': path.join(basedir, 'js/**/*.js'),
    'view': path.join(basedir,'template/**/*.html'),
    'tmp': path.join(basedir,'*.html')
}

gulp.task('js:build', function (cb) {
    gulp.src(['./js/**/*.js','!./js/components/**/*.js','!./js/main.js'])
        .pipe(amdOptimize(requireConfig, options))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./dist/js/'));
    gulp.src("./js/components/**")
        .pipe(gulp.dest('../webapp/mailboxMove/js/components')).on('end', cb);
});

gulp.task('js:main', function (cb) {
    gulp.src(['./dist/js/main.js','./js/main.js'])
        .pipe(concat("main2.js"))
        .pipe(rename("main.js"))
        .pipe(gulp.dest('../webapp/mailboxMove/js/')).on('end', cb);
});
gulp.task('js-clean',function(){
   return del("dist")
});
gulp.task('img',function(cb){
    gulp.src("img/**")
        .pipe(gulp.dest("../webapp/mailboxMove/img"));
    gulp.src("csvTemplate/**")
        .pipe(gulp.dest("../webapp/mailboxMove/csvTemplate")).on('end', cb);
});
gulp.task('less',function(cb){
  gulp.src("./css/common.less")
      .pipe(less())
      .pipe(gulp.dest("../webapp/mailboxMove/css")).on('end', cb);
});
gulp.task('html',function(cb){
    gulp.src("./template/**/*.html")
        .pipe(gulp.dest("../webapp/mailboxMove/template"));
    gulp.src(["index.html","openStep.html","openMove.html","orgSelect.html"])
        .pipe(gulp.dest("../webapp/mailboxMove/")).on('end', cb);
});

gulp.task('watch',function(){
    gulp.watch(['./css/*.less'],['watch:less'])
});
gulp.task('watch:less',function(){
    gulp.src("./css/common.less")
        .pipe(less())
        .pipe(gulp.dest("./css"));
})
gulp.task('node:server',['watch'], function () {
    nodemon({
        script: 'server.js',
        ignore: [ '.idea', 'node_modules'],
        env: {
            'NODE_ENV': 'development'
        }
    });
    browserSync.init({
        proxy: 'http://localhost:3000',
        open:true,
        files:["./template/**/*.html", "./img/**","./css/**/*.css","./js/**/*.js","./*.html"],
        browser: 'chrome',
        port: 3001
    });
});
gulp.task('build', function (callback) {
    runSequence(['js:build','img','less','html'],'js:main','js-clean',
        callback);
});
gulp.task('dev', ['node:server']);
gulp.task('default', ['build']);