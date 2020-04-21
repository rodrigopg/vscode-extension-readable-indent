import * as assert from 'assert';
import Indenter from '../Indenter';

suite("Indenter Class Tests", () => {
  const pivotEqual = `const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const puppeteer = require('puppeteer');
const l = require('../util/log');
const chapterCleanup = require('../util/chapter-cleanup');
const getCollection = require('./get-collection');
const pupOptions = require('../config/puppeteer');
const cookies = require('../config/rco-to/cookies');
`;
  
  const pivotColon = `    "eslint": "^5.15.0",
    "eslint-config-airbnb-base": "^13.1.0",
    "mocha": "^6.0.2",
    "eslint-plugin-import": "^2.16.0",
    "expect.js": "^0.3.1",
    "husky": "^1.3.1"
`;

  // Defines a Mocha unasync it test
  test("Simple `=` indent", () => {
    const indented = `const fs             = require('fs');
const path           = require('path');
const mkdirp         = require('mkdirp');
const puppeteer      = require('puppeteer');
const l              = require('../util/log');
const chapterCleanup = require('../util/chapter-cleanup');
const getCollection  = require('./get-collection');
const pupOptions     = require('../config/puppeteer');
const cookies        = require('../config/rco-to/cookies');
`;
    const ind = new Indenter();
    ind.alphabetize = false;
    const foo = ind.indent(pivotEqual);
    assert.equal(foo, indented);
  });

  test('Simple `:` indent', () => {
    const indented = `    "eslint"                    : "^5.15.0",
    "eslint-config-airbnb-base" : "^13.1.0",
    "mocha"                     : "^6.0.2",
    "eslint-plugin-import"      : "^2.16.0",
    "expect.js"                 : "^0.3.1",
    "husky"                     : "^1.3.1"
`;
    const ind = new Indenter();
    ind.alphabetize = false;
    const foo = ind.indent(pivotColon);
    assert.equal(foo, indented);
  });

  test("Simple `=` with pivot indent", () => {
    const indented = `            const fs = require('fs');
          const path = require('path');
        const mkdirp = require('mkdirp');
     const puppeteer = require('puppeteer');
             const l = require('../util/log');
const chapterCleanup = require('../util/chapter-cleanup');
 const getCollection = require('./get-collection');
    const pupOptions = require('../config/puppeteer');
       const cookies = require('../config/rco-to/cookies');
`;
    const ind = new Indenter();
    ind.alphabetize = false;
    const foo = ind.indent(pivotEqual);
    assert.equal(foo, indented);
  });

  test('Simple `:` with pivot indent', () => {
    const indented = `                       "eslint" : "^5.15.0",
    "eslint-config-airbnb-base" : "^13.1.0",
                        "mocha" : "^6.0.2",
         "eslint-plugin-import" : "^2.16.0",
                    "expect.js" : "^0.3.1",
                        "husky" : "^1.3.1"
`;

    const ind = new Indenter();
    ind.alphabetize = false;
    const foo = ind.indent(pivotColon);
    assert.equal(foo, indented);
  });


  test("Alphabetical `=` indent", () => {
    const indented = `const chapterCleanup = require('../util/chapter-cleanup');
const cookies        = require('../config/rco-to/cookies');
const fs             = require('fs');
const getCollection  = require('./get-collection');
const l              = require('../util/log');
const mkdirp         = require('mkdirp');
const path           = require('path');
const pupOptions     = require('../config/puppeteer');
const puppeteer      = require('puppeteer');
`;
    const ind = new Indenter();
    ind.alphabetize = true;
    const foo = ind.indent(pivotEqual);
    assert.equal(foo, indented);
  });

  test('Alphabetical `:` indent', () => {
    const indented = `                       "eslint" : "^5.15.0",
    "eslint-config-airbnb-base" : "^13.1.0",
         "eslint-plugin-import" : "^2.16.0",
                    "expect.js" : "^0.3.1",
                        "husky" : "^1.3.1"
                        "mocha" : "^6.0.2",
`;
    const ind = new Indenter();
    ind.alphabetize = true;
    const foo = ind.indent(pivotColon);
    assert.equal(foo, indented);
  });
});