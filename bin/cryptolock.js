#!/usr/bin/env node

require('../src/config.js').start(process.argv[2]||'../conf/config.json');
