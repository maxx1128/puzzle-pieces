'use strict';

let
  $ = require('jquery'),
  f = require('../functions/basic')
;

// Containerization for the primary nav
function primaryNav(patternId) {

  let
    pattern = $("#" + patternId)
  ;

  function init() {}

  function setEvents() {}

  function docReady() {
    init();
    setEvents();
  }

  $(document).on({
    ready: docReady()
  });
}

exports.activate = function(selector) {
  f.component_init(selector, primaryNav);
}
