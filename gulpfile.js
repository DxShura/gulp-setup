const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulpSequence = require('gulp-sequence');
const rev = require('gulp-rev');
const revDel = require('gulp-rev-delete-original');
const revRewrite = require('gulp-rev-rewrite')
const srcDir = './src';
const distDir = './dist';



gulp.task('copy_assets', ()=>{
    return gulp.src(`${srcDir}/assets/**/*`)
        .pipe(gulp.dest(`${distDir}/assets`))
});
gulp.task('copy_html', ()=>{
    return gulp.src(`${srcDir}/html/**/*.html`)
        .pipe(htmlmin({collapseWhitespace:false, removeComments: true }))
        .pipe(gulp.dest(distDir))
});
gulp.task('copy_sass', ()=>{
    return gulp.src(`${srcDir}/sass/**/*.scss`)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest(`${distDir}/css`))
});
gulp.task('copy_js', ()=>{
    return gulp.src(`${srcDir}/js/**/*.js`)
        .pipe(concat('final.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest(`${distDir}/js`))
});
gulp.task('serve', ['copy_sass', 'copy_js'], ()=>{
    browserSync.init({server : './dist'});
});

gulp.task('bs-reload', ()=>browserSync.reload());

gulp.task('watch', ()=>{
    gulp.watch(`${srcDir}/html/**/*.html`, ['copy_html', 'bs-reload']);
    gulp.watch(`${srcDir}/sass/**/*.scss`, ['copy_sass', 'bs-reload']);
    gulp.watch(`${srcDir}/js/**/*.js`, ['copy_js', 'bs-reload']);
    gulp.watch(`${srcDir}/assets/**/*`, ['copy_assests', 'bs-reload']);
});
gulp.task('clean', ()=>del(['dist']));
gulp.task('rev', ()=>{
    return gulp.src([`${distDir}/css/**/*.css`,`${distDir}/js/**/*.js`],{base:distDir})
    .pipe(rev())
    .pipe(revDel())
    .pipe(gulp.dest(distDir))
    .pipe(rev.manifest())
    .pipe(gulp.dest(distDir))
});
gulp.task('burstcache',['rev'], ()=>{
    const manifest = gulp.src(`${distDir}/rev-manifest.json`);
    return gulp.src(`${distDir}/*.html`)
    .pipe(revRewrite({manifest}))
    .pipe(gulp.dest(`${distDir}`))
});
gulp.task('default',gulpSequence('clean',['copy_assets','copy_html','copy_sass', 'copy_js','serve', 'watch']));
gulp.task('prod',gulpSequence('clean',['copy_assets','copy_html','copy_sass', 'copy_js','serve', 'watch'],'burstcache'));