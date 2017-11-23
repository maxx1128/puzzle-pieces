/******************************************************
 * PATTERN LAB NODE
 * EDITION-NODE-GULP
 * The gulp wrapper around patternlab-node core, providing tasks to interact with the core library and move supporting frontend assets.
******************************************************/
var
  gulp         = require('gulp'),
  path         = require('path'),
  browserSync  = require('browser-sync').create(),
  argv         = require('minimist')(process.argv.slice(2)),
  chalk        = require('chalk')
  
  plumber      = require('gulp-plumber'),
  ghPages      = require('gulp-gh-pages'),
  autoprefixer = require('gulp-autoprefixer'),
  include      = require('gulp-include'),
  notify       = require('gulp-notify'),
  rename       = require('gulp-rename'),
  sass         = require('gulp-sass'),
  sourcemaps   = require('gulp-sourcemaps'),

  fs           = require('fs'),
  del          = require('del'),
  babelify     = require('babelify'),
  browserSync  = require('browser-sync'),
  runSequence  = require('run-sequence'),
  browserify   = require('browserify'),
  source       = require('vinyl-source-stream'),
  buffer       = require('vinyl-buffer'),
  glob         = require('glob'),
  es           = require('event-stream');

/**
 * Normalize all paths to be plain, paths with no leading './',
 * relative to the process root, and with backslashes converted to
 * forward slashes. Should work regardless of how the path was
 * written. Accepts any number of parameters, and passes them along to
 * path.resolve().
 *
 * This is intended to avoid all known limitations of gulp.watch().
 *
 * @param {...string} pathFragment - A directory, filename, or glob.
*/

function normalizePath() {
  return path
    .relative(
      process.cwd(),
      path.resolve.apply(this, arguments)
    )
    .replace(/\\/g, "/");
}

// Function for plumber to handle errors
function customPlumber(errTitle) {
    return plumber({
        errorHandler: notify.onError({
            // Custom error titles go here
            title: errTitle || 'Error running Gulp',
            message: "<%= error.message %>",
            sound: 'Submarine',
        })
    });
}

/******************************************************
 * COPY TASKS - stream assets from source to destination
******************************************************/
// JS copy
gulp.task('pl-copy:js', function () {
  return gulp.src('main-**.js', {cwd: normalizePath(paths().source.js)} )
    .pipe(gulp.dest(normalizePath(paths().public.js)));
});

// Images copy
gulp.task('pl-copy:img', function () {
  return gulp.src('**/*.*',{cwd: normalizePath(paths().source.images)} )
    .pipe(gulp.dest(normalizePath(paths().public.images)));
});

// Favicon copy
gulp.task('pl-copy:favicon', function () {
  return gulp.src('favicon.ico', {cwd: normalizePath(paths().source.root)} )
    .pipe(gulp.dest(normalizePath(paths().public.root)));
});

// Fonts copy
gulp.task('pl-copy:font', function () {
  return gulp.src('*', {cwd: normalizePath(paths().source.fonts)})
    .pipe(gulp.dest(normalizePath(paths().public.fonts)));
});

// CSS Copy
gulp.task('pl-copy:css', function () {
  return gulp.src(normalizePath(paths().source.css) + '/*.css')
    .pipe(gulp.dest(normalizePath(paths().public.css)))
    .pipe(browserSync.stream());
});

// Styleguide Copy everything but css
gulp.task('pl-copy:styleguide', function () {
  return gulp.src(normalizePath(paths().source.styleguide) + '/**/!(*.css)')
    .pipe(gulp.dest(normalizePath(paths().public.root)))
    .pipe(browserSync.stream());
});

// Styleguide Copy and flatten css
gulp.task('pl-copy:styleguide-css', function () {
  return gulp.src(normalizePath(paths().source.styleguide) + '/**/*.css')
    .pipe(gulp.dest(function (file) {
      //flatten anything inside the styleguide into a single output dir per http://stackoverflow.com/a/34317320/1790362
      file.path = path.join(file.base, path.basename(file.path));
      return normalizePath(path.join(paths().public.styleguide, '/css'));
    }))
    .pipe(browserSync.stream());
});

