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

  context: 'default'

, debug: false

, strings: {}

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
      o.send(null);
      return o.responseText;
    }
    catch (e) { if (i18n.debug) console.log(e.message); }
  }

, init: function (uri, context, debug) {
    if (context) i18n.context = context;
    i18n.debug = debug;
    i18n.load(uri);
  }

, load: function (uri) {
    var ctxt = 'default', id = '', id_plural = ''
      , dict = i18n.ajax(uri+'/'+i18n.locale()+'.po').split(/\n|\r|\r\n/);
    for (var i in dict) {
      if (!dict[i] || !dict[i].indexOf || dict[i].indexOf('#') == 0)
        continue;
      if (dict[i] == '') {
        ctxt = 'default'; id = ''; id_plural = '';
      }
      else if (dict[i].indexOf('msgctxt') == 0)
        ctxt = dict[i].replace(/msgctxt\s"(.*)"/, '$1');
      else if (dict[i].indexOf('msgid_plural') == 0)
        id_plural = dict[i].replace(/msgid_plural\s"(.*)"/, '$1');
      else if (dict[i].indexOf('msgid') == 0)
        id = dict[i].replace(/msgid\s"(.*)"/, '$1');
      else if (dict[i].indexOf('msgstr[1]') == 0)
        i18n.set(ctxt, id_plural, dict[i].replace(/msgstr.*"(.*)"/, '$1'));
      else if (dict[i].indexOf('msgstr') == 0)
        i18n.set(ctxt, id, dict[i].replace(/msgstr.*"(.*)"/, '$1'));
    }
    if (i18n.debug) console.log(i18n.strings);
  }

, locale: function () {
    if (navigator)
      for (var key in ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'])
        if (navigator[key]) return navigator[key];
    return 'en-US';
  }

, set: function (ctxt, key, value) {
    if (ctxt && typeof(i18n.strings[ctxt]) == 'undefined')
      i18n.strings[ctxt] = {};
    if (key && value)
      i18n.strings[ctxt][key] = value;
  }

, translate: function (string, values) {
    try {
      return i18n.strings[i18n.context][string].replace(/{(\d+)}/g, function(match, index) {
        return typeof(values[index] != 'undefined') ? values[index] : match;
      });
    }
    catch (e) { if (i18n.debug) console.log(e.message); }
    return string;
  }

};

String.prototype.i18n = function () {
  return i18n.translate(this.valueOf(), arguments);
};
