// NOTE: named arguments passed to npm scripts must be prefixed with '--'
//       e.g. npm run loadstarterkit -- --kit=some-kit-name --clean
const plConfig = require('./patternlab-config.json');
const patternlab = require('@pattern-lab/core')(plConfig);

function getConfiguredCleanOption() {
  return plConfig.cleanPublic;
}

function build(done) {
  done = done || function(){};
  // Copied from core, for reference
  /**
   * Builds patterns, copies assets, and constructs user interface
   * 
   * @param {object} options an object used to control build behavior
   * @param {bool} options.cleanPublic whether or not to delete the configured output location (usually `public/`) before build
   * @param {object} options.data additional data to be merged with global data prior to build
   * @param {bool} options.watch whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild
   * @returns {Promise} a promise fulfilled when build is complete
  */
  const buildResult = patternlab.build({cleanPublic: getConfiguredCleanOption()});

  // handle async version of Pattern Lab
  if (buildResult instanceof Promise) {
    return buildResult.then(done);
  }
  // this should never happen with v3
  return null;
}

function buildFrontend(done) {
  //see build for reference
  done = done || function () { }; //fallback void
  const buildFrontEndResult = patternlab.buildFrontend({ cleanPublic: getConfiguredCleanOption() });
  if (buildFrontEndResult instanceof Promise) {
    return buildFrontEndResult.then(done);
  }
  // this should never happen with v3
  return null;
}

function version() {
  patternlab.version();
}

function help(){
  patternlab.help();
}

function patternsonly() {
  patternlab.patternsonly(plConfig) //TODO - gotta figure out the promise way to do this correctly
  //never returned anything, so this might be just fine
    .then(console.log('pattern only build complete'))
    .catch(e => console.log('pattern only build failed'));
}

function liststarterkits() {
  patternlab.liststarterkits()
}

function loadstarterkit(kit, clean) {
  
  if(!clean) {
    clean = false;
  }
  patternlab.loadstarterkit(kit, clean);
}

function installplugin(plugin) {
  patternlab.installplugin(plugin);
}

function serve() {
  patternlab.server.serve({
    cleanPublic: getConfiguredCleanOption()
  });
}

for (var i=0; i < process.argv.length; i++) {
  
  switch (process.argv[i]) {
    case 'serve':
      serve();
      break;
    case 'build':
      build();
      break;
    case: 'buildFrontend':
      buildFrontend();
      break;
    case 'version':
      version();
      break;
    case 'help':
      help();
      break;
    case 'patternsonly':
      patternsonly();
      break;
    case 'liststarterkits':
      liststarterkits();
      break;
    case 'loadstarterkit':
      if(process.env.npm_config_kit) {
        loadstarterkit(process.env.npm_config_kit, process.env.npm_config_clean);
      } else {
        console.info("====[ Pattern Lab Error: No Valid Kit Found ]====");
      }
      break;
    case 'installplugin':
      if(process.env.npm_config_plugin) {
        installplugin(process.env.npm_config_plugin);
      } else {
        console.info("====[ Pattern Lab Error: No Valid Plugin Found ]====");
      }
    break;
  }
}