/******************************************************
 * PATTERN LAB CONFIGURATION - API with core library
******************************************************/
//read all paths from our namespaced config file
var config = require('./patternlab-config.json'),
  patternlab = require('patternlab-node')(config);

function paths() {
  return config.paths;
}

function getConfiguredCleanOption() {
  return config.cleanPublic;
}

/**
 * Performs the actual build step. Accomodates both async and sync
 * versions of Pattern Lab.
 * @param {function} done - Gulp done callback
 */
function build(done) {
  const buildResult = patternlab.build(() => {}, getConfiguredCleanOption());

  // handle async version of Pattern Lab
  if (buildResult instanceof Promise) {
    return buildResult.then(done);
  }

  // handle sync version of Pattern Lab
  done();
  return null;
}

gulp.task('pl-assets', gulp.series(
  'pl-copy:js',
  'pl-copy:img',
  'pl-copy:favicon',
  'pl-copy:font',
  'pl-copy:css',
  'pl-copy:styleguide',
  'pl-copy:styleguide-css'
));

gulp.task('patternlab:version', function (done) {
  patternlab.version();
  done();
});

gulp.task('patternlab:help', function (done) {
  patternlab.help();
  done();
});

gulp.task('patternlab:patternsonly', function (done) {
  patternlab.patternsonly(done, getConfiguredCleanOption());
});

gulp.task('patternlab:liststarterkits', function (done) {
  patternlab.liststarterkits();
  done();
});

gulp.task('patternlab:loadstarterkit', function (done) {
  patternlab.loadstarterkit(argv.kit, argv.clean);
  done();
});

gulp.task('patternlab:build', gulp.series('pl-assets', build));

gulp.task('patternlab:installplugin', function (done) {
  patternlab.installplugin(argv.plugin);
  done();
});

/******************************************************
 * SERVER AND WATCH TASKS
******************************************************/
// watch task utility functions
function getSupportedTemplateExtensions() {
  var engines = require('./node_modules/patternlab-node/core/lib/pattern_engines');
  return engines.getSupportedFileExtensions();
}
function getTemplateWatches() {
  return getSupportedTemplateExtensions().map(function (dotExtension) {
    return normalizePath(paths().source.patterns, '**', '*' + dotExtension);
  });
}

/**
 * Reloads BrowserSync.
 * Note: Exits more reliably when used with a done callback.
 */
function reload(done) {
  browserSync.reload();
  done();
}

/**
 * Reloads BrowserSync, with CSS injection.
 * Note: Exits more reliably when used with a done callback.
 */
function reloadCSS(done) {
  browserSync.reload('*.css');
  done();
}

