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
      'XMLHttpRequest',
      'ActiveXObject("Msxml2.XMLHTTP")',
      'ActiveXObject("Microsoft.XMLHTTP")'
    ], o = null;
    for (var i in a) try { o = eval(a[i]); o = new o; break; } catch (e) {};
    try {
      if (!o) return '';
      o.open('GET', uri, false);
      //o.setRequestHeader('User-Agent', navigator.userAgent);
      o.send(null);
      return o.responseText;
    }
    catch (e) {}
  },

  // setup library
  init: function (uri) {
    i18n.load_translations(uri);
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

  /**
   * Copyright (c) 2010 Jakob Westhoff
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * 
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   */
  sprintf: function( format ) {
    // Check for format definition
    if ( typeof format != 'string' ) {
      throw "i18n.sprintf: The first arguments need to be a valid format string.";
    }

    /**
     * Define the regex to match a formating string
     * The regex consists of the following parts:
     * percent sign to indicate the start
     * (optional) sign specifier
     * (optional) padding specifier
     * (optional) alignment specifier
     * (optional) width specifier
     * (optional) precision specifier
     * type specifier:
     *  % - literal percent sign
     *  b - binary number
     *  c - ASCII character represented by the given value
     *  d - signed decimal number
     *  f - floating point value
     *  o - octal number
     *  s - string
     *  x - hexadecimal number (lowercase characters)
     *  X - hexadecimal number (uppercase characters)
     */
    var r = new RegExp( /%(\+)?([0 ]|'(.))?(-)?([0-9]+)?(\.([0-9]+))?([%bcdfosxX])/g );

    /**
     * Each format string is splitted into the following parts:
     * 0: Full format string
     * 1: sign specifier (+)
     * 2: padding specifier (0/<space>/'<any char>)
     * 3: if the padding character starts with a ' this will be the real 
     *    padding character
     * 4: alignment specifier
     * 5: width specifier
     * 6: precision specifier including the dot
     * 7: precision specifier without the dot
     * 8: type specifier
     */
    var parts      = [];
    var paramIndex = 1;
    while ( part = r.exec( format ) ) {
      // Check if an input value has been provided, for the current
      // format string
      if ( paramIndex >= arguments.length ) {
        throw "i18n.sprintf: At least one argument was missing.";
      }

      parts[parts.length] = {
        /* beginning of the part in the string */
        begin: part.index,
        /* end of the part in the string */
        end: part.index + part[0].length,
        /* force sign */
        sign: ( part[1] == '+' ),
        /* is the given data negative */
        negative: ( parseInt( arguments[paramIndex] ) < 0 ) ? true : false,
        /* padding character (default: <space>) */
        padding: ( part[2] == undefined )
                 ? ( ' ' ) /* default */
                 : ( ( part[2].substring( 0, 1 ) == "'" ) 
                     ? ( part[3] ) /* use special char */
                     : ( part[2] ) /* use normal <space> or zero */
                   ),
        /* should the output be aligned left?*/
        alignLeft: ( part[4] == '-' ),
        /* width specifier (number or false) */
        width: ( part[5] != undefined ) ? part[5] : false,
        /* precision specifier (number or false) */
        precision: ( part[7] != undefined ) ? part[7] : false,
        /* type specifier */
        type: part[8],
        /* the given data associated with this part converted to a string */
        data: ( part[8] != '%' ) ? String ( arguments[paramIndex++] ) : false
      };
    }

    var newString = "";
    var start = 0;
    // Generate our new formated string
    for( var i=0; i<parts.length; ++i ) {
      // Add first unformated string part
      newString += format.substring( start, parts[i].begin );

      // Mark the new string start
      start = parts[i].end;

      // Create the appropriate preformat substitution
      // This substitution is only the correct type conversion. All the
      // different options and flags haven't been applied to it at this
      // point
      var preSubstitution = "";
      switch ( parts[i].type ) {
        case '%':
          preSubstitution = "%";
        break;
        case 'b':
          preSubstitution = Math.abs( parseInt( parts[i].data ) ).toString( 2 );
        break;
        case 'c':
          preSubstitution = String.fromCharCode( Math.abs( parseInt( parts[i].data ) ) );
        break;
        case 'd':
          preSubstitution = String( Math.abs( parseInt( parts[i].data ) ) );
        break;
        case 'f':
          preSubstitution = ( parts[i].precision == false )
                            ? ( String( ( Math.abs( parseFloat( parts[i].data ) ) ) ) )
                            : ( Math.abs( parseFloat( parts[i].data ) ).toFixed( parts[i].precision ) );
        break;
        case 'o':
          preSubstitution = Math.abs( parseInt( parts[i].data ) ).toString( 8 );
        break;
        case 's':
          preSubstitution = parts[i].data.substring( 0, parts[i].precision ? parts[i].precision : parts[i].data.length ); /* Cut if precision is defined */
        break;
        case 'x':
          preSubstitution = Math.abs( parseInt( parts[i].data ) ).toString( 16 ).toLowerCase();
        break;
        case 'X':
          preSubstitution = Math.abs( parseInt( parts[i].data ) ).toString( 16 ).toUpperCase();
        break;
        default:
          throw 'i18n.sprintf: Unknown type "' + parts[i].type + '" detected. This should never happen. Maybe the regex is wrong.';
      }

      // The % character is a special type and does not need further processing
      if ( parts[i].type ==  "%" ) {
        newString += preSubstitution;
        continue;
      }

      // Modify the preSubstitution by taking sign, padding and width
      // into account

      // Pad the string based on the given width
      if ( parts[i].width != false ) {
        // Padding needed?
        if ( parts[i].width > preSubstitution.length ) {
          var origLength = preSubstitution.length;
          for( var j = 0; j < parts[i].width - origLength; ++j ) {
            preSubstitution = ( parts[i].alignLeft == true )
                              ? ( preSubstitution + parts[i].padding )
                              : ( parts[i].padding + preSubstitution );
          }
        }
      }

      // Add a sign symbol if neccessary or enforced, but only if we are
      // not handling a string
      if ( parts[i].type in ['b', 'd', 'o', 'f', 'x', 'X'] ) {
        if ( parts[i].negative == true ) {
          preSubstitution = "-" + preSubstitution;
        }
        else if ( parts[i].sign == true ) {
          preSubstitution = "+" + preSubstitution;
        }
      }

      // Add the substitution to the new string
      newString += preSubstitution;
    }

    // Add the last part of the given format string, which may still be there
    newString += format.substring( start, format.length );

    return newString;
  },

  // translate a string
  translate: function (string, values) {
    var args = '', format = i18n.strings[string] || string, result = format;
    for (var i = 0; i < values.length; i++) args += ', "'+values[i]+'"';
    try { eval('result = i18n.sprintf(format'+args+')'); } catch (e) {}
    return result;
  }

};

String.prototype.i18n = function () {
  return i18n.translate(this.valueOf(), arguments);
};
