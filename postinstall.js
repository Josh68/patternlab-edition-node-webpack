"use strict";
var path = require('path');
var fs = require('fs-extra');

/* Updating for v3 */

var sm = require('@pattern-lab/patternlab-node/core/lib/starterkit_manager');
var pm = require('@pattern-lab/patternlab-node/core/lib/plugin_manager');
var log = require('@pattern-lab/patternlab-node/core/lib/log');

// get the config
var configPath = path.resolve(process.cwd(), 'patternlab-config.json');
fs.readJson(path.resolve(configPath))
  .then(config => postInstallInit)
  .then(postInstallComplete)
  .catch(postInstallError);

function postInstallInit(config) {
  log.log('Beginning Pattern Lab postinstall...');
  return Promise.all(loadStarterKits, loadPlugins);
  // var kitLoader = loadStarterKits(config);
  // var pluginLoader = loadPlugins(config);
}

function loadStarterKits(config) {
  var starterkit_manager = new sm(config);
  var foundStarterkits = starterkit_manager.detect_starterkits();
  try {
    if (foundStarterkits && foundStarterkits.length > 0) {
      //kit names from config, second param is bool to clean kit first
      starterkit_manager.load_starterkit(foundStarterkits[0], true);
    } else {
      console.log('No starterkits found to automatically load.');
    }
    return Promise.resolve(true);
  } catch(e) {
    return Promise.reject(e);
  }
}

function loadPlugins() {
  //determine if any plugins are already installed
  var plugin_manager = new pm(config, configPath);
  var foundPlugins = plugin_manager.detect_plugins();
  try {
    if (foundPlugins && foundPlugins.length > 0) {
      for (var i = 0; i < foundPlugins.length; i++) {
        console.log('Found plugin', foundPlugins[i]);
        plugin_manager.install_plugin(foundPlugins[i]);
      }
    }
    return Promise.resolve(true); 
  } catch(e) {
    return Promise.reject(e);
  }
}

function postInstallError(err) {
  log.warning('An error occurred during Pattern Lab Node postinstall.');
  log.warning('Pattern Lab postinstall completed with errors.');
}

function postInstallComplete() {
  log.debug('Pattern Lab postinstall complete.');
}
