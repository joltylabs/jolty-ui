const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssMergeRules = require('postcss-merge-rules');
const combineDuplicatedSelectors = require('postcss-combine-duplicated-selectors');


const inputDir = './src';
const outputDir = './dist';
const inputFile = path.join(inputDir, 'index.css');
const outputFileUnminified = 'jolty-ui.css';
const outputFileMinified = 'jolty-ui.min.css';

const processCSS = async () => {
  const css = fs.readFileSync(inputFile, 'utf8');

  // Define the PostCSS processor with necessary plugins
  const processor = postcss([
    postcssImport(),
    postcssNested(),
    postcssMergeRules(),
    combineDuplicatedSelectors({ removeDuplicatedProperties: true })
  ]);

  // Process for unminified version with source map
  const resultUnminified = await processor.process(css, {
    from: inputFile,
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
    combineDuplicatedSelectors({ removeDuplicatedProperties: true }),
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
    from: inputFile,
    to: path.join(outputDir, outputFileMinified),
    map: { inline: false }
  });
  fs.writeFileSync(path.join(outputDir, outputFileMinified), resultMinified.css);
  fs.writeFileSync(path.join(outputDir, outputFileMinified + '.map'), resultMinified.map.toString());
};

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

processCSS().catch(error => console.error(error));
