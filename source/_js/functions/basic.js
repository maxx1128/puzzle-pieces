'use strict';

let $ = require('jquery');

module.exports = {
  component_init: function(selector, component_function){
    $(selector).each(function(){
      let id = $(this).attr('id');

      if ( typeof id === typeof undefined && id !== false ) {

        id = Math.floor((Math.random() * 99999999999999999) + 1);
        $(this).attr('id', id);
      }

      return component_function(id);
    });
  },

  external_links: function(selector) {
    $(selector).attr('target', '_blank');
  }
};
