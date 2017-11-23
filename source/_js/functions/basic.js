'use strict';

let $ = require('jquery');

exports.component_init = function(selector, component_function) {
  $(selector).each(function(){

    if ( $(this).attr('max-init') === undefined ) {
      var id = $(this).attr('id');
      
      if ( typeof id === typeof undefined && id !== false ) {
        
        id = 'IDUNIQUE_' + Math.floor((Math.random() * 99999999999999999) + 1);
        $(this).attr('id', id);
        $(this).attr('max-init', '');
      }
      
      component_function(id);
    }
  });
};
