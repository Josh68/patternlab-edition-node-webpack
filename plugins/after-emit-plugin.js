function AfterEmitPlugin(args) {
  const {patternlab, plConfig} = args;
  //this.chunkVersions = {}; //TODO - evaluate purpose of this empty object
  this.startTime = Date.now();
  this.prevTimestamps = {};
  this.plCore = patternlab;
  this.config = plConfig;
  this.transformedAssetTypes = this.config.transformedAssetTypes || [];
}

AfterEmitPlugin.prototype.apply = function (compiler) {
  compiler.plugin(
    'after-emit',
    function (compilation, callback) {
      var fileTypesToTest = this.transformedAssetTypes.join('|');
      const fileTestRegex = new RegExp(`.*\\.(${fileTypesToTest})$`);
      var changedFiles = Object.keys(compilation.fileTimestamps).filter(
        function (watchfile) {
          if (typeof this === "undefined" || !this.prevTimestamps) {
            return false;
          }
          return (
            (this.prevTimestamps[watchfile] || this.startTime) <
            (compilation.fileTimestamps[watchfile] || Infinity)
          );
        }.bind(this)
      );

      const changesArr = this.transformedAssetTypes.length > 0 ? changedFiles.filter(filePath => !fileTestRegex.test(filePath)) : changedFiles;

      const changedPatternFiles = changesArr.length > 0 || changedFiles.length === 0;

      console.log('changedFiles:');
      console.log(changedFiles);
      console.log(`changed pattern files: ${changedPatternFiles}`);

      this.prevTimestamps = compilation.fileTimestamps;

      if (!changedPatternFiles) {
        callback();
      } else {
        this.plCore.build(callback, this.config.cleanPublic);
      }
    }.bind(this)
  );
};

module.exports = AfterEmitPlugin;
