'use strict';

let
  $ = require('jquery'),
  f = require('./functions/basic'),
  feather = require('feather-icons'),
  wisdoms = require('./components/wisdoms')
;

feather.replace();
wisdoms.activate();

f.external_links('main article a');
f.img_to_figures('main article img');
