/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * gulpfile.js
 *
 */

const moduleName = 'cartcheckitout';
const JSpath = '../js/aligent/cartcheckitout';
const CSSpath = '../skin/frontend/base/default/css/aligent/cartcheckitout';

const gulp        = require ('gulp');
const babelify    = require ('babelify');
const browserify  = require ('browserify');
const connect     = require ('gulp-connect');
const notify      = require ("gulp-notify");
const sass        = require ('gulp-sass');
const source      = require ('vinyl-source-stream');
const buffer      = require ('vinyl-buffer');
const sourcemaps  = require ('gulp-sourcemaps');
const rename      = require ('gulp-rename');
const uglify      = require ('gulp-uglify');
const uglifycss   = require ('gulp-uglifycss');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('default',['init']);

gulp.task('init', ['js', 'css'], function() {
  gulp.watch('./**/*.js', ['js']);
  gulp.watch('./**/*.scss', ['css']);
});

gulp.task('js', function(){
  return browserify({
    debug: true,
    entries: ['./js/Main.js']
  })
    .transform(babelify.configure({
      presets: ['es2015'],
      sourceMapsAbsolute: true,
    }))
    .bundle()
    .on("error", notify.onError(function (error) {
      return "Error: " + error.message;
    }))
    .pipe(source(`${moduleName}.js`))
    .pipe(buffer())
    .pipe(gulp.dest(JSpath))
});

gulp.task('css', () => gulp.src('scss/*.scss')
  .pipe(sass({source: 'styles.css'}))
  .on("error", notify.onError(function (error) {
    return "Error: " + error.message;
  }))
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(rename(`${moduleName}.css`))
  .pipe(gulp.dest(CSSpath))
);






// const livereload  = require('gulp-livereload');
// gulp.task('livereload', function() {
//   livereload.changed()
// });

// livereload.listen();
// gulp.watch('**/*.js', ['js', 'js_min', 'livereload']);
// gulp.watch('**/*.scss', ['css', 'css_min', 'livereload']);

//const VagrantCSS = '/vagrant/swg-magento/skin/frontend/base/default/css/aligent/cartcheckitout';
//.pipe(gulp.dest(VagrantCSS))
// // Pre-process Sass into minified CSS3 & with sourcemap
// gulp.task('css_min', () => gulp.src('scss/*.scss')
//   .pipe(sourcemaps.init())
//   .pipe(sass({source: 'styles.css'}))
//   .on("error", notify.onError(function (error) {
//     return "Error: " + error.message;
//   }))
//   .pipe(rename(`${moduleName}.min.css`))
//   .pipe(sourcemaps.write('.'))
//   .pipe(uglifycss({
//     "maxLineLen": 80,
//     "uglyComments": true
//   }))
//   .pipe(gulp.dest(CSSpath))
//   .pipe(gulp.dest(VagrantCSS))
// );
// // Minify JavaScript & create sourcemap
// gulp.task('js_min', function(){
//   return browserify({
//     debug: true,
//     entries: ['./js/Main.js']
//   })
//     .transform(babelify.configure({
//       presets: ['es2015'],
//       sourceMapsAbsolute: true,
//     }))
//     .bundle()
//     .on("error", notify.onError(function (error) {
//       return "Error: " + error.message;
//     }))
//     .pipe(source(`${moduleName}.min.js`))
//     .pipe(buffer())
//     .pipe(sourcemaps.init({loadMaps: true}))
//     .pipe(uglify())
//     .pipe(sourcemaps.write('./'))
//     .pipe(gulp.dest(JSpath))
// });