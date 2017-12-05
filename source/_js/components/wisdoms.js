'use strict';

let $ = require('jquery');
let f = require('../functions/basic');

// Containerization for component tabs documentation
function ma_wisdom(patternId) {
  
  var 
    pattern,
    wisdoms = [
      'How different should legality and morality be?',
      'If the sky\'s falling, what was holding it up in the first place?',
      'If we could spy on two-dimensional beings, could four-dimensional beings spy on us?',
      'It\'s only paranoia until it\'s justified.',
      'A little bit of craziness helps you keep your sanity.',
      'Listen and read, but never watch.',
      'Work with your thoughts, not against them',
      'Reimagine, don\'t Recreate.',
      'Always remember the bigger picture.',
      'Question every claim. Including this one.',
      'Grow so much from failures, they become successes.',
      'Live simply, cynically, and not too seriously.',
      'Can we truly prove we\'re not brains in jars?',
      'Those who aren\'t busy being reborn are busy dying.',
      'All we have is our right to feel lost.',
      'How do we examine our biases while still trusting our judgement?',
      'Confusion equals Morality plus Humanity.',
      'Nobody knows what\'s next, but everybody does it.',
      'Death is only the end if you assume the story is about you.',
      'Info isn\'t hidden today, it\'s drowned in a sea of nonsense.',
      'There\'s no normal, just the accidental cultural moment we\'re born into.',
      'Can something be a "need" if we don\'t die without it?',
      'A person\'s main task in life is to give birth to themselves.',
      'Are we just dream figures in someone else\'s dream?',
      'Only when we let strangers in, can we find new ways to be ourselves.',
      'When humans are made into commodities, what can conversations be but trivial?',
      'A free person owes an explanation only to themselves',
      'Force is camouflaged by consent, brought by methods of mass suggestion.',
      'The biggest chains are desires and ideals made to look like our own.',
      'Inside every cynical person is a disappointed idealist.',
      'To be is to be perceived.',
      'The eternal happiness you most wish for is the only thing you can\'t have.',
      'To live is to suffer. To survive is to find some meaning in the suffering.'
    ],
    selected_wisdom = wisdoms[Math.floor(Math.random()*wisdoms.length)];
  ;

  function init() {
    pattern.text(selected_wisdom);
  }
  
  function setEvents() {}

  function docReady() {
    pattern = $("#" + patternId);
    init();
    setEvents();
  }
  
  return docReady();
}

module.exports = {
  activate: function() {
    f.component_init('.max-c-wisdom', ma_wisdom);
  }
};
