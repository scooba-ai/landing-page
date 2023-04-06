const { src, dest, parallel, series, watch } = require('gulp');
// Gulp Sass
const sass = require('gulp-sass')(require('sass'));
const fileinclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');

const minify = require('gulp-minifier');

const run = require('gulp-run-command').default;

// VARIABLES
const configs = {
    nodeRoot: './',
    vendorRoot: 'src'
};

//////////////////////////////////////

// COMPILE - HTML FILES
function htmls(cb) {
    src(['html/**', '!html/assets/**', '!html/from/**', '!html/images/**'])
    .pipe(dest('dist'));
    cb();
}

// COMPILE - SCSS STYLE
function stylecss(cb) {
    src([`src/scss/*.scss`])
        // .pipe(sourcemaps.init())                 // If you want generate source map.
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))    // If you want non-minify css then remove {outputStyle: 'compressed'} in sass()
        // .pipe(sourcemaps.write('./'))            // If you want generate source map.
        .pipe(dest(`dist/assets/css`))

    cb();
}

// COMPILE - JAVASCRIPTS
function jsvendor(cb) {

    src([`src/js/**`, `!src/js/bundle.js`, `!src/js/vendors/**`])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@root',
            context: {
                vendorRoot: configs.vendorRoot,
                build: 'dist',
                nodeRoot: configs.nodeRoot
            }
        }))
        .pipe(minify({ minify: true, minifyJS: { sourceMap: false } }))
        .pipe(dest(`dist/assets/js`));

    src([`src/js/bundle.js`])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@root',
            context: {
                vendorRoot: configs.vendorRoot,
                build: 'dist',
                nodeRoot: configs.nodeRoot
            }
        }))
        .pipe(minify({ minify: true, minifyJS: { sourceMap: false } }))
        .pipe(dest(`dist/assets/js`));

    cb();
}

// COPYING - ASSETS & IMAGES
function assets(cb) {
    src(`src/assets/fonts/**`).pipe(dest(`dist/assets/fonts`));
    src(`src/assets/images/**`).pipe(dest(`dist/assets/images`));
    src(`html/images/**`).pipe(dest(`dist/images`));
    src(`html/form/**`).pipe(dest(`dist/form`));
    cb();
}

// EXPORTS COMMAND FOR COMPILE
//////////////////////////////////////

exports.build = series(htmls, jsvendor, stylecss, assets);

exports.develop = function () {
    watch([`html/*.html`]).on('change', series(htmls))
    watch([`src/js/**`]).on('change', series(jsvendor))
    watch([`src/scss/**`], { ignoreInitial: false }, series(stylecss))
    watch([`src/assets/**`, `html/images/**`, `html/form/**`]).on('change', series(assets))
}

exports.watch = run(['gulp build', 'gulp develop']);
