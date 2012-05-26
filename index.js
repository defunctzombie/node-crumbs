
/// Serialize the a name value pair into a cookie string suitable for
/// http headers. An optional options object specified cookie parameters
///
/// serialize('foo', 'bar', { httpOnly: true })
///   => "foo=bar; httpOnly"
///
/// @param {String} name
/// @param {String} val
/// @param {Object} options
/// @return {String}
var serialize = function(name, val, opt){
    var pairs = [name + '=' + encodeURIComponent(val)];
    opt = opt || {};

    if (opt.maxAge) pais.push('Max-Age=' + opt.maxAge);
    if (opt.domain) pairs.push('Domain=' + opt.domain);
    if (opt.path) pairs.push('Path=' + opt.path);
    if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
    if (opt.httpOnly) pairs.push('HttpOnly');
    if (opt.secure) pairs.push('Secure');

    return pairs.join('; ');
};

/// Parse the given cookie header string into an object
/// The object has the various cookies as keys(names) => values
/// @param {String} str
/// @return {Object}
var parse = function(str) {
    var obj = {}
    var pairs = str.split(/[;,] */);

    pairs.forEach(function(pair) {
        var eq_idx = pair.indexOf('=')
        var key = pair.substr(0, eq_idx).trim()
        var val = pair.substr(++eq_idx, pair.length).trim();

        // quoted values
        if ('"' == val[0]) {
            val = val.slice(1, -1);
        }

        // only assign once
        if (undefined == obj[key]) {
            val = val.replace(/\+/g, ' ');
            try {
                obj[key] = decodeURIComponent(val);
            } catch (err) {
                if (err instanceof URIError) {
                    obj[key] = val;
                } else {
                    throw err;
                }
            }
        }
    });

    return obj;
};

/// Initialize a cookie object with given options
/// The cookie object simplifies modifying cookie parameters
///
/// @param {String} name
/// @param {String} value
/// @param {Object} options
var Cookie = function (options) {
    options = options || {};

    this.maxAge = null;
    this.httpOnly = true;
    this.path = options.path || '/';
    this.maxAge = options.maxAge;
    this.httpOnly = options.httpOnly;
    this.secure = options.secure;
    this.domain = options.domain;
    this._expires = options.expires;
};

Cookie.prototype = {

    /// Set expires `date`.
    /// @param {Date} date
    set expires(date) {
        this._expires = date;
    },

    /// Get expires `date`
    /// @return {Date}
    get expires() {
        return this._expires;
    },

    /// Set expires via max-age in `ms`.
    /// @param {Number} ms
    set maxAge(ms) {
        this.expires = ('number' == typeof ms)
            ? new Date(Date.now() + ms)
            : ms;
    },

    /// Get expires max-age in `ms`.
    /// @return {Number}
    get maxAge() {
        return (this.expires instanceof Date)
            ? this.expires.valueOf() - Date.now()
            : this.expires;
    },

    /// Return cookie data object.
    /// @return {Object}
    get data() {
        return {
              expires: this._expires
            , secure: this.secure
            , httpOnly: this.httpOnly
            , domain: this.domain
            , path: this.path
        }
    },

    /// Return a string suitable for use in http header
    /// @return {String}
    serialize: function(name, value) {
        return serialize(name, value, this.data);
    },

    /// Return JSON representation of this cookie.
    /// @return {Object}
    toJSON: function() {
        return this.data;
    }
};

module.exports.Cookie = Cookie;
module.exports.serialize = serialize;
module.exports.parse = parse;
