/**
 * i18njs, an internationalization library for JavaScript.
 *   http://github.com/jefftrudeau/i18njs
 *
 * Released under the GNU General Public License, version 2.
 *   http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * Copyright (C) Jeff Trudeau
 */
var i18n = {

  // translations
  strings: {}

  // simple AJAX request used to load resources
, ajax: function (uri) {
    var a = [
          'XMLHttpRequest'
        , 'ActiveXObject("Msxml2.XMLHTTP")'
        , 'ActiveXObject("Microsoft.XMLHTTP")'
      ]
      , o = null;
    for (var i in a) try { o = eval(a[i]); o = new o; break; } catch (e) {};
    try {
      if (!o) return '';
      o.open('GET', uri, false);
      //o.setRequestHeader('User-Agent', navigator.userAgent);
      o.send(null);
      return o.responseText;
    }
    catch (e) {}
  }

  // setup library
, init: function (uri) {
    i18n.load_translations(uri);
  }

  // load translations from a .po file matching user's locale
, load_translations: function (uri) {
    var key = ''
      , dict = i18n.ajax(uri+'/'+i18n.locale()+'.po').split(/\n|\r|\r\n/);
    for (var i in dict) {
      if (!dict[i] || !dict[i].indexOf || dict[i].indexOf('#') == 0)
        continue;
      if (dict[i].indexOf('msgid') == 0)
        key = dict[i].replace(/msgid\s"(.*)"/, '$1');
      else if (dict[i].indexOf('msgstr') == 0)
        i18n.strings[key] = dict[i].replace(/msgstr\s"(.*)"/, '$1');
    }
  }

  // determine user's locale
, locale: function () {
    if (navigator)
      for (var key in ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'])
        if (navigator[key]) return navigator[key];
    return 'en-US';
  }

  // translate a string
, translate: function (string, values) {
    var result = i18n.strings[string] || string;
    try {
      return result.replace(/{(\d+)}/g, function(match, index) {
        return typeof(values[index] != 'undefined') ? values[index] : match;
      });
    }
    catch (e) {}
    return result;
  }

};

String.prototype.i18n = function () {
  return i18n.translate(this.valueOf(), arguments);
};
