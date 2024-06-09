const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssMergeRules = require('postcss-merge-rules');

const inputDir = './src';
const outputDir = './dist';

const files = [
  { input: 'index.css', output: 'jolty-ui.css' },
  { input: 'base.css', output: 'jolty-ui-base.css' },
  { input: 'reset.css', output: 'jolty-ui-reset.css' }
];

const processCSS = async (inputFile, outputFileUnminified, outputFileMinified) => {
  const css = fs.readFileSync(path.join(inputDir, inputFile), 'utf8');

  // Define the PostCSS processor with necessary plugins
  const processor = postcss([
    postcssImport(),
    postcssNested(),
    postcssMergeRules(),
  ]);

  // Process for unminified version with source map
  const resultUnminified = await processor.process(css, {
    from: path.join(inputDir, inputFile),
    to: path.join(outputDir, outputFileUnminified),
    map: { inline: false }
  });
  fs.writeFileSync(path.join(outputDir, outputFileUnminified), resultUnminified.css);
  fs.writeFileSync(path.join(outputDir, outputFileUnminified + '.map'), resultUnminified.map.toString());

  // Process for minified version with cssnano and source map
  const resultMinified = await postcss([
    postcssImport(),
    postcssNested(),
    postcssMergeRules(),
    cssnano({
      preset: ['default', {
        mergeRules: true,
        mergeLonghand: true,
        discardComments: {
          removeAll: true,
        },
      }]
    })
  ]).process(css, {
    from: path.join(inputDir, inputFile),
    to: path.join(outputDir, outputFileMinified),
    map: { inline: false }
  });
  fs.writeFileSync(path.join(outputDir, outputFileMinified), resultMinified.css);
  fs.writeFileSync(path.join(outputDir, outputFileMinified + '.map'), resultMinified.map.toString());
};

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

files.forEach(file => {
  processCSS(file.input, file.output, file.output.replace('.css', '.min.css')).catch(error => console.error(error));
});
