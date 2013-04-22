/*!
 * Spintax
 * Copyright(c) 2013 John Henry
 * MIT Licensed
 */

/**
 * Spintax:
 *
 * Library for Parsing Spintax
 *
 * Inspired by: 
 *      https://github.com/flintinatux/spintax_parser/blob/master/lib/spintax_parser.rb
 *
 * Examples:
 *     require('spintax').unspin("{Hello|Hi} John!"); //#"Hello John!" or "Hi John"
 *     require('spintax').countVariations("{Hello|Hi} John!"); //#2
 *     require('spintax').unspin("Text goes {here|there|anywhere}{.|!|?}"); //#"Text goes there?" or "Text goes anywhere!" or...
 *     require('spintax').countVariations("Text goes {here|there|anywhere}{.|!|?}"); //#9
 */
(function(exports){  
    /*
     * @param {string} spun 
     * @return {string}
     */
    var SPINTAX_PATTERN = /\{[^"\r\n\}]*\}/;
    var unspin = module.exports.unspin = function (spun){
        var match;
        while(match = spun.match(SPINTAX_PATTERN)){
            match = match[0];
            var candidates = match.substring(1,match.length-1).split("|");
            spun = spun.replace(match,candidates[Math.floor(Math.random() * candidates.length)])
        }
        return spun;
    }

    /*
     * @param {string} spun 
     * @return {Number}
     */
    var countVariations = module.exports.countVariations = function (spun){
        spun = spun.replace(/[^{|}]+/g,'1');
        spun = spun.replace(/\{/g,'(');
        spun = spun.replace(/\|/g,'+');
        spun = spun.replace(/\}/g,')');
        spun = spun.replace(/\)\(/g,')*(');
        spun = spun.replace(/\)1/g,')*1');
        spun = spun.replace(/1\(/g,'1*(');
        return eval(spun);
    }
})(typeof exports === 'undefined'? this['spintax']={}: exports);