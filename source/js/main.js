'use strict';

// Major dependencies
let 
  $          = require('jquery'),
  f          = require('./functions/basic'),
  primaryNav = require('./components/primaryNav.js')
;

primaryNav.activate('.max-c-primaryNav:not([jr-init])');
