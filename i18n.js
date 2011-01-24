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
  strings: {},

  // simple AJAX request used to load resources
  ajax: function (uri) {
    var a = [
      'XMLHttpRequest()',
      'ActiveXObject("Msxml2.XMLHTTP")',
      'ActiveXObject("Microsoft.XMLHTTP")'
    ], o = null;
    for (var i in a) try { o = eval(a[i]); break; } catch (e) {};
    try {
      o.open('GET', uri, false);
      o.setRequestHeader('User-Agent', navigator.userAgent);
      o.send(null);
      return o.responseText;
    }
    catch (e) {}
  },

  // setup library
  init: function () {
    var path = document.getElementsByTagName('script'),
        path = path[path.length - 1].getAttribute('src'),
        path = path.substr(0, path.lastIndexOf('/'));
    if (typeof(sprintf) == 'undefined') try { eval(i18n.ajax(path+'/sprintf.js')); } catch (e) {}
    i18n.load_translations(path+'/po');
  },

  // load translations from a .po file matching user's locale
  load_translations: function (path) {
    var k = '', s = i18n.ajax(path+'/'+i18n.locale()+'.po').split(/\n|\r|\r\n/);
    for (var i in s) {
      if (!s[i] || !s[i].indexOf || s[i].indexOf('#') == 0) continue;
      if (s[i].indexOf('msgid') == 0) k = s[i].replace(/msgid\s"(.*)"/, '$1');
      else if (s[i].indexOf('msgstr') == 0) i18n.strings[k] = s[i].replace(/msgstr\s"(.*)"/, '$1');
    }
  },

  // determine user's locale
  locale: function () {
    if (navigator)
      for (var key in ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'])
        if (navigator[key]) return navigator[key];
    return 'en-US';
  },

  // translate a string
  translate: function (string, values) {
    var args = '', format = i18n.strings[string] || string, result = format;
    for (var i = 0; i < values.length; i++) args += ', "'+values[i]+'"';
    try { eval('result = sprintf(format'+args+')'); } catch (e) {}
    return result;
  }

};

i18n.init();

String.prototype.i18n = function () {
  return i18n.translate(this.valueOf(), arguments);
};
