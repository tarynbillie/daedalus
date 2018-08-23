const gulp = require('gulp');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const shell = require('gulp-shell');
const electronConnect = require('electron-connect');
const log = require('fancy-log');
const { assoc } = require('ramda');

const mainWebpackConfig = require('./source/main/webpack.config');
const rendererWebpackConfig = require('./source/renderer/webpack.config');

const logWebpackOutput = done => (err, stats) => {
  if (err) {
    log.error(err);
  }

  if (stats) {
    log(
      stats.toString({
        colors: true,
      }),
    );
  }
  done(err, stats);
};

// Setup electron-connect server to start the app in development mode
let electronServer;
// Gulp input sources for main and renderer compilation
const mainSource = () => gulp.src('source/main/index.js');
const rendererSource = () => gulp.src('source/renderer/index.js');

// Gulp output destinations for main and renderer compilation
const mainDestination = () => gulp.dest('dist/main');
const rendererDestination = () => gulp.dest('dist/renderer');

const withWatchEnabled = assoc('watch', true);

/**
 * Creates an electron-connect server instance that enables
 * us to control our app (restarting / reloading)
 * @param env - electron app environment
 * @param args - additional spawn options
 */
const createElectronServer = (env, args = []) => {
  electronServer = electronConnect.server.create({
    stopOnClose: true,
    spawnOpt: {
      env: Object.assign({}, process.env, env),
      args,
    },
  });
};

const webpackBuild = (config, source, destination) => done =>
  source()
    .pipe(webpackStream(config, webpack, logWebpackOutput(done)))
    .pipe(destination());

const buildMain = webpackBuild(mainWebpackConfig, mainSource, mainDestination);
const buildMainWatch = webpackBuild(
  withWatchEnabled(mainWebpackConfig),
  mainSource,
  mainDestination,
);
const buildRenderer = webpackBuild(rendererWebpackConfig, rendererSource, rendererDestination);
const buildRendererWatch = webpackBuild(
  withWatchEnabled(rendererWebpackConfig),
  rendererSource,
  rendererDestination,
);

gulp.task('clear:cache', shell.task('rimraf ./node_modules/.cache'));

gulp.task('clean:dist', shell.task('rimraf ./dist'));

gulp.task('server:start', () => electronServer.start());

gulp.task('server:create:dev', () =>
  Promise.resolve(createElectronServer({ NODE_ENV: process.env.NODE_ENV || 'development' })),
);

gulp.task('server:create:debug', () =>
  Promise.resolve(
    createElectronServer({ NODE_ENV: 'development' }, ['--inspect', '--inspect-brk']),
  ),
);

gulp.task('build:main', buildMain);

gulp.task('build:main:watch', buildMainWatch);

gulp.task('build:renderer:html', () =>
  gulp.src('source/renderer/index.html').pipe(gulp.dest('dist/renderer/')),
);

gulp.task('build:renderer:assets', buildRenderer);

gulp.task('build:renderer', gulp.series('build:renderer:html', 'build:renderer:assets'));

gulp.task('build:renderer:watch', buildRendererWatch);

gulp.task('build', gulp.series('clean:dist', 'build:main', 'build:renderer'));

gulp.task(
  'build:watch',
  gulp.series(
    'clean:dist',
    'server:create:dev',
    'build:renderer:html',
    'build:main:watch',
    'build:renderer:watch',
  ),
);

gulp.task('cucumber', shell.task('npm run cucumber --'));

gulp.task('cucumber:watch', shell.task('nodemon --exec npm run cucumber:watch'));

gulp.task('test', gulp.series('build', 'cucumber'));

gulp.task('test:watch', gulp.series('build:watch', 'cucumber:watch'));

gulp.task('purge:translations', shell.task('rimraf ./translations/messages/source'));

gulp.task('electron:inspector', shell.task('npm run electron:inspector'));

gulp.task(
  'start',
  shell.task(`cross-env NODE_ENV=${process.env.NODE_ENV || 'production'} electron ./`),
);

gulp.task('dev', gulp.series('server:create:dev', 'build:watch', 'server:start'));

gulp.task(
  'debug',
  gulp.series('server:create:debug', 'build:watch', 'server:start', 'electron:inspector'),
);
