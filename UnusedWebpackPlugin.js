"use strict";
var fs = require("fs");
var glob = require("glob");
var UnusedWebpackPlugin = (function () {
    function UnusedWebpackPlugin(options) {
        this.options = options || {};
        this.options.cwd = this.options.cwd || './';
        this.options.patterns = this.options.patterns || ['**/*.js', '**/*.styl'];
        this.options.ignores = (this.options.ignores || []).concat('node_modules/**');
        this.options.output = this.options.output || './unused-files';
        this.apply = this.apply.bind(this);
    }
    UnusedWebpackPlugin.prototype.apply = function (compiler) {
        var _this = this;
        compiler.plugin('after-compile', function (compilation, callback) {
            var localDependencies = new Set();
            compilation.fileDependencies.forEach(function (dependency) {
                if (!/node_modules/.test(dependency)) {
                    localDependencies.add(dependency);
                }
            });
            Promise.all(_this.options.patterns.map(function (pattern) {
                return new Promise(function (resolve, reject) {
                    glob(pattern, { cwd: _this.options.cwd, ignore: _this.options.ignores, absolute: true }, function (err, files) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(files);
                        }
                    });
                });
            }))
                .then(function (matches) {
                var unusedFiles = [];
                for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
                    var files = matches_1[_i];
                    for (var _a = 0, files_1 = files; _a < files_1.length; _a++) {
                        var file = files_1[_a];
                        if (!localDependencies.has(file)) {
                            unusedFiles.push(file);
                        }
                    }
                }
                return new Promise(function (resolve, reject) {
                    fs.writeFile(_this.options.output, unusedFiles.join('\n'), function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            })
                .then(function () {
                callback();
            })["catch"](function (err) {
                callback(err);
            });
        });
    };
    return UnusedWebpackPlugin;
}());
module.exports = UnusedWebpackPlugin;