function watch() {
  const watchers = [
    {
      name: 'CSS',
      paths: [normalizePath(paths().source.css, '**', '*.css')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('pl-copy:css', reloadCSS)
    },
    {
      name: 'Styleguide Files',
      paths: [normalizePath(paths().source.styleguide, '**', '*')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('pl-copy:styleguide', 'pl-copy:styleguide-css', reloadCSS)
    },
    {
      name: 'Sass Files',
      paths: [normalizePath(paths().source.sass, '**/**/*.scss')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('sass', 'pl-sass', 'pl-copy:css', reloadCSS)
    },
    {
      name: 'JS Files',
      paths: [normalizePath(paths().source.js_pre, '**/**/**/*.js')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('browserify', 'pl-copy:js', reload)
    },
    {
      name: 'Source Files',
      paths: [
        normalizePath(paths().source.patterns, '**', '*.json'),
        normalizePath(paths().source.patterns, '**', '*.md'),
        normalizePath(paths().source.data, '**', '*.json'),
        normalizePath(paths().source.fonts, '**', '*'),
        normalizePath(paths().source.images, '**', '*'),
        normalizePath(paths().source.js, '**', '*'),
        normalizePath(paths().source.meta, '**', '*'),
        normalizePath(paths().source.annotations, '**', '*')
      ].concat(getTemplateWatches()),
      config: { awaitWriteFinish: true },
      tasks: gulp.series(build, reload)
    }
  ];

  watchers.forEach(watcher => {
    console.log('\n' + chalk.bold('Watching ' + watcher.name + ':'));
    watcher.paths.forEach(p => console.log('  ' + p));
    gulp.watch(watcher.paths, watcher.config, watcher.tasks);
  });
  console.log();
}

gulp.task('patternlab:connect', gulp.series(function (done) {
  browserSync.init({
    server: {
      baseDir: normalizePath(paths().public.root)
    },
    snippetOptions: {
      // Ignore all HTML files within the templates folder
      blacklist: ['/index.html', '/', '/?*']
    },
    notify: {
      styles: [
        'display: none',
        'padding: 15px',
        'font-family: sans-serif',
        'position: fixed',
        'font-size: 1em',
        'z-index: 9999',
        'bottom: 0px',
        'right: 0px',
        'border-top-left-radius: 5px',
        'background-color: #1B2032',
        'opacity: 0.4',
        'margin: 0',
        'color: white',
        'text-align: center'
      ]
    }
  }, function () {
    done();
  });
}));

/******************************************************
 * CUSTOM TASKS
******************************************************/


// Converts the Sass partials into a single CSS file
gulp.task('sass', function () {
    
    var sassOptions = { 
        outputStyle: 'expanded',
    };

    var autoprefixerOptions = {
      browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
    };

  return gulp
    .src('source/_sass/main.scss')
    .pipe(customPlumber('Error running Sass'))
    .pipe(sourcemaps.init())
    // Write Sass for either dev or prod
    .pipe(sass(sassOptions))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write())
    .pipe(rename("style.css"))
    // Sends the Sass file to either the app or dist folder
    .pipe(gulp.dest('source/css'))
    .pipe(notify({ message: 'Sass Processed!', onLast: true }))
    .pipe(browserSync.stream());
});

gulp.task('pl-sass', function () {
    
    var sassOptions = { 
        outputStyle: 'expanded',
    };

    var autoprefixerOptions = {
      browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
    };

  return gulp
    .src('source/_sass/pattern-scaffolding.scss')
    .pipe(customPlumber('Error running Sass'))
    .pipe(sourcemaps.init())
    // Write Sass for either dev or prod
    .pipe(sass(sassOptions))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write())
    .pipe(rename("pattern-scaffolding.css"))
    // Sends the Sass file to either the app or dist folder
    .pipe(gulp.dest('source/css'))
    .pipe(notify({ message: 'PL Sass Processed!', onLast: true }))
    .pipe(browserSync.stream());
});

gulp.task('browserify', function(done) {
  glob('source/_js/main-**.js', function(err, files) {
    if(err) done(err);

    var tasks = files.map(function(entry) {
      return browserify({
          entries: [entry],
          outputStyle: 'compressed'
        })
        .transform("babelify", {presets: ["es2015"]})
        .bundle()
        .pipe(source(entry))
        .pipe(gulp.dest('source/js'))
        .pipe(browserSync.stream());
      });
    es.merge(tasks).on('end', done);
  })
});


gulp.task('pages', function() {
  return gulp.src('public/**/**/**/*')
    .pipe(ghPages({
      force: true,
      remoteUrl: "https://github.com/maxx1128/puzzle-pieces.git",
      cacheDir: 'public/**/**/**/*'
    }));
});


/******************************************************
 * COMPOUND TASKS
******************************************************/
gulp.task('default', gulp.series('patternlab:build'));
// gulp.task('deploy', gulp.series('patternlab:build', 'pages'));
gulp.task('patternlab:watch', gulp.series('patternlab:build', watch));
gulp.task('patternlab:serve', gulp.series('sass', 'pl-sass', 'browserify', 'patternlab:build', 'patternlab:connect', watch));
