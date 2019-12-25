# unused-webpack-plugin

A Webpack plugin used to find unused source files


## Usage

1. Install dependency.

`npm install --save-dev @mokahr/unused-webpack-plugin`

2. Update webpack config file.

```js
const UnusedWebpackPlugin = require('@mokahr/unused-webpack-plugin');

// your webpack config
module.exports = {
  ...
  plugins: [
    ...
    new UnusedWebpackPlugin(), // use the 'unused' plugin ;-)
  ]
}
```

3. Restart your webpack server and a new file named `unused-files` will be created under the project working directory.

## Configuration

```js
new UnusedWebpackPlugin(options)
```

### [optional] options.cwd: string

Current working directory, default value is `./`

### [optional] options.patterns: string[]

Included glob pattern list, default value is `['**/*.js', '**/*.styl']`, which means only .js or .styl files will be checked.

Note: Usually not all the static assets are referenced in js files directly, such as some images or font files, therefore we do not recommend to use the pattern `*` directly, otherwise you may got some misleading results.

### [optional] options.ignores: string[]

Excluded glob pattern list, default value is `['node_modules/**']`

### [optional] options.output: string

The result file path, default value is `./unused-files`

## Tips

- Please do not use this plugin on production environment.
- After generating unused files, you can remove them by shell command `cat unused-files | while read LINE; do rm $LINE; done`.
