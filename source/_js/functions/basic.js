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
    $(selector).attr('rel', 'noopener');
  },

  img_to_figures: function(selector) {
    $(selector).each(function(){

      if ( $(this).closest('figure').length === 0 ) {
        let alt_text = $(this).attr('alt');

        $(this).wrap("<figure class='max-inline-flex max-flex-column max-flex-align-start max-m-none max-mb-oneHalf'></figure>");
        $(this).after(`<figcaption class="max-font-size-small max-line-height-small max-italic max-color-primary-darker max-pt-quart">${alt_text}<figcaption>`);
      }
    });
  }
};
