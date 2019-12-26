import * as fs from 'fs';
import glob = require('glob');

interface Options {
  /**
   * Current working directory
   * @defaultValue ./
   */
  cwd: string;
  /**
   * Included patterns
   * @defaultValue ['**\/*.js', '**\/*.styl']
   */
  patterns: string[];
  /**
   * Excluded patterns
   * @defaultValue ['node_modules/**']
   */
  ignores: string[];
  /**
   * The output unused files list path
   * @defaultValue ./unused-files
   */
  output: string;
}

class UnusedWebpackPlugin {
  options: Options;
  constructor(options: Options) {
    this.options = options || { cwd: '', patterns: [], ignores: [], output: '' };
    this.options.cwd = this.options.cwd || './';
    this.options.patterns = this.options.patterns || ['**/*.js', '**/*.styl'];
    this.options.ignores = (this.options.ignores || []).concat('node_modules/**');
    this.options.output = this.options.output || './unused-files';

    this.apply = this.apply.bind(this);
  }

  apply(compiler: any) {
    compiler.plugin('after-compile', (compilation: any, callback: any) => {
      const localDependencies = new Set();
      for (const dependency of compilation.fileDependencies) {
        if (!/node_modules/.test(dependency)) {
          localDependencies.add(dependency);
        }
      }

      Promise.all(this.options.patterns.map((pattern) => {
        return new Promise((resolve, reject) => {
          glob(pattern, { cwd: this.options.cwd, ignore: this.options.ignores, absolute: true }, (err: Error, files: string[]) => {
            if (err) {
              reject(err);
            } else {
              resolve(files);
            }
          });
        });
      }))
      .then((matches: string[][]) => {
        const unusedFiles: string[] = [];
        for (let files of matches) {
          for (let file of files) {
            if (!localDependencies.has(file)) {
              unusedFiles.push(file);
            }
          }
        }
        return new Promise((resolve, reject) => {
          fs.writeFile(this.options.output, unusedFiles.join('\n'), (err: Error) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      })
      .then(() => {
        callback();
      })
      .catch((err) => {
        callback(err);
      });
    });
  }
}

export = UnusedWebpackPlugin;
