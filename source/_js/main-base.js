'use strict';

let
  $ = require('jquery'),
  feather = require('feather-icons'),
  primaryNav = require('./components/primaryNav')
;

feather.replace();
primaryNav.activate('.max-c-nav');
