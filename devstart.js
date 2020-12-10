const path = require('path');
const fs = require('fs');
const nodemon = require('nodemon');
// const browserify = require('browserify');
// const watchify = require('watchify');

//const SRCDIR = path.normalize(`${__dirname}/src`);
const SERVERSTART = path.normalize(`${__dirname}/lib/www`);
const SERVERSETUP = path.normalize(`${__dirname}/app.js`);
const PUBLICDIR = path.normalize(`${__dirname}/public`);
const CONTROLLERDIR = path.normalize(`${__dirname}/controllers`);
const VIEWDIR = path.normalize(`${__dirname}/views`);
const DBDIR = path.normalize(`${__dirname}/models`);
const ROUTERDIR = path.normalize(`${__dirname}/routes`);
const SERVICEDIR = path.normalize(`${__dirname}/services`);

nodemon({
    script: SERVERSTART,
    watch: [
      SERVERSETUP,
      PUBLICDIR,
      ROUTERDIR,
      CONTROLLERDIR,
      DBDIR,
      VIEWDIR,
      SERVICEDIR
    ],
    ext: 'js,json,html,css'
  });

// let b = browserify({
//   cache: {},
//   packageCache: {},
//   plugin: [watchify],
//   entries: [
//     `${SRCDIR}/index.js`
//   ]
// })

// let bundle = function() {
//   b.bundle()  
//     .on('error', function(err) {
//       console.error(`BROWSERIFY ERROR: ${err.message}`);
//       console.error(err.stack);
//       this.emit('end');
//     })
//     .pipe(fs.createWriteStream(`${BUILDDIR}/bundle.js`))
// };

// b.on('update', bundle);
// b.on('log', console.log);
// bundle();

nodemon
  .on('start', function() {
    console.log('Nodemon started');
  })
  .on('quit', function() {
    console.log('Nodemon stopped');
    process.exit(0);
  })
  .on('restart', function(files) {
    console.log('Nodemon restarted');
  });