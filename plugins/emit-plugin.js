const globby = require("globby");
const { resolve } = require('path');

function EmitPlugin(args) {
  const { patternEngines, plConfig } = args;
  this.config = plConfig;
  this.patternEngines = patternEngines;
}

EmitPlugin.prototype.apply = function (compiler) {
  compiler.plugin(
    "emit",
    function (compilation, callback) {
      setupDependencies.call(this, compilation, callback);
    }.bind(this)
  );
};

function setupDependencies(compilation, callback) {
  // watch supported templates
  const supportedTemplateExtensions = this.patternEngines.getSupportedFileExtensions();
  const templateFilePaths = supportedTemplateExtensions.map(function (dotExtension) {
    return this.config.paths.source.patterns + '/**/*' + dotExtension;
  }, this);

  // additional watch files
  const watchFiles = [this.config.paths.source.patterns + "/**/*.json", this.config.paths.source.patterns + "**/*.md", this.config.paths.source.data + "**/*.json", this.config.paths.source.fonts + "**/*", this.config.paths.source.images + "**/*", this.config.paths.source.js + "**/*", this.config.paths.source.meta + "**/*", this.config.paths.source.annotations + "**/*"];

  const allWatchFiles = watchFiles.concat(templateFilePaths);

  allWatchFiles.forEach(function (globPath) {
    const patternFiles = globby.sync(globPath).map(function (filePath) {
      return resolve(filePath);
    });

    compilation.fileDependencies = compilation.fileDependencies.concat(patternFiles);
  }, this);

  callback && callback();
}

module.exports = EmitPlugin;