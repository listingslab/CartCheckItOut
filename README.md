# Aligent CartCheckItOut

### Extension key: Aligent_CartCheckItOut

One page combined Cart and Checkout page Magento Extension.
This extension provides one page checkout process based on [Ecomdev's](https://github.com/EcomDev/checkitout) excellent CheckItOut. It uses [Gulp](http://gulpjs.com/) and [Babel](https://babeljs.io) as simply as possible to transpile the source code into browser-ready JavaScript and CSS.

### Add tasks to your gulpfile

The cartcheckitout app requires following local dev  dependencies, so please add these dev dependencies to the ```./package.json``` file. If your dependencies already include any of the ones below, you don't need to include them again. Just delete them from the list. Update dependency tree by running an ```npm install```.

```javascript
  "devDependencies": {
    "babel-preset-es2015": "^6.24.1",
    "babelify": "^7.3.0",
    "browserify": "^14.3.0",
    "gulp": "^3.9.1",
    "gulp-connect": "^5.0.0",
    "gulp-livereload": "^2.1.1",
    "gulp-notify": "^3.0.0",
    "gulp-rename": "^1.2.2",
    "gulp-run": "^1.7.1",
    "gulp-sass": "^3.1.0",
    "gulp-sourcemaps": "^2.6.0",
    "gulp-uglify": "^2.1.2",
    "gulp-uglifycss": "^1.0.8",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^1.1.0"
  },
```

Next, add the following constants to the top of your gulp file. This is a part to pay attention to. Basically - you can't redelcare stuff, so you don't need to include 'gulp' because it will have already been included in your existing gulpfile. Make sure you have all these as well as your existing ones.

```javascript
var babelify    = require ('babelify');
var browserify  = require ('browserify');
var connect     = require ('gulp-connect');
var notify      = require ('gulp-notify');
var sass        = require ('gulp-sass');
var source      = require ('vinyl-source-stream');
var buffer      = require ('vinyl-buffer');
var sourcemaps  = require ('gulp-sourcemaps');
var rename      = require ('gulp-rename');
var uglifycss   = require ('gulp-uglifycss');
```

Next you need to adjust the variables which tell the build process where to place files and add the tasks that the application needs to perform to create a new build of the JavaScript & CSS. Simply copy and paste this full snippet into your gulpfile.

```javascript
//////////////////////////
// START CartCheckItOut //
//////////////////////////
var ccio_moduleName = 'cartcheckitout';
var ccio_modulePath = './vendor/aligent/cartcheckitout/';
var ccio_moduleSrc = './vendor/aligent/cartcheckitout/src/';
var ccio_JSpath = ccio_modulePath + 'js/aligent/cartcheckitout';
var ccio_CSSpath = ccio_modulePath + 'skin/frontend/base/default/css/aligent/cartcheckitout';
gulp.task('ccio_init', ['ccio_js', 'ccio_css'], function() {
  // Add the following into your watch task if you plan to develop
  // gulp.watch(ccio_moduleSrc + '**/*.js', ['ccio_js']);
  // gulp.watch(ccio_moduleSrc + '**/*.scss', ['ccio_css']);
});
gulp.task('ccio_js', function(){
  return browserify({
    debug: true,
    entries: [ccio_moduleSrc + 'js/Main.js']
  })
    .transform(babelify.configure({
      presets: ['es2015'],
      sourceMapsAbsolute: true,
    }))
    .bundle()
    .on("error", notify.onError(function (error) {
      return "Error: " + error.message;
    }))
    .pipe(source(`${ccio_moduleName}.js`))
    .pipe(buffer())
    .pipe(gulp.dest(ccio_JSpath))
});
gulp.task('ccio_css', () => gulp.src(ccio_moduleSrc + 'scss/*.scss')
  .pipe(sass({
    source: 'styles.css'
  }))
  .on("error", notify.onError(function (error) {
    return "Error: " + error.message;
  }))
  .pipe(rename(`${ccio_moduleName}.css`))
  .pipe(gulp.dest(ccio_CSSpath))
);
////////////////////////
// END CartCheckItOut //
////////////////////////
```

Gulp processes watches for any changes in the /src/js or /src/scss folders and re-transpiles the JS and Sass into modern browser compliant, minimised code. and inserts it into the correct places in Magento.

Because we are not committing the compiled JS & CSS to git you will have to run the build process yourself at least once to generate these files.

It should be possible to daisy-chain gulp tasks to achieve the workflow you need, but in the meantime, here is a quick way to fire up gulp locally to get you developing.

- navigate into the source folder (./src)
- ```npm install```
- ```gulp```

### Features

- Example ES6 application you can extend
- Holy grail 3 column flexbox layout
- Easy integration with any magento project via composer
- Simple Sass file structure ready to use

### Developers

- Chris Dorward <chris.dorward@aligent.com.au>
- Michael Wylde <michael@aligent.com.au>

### (c) 2017 Aligent Consulting [OSL - Open Software Licence 3.0](http://opensource.org/licenses/osl-3.0.php)
