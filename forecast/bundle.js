(function () {
    'use strict';

    // Used for the selectors and for auto populating other structures
    const cModels = {
        "TIR": {
            "description": "TIR 2km",
            "center":   ["49.9771652", "12.0000000"],
            "swcorner": ["48.1308060", "9.0694275"],
            "necorner": ["51.8235283", "14.9305725"],
            "resolution": 2, // in km
            "zoom": 7,
            "parameters": [
                // Thermal
                "wstar_bsratio",
                "wstar",
                "bsratio",
                "hglider",
                "hwcrit",
                "dwcrit",
                "hbl",
                "dbl",
                "bltopvariab",
                "wblmaxmin",
                "zwblmaxmin",

                // Cloud
                "zsfclcldif",
                "zsfclcl",
                "zsfclclmask",
                "zblcldif",
                "zblcl",
                "zblclmask",
                "blcloudpct",
                "cfracl",
                "cfracm",
                "cfrach",

                // Wind
                "sfcwind0",
                // "sfcwind",
                "blwind",
                "bltopwind",
                "blwindshear",

                // Wave
                "press950",
                "press850",
                "press700",
                "press500",

                // General
                "sfctemp",
                "sfcdewpt",
                // "mslpress",
                "rain1",
                "cape",

                // Experimental
                "pfd_tot",
                "sfcsunpct",
                "sfcshf",
                "blicw",
                "blcwbase",
            ],
            "days": [0, 1],
            "hours": { // keys: "0" -> today, "1" -> tomorrow, ...
                "0" : ["0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800", "1900", "2000"],
                "1" : ["0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800", "1900", "2000"]
            }
        }
    };

    const cCategories = ["thermal", "cloud", "wind", "wave", "general", "experimental"];

    const cParameters = {
        // Thermal
        "wstar_bsratio": { category: "thermal", "longname": dict["wstar_bsratio.longname"], "description": dict["wstar_bsratio.description"],
                           composite: { of: ["wstar", "bsratio"], units: ["cm/s", " "], domains: [[0, 500], [0, 10]], type: "wstar_bsratio" }
                         },
        "wstar":         { category: "thermal", "longname": dict["wstar.longname"],         "description": dict["wstar.description"], unit: "cm/s", domain: [0, 500] },
        "bsratio":       { category: "thermal", "longname": dict["bsratio.longname"],       "description": dict["bsratio.description"], unit: " ", domain: [0, 10] },
        "hglider":       { category: "thermal", "longname": dict["hglider.longname"],       "description": dict["hglider.description"], unit: "m", domain: [0, 3000] },
        "hwcrit":        { category: "thermal", "longname": dict["hwcrit.longname"],        "description": dict["hwcrit.description"], unit: "m", domain: [0, 3000] },
        "dwcrit":        { category: "thermal", "longname": dict["dwcrit.longname"],        "description": dict["dwcrit.description"], unit: "m", domain: [0, 3000] },
        "hbl":           { category: "thermal", "longname": dict["hbl.longname"],           "description": dict["hbl.description"], unit: "m", domain: [0, 3000] },
        "dbl":           { category: "thermal", "longname": dict["dbl.longname"],           "description": dict["dbl.description"], unit: "m", domain: [0, 3000] },
        "bltopvariab":   { category: "thermal", "longname": dict["bltopvariab.longname"],   "description": dict["bltopvariab.description"], unit: "m", domain: [0, 2000] },
        "wblmaxmin":     { category: "thermal", "longname": dict["wblmaxmin.longname"],     "description": dict["wblmaxmin.description"], unit: "cm/s", domain: [-250, 250] },
        "zwblmaxmin":    { category: "thermal", "longname": dict["zwblmaxmin.longname"],    "description": dict["zwblmaxmin.description"], unit: "m", domain: [0, 3000] },
        // Cloud
        "zsfclcldif":    { category: "cloud", "longname": dict["zsfclcldif.longname"],    "description": dict["zsfclcldif.description"], unit: "m", domain: [-1000, 1000], colorscale: "cloudpotential" },
        "zsfclcl":       { category: "cloud", "longname": dict["zsfclcl.longname"],       "description": dict["zsfclcl.description"], unit: "m", domain: [0, 3000] },
        "zsfclclmask":   { category: "cloud", "longname": dict["zsfclclmask.longname"],   "description": dict["zsfclclmask.description"], unit: "m", domain: [0, 3000] },
        "zblcldif":      { category: "cloud", "longname": dict["zblcldif.longname"],      "description": dict["zblcldif.description"], unit: "m", domain: [-1000, 1000], colorscale: "cloudpotential" },
        "zblcl":         { category: "cloud", "longname": dict["zblcl.longname"],         "description": dict["zblcl.description"], unit: "m", domain: [0, 3000] },
        "zblclmask":     { category: "cloud", "longname": dict["zblclmask.longname"],     "description": dict["zblclmask.description"], unit: "m", domain: [0, 3000] },
        "blcloudpct":    { category: "cloud", "longname": dict["blcloudpct.longname"],    "description": dict["blcloudpct.description"], unit: "%", domain: [0, 100], colorscale: "clouds" },
        "cfracl":        { category: "cloud", "longname": dict["cfracl.longname"],        "description": dict["cfracl.description"], unit: "", domain: [0, 100], colorscale: "clouds" },
        "cfracm":        { category: "cloud", "longname": dict["cfracm.longname"],        "description": dict["cfracm.description"], unit: "", domain: [0, 100], colorscale: "clouds" },
        "cfrach":        { category: "cloud", "longname": dict["cfrach.longname"],        "description": dict["cfrach.description"], unit: "", domain: [0, 100], colorscale: "clouds" },
        "clouds":        { category: "cloud", "longname": dict["clouds.longname"],        "description": dict["clouds.description"],
                           composite: { of: ["cfracl", "cfracm", "cfrach"], units: ["%", "%", "%"], domains: [[0, 100], [0, 100], [0, 100]], type: "clouds" }
                         },
        // Wind
        "sfcwind0":      { category: "wind", "longname": dict["sfcwind0.longname"],      "description": dict["sfcwind0.description"],
                           composite:{ of: ["sfcwind0spd", "sfcwind0dir"], units: ["m/s", "°"], domains: [[0, 30]], type: "wind" }
                         },
        "sfcwind":       { category: "wind", "longname": dict["sfcwind.longname"],       "description": dict["sfcwind.description"],
                           composite: { of: ["sfcwindspd", "sfcwinddir"], units: ["m/s", "°"], domains: [[0, 30]], type: "wind" }
                         },
        "blwind":        { category: "wind", "longname": dict["blwind.longname"],        "description": dict["blwind.description"],
                           composite: { of: ["blwindspd", "blwinddir"], units: ["m/s", "°"], domains: [[0, 30]], type: "wind" }
                         },
        "bltopwind":     { category: "wind", "longname": dict["bltopwind.longname"],     "description": dict["bltopwind.description"],
                           composite: { of: ["bltopwindspd", "bltopwinddir"], units: ["m/s", "°"], domains: [[0, 30]], type: "wind" }
                         },
        "blwindshear":   { category: "wind", "longname": dict["blwindshear.longname"],   "description": dict["blwindshear.description"], unit: "m/s", domain: [0, 30] },
        // Wave
        "press950":      { category: "wave", "longname": dict["press950.longname"],      "description": dict["press950.description"],
                           composite: { of: ["press950", "press950wspd", "press950wdir"], units: ["cm/s", "m/s", "°"], domains: [[-250, 250], [0, 30]], type: "press" }
                         },
        "press850":      { category: "wave", "longname": dict["press850.longname"],      "description": dict["press850.description"],
                           composite: { of: ["press850", "press850wspd", "press850wdir"], units: ["cm/s", "m/s", "°"], domains: [[-250, 250], [0, 30]], type: "press" }
                         },
        "press700":      { category: "wave", "longname": dict["press700.longname"],      "description": dict["press700.description"],
                           composite: { of: ["press700", "press700wspd", "press700wdir"], units: ["cm/s", "m/s", "°"], domains: [[-250, 250], [0, 30]], type: "press" }
                         },
        "press500":      { category: "wave", "longname": dict["press500.longname"],      "description": dict["press500.description"],
                           composite: { of: ["press500", "press500wspd", "press500wdir"], units: ["cm/s", "m/s", "°"], domains: [[-250, 250], [0, 30]], type: "press" }
                         },
        // General
        "sfctemp":       { category: "general", "longname": dict["sfctemp.longname"],       "description": dict["sfctemp.description"], unit: "°C", domain: [-10, 40] },
        "sfcdewpt":      { category: "general", "longname": dict["sfcdewpt.longname"],      "description": dict["sfcdewpt.description"], unit: "°C", domain: [-20, 30] },
        "mslpress":      { category: "general", "longname": dict["mslpress.longname"],      "description": dict["mslpress.description"], unit: "hPa" },
        "rain1":         { category: "general", "longname": dict["rain1.longname"],         "description": dict["rain1.description"], unit: "mm/h", domain: [0, 10] },
        "cape":          { category: "general", "longname": dict["cape.longname"],          "description": dict["cape.description"], unit: "J/kg", domain: [0, 2000] },
        // Experimental
        "pfd_tot":       { category: "experimental", "longname": dict["pfd_tot.longname"],       "description": dict["pfd_tot.description"], unit: "km", domain: [0, 1000], colorscale: "pfd" },
        "sfcsunpct":     { category: "experimental", "longname": dict["sfcsunpct.longname"],     "description": dict["sfcsunpct.description"], unit: "%", domain: [0, 100] },
        "sfcshf":        { category: "experimental", "longname": dict["sfcshf.longname"],        "description": dict["sfcshf.description"], unit: "W/m²", domain: [-50, 400] },
        "blicw":         { category: "experimental", "longname": dict["blicw.longname"],         "description": dict["blicw.description"], unit: "g", domain: [0, 100] },
        "blcwbase":      { category: "experimental", "longname": dict["blcwbase.longname"],      "description": dict["blcwbase.description"], unit: "m", domain: [0, 3000] },
    };

    const cSoundings = {
        "TIR": {
            // keys: "1" -> sounding1, "2" -> sounding2, ...
            "1": { "name": "Tirschenreuth",     "location": ["49.8741", "12.3272"] },
            "2": { "name": "Oberhinkofen",      "location": ["48.9523", "12.1462"] },
            "3": { "name": "Bamberg",           "location": ["49.9179", "10.9121"] },
            "4": { "name": "Jena",              "location": ["50.9164", "11.7171"] },
            "5": { "name": "Nördlingen",        "location": ["48.8703", "10.5034"] },
            "6": { "name": "Großrückerswalde",  "location": ["50.6431", "13.1274"] },
            "7": { "name": "Klatovy",           "location": ["49.4172", "13.3215"] },
            "8": { "name": "Wasserkuppe",       "location": ["50.4989", "9.9541"] },
            "9": { "name": "Sonnen",            "location": ["48.6823", "13.6949"] }
        }
    };

    const cMeteograms = {
        "TIR": {
            // keys: "Someplace" -> meteogram_Someplace, ...
            "Tirschenreuth":      { "name": "Tirschenreuth",     "location": ["49.8741", "12.3272"]},
            "Oberhinkofen":       { "name": "Oberhinkofen",      "location": ["48.9523", "12.1462"]},
            "Bamberg":            { "name": "Bamberg",           "location": ["49.9179", "10.9121"]},
            "Jena":               { "name": "Jena",              "location": ["50.9164", "11.7171"]},
            "Noerdlingen":        { "name": "Nördlingen",        "location": ["48.8703", "10.5034"]},
            "Grossrueckerswalde": { "name": "Großrückerswalde",  "location": ["50.6431", "13.1274"]},
            "Klatovy":            { "name": "Klatovy",           "location": ["49.4172", "13.3215"]},
            "Wasserkuppe":        { "name": "Wasserkuppe",       "location": ["50.4989", "9.9541"]},
            "Sonnen":             { "name": "Sonnen",            "location": ["48.6823", "13.6949"]}
        }
    };

    // Define all static layers to be used in the map. Differentiate between mutually exclusive base layers ...
    const cLayers = {
        baseLayers: {
            [dict["Topography"]]: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Powered by <a href="https://www.esri.com" target="_blank">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
            }),
            [dict["Grayscale"]]: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Powered by <a href="https://www.esri.com" target="_blank">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
            })
        },
        // ... and overlays
        overlays: {
            [dict["Airspace"]]: L.tileLayer('https://{s}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{y}.png', {
                attribution: 'Airspace tiles by <a href="https://www.openaip.net" target="_blank">OpenAip</a>',
                tms: true,
                subdomains: '12',
                transparent: true,
                opacity: 0.5
            })
        },
    };

    const cDefaults = {
        // The data is expected at <server>/<region> for day 0 and <server>/<region>+<day> for day > 0
        forecastServerRoot: "results/OUT",     // this points to the base location of all data
        baseLayer: dict["Topography"],
        overlays: [],
        zoom: 7,
        minZoom: 6,
        maxZoom: 13,
        model: "TIR",                   // default model to start on
        parameter: "wstar_bsratio",     // which paramter to start on
        parameterTime: "1300",          // which hour to start on
        opacityLevel: 0.6,
        opacityDelta: 0.1,
        loadingAnimationDelay: 300, // ms. Wait this long before showing a loading animation for the to-be-shown overlay
        zoomLocation: 'bottomleft',            // Zoom control position
        scaleLocation: 'bottomleft',           // Scale position
        RASPControlLocation: 'topleft',        // Position of custom RASP data control
        soundingMarker: 'img/sounding.svg',
        meteogramMarker: 'img/meteogram.svg',
        markerSize: 15
    };

    L.Control.Attribution.Compact = L.Control.Attribution.extend({
        addTo: function(map) {
            L.Control.Attribution.prototype.addTo.call(this, map);
            // use the css checkbox hack to toggle the attribution
            var parent     = this._container.parentNode;
            parent.onclick = event => event.stopPropagation();
            var checkbox   = document.createElement('input');
            var label      = document.createElement('label');
            var checkboxId = map._container.id + '-attribution-toggle';
            checkbox.setAttribute('id', checkboxId);
            checkbox.setAttribute('type', 'checkbox');
            checkbox.classList.add('leaflet-compact-attribution-toggle');
            parent.insertBefore(checkbox, parent.firstChild);
            label.setAttribute('for', checkboxId);
            label.classList.add('leaflet-control');
            label.classList.add('leaflet-compact-attribution-label');
            parent.appendChild(label);
            // initial setup for map load
            if (map._container.offsetWidth <= 700) {
                L.DomUtil.addClass(this._container, 'leaflet-compact-attribution');
            }
            // update on map resize
            map.on('resize', function() {
                if (map._container.offsetWidth > 700) {
                    L.DomUtil.removeClass(this._container, 'leaflet-compact-attribution');
                } else {
                    L.DomUtil.addClass(this._container, 'leaflet-compact-attribution');
                }
            }, this);
            return this;
        },
    });

    function compactAttribution(options) {
        return new L.Control.Attribution.Compact(options);
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var georaster_browser_bundle_min = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}("undefined"!=typeof self?self:commonjsGlobal,(function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n});},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=44)}([function(e,t,r){r.d(t,"a",(function(){return n})),r.d(t,"b",(function(){return i})),r.d(t,"c",(function(){return o})),r.d(t,"d",(function(){return s})),r.d(t,"e",(function(){return a}));const n=Symbol("thread.errors"),i=Symbol("thread.events"),o=Symbol("thread.terminate"),s=Symbol("thread.transferable"),a=Symbol("thread.worker");},function(e,t){var r;r=function(){return this}();try{r=r||new Function("return this")();}catch(e){"object"==typeof window&&(r=window);}e.exports=r;},function(e,t,r){(function(e){
    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <http://feross.org>
     * @license  MIT
     */
    var n=r(45),i=r(46),o=r(25);function s(){return u.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function a(e,t){if(s()<t)throw new RangeError("Invalid typed array length");return u.TYPED_ARRAY_SUPPORT?(e=new Uint8Array(t)).__proto__=u.prototype:(null===e&&(e=new u(t)),e.length=t),e}function u(e,t,r){if(!(u.TYPED_ARRAY_SUPPORT||this instanceof u))return new u(e,t,r);if("number"==typeof e){if("string"==typeof t)throw new Error("If encoding is specified then the first argument must be a string");return f(this,e)}return c(this,e,t,r)}function c(e,t,r,n){if("number"==typeof t)throw new TypeError('"value" argument must not be a number');return "undefined"!=typeof ArrayBuffer&&t instanceof ArrayBuffer?function(e,t,r,n){if(t.byteLength,r<0||t.byteLength<r)throw new RangeError("'offset' is out of bounds");if(t.byteLength<r+(n||0))throw new RangeError("'length' is out of bounds");t=void 0===r&&void 0===n?new Uint8Array(t):void 0===n?new Uint8Array(t,r):new Uint8Array(t,r,n);u.TYPED_ARRAY_SUPPORT?(e=t).__proto__=u.prototype:e=h(e,t);return e}(e,t,r,n):"string"==typeof t?function(e,t,r){"string"==typeof r&&""!==r||(r="utf8");if(!u.isEncoding(r))throw new TypeError('"encoding" must be a valid string encoding');var n=0|p(t,r),i=(e=a(e,n)).write(t,r);i!==n&&(e=e.slice(0,i));return e}(e,t,r):function(e,t){if(u.isBuffer(t)){var r=0|d(t.length);return 0===(e=a(e,r)).length||t.copy(e,0,0,r),e}if(t){if("undefined"!=typeof ArrayBuffer&&t.buffer instanceof ArrayBuffer||"length"in t)return "number"!=typeof t.length||(n=t.length)!=n?a(e,0):h(e,t);if("Buffer"===t.type&&o(t.data))return h(e,t.data)}var n;throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(e,t)}function l(e){if("number"!=typeof e)throw new TypeError('"size" argument must be a number');if(e<0)throw new RangeError('"size" argument must not be negative')}function f(e,t){if(l(t),e=a(e,t<0?0:0|d(t)),!u.TYPED_ARRAY_SUPPORT)for(var r=0;r<t;++r)e[r]=0;return e}function h(e,t){var r=t.length<0?0:0|d(t.length);e=a(e,r);for(var n=0;n<r;n+=1)e[n]=255&t[n];return e}function d(e){if(e>=s())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+s().toString(16)+" bytes");return 0|e}function p(e,t){if(u.isBuffer(e))return e.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(e)||e instanceof ArrayBuffer))return e.byteLength;"string"!=typeof e&&(e=""+e);var r=e.length;if(0===r)return 0;for(var n=!1;;)switch(t){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":case void 0:return N(e).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return G(e).length;default:if(n)return N(e).length;t=(""+t).toLowerCase(),n=!0;}}function g(e,t,r){var n=!1;if((void 0===t||t<0)&&(t=0),t>this.length)return "";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return "";if((r>>>=0)<=(t>>>=0))return "";for(e||(e="utf8");;)switch(e){case"hex":return O(this,t,r);case"utf8":case"utf-8":return E(this,t,r);case"ascii":return C(this,t,r);case"latin1":case"binary":return A(this,t,r);case"base64":return x(this,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return R(this,t,r);default:if(n)throw new TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase(),n=!0;}}function m(e,t,r){var n=e[t];e[t]=e[r],e[r]=n;}function y(e,t,r,n,i){if(0===e.length)return -1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),r=+r,isNaN(r)&&(r=i?0:e.length-1),r<0&&(r=e.length+r),r>=e.length){if(i)return -1;r=e.length-1;}else if(r<0){if(!i)return -1;r=0;}if("string"==typeof t&&(t=u.from(t,n)),u.isBuffer(t))return 0===t.length?-1:b(e,t,r,n,i);if("number"==typeof t)return t&=255,u.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(e,t,r):Uint8Array.prototype.lastIndexOf.call(e,t,r):b(e,[t],r,n,i);throw new TypeError("val must be string, number or Buffer")}function b(e,t,r,n,i){var o,s=1,a=e.length,u=t.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(e.length<2||t.length<2)return -1;s=2,a/=2,u/=2,r/=2;}function c(e,t){return 1===s?e[t]:e.readUInt16BE(t*s)}if(i){var l=-1;for(o=r;o<a;o++)if(c(e,o)===c(t,-1===l?0:o-l)){if(-1===l&&(l=o),o-l+1===u)return l*s}else -1!==l&&(o-=o-l),l=-1;}else for(r+u>a&&(r=a-u),o=r;o>=0;o--){for(var f=!0,h=0;h<u;h++)if(c(e,o+h)!==c(t,h)){f=!1;break}if(f)return o}return -1}function w(e,t,r,n){r=Number(r)||0;var i=e.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=t.length;if(o%2!=0)throw new TypeError("Invalid hex string");n>o/2&&(n=o/2);for(var s=0;s<n;++s){var a=parseInt(t.substr(2*s,2),16);if(isNaN(a))return s;e[r+s]=a;}return s}function v(e,t,r,n){return q(N(t,e.length-r),e,r,n)}function _(e,t,r,n){return q(function(e){for(var t=[],r=0;r<e.length;++r)t.push(255&e.charCodeAt(r));return t}(t),e,r,n)}function k(e,t,r,n){return _(e,t,r,n)}function S(e,t,r,n){return q(G(t),e,r,n)}function T(e,t,r,n){return q(function(e,t){for(var r,n,i,o=[],s=0;s<e.length&&!((t-=2)<0);++s)r=e.charCodeAt(s),n=r>>8,i=r%256,o.push(i),o.push(n);return o}(t,e.length-r),e,r,n)}function x(e,t,r){return 0===t&&r===e.length?n.fromByteArray(e):n.fromByteArray(e.slice(t,r))}function E(e,t,r){r=Math.min(e.length,r);for(var n=[],i=t;i<r;){var o,s,a,u,c=e[i],l=null,f=c>239?4:c>223?3:c>191?2:1;if(i+f<=r)switch(f){case 1:c<128&&(l=c);break;case 2:128==(192&(o=e[i+1]))&&(u=(31&c)<<6|63&o)>127&&(l=u);break;case 3:o=e[i+1],s=e[i+2],128==(192&o)&&128==(192&s)&&(u=(15&c)<<12|(63&o)<<6|63&s)>2047&&(u<55296||u>57343)&&(l=u);break;case 4:o=e[i+1],s=e[i+2],a=e[i+3],128==(192&o)&&128==(192&s)&&128==(192&a)&&(u=(15&c)<<18|(63&o)<<12|(63&s)<<6|63&a)>65535&&u<1114112&&(l=u);}null===l?(l=65533,f=1):l>65535&&(l-=65536,n.push(l>>>10&1023|55296),l=56320|1023&l),n.push(l),i+=f;}return function(e){var t=e.length;if(t<=4096)return String.fromCharCode.apply(String,e);var r="",n=0;for(;n<t;)r+=String.fromCharCode.apply(String,e.slice(n,n+=4096));return r}(n)}t.Buffer=u,t.SlowBuffer=function(e){+e!=e&&(e=0);return u.alloc(+e)},t.INSPECT_MAX_BYTES=50,u.TYPED_ARRAY_SUPPORT=void 0!==e.TYPED_ARRAY_SUPPORT?e.TYPED_ARRAY_SUPPORT:function(){try{var e=new Uint8Array(1);return e.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===e.foo()&&"function"==typeof e.subarray&&0===e.subarray(1,1).byteLength}catch(e){return !1}}(),t.kMaxLength=s(),u.poolSize=8192,u._augment=function(e){return e.__proto__=u.prototype,e},u.from=function(e,t,r){return c(null,e,t,r)},u.TYPED_ARRAY_SUPPORT&&(u.prototype.__proto__=Uint8Array.prototype,u.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&u[Symbol.species]===u&&Object.defineProperty(u,Symbol.species,{value:null,configurable:!0})),u.alloc=function(e,t,r){return function(e,t,r,n){return l(t),t<=0?a(e,t):void 0!==r?"string"==typeof n?a(e,t).fill(r,n):a(e,t).fill(r):a(e,t)}(null,e,t,r)},u.allocUnsafe=function(e){return f(null,e)},u.allocUnsafeSlow=function(e){return f(null,e)},u.isBuffer=function(e){return !(null==e||!e._isBuffer)},u.compare=function(e,t){if(!u.isBuffer(e)||!u.isBuffer(t))throw new TypeError("Arguments must be Buffers");if(e===t)return 0;for(var r=e.length,n=t.length,i=0,o=Math.min(r,n);i<o;++i)if(e[i]!==t[i]){r=e[i],n=t[i];break}return r<n?-1:n<r?1:0},u.isEncoding=function(e){switch(String(e).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return !0;default:return !1}},u.concat=function(e,t){if(!o(e))throw new TypeError('"list" argument must be an Array of Buffers');if(0===e.length)return u.alloc(0);var r;if(void 0===t)for(t=0,r=0;r<e.length;++r)t+=e[r].length;var n=u.allocUnsafe(t),i=0;for(r=0;r<e.length;++r){var s=e[r];if(!u.isBuffer(s))throw new TypeError('"list" argument must be an Array of Buffers');s.copy(n,i),i+=s.length;}return n},u.byteLength=p,u.prototype._isBuffer=!0,u.prototype.swap16=function(){var e=this.length;if(e%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var t=0;t<e;t+=2)m(this,t,t+1);return this},u.prototype.swap32=function(){var e=this.length;if(e%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var t=0;t<e;t+=4)m(this,t,t+3),m(this,t+1,t+2);return this},u.prototype.swap64=function(){var e=this.length;if(e%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var t=0;t<e;t+=8)m(this,t,t+7),m(this,t+1,t+6),m(this,t+2,t+5),m(this,t+3,t+4);return this},u.prototype.toString=function(){var e=0|this.length;return 0===e?"":0===arguments.length?E(this,0,e):g.apply(this,arguments)},u.prototype.equals=function(e){if(!u.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e||0===u.compare(this,e)},u.prototype.inspect=function(){var e="",r=t.INSPECT_MAX_BYTES;return this.length>0&&(e=this.toString("hex",0,r).match(/.{2}/g).join(" "),this.length>r&&(e+=" ... ")),"<Buffer "+e+">"},u.prototype.compare=function(e,t,r,n,i){if(!u.isBuffer(e))throw new TypeError("Argument must be a Buffer");if(void 0===t&&(t=0),void 0===r&&(r=e?e.length:0),void 0===n&&(n=0),void 0===i&&(i=this.length),t<0||r>e.length||n<0||i>this.length)throw new RangeError("out of range index");if(n>=i&&t>=r)return 0;if(n>=i)return -1;if(t>=r)return 1;if(this===e)return 0;for(var o=(i>>>=0)-(n>>>=0),s=(r>>>=0)-(t>>>=0),a=Math.min(o,s),c=this.slice(n,i),l=e.slice(t,r),f=0;f<a;++f)if(c[f]!==l[f]){o=c[f],s=l[f];break}return o<s?-1:s<o?1:0},u.prototype.includes=function(e,t,r){return -1!==this.indexOf(e,t,r)},u.prototype.indexOf=function(e,t,r){return y(this,e,t,r,!0)},u.prototype.lastIndexOf=function(e,t,r){return y(this,e,t,r,!1)},u.prototype.write=function(e,t,r,n){if(void 0===t)n="utf8",r=this.length,t=0;else if(void 0===r&&"string"==typeof t)n=t,r=this.length,t=0;else {if(!isFinite(t))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");t|=0,isFinite(r)?(r|=0,void 0===n&&(n="utf8")):(n=r,r=void 0);}var i=this.length-t;if((void 0===r||r>i)&&(r=i),e.length>0&&(r<0||t<0)||t>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return w(this,e,t,r);case"utf8":case"utf-8":return v(this,e,t,r);case"ascii":return _(this,e,t,r);case"latin1":case"binary":return k(this,e,t,r);case"base64":return S(this,e,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return T(this,e,t,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0;}},u.prototype.toJSON=function(){return {type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function C(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;++i)n+=String.fromCharCode(127&e[i]);return n}function A(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;++i)n+=String.fromCharCode(e[i]);return n}function O(e,t,r){var n=e.length;(!t||t<0)&&(t=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=t;o<r;++o)i+=B(e[o]);return i}function R(e,t,r){for(var n=e.slice(t,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function I(e,t,r){if(e%1!=0||e<0)throw new RangeError("offset is not uint");if(e+t>r)throw new RangeError("Trying to access beyond buffer length")}function P(e,t,r,n,i,o){if(!u.isBuffer(e))throw new TypeError('"buffer" argument must be a Buffer instance');if(t>i||t<o)throw new RangeError('"value" argument is out of bounds');if(r+n>e.length)throw new RangeError("Index out of range")}function M(e,t,r,n){t<0&&(t=65535+t+1);for(var i=0,o=Math.min(e.length-r,2);i<o;++i)e[r+i]=(t&255<<8*(n?i:1-i))>>>8*(n?i:1-i);}function D(e,t,r,n){t<0&&(t=4294967295+t+1);for(var i=0,o=Math.min(e.length-r,4);i<o;++i)e[r+i]=t>>>8*(n?i:3-i)&255;}function L(e,t,r,n,i,o){if(r+n>e.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function U(e,t,r,n,o){return o||L(e,0,r,4),i.write(e,t,r,n,23,4),r+4}function j(e,t,r,n,o){return o||L(e,0,r,8),i.write(e,t,r,n,52,8),r+8}u.prototype.slice=function(e,t){var r,n=this.length;if((e=~~e)<0?(e+=n)<0&&(e=0):e>n&&(e=n),(t=void 0===t?n:~~t)<0?(t+=n)<0&&(t=0):t>n&&(t=n),t<e&&(t=e),u.TYPED_ARRAY_SUPPORT)(r=this.subarray(e,t)).__proto__=u.prototype;else {var i=t-e;r=new u(i,void 0);for(var o=0;o<i;++o)r[o]=this[o+e];}return r},u.prototype.readUIntLE=function(e,t,r){e|=0,t|=0,r||I(e,t,this.length);for(var n=this[e],i=1,o=0;++o<t&&(i*=256);)n+=this[e+o]*i;return n},u.prototype.readUIntBE=function(e,t,r){e|=0,t|=0,r||I(e,t,this.length);for(var n=this[e+--t],i=1;t>0&&(i*=256);)n+=this[e+--t]*i;return n},u.prototype.readUInt8=function(e,t){return t||I(e,1,this.length),this[e]},u.prototype.readUInt16LE=function(e,t){return t||I(e,2,this.length),this[e]|this[e+1]<<8},u.prototype.readUInt16BE=function(e,t){return t||I(e,2,this.length),this[e]<<8|this[e+1]},u.prototype.readUInt32LE=function(e,t){return t||I(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+16777216*this[e+3]},u.prototype.readUInt32BE=function(e,t){return t||I(e,4,this.length),16777216*this[e]+(this[e+1]<<16|this[e+2]<<8|this[e+3])},u.prototype.readIntLE=function(e,t,r){e|=0,t|=0,r||I(e,t,this.length);for(var n=this[e],i=1,o=0;++o<t&&(i*=256);)n+=this[e+o]*i;return n>=(i*=128)&&(n-=Math.pow(2,8*t)),n},u.prototype.readIntBE=function(e,t,r){e|=0,t|=0,r||I(e,t,this.length);for(var n=t,i=1,o=this[e+--n];n>0&&(i*=256);)o+=this[e+--n]*i;return o>=(i*=128)&&(o-=Math.pow(2,8*t)),o},u.prototype.readInt8=function(e,t){return t||I(e,1,this.length),128&this[e]?-1*(255-this[e]+1):this[e]},u.prototype.readInt16LE=function(e,t){t||I(e,2,this.length);var r=this[e]|this[e+1]<<8;return 32768&r?4294901760|r:r},u.prototype.readInt16BE=function(e,t){t||I(e,2,this.length);var r=this[e+1]|this[e]<<8;return 32768&r?4294901760|r:r},u.prototype.readInt32LE=function(e,t){return t||I(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},u.prototype.readInt32BE=function(e,t){return t||I(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},u.prototype.readFloatLE=function(e,t){return t||I(e,4,this.length),i.read(this,e,!0,23,4)},u.prototype.readFloatBE=function(e,t){return t||I(e,4,this.length),i.read(this,e,!1,23,4)},u.prototype.readDoubleLE=function(e,t){return t||I(e,8,this.length),i.read(this,e,!0,52,8)},u.prototype.readDoubleBE=function(e,t){return t||I(e,8,this.length),i.read(this,e,!1,52,8)},u.prototype.writeUIntLE=function(e,t,r,n){(e=+e,t|=0,r|=0,n)||P(this,e,t,r,Math.pow(2,8*r)-1,0);var i=1,o=0;for(this[t]=255&e;++o<r&&(i*=256);)this[t+o]=e/i&255;return t+r},u.prototype.writeUIntBE=function(e,t,r,n){(e=+e,t|=0,r|=0,n)||P(this,e,t,r,Math.pow(2,8*r)-1,0);var i=r-1,o=1;for(this[t+i]=255&e;--i>=0&&(o*=256);)this[t+i]=e/o&255;return t+r},u.prototype.writeUInt8=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,1,255,0),u.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),this[t]=255&e,t+1},u.prototype.writeUInt16LE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[t]=255&e,this[t+1]=e>>>8):M(this,e,t,!0),t+2},u.prototype.writeUInt16BE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[t]=e>>>8,this[t+1]=255&e):M(this,e,t,!1),t+2},u.prototype.writeUInt32LE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=255&e):D(this,e,t,!0),t+4},u.prototype.writeUInt32BE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e):D(this,e,t,!1),t+4},u.prototype.writeIntLE=function(e,t,r,n){if(e=+e,t|=0,!n){var i=Math.pow(2,8*r-1);P(this,e,t,r,i-1,-i);}var o=0,s=1,a=0;for(this[t]=255&e;++o<r&&(s*=256);)e<0&&0===a&&0!==this[t+o-1]&&(a=1),this[t+o]=(e/s>>0)-a&255;return t+r},u.prototype.writeIntBE=function(e,t,r,n){if(e=+e,t|=0,!n){var i=Math.pow(2,8*r-1);P(this,e,t,r,i-1,-i);}var o=r-1,s=1,a=0;for(this[t+o]=255&e;--o>=0&&(s*=256);)e<0&&0===a&&0!==this[t+o+1]&&(a=1),this[t+o]=(e/s>>0)-a&255;return t+r},u.prototype.writeInt8=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,1,127,-128),u.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),e<0&&(e=255+e+1),this[t]=255&e,t+1},u.prototype.writeInt16LE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[t]=255&e,this[t+1]=e>>>8):M(this,e,t,!0),t+2},u.prototype.writeInt16BE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[t]=e>>>8,this[t+1]=255&e):M(this,e,t,!1),t+2},u.prototype.writeInt32LE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,4,2147483647,-2147483648),u.TYPED_ARRAY_SUPPORT?(this[t]=255&e,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24):D(this,e,t,!0),t+4},u.prototype.writeInt32BE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,4,2147483647,-2147483648),e<0&&(e=4294967295+e+1),u.TYPED_ARRAY_SUPPORT?(this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e):D(this,e,t,!1),t+4},u.prototype.writeFloatLE=function(e,t,r){return U(this,e,t,!0,r)},u.prototype.writeFloatBE=function(e,t,r){return U(this,e,t,!1,r)},u.prototype.writeDoubleLE=function(e,t,r){return j(this,e,t,!0,r)},u.prototype.writeDoubleBE=function(e,t,r){return j(this,e,t,!1,r)},u.prototype.copy=function(e,t,r,n){if(r||(r=0),n||0===n||(n=this.length),t>=e.length&&(t=e.length),t||(t=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===e.length||0===this.length)return 0;if(t<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),e.length-t<n-r&&(n=e.length-t+r);var i,o=n-r;if(this===e&&r<t&&t<n)for(i=o-1;i>=0;--i)e[i+t]=this[i+r];else if(o<1e3||!u.TYPED_ARRAY_SUPPORT)for(i=0;i<o;++i)e[i+t]=this[i+r];else Uint8Array.prototype.set.call(e,this.subarray(r,r+o),t);return o},u.prototype.fill=function(e,t,r,n){if("string"==typeof e){if("string"==typeof t?(n=t,t=0,r=this.length):"string"==typeof r&&(n=r,r=this.length),1===e.length){var i=e.charCodeAt(0);i<256&&(e=i);}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else "number"==typeof e&&(e&=255);if(t<0||this.length<t||this.length<r)throw new RangeError("Out of range index");if(r<=t)return this;var o;if(t>>>=0,r=void 0===r?this.length:r>>>0,e||(e=0),"number"==typeof e)for(o=t;o<r;++o)this[o]=e;else {var s=u.isBuffer(e)?e:N(new u(e,n).toString()),a=s.length;for(o=0;o<r-t;++o)this[o+t]=s[o%a];}return this};var F=/[^+\/0-9A-Za-z-_]/g;function B(e){return e<16?"0"+e.toString(16):e.toString(16)}function N(e,t){var r;t=t||1/0;for(var n=e.length,i=null,o=[],s=0;s<n;++s){if((r=e.charCodeAt(s))>55295&&r<57344){if(!i){if(r>56319){(t-=3)>-1&&o.push(239,191,189);continue}if(s+1===n){(t-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(t-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320);}else i&&(t-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((t-=1)<0)break;o.push(r);}else if(r<2048){if((t-=2)<0)break;o.push(r>>6|192,63&r|128);}else if(r<65536){if((t-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128);}else {if(!(r<1114112))throw new Error("Invalid code point");if((t-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128);}}return o}function G(e){return n.toByteArray(function(e){if((e=function(e){return e.trim?e.trim():e.replace(/^\s+|\s+$/g,"")}(e).replace(F,"")).length<2)return "";for(;e.length%4!=0;)e+="=";return e}(e))}function q(e,t,r,n){for(var i=0;i<n&&!(i+r>=t.length||i>=e.length);++i)t[i+r]=e[i];return i}}).call(this,r(1));},function(e,t){var r,n,i=e.exports={};function o(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function a(e){if(r===setTimeout)return setTimeout(e,0);if((r===o||!r)&&setTimeout)return r=setTimeout,setTimeout(e,0);try{return r(e,0)}catch(t){try{return r.call(null,e,0)}catch(t){return r.call(this,e,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:o;}catch(e){r=o;}try{n="function"==typeof clearTimeout?clearTimeout:s;}catch(e){n=s;}}();var u,c=[],l=!1,f=-1;function h(){l&&u&&(l=!1,u.length?c=u.concat(c):f=-1,c.length&&d());}function d(){if(!l){var e=a(h);l=!0;for(var t=c.length;t;){for(u=c,c=[];++f<t;)u&&u[f].run();f=-1,t=c.length;}u=null,l=!1,function(e){if(n===clearTimeout)return clearTimeout(e);if((n===s||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(e);try{n(e);}catch(t){try{return n.call(null,e)}catch(t){return n.call(this,e)}}}(e);}}function p(e,t){this.fun=e,this.array=t;}function g(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];c.push(new p(e,t)),1!==c.length||l||a(d);},p.prototype.run=function(){this.fun.apply(null,this.array);},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=g,i.addListener=g,i.once=g,i.off=g,i.removeListener=g,i.removeAllListeners=g,i.emit=g,i.prependListener=g,i.prependOnceListener=g,i.listeners=function(e){return []},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return "/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0};},function(e,t){"function"==typeof Object.create?e.exports=function(e,t){t&&(e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}));}:e.exports=function(e,t){if(t){e.super_=t;var r=function(){};r.prototype=t.prototype,e.prototype=new r,e.prototype.constructor=e;}};},function(e,t,r){(function(n){t.formatArgs=function(t){if(t[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+t[0]+(this.useColors?"%c ":" ")+"+"+e.exports.humanize(this.diff),!this.useColors)return;const r="color: "+this.color;t.splice(1,0,r,"color: inherit");let n=0,i=0;t[0].replace(/%[a-zA-Z%]/g,e=>{"%%"!==e&&(n++,"%c"===e&&(i=n));}),t.splice(i,0,r);},t.save=function(e){try{e?t.storage.setItem("debug",e):t.storage.removeItem("debug");}catch(e){}},t.load=function(){let e;try{e=t.storage.getItem("debug");}catch(e){}!e&&void 0!==n&&"env"in n&&(e=n.env.DEBUG);return e},t.useColors=function(){if("undefined"!=typeof window&&window.process&&("renderer"===window.process.type||window.process.__nwjs))return !0;if("undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))return !1;return "undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)},t.storage=function(){try{return localStorage}catch(e){}}(),t.destroy=(()=>{let e=!1;return ()=>{e||(e=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));}})(),t.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],t.log=console.debug||console.log||(()=>{}),e.exports=r(71)(t);const{formatters:i}=e.exports;i.j=function(e){try{return JSON.stringify(e)}catch(e){return "[UnexpectedJSONParseError]: "+e.message}};}).call(this,r(3));},function(e,t,r){r.d(t,"a",(function(){return o})),r.d(t,"b",(function(){return s}));const n={deserialize:e=>Object.assign(Error(e.message),{name:e.name,stack:e.stack}),serialize:e=>({__error_marker:"$$error",message:e.message,name:e.name,stack:e.stack})};let i={deserialize(e){return (t=e)&&"object"==typeof t&&"__error_marker"in t&&"$$error"===t.__error_marker?n.deserialize(e):e;var t;},serialize:e=>e instanceof Error?n.serialize(e):e};function o(e){return i.deserialize(e)}function s(e){return i.serialize(e)}},function(e,t,r){var n=r(15),i=Object.keys||function(e){var t=[];for(var r in e)t.push(r);return t};e.exports=f;var o=Object.create(r(10));o.inherits=r(4);var s=r(26),a=r(30);o.inherits(f,s);for(var u=i(a.prototype),c=0;c<u.length;c++){var l=u[c];f.prototype[l]||(f.prototype[l]=a.prototype[l]);}function f(e){if(!(this instanceof f))return new f(e);s.call(this,e),a.call(this,e),e&&!1===e.readable&&(this.readable=!1),e&&!1===e.writable&&(this.writable=!1),this.allowHalfOpen=!0,e&&!1===e.allowHalfOpen&&(this.allowHalfOpen=!1),this.once("end",h);}function h(){this.allowHalfOpen||this._writableState.ended||n.nextTick(d,this);}function d(e){e.end();}Object.defineProperty(f.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(f.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed&&this._writableState.destroyed)},set:function(e){void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed=e,this._writableState.destroyed=e);}}),f.prototype._destroy=function(e,t){this.push(null),this.end(),n.nextTick(t,e);};},function(e,t,r){let n;function i(){return n||(n=function(){try{throw new Error}catch(e){const t=(""+e.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);if(t)return (""+t[0]).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)?\/[^/]+(?:\?.*)?$/,"$1")+"/"}return "/"}()),n}r.d(t,"a",(function(){return o})),r.d(t,"b",(function(){return c}));const o="undefined"!=typeof navigator&&navigator.hardwareConcurrency?navigator.hardwareConcurrency:4,s=e=>/^(file|https?:)?\/\//i.test(e);function a(e){const t=new Blob([e],{type:"application/javascript"});return URL.createObjectURL(t)}let u;function c(){return u||(u=function(){if("undefined"==typeof Worker)return class{constructor(){throw Error("No web worker implementation available. You might have tried to spawn a worker within a worker in a browser that doesn't support workers in workers.")}};class e extends Worker{constructor(e,t){"string"==typeof e&&t&&t._baseURL?e=new URL(e,t._baseURL):"string"==typeof e&&!s(e)&&i().match(/^file:\/\//i)&&(e=new URL(e,i().replace(/\/[^\/]+$/,"/")),e=a(`importScripts(${JSON.stringify(e)});`)),"string"==typeof e&&s(e)&&(e=a(`importScripts(${JSON.stringify(e)});`)),super(e,t);}}class t extends e{constructor(e,t){super(window.URL.createObjectURL(e),t);}static fromText(e,r){const n=new window.Blob([e],{type:"text/javascript"});return new t(n,r)}}return {blob:t,default:e}}()),u}},function(e,t,r){var n,i;r.d(t,"a",(function(){return n})),r.d(t,"b",(function(){return i})),function(e){e.cancel="cancel",e.run="run";}(n||(n={})),function(e){e.error="error",e.init="init",e.result="result",e.running="running",e.uncaughtError="uncaughtError";}(i||(i={}));},function(e,t,r){(function(e){function r(e){return Object.prototype.toString.call(e)}t.isArray=function(e){return Array.isArray?Array.isArray(e):"[object Array]"===r(e)},t.isBoolean=function(e){return "boolean"==typeof e},t.isNull=function(e){return null===e},t.isNullOrUndefined=function(e){return null==e},t.isNumber=function(e){return "number"==typeof e},t.isString=function(e){return "string"==typeof e},t.isSymbol=function(e){return "symbol"==typeof e},t.isUndefined=function(e){return void 0===e},t.isRegExp=function(e){return "[object RegExp]"===r(e)},t.isObject=function(e){return "object"==typeof e&&null!==e},t.isDate=function(e){return "[object Date]"===r(e)},t.isError=function(e){return "[object Error]"===r(e)||e instanceof Error},t.isFunction=function(e){return "function"==typeof e},t.isPrimitive=function(e){return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||void 0===e},t.isBuffer=e.isBuffer;}).call(this,r(2).Buffer);},function(e,t,r){r.d(t,"a",(function(){return o}));var n=r(0);function i(e){throw Error(e)}const o={errors:e=>e[n.a]||i("Error observable not found. Make sure to pass a thread instance as returned by the spawn() promise."),events:e=>e[n.b]||i("Events observable not found. Make sure to pass a thread instance as returned by the spawn() promise."),terminate:e=>e[n.c]()};},function(e,t){},function(e,t,r){const n=()=>"function"==typeof Symbol,i=e=>n()&&Boolean(Symbol[e]),o=e=>i(e)?Symbol[e]:"@@"+e;i("asyncIterator")||(Symbol.asyncIterator=Symbol.asyncIterator||Symbol.for("Symbol.asyncIterator"));const s=o("iterator"),a=o("observable"),u=o("species");function c(e,t){const r=e[t];if(null!=r){if("function"!=typeof r)throw new TypeError(r+" is not a function");return r}}function l(e){let t=e.constructor;return void 0!==t&&(t=t[u],null===t&&(t=void 0)),void 0!==t?t:w}function f(e){f.log?f.log(e):setTimeout(()=>{throw e},0);}function h(e){Promise.resolve().then(()=>{try{e();}catch(e){f(e);}});}function d(e){const t=e._cleanup;if(void 0!==t&&(e._cleanup=void 0,t))try{if("function"==typeof t)t();else {const e=c(t,"unsubscribe");e&&e.call(t);}}catch(e){f(e);}}function p(e){e._observer=void 0,e._queue=void 0,e._state="closed";}function g(e,t,r){e._state="running";const n=e._observer;try{const i=n?c(n,t):void 0;switch(t){case"next":i&&i.call(n,r);break;case"error":if(p(e),!i)throw r;i.call(n,r);break;case"complete":p(e),i&&i.call(n);}}catch(e){f(e);}"closed"===e._state?d(e):"running"===e._state&&(e._state="ready");}function m(e,t,r){if("closed"!==e._state)return "buffering"===e._state?(e._queue=e._queue||[],void e._queue.push({type:t,value:r})):"ready"!==e._state?(e._state="buffering",e._queue=[{type:t,value:r}],void h(()=>function(e){const t=e._queue;if(t){e._queue=void 0,e._state="ready";for(const r of t)if(g(e,r.type,r.value),"closed"===e._state)break}}(e))):void g(e,t,r)}class y{constructor(e,t){this._cleanup=void 0,this._observer=e,this._queue=void 0,this._state="initializing";const r=new b(this);try{this._cleanup=t.call(void 0,r);}catch(e){r.error(e);}"initializing"===this._state&&(this._state="ready");}get closed(){return "closed"===this._state}unsubscribe(){"closed"!==this._state&&(p(this),d(this));}}class b{constructor(e){this._subscription=e;}get closed(){return "closed"===this._subscription._state}next(e){m(this._subscription,"next",e);}error(e){m(this._subscription,"error",e);}complete(){m(this._subscription,"complete");}}class w{constructor(e){if(!(this instanceof w))throw new TypeError("Observable cannot be called as a function");if("function"!=typeof e)throw new TypeError("Observable initializer must be a function");this._subscriber=e;}subscribe(e,t,r){return "object"==typeof e&&null!==e||(e={next:e,error:t,complete:r}),new y(e,this._subscriber)}pipe(e,...t){let r=this;for(const n of [e,...t])r=n(r);return r}tap(e,t,r){const n="object"!=typeof e||null===e?{next:e,error:t,complete:r}:e;return new w(e=>this.subscribe({next(t){n.next&&n.next(t),e.next(t);},error(t){n.error&&n.error(t),e.error(t);},complete(){n.complete&&n.complete(),e.complete();},start(e){n.start&&n.start(e);}}))}forEach(e){return new Promise((t,r)=>{if("function"!=typeof e)return void r(new TypeError(e+" is not a function"));function n(){i.unsubscribe(),t();}const i=this.subscribe({next(t){try{e(t,n);}catch(e){r(e),i.unsubscribe();}},error:r,complete:t});})}map(e){if("function"!=typeof e)throw new TypeError(e+" is not a function");return new(l(this))(t=>this.subscribe({next(r){let n=r;try{n=e(r);}catch(e){return t.error(e)}t.next(n);},error(e){t.error(e);},complete(){t.complete();}}))}filter(e){if("function"!=typeof e)throw new TypeError(e+" is not a function");return new(l(this))(t=>this.subscribe({next(r){try{if(!e(r))return}catch(e){return t.error(e)}t.next(r);},error(e){t.error(e);},complete(){t.complete();}}))}reduce(e,t){if("function"!=typeof e)throw new TypeError(e+" is not a function");const r=l(this),n=arguments.length>1;let i=!1,o=t;return new r(t=>this.subscribe({next(r){const s=!i;if(i=!0,!s||n)try{o=e(o,r);}catch(e){return t.error(e)}else o=r;},error(e){t.error(e);},complete(){if(!i&&!n)return t.error(new TypeError("Cannot reduce an empty sequence"));t.next(o),t.complete();}}))}concat(...e){const t=l(this);return new t(r=>{let n,i=0;return function o(s){n=s.subscribe({next(e){r.next(e);},error(e){r.error(e);},complete(){i===e.length?(n=void 0,r.complete()):o(t.from(e[i++]));}});}(this),()=>{n&&(n.unsubscribe(),n=void 0);}})}flatMap(e){if("function"!=typeof e)throw new TypeError(e+" is not a function");const t=l(this);return new t(r=>{const n=[],i=this.subscribe({next(i){let s;if(e)try{s=e(i);}catch(e){return r.error(e)}else s=i;const a=t.from(s).subscribe({next(e){r.next(e);},error(e){r.error(e);},complete(){const e=n.indexOf(a);e>=0&&n.splice(e,1),o();}});n.push(a);},error(e){r.error(e);},complete(){o();}});function o(){i.closed&&0===n.length&&r.complete();}return ()=>{n.forEach(e=>e.unsubscribe()),i.unsubscribe();}})}[a](){return this}static from(e){const t="function"==typeof this?this:w;if(null==e)throw new TypeError(e+" is not an object");const r=c(e,a);if(r){const n=r.call(e);if(Object(n)!==n)throw new TypeError(n+" is not an object");return function(e){return e instanceof w}(n)&&n.constructor===t?n:new t(e=>n.subscribe(e))}if(i("iterator")){const r=c(e,s);if(r)return new t(t=>{h(()=>{if(!t.closed){for(const n of r.call(e))if(t.next(n),t.closed)return;t.complete();}});})}if(Array.isArray(e))return new t(t=>{h(()=>{if(!t.closed){for(const r of e)if(t.next(r),t.closed)return;t.complete();}});});throw new TypeError(e+" is not observable")}static of(...e){return new("function"==typeof this?this:w)(t=>{h(()=>{if(!t.closed){for(const r of e)if(t.next(r),t.closed)return;t.complete();}});})}static get[u](){return this}}n()&&Object.defineProperty(w,Symbol("extensions"),{value:{symbol:a,hostReportError:f},configurable:!0});t.a=w;},function(e,t,r){var n;r.d(t,"a",(function(){return n})),function(e){e.internalError="internalError",e.message="message",e.termination="termination";}(n||(n={}));},function(e,t,r){(function(t){void 0===t||!t.version||0===t.version.indexOf("v0.")||0===t.version.indexOf("v1.")&&0!==t.version.indexOf("v1.8.")?e.exports={nextTick:function(e,r,n,i){if("function"!=typeof e)throw new TypeError('"callback" argument must be a function');var o,s,a=arguments.length;switch(a){case 0:case 1:return t.nextTick(e);case 2:return t.nextTick((function(){e.call(null,r);}));case 3:return t.nextTick((function(){e.call(null,r,n);}));case 4:return t.nextTick((function(){e.call(null,r,n,i);}));default:for(o=new Array(a-1),s=0;s<o.length;)o[s++]=arguments[s];return t.nextTick((function(){e.apply(null,o);}))}}}:e.exports=t;}).call(this,r(3));},function(e,t,r){var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;function i(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)i(r,n)&&(e[n]=r[n]);}}return e},t.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var o={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var o=0;o<n;o++)e[i+o]=t[r+o];},flattenChunks:function(e){var t,r,n,i,o,s;for(n=0,t=0,r=e.length;t<r;t++)n+=e[t].length;for(s=new Uint8Array(n),i=0,t=0,r=e.length;t<r;t++)o=e[t],s.set(o,i),i+=o.length;return s}},s={arraySet:function(e,t,r,n,i){for(var o=0;o<n;o++)e[i+o]=t[r+o];},flattenChunks:function(e){return [].concat.apply([],e)}};t.setTyped=function(e){e?(t.Buf8=Uint8Array,t.Buf16=Uint16Array,t.Buf32=Int32Array,t.assign(t,o)):(t.Buf8=Array,t.Buf16=Array,t.Buf32=Array,t.assign(t,s));},t.setTyped(n);},function(e,t,r){var n=r(77),i=r(79);function o(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null;}t.parse=w,t.resolve=function(e,t){return w(e,!1,!0).resolve(t)},t.resolveObject=function(e,t){return e?w(e,!1,!0).resolveObject(t):t},t.format=function(e){i.isString(e)&&(e=w(e));return e instanceof o?e.format():o.prototype.format.call(e)},t.Url=o;var s=/^([a-z0-9.+-]+:)/i,a=/:[0-9]*$/,u=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,c=["{","}","|","\\","^","`"].concat(["<",">",'"',"`"," ","\r","\n","\t"]),l=["'"].concat(c),f=["%","/","?",";","#"].concat(l),h=["/","?","#"],d=/^[+a-z0-9A-Z_-]{0,63}$/,p=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,g={javascript:!0,"javascript:":!0},m={javascript:!0,"javascript:":!0},y={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},b=r(80);function w(e,t,r){if(e&&i.isObject(e)&&e instanceof o)return e;var n=new o;return n.parse(e,t,r),n}o.prototype.parse=function(e,t,r){if(!i.isString(e))throw new TypeError("Parameter 'url' must be a string, not "+typeof e);var o=e.indexOf("?"),a=-1!==o&&o<e.indexOf("#")?"?":"#",c=e.split(a);c[0]=c[0].replace(/\\/g,"/");var w=e=c.join(a);if(w=w.trim(),!r&&1===e.split("#").length){var v=u.exec(w);if(v)return this.path=w,this.href=w,this.pathname=v[1],v[2]?(this.search=v[2],this.query=t?b.parse(this.search.substr(1)):this.search.substr(1)):t&&(this.search="",this.query={}),this}var _=s.exec(w);if(_){var k=(_=_[0]).toLowerCase();this.protocol=k,w=w.substr(_.length);}if(r||_||w.match(/^\/\/[^@\/]+@[^@\/]+/)){var S="//"===w.substr(0,2);!S||_&&m[_]||(w=w.substr(2),this.slashes=!0);}if(!m[_]&&(S||_&&!y[_])){for(var T,x,E=-1,C=0;C<h.length;C++){-1!==(A=w.indexOf(h[C]))&&(-1===E||A<E)&&(E=A);}-1!==(x=-1===E?w.lastIndexOf("@"):w.lastIndexOf("@",E))&&(T=w.slice(0,x),w=w.slice(x+1),this.auth=decodeURIComponent(T)),E=-1;for(C=0;C<f.length;C++){var A;-1!==(A=w.indexOf(f[C]))&&(-1===E||A<E)&&(E=A);}-1===E&&(E=w.length),this.host=w.slice(0,E),w=w.slice(E),this.parseHost(),this.hostname=this.hostname||"";var O="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!O)for(var R=this.hostname.split(/\./),I=(C=0,R.length);C<I;C++){var P=R[C];if(P&&!P.match(d)){for(var M="",D=0,L=P.length;D<L;D++)P.charCodeAt(D)>127?M+="x":M+=P[D];if(!M.match(d)){var U=R.slice(0,C),j=R.slice(C+1),F=P.match(p);F&&(U.push(F[1]),j.unshift(F[2])),j.length&&(w="/"+j.join(".")+w),this.hostname=U.join(".");break}}}this.hostname.length>255?this.hostname="":this.hostname=this.hostname.toLowerCase(),O||(this.hostname=n.toASCII(this.hostname));var B=this.port?":"+this.port:"",N=this.hostname||"";this.host=N+B,this.href+=this.host,O&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==w[0]&&(w="/"+w));}if(!g[k])for(C=0,I=l.length;C<I;C++){var G=l[C];if(-1!==w.indexOf(G)){var q=encodeURIComponent(G);q===G&&(q=escape(G)),w=w.split(G).join(q);}}var H=w.indexOf("#");-1!==H&&(this.hash=w.substr(H),w=w.slice(0,H));var z=w.indexOf("?");if(-1!==z?(this.search=w.substr(z),this.query=w.substr(z+1),t&&(this.query=b.parse(this.query)),w=w.slice(0,z)):t&&(this.search="",this.query={}),w&&(this.pathname=w),y[k]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){B=this.pathname||"";var K=this.search||"";this.path=B+K;}return this.href=this.format(),this},o.prototype.format=function(){var e=this.auth||"";e&&(e=(e=encodeURIComponent(e)).replace(/%3A/i,":"),e+="@");var t=this.protocol||"",r=this.pathname||"",n=this.hash||"",o=!1,s="";this.host?o=e+this.host:this.hostname&&(o=e+(-1===this.hostname.indexOf(":")?this.hostname:"["+this.hostname+"]"),this.port&&(o+=":"+this.port)),this.query&&i.isObject(this.query)&&Object.keys(this.query).length&&(s=b.stringify(this.query));var a=this.search||s&&"?"+s||"";return t&&":"!==t.substr(-1)&&(t+=":"),this.slashes||(!t||y[t])&&!1!==o?(o="//"+(o||""),r&&"/"!==r.charAt(0)&&(r="/"+r)):o||(o=""),n&&"#"!==n.charAt(0)&&(n="#"+n),a&&"?"!==a.charAt(0)&&(a="?"+a),t+o+(r=r.replace(/[?#]/g,(function(e){return encodeURIComponent(e)})))+(a=a.replace("#","%23"))+n},o.prototype.resolve=function(e){return this.resolveObject(w(e,!1,!0)).format()},o.prototype.resolveObject=function(e){if(i.isString(e)){var t=new o;t.parse(e,!1,!0),e=t;}for(var r=new o,n=Object.keys(this),s=0;s<n.length;s++){var a=n[s];r[a]=this[a];}if(r.hash=e.hash,""===e.href)return r.href=r.format(),r;if(e.slashes&&!e.protocol){for(var u=Object.keys(e),c=0;c<u.length;c++){var l=u[c];"protocol"!==l&&(r[l]=e[l]);}return y[r.protocol]&&r.hostname&&!r.pathname&&(r.path=r.pathname="/"),r.href=r.format(),r}if(e.protocol&&e.protocol!==r.protocol){if(!y[e.protocol]){for(var f=Object.keys(e),h=0;h<f.length;h++){var d=f[h];r[d]=e[d];}return r.href=r.format(),r}if(r.protocol=e.protocol,e.host||m[e.protocol])r.pathname=e.pathname;else {for(var p=(e.pathname||"").split("/");p.length&&!(e.host=p.shift()););e.host||(e.host=""),e.hostname||(e.hostname=""),""!==p[0]&&p.unshift(""),p.length<2&&p.unshift(""),r.pathname=p.join("/");}if(r.search=e.search,r.query=e.query,r.host=e.host||"",r.auth=e.auth,r.hostname=e.hostname||e.host,r.port=e.port,r.pathname||r.search){var g=r.pathname||"",b=r.search||"";r.path=g+b;}return r.slashes=r.slashes||e.slashes,r.href=r.format(),r}var w=r.pathname&&"/"===r.pathname.charAt(0),v=e.host||e.pathname&&"/"===e.pathname.charAt(0),_=v||w||r.host&&e.pathname,k=_,S=r.pathname&&r.pathname.split("/")||[],T=(p=e.pathname&&e.pathname.split("/")||[],r.protocol&&!y[r.protocol]);if(T&&(r.hostname="",r.port=null,r.host&&(""===S[0]?S[0]=r.host:S.unshift(r.host)),r.host="",e.protocol&&(e.hostname=null,e.port=null,e.host&&(""===p[0]?p[0]=e.host:p.unshift(e.host)),e.host=null),_=_&&(""===p[0]||""===S[0])),v)r.host=e.host||""===e.host?e.host:r.host,r.hostname=e.hostname||""===e.hostname?e.hostname:r.hostname,r.search=e.search,r.query=e.query,S=p;else if(p.length)S||(S=[]),S.pop(),S=S.concat(p),r.search=e.search,r.query=e.query;else if(!i.isNullOrUndefined(e.search)){if(T)r.hostname=r.host=S.shift(),(O=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=O.shift(),r.host=r.hostname=O.shift());return r.search=e.search,r.query=e.query,i.isNull(r.pathname)&&i.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.href=r.format(),r}if(!S.length)return r.pathname=null,r.search?r.path="/"+r.search:r.path=null,r.href=r.format(),r;for(var x=S.slice(-1)[0],E=(r.host||e.host||S.length>1)&&("."===x||".."===x)||""===x,C=0,A=S.length;A>=0;A--)"."===(x=S[A])?S.splice(A,1):".."===x?(S.splice(A,1),C++):C&&(S.splice(A,1),C--);if(!_&&!k)for(;C--;C)S.unshift("..");!_||""===S[0]||S[0]&&"/"===S[0].charAt(0)||S.unshift(""),E&&"/"!==S.join("/").substr(-1)&&S.push("");var O,R=""===S[0]||S[0]&&"/"===S[0].charAt(0);T&&(r.hostname=r.host=R?"":S.length?S.shift():"",(O=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=O.shift(),r.host=r.hostname=O.shift()));return (_=_||r.host&&S.length)&&!R&&S.unshift(""),S.length?r.pathname=S.join("/"):(r.pathname=null,r.path=null),i.isNull(r.pathname)&&i.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.auth=e.auth||r.auth,r.slashes=r.slashes||e.slashes,r.href=r.format(),r},o.prototype.parseHost=function(){var e=this.host,t=a.exec(e);t&&(":"!==(t=t[0])&&(this.port=t.substr(1)),e=e.substr(0,e.length-t.length)),e&&(this.hostname=e);};},function(e,t,r){(function(e){var n=r(73),i=r(35),o=r(75),s=r(76),a=r(17),u=t;u.request=function(t,r){t="string"==typeof t?a.parse(t):o(t);var i=-1===e.location.protocol.search(/^https?:$/)?"http:":"",s=t.protocol||i,u=t.hostname||t.host,c=t.port,l=t.path||"/";u&&-1!==u.indexOf(":")&&(u="["+u+"]"),t.url=(u?s+"//"+u:"")+(c?":"+c:"")+l,t.method=(t.method||"GET").toUpperCase(),t.headers=t.headers||{};var f=new n(t);return r&&f.on("response",r),f},u.get=function(e,t){var r=u.request(e,t);return r.end(),r},u.ClientRequest=n,u.IncomingMessage=i.IncomingMessage,u.Agent=function(){},u.Agent.defaultMaxSockets=4,u.globalAgent=new u.Agent,u.STATUS_CODES=s,u.METHODS=["CHECKOUT","CONNECT","COPY","DELETE","GET","HEAD","LOCK","M-SEARCH","MERGE","MKACTIVITY","MKCOL","MOVE","NOTIFY","OPTIONS","PATCH","POST","PROPFIND","PROPPATCH","PURGE","PUT","REPORT","SEARCH","SUBSCRIBE","TRACE","UNLOCK","UNSUBSCRIBE"];}).call(this,r(1));},,function(e,t,r){(t=e.exports=r(26)).Stream=t,t.Readable=t,t.Writable=r(30),t.Duplex=r(7),t.Transform=r(32),t.PassThrough=r(59);},function(e,t,r){var n=r(2),i=n.Buffer;function o(e,t){for(var r in e)t[r]=e[r];}function s(e,t,r){return i(e,t,r)}i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow?e.exports=n:(o(n,t),t.Buffer=s),o(i,s),s.from=function(e,t,r){if("number"==typeof e)throw new TypeError("Argument must not be a number");return i(e,t,r)},s.alloc=function(e,t,r){if("number"!=typeof e)throw new TypeError("Argument must be a number");var n=i(e);return void 0!==t?"string"==typeof r?n.fill(t,r):n.fill(t):n.fill(0),n},s.allocUnsafe=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return i(e)},s.allocUnsafeSlow=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return n.SlowBuffer(e)};},function(e,t,r){(function(e){r.d(t,"a",(function(){return y}));var n=r(5),i=r.n(n),o=r(13),s=r(6),a=r(41),u=r(0),c=r(14),l=r(24),f=function(e,t,r,n){return new(r||(r=Promise))((function(i,o){function s(e){try{u(n.next(e));}catch(e){o(e);}}function a(e){try{u(n.throw(e));}catch(e){o(e);}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t);}))).then(s,a);}u((n=n.apply(e,t||[])).next());}))};const h=i()("threads:master:messages"),d=i()("threads:master:spawn"),p=i()("threads:master:thread-utils"),g=void 0!==e&&e.env.THREADS_WORKER_INIT_TIMEOUT?Number.parseInt(e.env.THREADS_WORKER_INIT_TIMEOUT,10):1e4;function m(e,t,r,n){const i=r.filter(e=>e.type===c.a.internalError).map(e=>e.error);return Object.assign(e,{[u.a]:i,[u.b]:r,[u.c]:n,[u.e]:t})}function y(e,t){return f(this,void 0,void 0,(function*(){d("Initializing new thread");const r=(yield function(e,t,r){return f(this,void 0,void 0,(function*(){let n;const i=new Promise((e,i)=>{n=setTimeout(()=>i(Error(r)),t);}),o=yield Promise.race([e,i]);return clearTimeout(n),o}))}(function(e){return new Promise((t,r)=>{const n=i=>{var o;h("Message from worker before finishing initialization:",i.data),(o=i.data)&&"init"===o.type?(e.removeEventListener("message",n),t(i.data)):(e=>e&&"uncaughtError"===e.type)(i.data)&&(e.removeEventListener("message",n),r(Object(s.a)(i.data.error)));};e.addEventListener("message",n);})}(e),t&&t.timeout?t.timeout:g,`Timeout: Did not receive an init message from worker after ${g}ms. Make sure the worker calls expose().`)).exposed,{termination:n,terminate:i}=function(e){const[t,r]=Object(a.a)();return {terminate:()=>f(this,void 0,void 0,(function*(){p("Terminating worker"),yield e.terminate(),r();})),termination:t}}(e),u=function(e,t){return new o.a(r=>{const n=e=>{const t={type:c.a.message,data:e.data};r.next(t);},i=e=>{p("Unhandled promise rejection event in thread:",e);const t={type:c.a.internalError,error:Error(e.reason)};r.next(t);};e.addEventListener("message",n),e.addEventListener("unhandledrejection",i),t.then(()=>{const t={type:c.a.termination};e.removeEventListener("message",n),e.removeEventListener("unhandledrejection",i),r.next(t),r.complete();});})}(e,n);if("function"===r.type){return m(Object(l.a)(e),e,u,i)}if("module"===r.type){return m(Object(l.b)(e,r.methods),e,u,i)}{const e=r.type;throw Error("Worker init message states unexpected type of expose(): "+e)}}))}}).call(this,r(3));},function(e,t,r){r.d(t,"a",(function(){return m}));var n=r(5),i=r.n(n),o=r(40),s=r(87),a=r(13);function u(e){return Promise.all(e.map(e=>{const t=e=>({status:"fulfilled",value:e}),r=e=>({status:"rejected",reason:e}),n=Promise.resolve(e);try{return n.then(t,r)}catch(e){return Promise.reject(e)}}))}var c,l=r(8);!function(e){e.initialized="initialized",e.taskCanceled="taskCanceled",e.taskCompleted="taskCompleted",e.taskFailed="taskFailed",e.taskQueued="taskQueued",e.taskQueueDrained="taskQueueDrained",e.taskStart="taskStart",e.terminated="terminated";}(c||(c={}));var f=r(11),h=function(e,t,r,n){return new(r||(r=Promise))((function(i,o){function s(e){try{u(n.next(e));}catch(e){o(e);}}function a(e){try{u(n.throw(e));}catch(e){o(e);}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t);}))).then(s,a);}u((n=n.apply(e,t||[])).next());}))};let d=1;class p{constructor(e,t){this.eventSubject=new o.a,this.initErrors=[],this.isClosing=!1,this.nextTaskID=1,this.taskQueue=[];const r="number"==typeof t?{size:t}:t||{},{size:n=l.a}=r;this.debug=i()("threads:pool:"+(r.name||String(d++)).replace(/\W/g," ").trim().replace(/\s+/g,"-")),this.options=r,this.workers=function(e,t){return function(e){const t=[];for(let r=0;r<e;r++)t.push(r);return t}(t).map(()=>({init:e(),runningTasks:[]}))}(e,n),this.eventObservable=Object(s.a)(a.a.from(this.eventSubject)),Promise.all(this.workers.map(e=>e.init)).then(()=>this.eventSubject.next({type:c.initialized,size:this.workers.length}),e=>{this.debug("Error while initializing pool worker:",e),this.eventSubject.error(e),this.initErrors.push(e);});}findIdlingWorker(){const{concurrency:e=1}=this.options;return this.workers.find(t=>t.runningTasks.length<e)}runPoolTask(e,t){return h(this,void 0,void 0,(function*(){const r=this.workers.indexOf(e)+1;this.debug(`Running task #${t.id} on worker #${r}...`),this.eventSubject.next({type:c.taskStart,taskID:t.id,workerID:r});try{const n=yield t.run(yield e.init);this.debug(`Task #${t.id} completed successfully`),this.eventSubject.next({type:c.taskCompleted,returnValue:n,taskID:t.id,workerID:r});}catch(e){this.debug(`Task #${t.id} failed`),this.eventSubject.next({type:c.taskFailed,taskID:t.id,error:e,workerID:r});}}))}run(e,t){return h(this,void 0,void 0,(function*(){const r=(()=>h(this,void 0,void 0,(function*(){var n;yield(n=0,new Promise(e=>setTimeout(e,n)));try{yield this.runPoolTask(e,t);}finally{e.runningTasks=e.runningTasks.filter(e=>e!==r),this.isClosing||this.scheduleWork();}})))();e.runningTasks.push(r);}))}scheduleWork(){this.debug("Attempt de-queueing a task in order to run it...");const e=this.findIdlingWorker();if(!e)return;const t=this.taskQueue.shift();if(!t)return this.debug("Task queue is empty"),void this.eventSubject.next({type:c.taskQueueDrained});this.run(e,t);}taskCompletion(e){return new Promise((t,r)=>{const n=this.events().subscribe(i=>{i.type===c.taskCompleted&&i.taskID===e?(n.unsubscribe(),t(i.returnValue)):i.type===c.taskFailed&&i.taskID===e?(n.unsubscribe(),r(i.error)):i.type===c.terminated&&(n.unsubscribe(),r(Error("Pool has been terminated before task was run.")));});})}settled(e=!1){return h(this,void 0,void 0,(function*(){const t=()=>{return e=this.workers,t=e=>e.runningTasks,e.reduce((e,r)=>[...e,...t(r)],[]);var e,t;},r=[],n=this.eventObservable.subscribe(e=>{e.type===c.taskFailed&&r.push(e.error);});return this.initErrors.length>0?Promise.reject(this.initErrors[0]):e&&0===this.taskQueue.length?(yield u(t()),r):(yield new Promise((e,t)=>{const r=this.eventObservable.subscribe({next(t){t.type===c.taskQueueDrained&&(r.unsubscribe(),e());},error:t});}),yield u(t()),n.unsubscribe(),r)}))}completed(e=!1){return h(this,void 0,void 0,(function*(){const t=this.settled(e),r=new Promise((e,r)=>{const n=this.eventObservable.subscribe({next(i){i.type===c.taskQueueDrained?(n.unsubscribe(),e(t)):i.type===c.taskFailed&&(n.unsubscribe(),r(i.error));},error:r});}),n=yield Promise.race([t,r]);if(n.length>0)throw n[0]}))}events(){return this.eventObservable}queue(e){const{maxQueuedJobs:t=1/0}=this.options;if(this.isClosing)throw Error("Cannot schedule pool tasks after terminate() has been called.");if(this.initErrors.length>0)throw this.initErrors[0];const r=this.nextTaskID++,n=this.taskCompletion(r);n.catch(e=>{this.debug(`Task #${r} errored:`,e);});const i={id:r,run:e,cancel:()=>{-1!==this.taskQueue.indexOf(i)&&(this.taskQueue=this.taskQueue.filter(e=>e!==i),this.eventSubject.next({type:c.taskCanceled,taskID:i.id}));},then:n.then.bind(n)};if(this.taskQueue.length>=t)throw Error("Maximum number of pool tasks queued. Refusing to queue another one.\nThis usually happens for one of two reasons: We are either at peak workload right now or some tasks just won't finish, thus blocking the pool.");return this.debug(`Queueing task #${i.id}...`),this.taskQueue.push(i),this.eventSubject.next({type:c.taskQueued,taskID:i.id}),this.scheduleWork(),i}terminate(e){return h(this,void 0,void 0,(function*(){this.isClosing=!0,e||(yield this.completed(!0)),this.eventSubject.next({type:c.terminated,remainingQueue:[...this.taskQueue]}),this.eventSubject.complete(),yield Promise.all(this.workers.map(e=>h(this,void 0,void 0,(function*(){return f.a.terminate(yield e.init)}))));}))}}function g(e,t){return new p(e,t)}p.EventType=c,g.EventType=c;const m=g;},function(e,t,r){r.d(t,"a",(function(){return b})),r.d(t,"b",(function(){return w}));var n=r(5),i=r.n(n),o=r(13),s=r(87),a=r(6);const u=()=>{},c=e=>e,l=e=>Promise.resolve().then(e);function f(e){throw e}class h extends o.a{constructor(e){super(t=>{const r=this,n=Object.assign(Object.assign({},t),{complete(){t.complete(),r.onCompletion();},error(e){t.error(e),r.onError(e);},next(e){t.next(e),r.onNext(e);}});try{return this.initHasRun=!0,e(n)}catch(e){n.error(e);}}),this.initHasRun=!1,this.fulfillmentCallbacks=[],this.rejectionCallbacks=[],this.firstValueSet=!1,this.state="pending";}onNext(e){this.firstValueSet||(this.firstValue=e,this.firstValueSet=!0);}onError(e){this.state="rejected",this.rejection=e;for(const t of this.rejectionCallbacks)l(()=>t(e));}onCompletion(){this.state="fulfilled";for(const e of this.fulfillmentCallbacks)l(()=>e(this.firstValue));}then(e,t){const r=e||c,n=t||f;let i=!1;return new Promise((e,t)=>{const o=r=>{if(!i){i=!0;try{e(n(r));}catch(e){t(e);}}};return this.initHasRun||this.subscribe({error:o}),"fulfilled"===this.state?e(r(this.firstValue)):"rejected"===this.state?(i=!0,e(n(this.rejection))):(this.fulfillmentCallbacks.push(t=>{try{e(r(t));}catch(e){o(e);}}),void this.rejectionCallbacks.push(o))})}catch(e){return this.then(void 0,e)}finally(e){const t=e||u;return this.then(e=>(t(),e),()=>t())}static from(e){return function(e){return e&&"function"==typeof e.then}(e)?new h(t=>{e.then(e=>{t.next(e),t.complete();},e=>{t.error(e);});}):super.from(e)}}var d=r(42),p=r(9);const g=i()("threads:master:messages");let m=1;function y(e,t){return new o.a(r=>{let n;const i=o=>{var s;if(g("Message from worker:",o.data),o.data&&o.data.uid===t)if((s=o.data)&&s.type===p.b.running)n=o.data.resultType;else if((e=>e&&e.type===p.b.result)(o.data))"promise"===n?(void 0!==o.data.payload&&r.next(Object(a.a)(o.data.payload)),r.complete(),e.removeEventListener("message",i)):(o.data.payload&&r.next(Object(a.a)(o.data.payload)),o.data.complete&&(r.complete(),e.removeEventListener("message",i)));else if((e=>e&&e.type===p.b.error)(o.data)){const t=Object(a.a)(o.data.error);r.error(t),e.removeEventListener("message",i);}};return e.addEventListener("message",i),()=>{if("observable"===n||!n){const r={type:p.a.cancel,uid:t};e.postMessage(r);}e.removeEventListener("message",i);}})}function b(e,t){return (...r)=>{const n=m++,{args:i,transferables:o}=function(e){if(0===e.length)return {args:[],transferables:[]};const t=[],r=[];for(const n of e)Object(d.a)(n)?(t.push(Object(a.b)(n.send)),r.push(...n.transferables)):t.push(Object(a.b)(n));return {args:t,transferables:0===r.length?r:(n=r,Array.from(new Set(n)))};var n;}(r),u={type:p.a.run,uid:n,method:t,args:i};g("Sending command to run function to worker:",u);try{e.postMessage(u,o);}catch(e){return h.from(Promise.reject(e))}return h.from(Object(s.a)(y(e,n)))}}function w(e,t){const r={};for(const n of t)r[n]=b(e,n);return r}},function(e,t){var r={}.toString;e.exports=Array.isArray||function(e){return "[object Array]"==r.call(e)};},function(e,t,r){(function(t,n){var i=r(15);e.exports=w;var o,s=r(25);w.ReadableState=b;r(27).EventEmitter;var a=function(e,t){return e.listeners(t).length},u=r(28),c=r(21).Buffer,l=t.Uint8Array||function(){};var f=Object.create(r(10));f.inherits=r(4);var h=r(52),d=void 0;d=h&&h.debuglog?h.debuglog("stream"):function(){};var p,g=r(53),m=r(29);f.inherits(w,u);var y=["error","close","destroy","pause","resume"];function b(e,t){e=e||{};var n=t instanceof(o=o||r(7));this.objectMode=!!e.objectMode,n&&(this.objectMode=this.objectMode||!!e.readableObjectMode);var i=e.highWaterMark,s=e.readableHighWaterMark,a=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(s||0===s)?s:a,this.highWaterMark=Math.floor(this.highWaterMark),this.buffer=new g,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.destroyed=!1,this.defaultEncoding=e.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,e.encoding&&(p||(p=r(31).StringDecoder),this.decoder=new p(e.encoding),this.encoding=e.encoding);}function w(e){if(o=o||r(7),!(this instanceof w))return new w(e);this._readableState=new b(e,this),this.readable=!0,e&&("function"==typeof e.read&&(this._read=e.read),"function"==typeof e.destroy&&(this._destroy=e.destroy)),u.call(this);}function v(e,t,r,n,i){var o,s=e._readableState;null===t?(s.reading=!1,function(e,t){if(t.ended)return;if(t.decoder){var r=t.decoder.end();r&&r.length&&(t.buffer.push(r),t.length+=t.objectMode?1:r.length);}t.ended=!0,S(e);}(e,s)):(i||(o=function(e,t){var r;n=t,c.isBuffer(n)||n instanceof l||"string"==typeof t||void 0===t||e.objectMode||(r=new TypeError("Invalid non-string/buffer chunk"));var n;return r}(s,t)),o?e.emit("error",o):s.objectMode||t&&t.length>0?("string"==typeof t||s.objectMode||Object.getPrototypeOf(t)===c.prototype||(t=function(e){return c.from(e)}(t)),n?s.endEmitted?e.emit("error",new Error("stream.unshift() after end event")):_(e,s,t,!0):s.ended?e.emit("error",new Error("stream.push() after EOF")):(s.reading=!1,s.decoder&&!r?(t=s.decoder.write(t),s.objectMode||0!==t.length?_(e,s,t,!1):x(e,s)):_(e,s,t,!1))):n||(s.reading=!1));return function(e){return !e.ended&&(e.needReadable||e.length<e.highWaterMark||0===e.length)}(s)}function _(e,t,r,n){t.flowing&&0===t.length&&!t.sync?(e.emit("data",r),e.read(0)):(t.length+=t.objectMode?1:r.length,n?t.buffer.unshift(r):t.buffer.push(r),t.needReadable&&S(e)),x(e,t);}Object.defineProperty(w.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&this._readableState.destroyed},set:function(e){this._readableState&&(this._readableState.destroyed=e);}}),w.prototype.destroy=m.destroy,w.prototype._undestroy=m.undestroy,w.prototype._destroy=function(e,t){this.push(null),t(e);},w.prototype.push=function(e,t){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof e&&((t=t||n.defaultEncoding)!==n.encoding&&(e=c.from(e,t),t=""),r=!0),v(this,e,t,!1,r)},w.prototype.unshift=function(e){return v(this,e,null,!0,!1)},w.prototype.isPaused=function(){return !1===this._readableState.flowing},w.prototype.setEncoding=function(e){return p||(p=r(31).StringDecoder),this._readableState.decoder=new p(e),this._readableState.encoding=e,this};function k(e,t){return e<=0||0===t.length&&t.ended?0:t.objectMode?1:e!=e?t.flowing&&t.length?t.buffer.head.data.length:t.length:(e>t.highWaterMark&&(t.highWaterMark=function(e){return e>=8388608?e=8388608:(e--,e|=e>>>1,e|=e>>>2,e|=e>>>4,e|=e>>>8,e|=e>>>16,e++),e}(e)),e<=t.length?e:t.ended?t.length:(t.needReadable=!0,0))}function S(e){var t=e._readableState;t.needReadable=!1,t.emittedReadable||(d("emitReadable",t.flowing),t.emittedReadable=!0,t.sync?i.nextTick(T,e):T(e));}function T(e){d("emit readable"),e.emit("readable"),O(e);}function x(e,t){t.readingMore||(t.readingMore=!0,i.nextTick(E,e,t));}function E(e,t){for(var r=t.length;!t.reading&&!t.flowing&&!t.ended&&t.length<t.highWaterMark&&(d("maybeReadMore read 0"),e.read(0),r!==t.length);)r=t.length;t.readingMore=!1;}function C(e){d("readable nexttick read 0"),e.read(0);}function A(e,t){t.reading||(d("resume read 0"),e.read(0)),t.resumeScheduled=!1,t.awaitDrain=0,e.emit("resume"),O(e),t.flowing&&!t.reading&&e.read(0);}function O(e){var t=e._readableState;for(d("flow",t.flowing);t.flowing&&null!==e.read(););}function R(e,t){return 0===t.length?null:(t.objectMode?r=t.buffer.shift():!e||e>=t.length?(r=t.decoder?t.buffer.join(""):1===t.buffer.length?t.buffer.head.data:t.buffer.concat(t.length),t.buffer.clear()):r=function(e,t,r){var n;e<t.head.data.length?(n=t.head.data.slice(0,e),t.head.data=t.head.data.slice(e)):n=e===t.head.data.length?t.shift():r?function(e,t){var r=t.head,n=1,i=r.data;e-=i.length;for(;r=r.next;){var o=r.data,s=e>o.length?o.length:e;if(s===o.length?i+=o:i+=o.slice(0,e),0===(e-=s)){s===o.length?(++n,r.next?t.head=r.next:t.head=t.tail=null):(t.head=r,r.data=o.slice(s));break}++n;}return t.length-=n,i}(e,t):function(e,t){var r=c.allocUnsafe(e),n=t.head,i=1;n.data.copy(r),e-=n.data.length;for(;n=n.next;){var o=n.data,s=e>o.length?o.length:e;if(o.copy(r,r.length-e,0,s),0===(e-=s)){s===o.length?(++i,n.next?t.head=n.next:t.head=t.tail=null):(t.head=n,n.data=o.slice(s));break}++i;}return t.length-=i,r}(e,t);return n}(e,t.buffer,t.decoder),r);var r;}function I(e){var t=e._readableState;if(t.length>0)throw new Error('"endReadable()" called on non-empty stream');t.endEmitted||(t.ended=!0,i.nextTick(P,t,e));}function P(e,t){e.endEmitted||0!==e.length||(e.endEmitted=!0,t.readable=!1,t.emit("end"));}function M(e,t){for(var r=0,n=e.length;r<n;r++)if(e[r]===t)return r;return -1}w.prototype.read=function(e){d("read",e),e=parseInt(e,10);var t=this._readableState,r=e;if(0!==e&&(t.emittedReadable=!1),0===e&&t.needReadable&&(t.length>=t.highWaterMark||t.ended))return d("read: emitReadable",t.length,t.ended),0===t.length&&t.ended?I(this):S(this),null;if(0===(e=k(e,t))&&t.ended)return 0===t.length&&I(this),null;var n,i=t.needReadable;return d("need readable",i),(0===t.length||t.length-e<t.highWaterMark)&&d("length less than watermark",i=!0),t.ended||t.reading?d("reading or ended",i=!1):i&&(d("do read"),t.reading=!0,t.sync=!0,0===t.length&&(t.needReadable=!0),this._read(t.highWaterMark),t.sync=!1,t.reading||(e=k(r,t))),null===(n=e>0?R(e,t):null)?(t.needReadable=!0,e=0):t.length-=e,0===t.length&&(t.ended||(t.needReadable=!0),r!==e&&t.ended&&I(this)),null!==n&&this.emit("data",n),n},w.prototype._read=function(e){this.emit("error",new Error("_read() is not implemented"));},w.prototype.pipe=function(e,t){var r=this,o=this._readableState;switch(o.pipesCount){case 0:o.pipes=e;break;case 1:o.pipes=[o.pipes,e];break;default:o.pipes.push(e);}o.pipesCount+=1,d("pipe count=%d opts=%j",o.pipesCount,t);var u=(!t||!1!==t.end)&&e!==n.stdout&&e!==n.stderr?l:w;function c(t,n){d("onunpipe"),t===r&&n&&!1===n.hasUnpiped&&(n.hasUnpiped=!0,d("cleanup"),e.removeListener("close",y),e.removeListener("finish",b),e.removeListener("drain",f),e.removeListener("error",m),e.removeListener("unpipe",c),r.removeListener("end",l),r.removeListener("end",w),r.removeListener("data",g),h=!0,!o.awaitDrain||e._writableState&&!e._writableState.needDrain||f());}function l(){d("onend"),e.end();}o.endEmitted?i.nextTick(u):r.once("end",u),e.on("unpipe",c);var f=function(e){return function(){var t=e._readableState;d("pipeOnDrain",t.awaitDrain),t.awaitDrain&&t.awaitDrain--,0===t.awaitDrain&&a(e,"data")&&(t.flowing=!0,O(e));}}(r);e.on("drain",f);var h=!1;var p=!1;function g(t){d("ondata"),p=!1,!1!==e.write(t)||p||((1===o.pipesCount&&o.pipes===e||o.pipesCount>1&&-1!==M(o.pipes,e))&&!h&&(d("false write response, pause",r._readableState.awaitDrain),r._readableState.awaitDrain++,p=!0),r.pause());}function m(t){d("onerror",t),w(),e.removeListener("error",m),0===a(e,"error")&&e.emit("error",t);}function y(){e.removeListener("finish",b),w();}function b(){d("onfinish"),e.removeListener("close",y),w();}function w(){d("unpipe"),r.unpipe(e);}return r.on("data",g),function(e,t,r){if("function"==typeof e.prependListener)return e.prependListener(t,r);e._events&&e._events[t]?s(e._events[t])?e._events[t].unshift(r):e._events[t]=[r,e._events[t]]:e.on(t,r);}(e,"error",m),e.once("close",y),e.once("finish",b),e.emit("pipe",r),o.flowing||(d("pipe resume"),r.resume()),e},w.prototype.unpipe=function(e){var t=this._readableState,r={hasUnpiped:!1};if(0===t.pipesCount)return this;if(1===t.pipesCount)return e&&e!==t.pipes||(e||(e=t.pipes),t.pipes=null,t.pipesCount=0,t.flowing=!1,e&&e.emit("unpipe",this,r)),this;if(!e){var n=t.pipes,i=t.pipesCount;t.pipes=null,t.pipesCount=0,t.flowing=!1;for(var o=0;o<i;o++)n[o].emit("unpipe",this,r);return this}var s=M(t.pipes,e);return -1===s||(t.pipes.splice(s,1),t.pipesCount-=1,1===t.pipesCount&&(t.pipes=t.pipes[0]),e.emit("unpipe",this,r)),this},w.prototype.on=function(e,t){var r=u.prototype.on.call(this,e,t);if("data"===e)!1!==this._readableState.flowing&&this.resume();else if("readable"===e){var n=this._readableState;n.endEmitted||n.readableListening||(n.readableListening=n.needReadable=!0,n.emittedReadable=!1,n.reading?n.length&&S(this):i.nextTick(C,this));}return r},w.prototype.addListener=w.prototype.on,w.prototype.resume=function(){var e=this._readableState;return e.flowing||(d("resume"),e.flowing=!0,function(e,t){t.resumeScheduled||(t.resumeScheduled=!0,i.nextTick(A,e,t));}(this,e)),this},w.prototype.pause=function(){return d("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(d("pause"),this._readableState.flowing=!1,this.emit("pause")),this},w.prototype.wrap=function(e){var t=this,r=this._readableState,n=!1;for(var i in e.on("end",(function(){if(d("wrapped end"),r.decoder&&!r.ended){var e=r.decoder.end();e&&e.length&&t.push(e);}t.push(null);})),e.on("data",(function(i){(d("wrapped data"),r.decoder&&(i=r.decoder.write(i)),r.objectMode&&null==i)||(r.objectMode||i&&i.length)&&(t.push(i)||(n=!0,e.pause()));})),e)void 0===this[i]&&"function"==typeof e[i]&&(this[i]=function(t){return function(){return e[t].apply(e,arguments)}}(i));for(var o=0;o<y.length;o++)e.on(y[o],this.emit.bind(this,y[o]));return this._read=function(t){d("wrapped _read",t),n&&(n=!1,e.resume());},this},Object.defineProperty(w.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),w._fromList=R;}).call(this,r(1),r(3));},function(e,t,r){var n,i="object"==typeof Reflect?Reflect:null,o=i&&"function"==typeof i.apply?i.apply:function(e,t,r){return Function.prototype.apply.call(e,t,r)};n=i&&"function"==typeof i.ownKeys?i.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var s=Number.isNaN||function(e){return e!=e};function a(){a.init.call(this);}e.exports=a,e.exports.once=function(e,t){return new Promise((function(r,n){function i(r){e.removeListener(t,o),n(r);}function o(){"function"==typeof e.removeListener&&e.removeListener("error",i),r([].slice.call(arguments));}y(e,t,o,{once:!0}),"error"!==t&&function(e,t,r){"function"==typeof e.on&&y(e,"error",t,r);}(e,i,{once:!0});}))},a.EventEmitter=a,a.prototype._events=void 0,a.prototype._eventsCount=0,a.prototype._maxListeners=void 0;var u=10;function c(e){if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e)}function l(e){return void 0===e._maxListeners?a.defaultMaxListeners:e._maxListeners}function f(e,t,r,n){var i,o,s,a;if(c(r),void 0===(o=e._events)?(o=e._events=Object.create(null),e._eventsCount=0):(void 0!==o.newListener&&(e.emit("newListener",t,r.listener?r.listener:r),o=e._events),s=o[t]),void 0===s)s=o[t]=r,++e._eventsCount;else if("function"==typeof s?s=o[t]=n?[r,s]:[s,r]:n?s.unshift(r):s.push(r),(i=l(e))>0&&s.length>i&&!s.warned){s.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+s.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=e,u.type=t,u.count=s.length,a=u,console&&console.warn&&console.warn(a);}return e}function h(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function d(e,t,r){var n={fired:!1,wrapFn:void 0,target:e,type:t,listener:r},i=h.bind(n);return i.listener=r,n.wrapFn=i,i}function p(e,t,r){var n=e._events;if(void 0===n)return [];var i=n[t];return void 0===i?[]:"function"==typeof i?r?[i.listener||i]:[i]:r?function(e){for(var t=new Array(e.length),r=0;r<t.length;++r)t[r]=e[r].listener||e[r];return t}(i):m(i,i.length)}function g(e){var t=this._events;if(void 0!==t){var r=t[e];if("function"==typeof r)return 1;if(void 0!==r)return r.length}return 0}function m(e,t){for(var r=new Array(t),n=0;n<t;++n)r[n]=e[n];return r}function y(e,t,r,n){if("function"==typeof e.on)n.once?e.once(t,r):e.on(t,r);else {if("function"!=typeof e.addEventListener)throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof e);e.addEventListener(t,(function i(o){n.once&&e.removeEventListener(t,i),r(o);}));}}Object.defineProperty(a,"defaultMaxListeners",{enumerable:!0,get:function(){return u},set:function(e){if("number"!=typeof e||e<0||s(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");u=e;}}),a.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0;},a.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||s(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this},a.prototype.getMaxListeners=function(){return l(this)},a.prototype.emit=function(e){for(var t=[],r=1;r<arguments.length;r++)t.push(arguments[r]);var n="error"===e,i=this._events;if(void 0!==i)n=n&&void 0===i.error;else if(!n)return !1;if(n){var s;if(t.length>0&&(s=t[0]),s instanceof Error)throw s;var a=new Error("Unhandled error."+(s?" ("+s.message+")":""));throw a.context=s,a}var u=i[e];if(void 0===u)return !1;if("function"==typeof u)o(u,this,t);else {var c=u.length,l=m(u,c);for(r=0;r<c;++r)o(l[r],this,t);}return !0},a.prototype.addListener=function(e,t){return f(this,e,t,!1)},a.prototype.on=a.prototype.addListener,a.prototype.prependListener=function(e,t){return f(this,e,t,!0)},a.prototype.once=function(e,t){return c(t),this.on(e,d(this,e,t)),this},a.prototype.prependOnceListener=function(e,t){return c(t),this.prependListener(e,d(this,e,t)),this},a.prototype.removeListener=function(e,t){var r,n,i,o,s;if(c(t),void 0===(n=this._events))return this;if(void 0===(r=n[e]))return this;if(r===t||r.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete n[e],n.removeListener&&this.emit("removeListener",e,r.listener||t));else if("function"!=typeof r){for(i=-1,o=r.length-1;o>=0;o--)if(r[o]===t||r[o].listener===t){s=r[o].listener,i=o;break}if(i<0)return this;0===i?r.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop();}(r,i),1===r.length&&(n[e]=r[0]),void 0!==n.removeListener&&this.emit("removeListener",e,s||t);}return this},a.prototype.off=a.prototype.removeListener,a.prototype.removeAllListeners=function(e){var t,r,n;if(void 0===(r=this._events))return this;if(void 0===r.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==r[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete r[e]),this;if(0===arguments.length){var i,o=Object.keys(r);for(n=0;n<o.length;++n)"removeListener"!==(i=o[n])&&this.removeAllListeners(i);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=r[e]))this.removeListener(e,t);else if(void 0!==t)for(n=t.length-1;n>=0;n--)this.removeListener(e,t[n]);return this},a.prototype.listeners=function(e){return p(this,e,!0)},a.prototype.rawListeners=function(e){return p(this,e,!1)},a.listenerCount=function(e,t){return "function"==typeof e.listenerCount?e.listenerCount(t):g.call(e,t)},a.prototype.listenerCount=g,a.prototype.eventNames=function(){return this._eventsCount>0?n(this._events):[]};},function(e,t,r){e.exports=r(27).EventEmitter;},function(e,t,r){var n=r(15);function i(e,t){e.emit("error",t);}e.exports={destroy:function(e,t){var r=this,o=this._readableState&&this._readableState.destroyed,s=this._writableState&&this._writableState.destroyed;return o||s?(t?t(e):!e||this._writableState&&this._writableState.errorEmitted||n.nextTick(i,this,e),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(e||null,(function(e){!t&&e?(n.nextTick(i,r,e),r._writableState&&(r._writableState.errorEmitted=!0)):t&&t(e);})),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1);}};},function(e,t,r){(function(t,n,i){var o=r(15);function s(e){var t=this;this.next=null,this.entry=null,this.finish=function(){!function(e,t,r){var n=e.entry;e.entry=null;for(;n;){var i=n.callback;t.pendingcb--,i(r),n=n.next;}t.corkedRequestsFree?t.corkedRequestsFree.next=e:t.corkedRequestsFree=e;}(t,e);};}e.exports=b;var a,u=!t.browser&&["v0.10","v0.9."].indexOf(t.version.slice(0,5))>-1?n:o.nextTick;b.WritableState=y;var c=Object.create(r(10));c.inherits=r(4);var l={deprecate:r(57)},f=r(28),h=r(21).Buffer,d=i.Uint8Array||function(){};var p,g=r(29);function m(){}function y(e,t){a=a||r(7),e=e||{};var n=t instanceof a;this.objectMode=!!e.objectMode,n&&(this.objectMode=this.objectMode||!!e.writableObjectMode);var i=e.highWaterMark,c=e.writableHighWaterMark,l=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(c||0===c)?c:l,this.highWaterMark=Math.floor(this.highWaterMark),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var f=!1===e.decodeStrings;this.decodeStrings=!f,this.defaultEncoding=e.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(e){!function(e,t){var r=e._writableState,n=r.sync,i=r.writecb;if(function(e){e.writing=!1,e.writecb=null,e.length-=e.writelen,e.writelen=0;}(r),t)!function(e,t,r,n,i){--t.pendingcb,r?(o.nextTick(i,n),o.nextTick(T,e,t),e._writableState.errorEmitted=!0,e.emit("error",n)):(i(n),e._writableState.errorEmitted=!0,e.emit("error",n),T(e,t));}(e,r,n,t,i);else {var s=k(r);s||r.corked||r.bufferProcessing||!r.bufferedRequest||_(e,r),n?u(v,e,r,s,i):v(e,r,s,i);}}(t,e);},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.bufferedRequestCount=0,this.corkedRequestsFree=new s(this);}function b(e){if(a=a||r(7),!(p.call(b,this)||this instanceof a))return new b(e);this._writableState=new y(e,this),this.writable=!0,e&&("function"==typeof e.write&&(this._write=e.write),"function"==typeof e.writev&&(this._writev=e.writev),"function"==typeof e.destroy&&(this._destroy=e.destroy),"function"==typeof e.final&&(this._final=e.final)),f.call(this);}function w(e,t,r,n,i,o,s){t.writelen=n,t.writecb=s,t.writing=!0,t.sync=!0,r?e._writev(i,t.onwrite):e._write(i,o,t.onwrite),t.sync=!1;}function v(e,t,r,n){r||function(e,t){0===t.length&&t.needDrain&&(t.needDrain=!1,e.emit("drain"));}(e,t),t.pendingcb--,n(),T(e,t);}function _(e,t){t.bufferProcessing=!0;var r=t.bufferedRequest;if(e._writev&&r&&r.next){var n=t.bufferedRequestCount,i=new Array(n),o=t.corkedRequestsFree;o.entry=r;for(var a=0,u=!0;r;)i[a]=r,r.isBuf||(u=!1),r=r.next,a+=1;i.allBuffers=u,w(e,t,!0,t.length,i,"",o.finish),t.pendingcb++,t.lastBufferedRequest=null,o.next?(t.corkedRequestsFree=o.next,o.next=null):t.corkedRequestsFree=new s(t),t.bufferedRequestCount=0;}else {for(;r;){var c=r.chunk,l=r.encoding,f=r.callback;if(w(e,t,!1,t.objectMode?1:c.length,c,l,f),r=r.next,t.bufferedRequestCount--,t.writing)break}null===r&&(t.lastBufferedRequest=null);}t.bufferedRequest=r,t.bufferProcessing=!1;}function k(e){return e.ending&&0===e.length&&null===e.bufferedRequest&&!e.finished&&!e.writing}function S(e,t){e._final((function(r){t.pendingcb--,r&&e.emit("error",r),t.prefinished=!0,e.emit("prefinish"),T(e,t);}));}function T(e,t){var r=k(t);return r&&(!function(e,t){t.prefinished||t.finalCalled||("function"==typeof e._final?(t.pendingcb++,t.finalCalled=!0,o.nextTick(S,e,t)):(t.prefinished=!0,e.emit("prefinish")));}(e,t),0===t.pendingcb&&(t.finished=!0,e.emit("finish"))),r}c.inherits(b,f),y.prototype.getBuffer=function(){for(var e=this.bufferedRequest,t=[];e;)t.push(e),e=e.next;return t},function(){try{Object.defineProperty(y.prototype,"buffer",{get:l.deprecate((function(){return this.getBuffer()}),"_writableState.buffer is deprecated. Use _writableState.getBuffer instead.","DEP0003")});}catch(e){}}(),"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(p=Function.prototype[Symbol.hasInstance],Object.defineProperty(b,Symbol.hasInstance,{value:function(e){return !!p.call(this,e)||this===b&&(e&&e._writableState instanceof y)}})):p=function(e){return e instanceof this},b.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"));},b.prototype.write=function(e,t,r){var n,i=this._writableState,s=!1,a=!i.objectMode&&(n=e,h.isBuffer(n)||n instanceof d);return a&&!h.isBuffer(e)&&(e=function(e){return h.from(e)}(e)),"function"==typeof t&&(r=t,t=null),a?t="buffer":t||(t=i.defaultEncoding),"function"!=typeof r&&(r=m),i.ended?function(e,t){var r=new Error("write after end");e.emit("error",r),o.nextTick(t,r);}(this,r):(a||function(e,t,r,n){var i=!0,s=!1;return null===r?s=new TypeError("May not write null values to stream"):"string"==typeof r||void 0===r||t.objectMode||(s=new TypeError("Invalid non-string/buffer chunk")),s&&(e.emit("error",s),o.nextTick(n,s),i=!1),i}(this,i,e,r))&&(i.pendingcb++,s=function(e,t,r,n,i,o){if(!r){var s=function(e,t,r){e.objectMode||!1===e.decodeStrings||"string"!=typeof t||(t=h.from(t,r));return t}(t,n,i);n!==s&&(r=!0,i="buffer",n=s);}var a=t.objectMode?1:n.length;t.length+=a;var u=t.length<t.highWaterMark;u||(t.needDrain=!0);if(t.writing||t.corked){var c=t.lastBufferedRequest;t.lastBufferedRequest={chunk:n,encoding:i,isBuf:r,callback:o,next:null},c?c.next=t.lastBufferedRequest:t.bufferedRequest=t.lastBufferedRequest,t.bufferedRequestCount+=1;}else w(e,t,!1,a,n,i,o);return u}(this,i,a,e,t,r)),s},b.prototype.cork=function(){this._writableState.corked++;},b.prototype.uncork=function(){var e=this._writableState;e.corked&&(e.corked--,e.writing||e.corked||e.finished||e.bufferProcessing||!e.bufferedRequest||_(this,e));},b.prototype.setDefaultEncoding=function(e){if("string"==typeof e&&(e=e.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((e+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+e);return this._writableState.defaultEncoding=e,this},Object.defineProperty(b.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),b.prototype._write=function(e,t,r){r(new Error("_write() is not implemented"));},b.prototype._writev=null,b.prototype.end=function(e,t,r){var n=this._writableState;"function"==typeof e?(r=e,e=null,t=null):"function"==typeof t&&(r=t,t=null),null!=e&&this.write(e,t),n.corked&&(n.corked=1,this.uncork()),n.ending||n.finished||function(e,t,r){t.ending=!0,T(e,t),r&&(t.finished?o.nextTick(r):e.once("finish",r));t.ended=!0,e.writable=!1;}(this,n,r);},Object.defineProperty(b.prototype,"destroyed",{get:function(){return void 0!==this._writableState&&this._writableState.destroyed},set:function(e){this._writableState&&(this._writableState.destroyed=e);}}),b.prototype.destroy=g.destroy,b.prototype._undestroy=g.undestroy,b.prototype._destroy=function(e,t){this.end(),t(e);};}).call(this,r(3),r(55).setImmediate,r(1));},function(e,t,r){var n=r(58).Buffer,i=n.isEncoding||function(e){switch((e=""+e)&&e.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return !0;default:return !1}};function o(e){var t;switch(this.encoding=function(e){var t=function(e){if(!e)return "utf8";for(var t;;)switch(e){case"utf8":case"utf-8":return "utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return "utf16le";case"latin1":case"binary":return "latin1";case"base64":case"ascii":case"hex":return e;default:if(t)return;e=(""+e).toLowerCase(),t=!0;}}(e);if("string"!=typeof t&&(n.isEncoding===i||!i(e)))throw new Error("Unknown encoding: "+e);return t||e}(e),this.encoding){case"utf16le":this.text=u,this.end=c,t=4;break;case"utf8":this.fillLast=a,t=4;break;case"base64":this.text=l,this.end=f,t=3;break;default:return this.write=h,void(this.end=d)}this.lastNeed=0,this.lastTotal=0,this.lastChar=n.allocUnsafe(t);}function s(e){return e<=127?0:e>>5==6?2:e>>4==14?3:e>>3==30?4:-1}function a(e){var t=this.lastTotal-this.lastNeed,r=function(e,t,r){if(128!=(192&t[0]))return e.lastNeed=0,"�".repeat(r);if(e.lastNeed>1&&t.length>1){if(128!=(192&t[1]))return e.lastNeed=1,"�".repeat(r+1);if(e.lastNeed>2&&t.length>2&&128!=(192&t[2]))return e.lastNeed=2,"�".repeat(r+2)}}(this,e,t);return void 0!==r?r:this.lastNeed<=e.length?(e.copy(this.lastChar,t,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(e.copy(this.lastChar,t,0,e.length),void(this.lastNeed-=e.length))}function u(e,t){if((e.length-t)%2==0){var r=e.toString("utf16le",t);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=e[e.length-1],e.toString("utf16le",t,e.length-1)}function c(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return t+this.lastChar.toString("utf16le",0,r)}return t}function l(e,t){var r=(e.length-t)%3;return 0===r?e.toString("base64",t):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=e[e.length-1]:(this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1]),e.toString("base64",t,e.length-r))}function f(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+this.lastChar.toString("base64",0,3-this.lastNeed):t}function h(e){return e.toString(this.encoding)}function d(e){return e&&e.length?this.write(e):""}t.StringDecoder=o,o.prototype.write=function(e){if(0===e.length)return "";var t,r;if(this.lastNeed){if(void 0===(t=this.fillLast(e)))return "";r=this.lastNeed,this.lastNeed=0;}else r=0;return r<e.length?t?t+this.text(e,r):this.text(e,r):t||""},o.prototype.end=function(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+"�".repeat(this.lastTotal-this.lastNeed):t},o.prototype.text=function(e,t){var r=function(e,t,r){var n=t.length-1;if(n<r)return 0;var i=s(t[n]);if(i>=0)return i>0&&(e.lastNeed=i-1),i;if(--n<r)return 0;if((i=s(t[n]))>=0)return i>0&&(e.lastNeed=i-2),i;if(--n<r)return 0;if((i=s(t[n]))>=0)return i>0&&(2===i?i=0:e.lastNeed=i-3),i;return 0}(this,e,t);if(!this.lastNeed)return e.toString("utf8",t);this.lastTotal=r;var n=e.length-(r-this.lastNeed);return e.copy(this.lastChar,0,n),e.toString("utf8",t,n)},o.prototype.fillLast=function(e){if(this.lastNeed<=e.length)return e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,e.length),this.lastNeed-=e.length;};},function(e,t,r){e.exports=s;var n=r(7),i=Object.create(r(10));function o(e,t){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(!n)return this.emit("error",new Error("write callback called multiple times"));r.writechunk=null,r.writecb=null,null!=t&&this.push(t),n(e);var i=this._readableState;i.reading=!1,(i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark);}function s(e){if(!(this instanceof s))return new s(e);n.call(this,e),this._transformState={afterTransform:o.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,e&&("function"==typeof e.transform&&(this._transform=e.transform),"function"==typeof e.flush&&(this._flush=e.flush)),this.on("prefinish",a);}function a(){var e=this;"function"==typeof this._flush?this._flush((function(t,r){u(e,t,r);})):u(this,null,null);}function u(e,t,r){if(t)return e.emit("error",t);if(null!=r&&e.push(r),e._writableState.length)throw new Error("Calling transform done when ws.length != 0");if(e._transformState.transforming)throw new Error("Calling transform done when still transforming");return e.push(null)}i.inherits=r(4),i.inherits(s,n),s.prototype.push=function(e,t){return this._transformState.needTransform=!1,n.prototype.push.call(this,e,t)},s.prototype._transform=function(e,t,r){throw new Error("_transform() is not implemented")},s.prototype._write=function(e,t,r){var n=this._transformState;if(n.writecb=r,n.writechunk=e,n.writeencoding=t,!n.transforming){var i=this._readableState;(n.needTransform||i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark);}},s.prototype._read=function(e){var t=this._transformState;null!==t.writechunk&&t.writecb&&!t.transforming?(t.transforming=!0,this._transform(t.writechunk,t.writeencoding,t.afterTransform)):t.needTransform=!0;},s.prototype._destroy=function(e,t){var r=this;n.prototype._destroy.call(this,e,(function(e){t(e),r.emit("close");}));};},function(e,t,r){(function(e){var n=r(85),i=r(23),o=r(22);const s="undefined"!=typeof navigator?navigator.hardwareConcurrency:null;t.a=class{constructor(t=s){const r=new n.a(e);this.pool=Object(i.a)(()=>Object(o.a)(r),t);}async decode(e,t){return new Promise((r,n)=>{this.pool.queue(async i=>{try{const n=await i(e,t);r(n);}catch(e){n(e);}});})}destroy(){this.pool.terminate(!0);}};}).call(this,r(70));},function(e,t,r){(function(e){t.fetch=a(e.fetch)&&a(e.ReadableStream),t.writableStream=a(e.WritableStream),t.abortController=a(e.AbortController),t.blobConstructor=!1;try{new Blob([new ArrayBuffer(1)]),t.blobConstructor=!0;}catch(e){}var r;function n(){if(void 0!==r)return r;if(e.XMLHttpRequest){r=new e.XMLHttpRequest;try{r.open("GET",e.XDomainRequest?"/":"https://example.com");}catch(e){r=null;}}else r=null;return r}function i(e){var t=n();if(!t)return !1;try{return t.responseType=e,t.responseType===e}catch(e){}return !1}var o=void 0!==e.ArrayBuffer,s=o&&a(e.ArrayBuffer.prototype.slice);function a(e){return "function"==typeof e}t.arraybuffer=t.fetch||o&&i("arraybuffer"),t.msstream=!t.fetch&&s&&i("ms-stream"),t.mozchunkedarraybuffer=!t.fetch&&o&&i("moz-chunked-arraybuffer"),t.overrideMimeType=t.fetch||!!n()&&a(n().overrideMimeType),t.vbArray=a(e.VBArray),r=null;}).call(this,r(1));},function(e,t,r){(function(e,n,i){var o=r(34),s=r(4),a=r(20),u=t.readyStates={UNSENT:0,OPENED:1,HEADERS_RECEIVED:2,LOADING:3,DONE:4},c=t.IncomingMessage=function(t,r,s,u){var c=this;if(a.Readable.call(c),c._mode=s,c.headers={},c.rawHeaders=[],c.trailers={},c.rawTrailers=[],c.on("end",(function(){e.nextTick((function(){c.emit("close");}));})),"fetch"===s){if(c._fetchResponse=r,c.url=r.url,c.statusCode=r.status,c.statusMessage=r.statusText,r.headers.forEach((function(e,t){c.headers[t.toLowerCase()]=e,c.rawHeaders.push(t,e);})),o.writableStream){var l=new WritableStream({write:function(e){return new Promise((function(t,r){c._destroyed?r():c.push(new n(e))?t():c._resumeFetch=t;}))},close:function(){i.clearTimeout(u),c._destroyed||c.push(null);},abort:function(e){c._destroyed||c.emit("error",e);}});try{return void r.body.pipeTo(l).catch((function(e){i.clearTimeout(u),c._destroyed||c.emit("error",e);}))}catch(e){}}var f=r.body.getReader();!function e(){f.read().then((function(t){if(!c._destroyed){if(t.done)return i.clearTimeout(u),void c.push(null);c.push(new n(t.value)),e();}})).catch((function(e){i.clearTimeout(u),c._destroyed||c.emit("error",e);}));}();}else {if(c._xhr=t,c._pos=0,c.url=t.responseURL,c.statusCode=t.status,c.statusMessage=t.statusText,t.getAllResponseHeaders().split(/\r?\n/).forEach((function(e){var t=e.match(/^([^:]+):\s*(.*)/);if(t){var r=t[1].toLowerCase();"set-cookie"===r?(void 0===c.headers[r]&&(c.headers[r]=[]),c.headers[r].push(t[2])):void 0!==c.headers[r]?c.headers[r]+=", "+t[2]:c.headers[r]=t[2],c.rawHeaders.push(t[1],t[2]);}})),c._charset="x-user-defined",!o.overrideMimeType){var h=c.rawHeaders["mime-type"];if(h){var d=h.match(/;\s*charset=([^;])(;|$)/);d&&(c._charset=d[1].toLowerCase());}c._charset||(c._charset="utf-8");}}};s(c,a.Readable),c.prototype._read=function(){var e=this._resumeFetch;e&&(this._resumeFetch=null,e());},c.prototype._onXHRProgress=function(){var e=this,t=e._xhr,r=null;switch(e._mode){case"text:vbarray":if(t.readyState!==u.DONE)break;try{r=new i.VBArray(t.responseBody).toArray();}catch(e){}if(null!==r){e.push(new n(r));break}case"text":try{r=t.responseText;}catch(t){e._mode="text:vbarray";break}if(r.length>e._pos){var o=r.substr(e._pos);if("x-user-defined"===e._charset){for(var s=new n(o.length),a=0;a<o.length;a++)s[a]=255&o.charCodeAt(a);e.push(s);}else e.push(o,e._charset);e._pos=r.length;}break;case"arraybuffer":if(t.readyState!==u.DONE||!t.response)break;r=t.response,e.push(new n(new Uint8Array(r)));break;case"moz-chunked-arraybuffer":if(r=t.response,t.readyState!==u.LOADING||!r)break;e.push(new n(new Uint8Array(r)));break;case"ms-stream":if(r=t.response,t.readyState!==u.LOADING)break;var c=new i.MSStreamReader;c.onprogress=function(){c.result.byteLength>e._pos&&(e.push(new n(new Uint8Array(c.result.slice(e._pos)))),e._pos=c.result.byteLength);},c.onload=function(){e.push(null);},c.readAsArrayBuffer(r);}e._xhr.readyState===u.DONE&&"ms-stream"!==e._mode&&e.push(null);};}).call(this,r(3),r(2).Buffer,r(1));},function(e,t,r){e.exports={countIn1D:function(e){return e.reduce((function(e,t){return void 0===e[t]?e[t]=1:e[t]++,e}),{})},countIn2D:function(e){return e.reduce((function(e,t){return t.forEach((function(t){void 0===e[t]?e[t]=1:e[t]++;})),e}),{})},unflatten:function(e,t){for(var r=t.height,n=t.width,i=[],o=0;o<r;o++){var s=o*n,a=s+n;i.push(e.slice(s,a));}return i}};},function(e,t,r){r.r(t),r.d(t,"globals",(function(){return n})),r.d(t,"rgb",(function(){return i})),r.d(t,"getDecoder",(function(){return B})),r.d(t,"setLogger",(function(){return _e})),r.d(t,"GeoTIFF",(function(){return Ce})),r.d(t,"MultiGeoTIFF",(function(){return Ae})),r.d(t,"fromUrl",(function(){return Oe})),r.d(t,"fromArrayBuffer",(function(){return Re})),r.d(t,"fromFile",(function(){return Ie})),r.d(t,"fromBlob",(function(){return Pe})),r.d(t,"fromUrls",(function(){return Me})),r.d(t,"writeArrayBuffer",(function(){return De})),r.d(t,"Pool",(function(){return Z.a}));var n={};r.r(n),r.d(n,"fieldTagNames",(function(){return a})),r.d(n,"fieldTags",(function(){return u})),r.d(n,"fieldTagTypes",(function(){return c})),r.d(n,"arrayFields",(function(){return l})),r.d(n,"fieldTypeNames",(function(){return f})),r.d(n,"fieldTypes",(function(){return h})),r.d(n,"photometricInterpretations",(function(){return d})),r.d(n,"ExtraSamplesValues",(function(){return p})),r.d(n,"geoKeyNames",(function(){return g})),r.d(n,"geoKeys",(function(){return m}));var i={};r.r(i),r.d(i,"fromWhiteIsZero",(function(){return y})),r.d(i,"fromBlackIsZero",(function(){return b})),r.d(i,"fromPalette",(function(){return w})),r.d(i,"fromCMYK",(function(){return v})),r.d(i,"fromYCbCr",(function(){return _})),r.d(i,"fromCIELab",(function(){return k}));var o=r(38),s=r.n(o);const a={315:"Artist",258:"BitsPerSample",265:"CellLength",264:"CellWidth",320:"ColorMap",259:"Compression",33432:"Copyright",306:"DateTime",338:"ExtraSamples",266:"FillOrder",289:"FreeByteCounts",288:"FreeOffsets",291:"GrayResponseCurve",290:"GrayResponseUnit",316:"HostComputer",270:"ImageDescription",257:"ImageLength",256:"ImageWidth",271:"Make",281:"MaxSampleValue",280:"MinSampleValue",272:"Model",254:"NewSubfileType",274:"Orientation",262:"PhotometricInterpretation",284:"PlanarConfiguration",296:"ResolutionUnit",278:"RowsPerStrip",277:"SamplesPerPixel",305:"Software",279:"StripByteCounts",273:"StripOffsets",255:"SubfileType",263:"Threshholding",282:"XResolution",283:"YResolution",326:"BadFaxLines",327:"CleanFaxData",343:"ClipPath",328:"ConsecutiveBadFaxLines",433:"Decode",434:"DefaultImageColor",269:"DocumentName",336:"DotRange",321:"HalftoneHints",346:"Indexed",347:"JPEGTables",285:"PageName",297:"PageNumber",317:"Predictor",319:"PrimaryChromaticities",532:"ReferenceBlackWhite",339:"SampleFormat",340:"SMinSampleValue",341:"SMaxSampleValue",559:"StripRowCounts",330:"SubIFDs",292:"T4Options",293:"T6Options",325:"TileByteCounts",323:"TileLength",324:"TileOffsets",322:"TileWidth",301:"TransferFunction",318:"WhitePoint",344:"XClipPathUnits",286:"XPosition",529:"YCbCrCoefficients",531:"YCbCrPositioning",530:"YCbCrSubSampling",345:"YClipPathUnits",287:"YPosition",37378:"ApertureValue",40961:"ColorSpace",36868:"DateTimeDigitized",36867:"DateTimeOriginal",34665:"Exif IFD",36864:"ExifVersion",33434:"ExposureTime",41728:"FileSource",37385:"Flash",40960:"FlashpixVersion",33437:"FNumber",42016:"ImageUniqueID",37384:"LightSource",37500:"MakerNote",37377:"ShutterSpeedValue",37510:"UserComment",33723:"IPTC",34675:"ICC Profile",700:"XMP",42112:"GDAL_METADATA",42113:"GDAL_NODATA",34377:"Photoshop",33550:"ModelPixelScale",33922:"ModelTiepoint",34264:"ModelTransformation",34735:"GeoKeyDirectory",34736:"GeoDoubleParams",34737:"GeoAsciiParams"},u={};for(const e in a)a.hasOwnProperty(e)&&(u[a[e]]=parseInt(e,10));const c={256:"SHORT",257:"SHORT",258:"SHORT",259:"SHORT",262:"SHORT",273:"LONG",274:"SHORT",277:"SHORT",278:"LONG",279:"LONG",282:"RATIONAL",283:"RATIONAL",284:"SHORT",286:"SHORT",287:"RATIONAL",296:"SHORT",305:"ASCII",306:"ASCII",338:"SHORT",339:"SHORT",513:"LONG",514:"LONG",1024:"SHORT",1025:"SHORT",2048:"SHORT",2049:"ASCII",33550:"DOUBLE",33922:"DOUBLE",34665:"LONG",34735:"SHORT",34737:"ASCII",42113:"ASCII"},l=[u.BitsPerSample,u.ExtraSamples,u.SampleFormat,u.StripByteCounts,u.StripOffsets,u.StripRowCounts,u.TileByteCounts,u.TileOffsets],f={1:"BYTE",2:"ASCII",3:"SHORT",4:"LONG",5:"RATIONAL",6:"SBYTE",7:"UNDEFINED",8:"SSHORT",9:"SLONG",10:"SRATIONAL",11:"FLOAT",12:"DOUBLE",13:"IFD",16:"LONG8",17:"SLONG8",18:"IFD8"},h={};for(const e in f)f.hasOwnProperty(e)&&(h[f[e]]=parseInt(e,10));const d={WhiteIsZero:0,BlackIsZero:1,RGB:2,Palette:3,TransparencyMask:4,CMYK:5,YCbCr:6,CIELab:8,ICCLab:9},p={Unspecified:0,Assocalpha:1,Unassalpha:2},g={1024:"GTModelTypeGeoKey",1025:"GTRasterTypeGeoKey",1026:"GTCitationGeoKey",2048:"GeographicTypeGeoKey",2049:"GeogCitationGeoKey",2050:"GeogGeodeticDatumGeoKey",2051:"GeogPrimeMeridianGeoKey",2052:"GeogLinearUnitsGeoKey",2053:"GeogLinearUnitSizeGeoKey",2054:"GeogAngularUnitsGeoKey",2055:"GeogAngularUnitSizeGeoKey",2056:"GeogEllipsoidGeoKey",2057:"GeogSemiMajorAxisGeoKey",2058:"GeogSemiMinorAxisGeoKey",2059:"GeogInvFlatteningGeoKey",2060:"GeogAzimuthUnitsGeoKey",2061:"GeogPrimeMeridianLongGeoKey",2062:"GeogTOWGS84GeoKey",3072:"ProjectedCSTypeGeoKey",3073:"PCSCitationGeoKey",3074:"ProjectionGeoKey",3075:"ProjCoordTransGeoKey",3076:"ProjLinearUnitsGeoKey",3077:"ProjLinearUnitSizeGeoKey",3078:"ProjStdParallel1GeoKey",3079:"ProjStdParallel2GeoKey",3080:"ProjNatOriginLongGeoKey",3081:"ProjNatOriginLatGeoKey",3082:"ProjFalseEastingGeoKey",3083:"ProjFalseNorthingGeoKey",3084:"ProjFalseOriginLongGeoKey",3085:"ProjFalseOriginLatGeoKey",3086:"ProjFalseOriginEastingGeoKey",3087:"ProjFalseOriginNorthingGeoKey",3088:"ProjCenterLongGeoKey",3089:"ProjCenterLatGeoKey",3090:"ProjCenterEastingGeoKey",3091:"ProjCenterNorthingGeoKey",3092:"ProjScaleAtNatOriginGeoKey",3093:"ProjScaleAtCenterGeoKey",3094:"ProjAzimuthAngleGeoKey",3095:"ProjStraightVertPoleLongGeoKey",3096:"ProjRectifiedGridAngleGeoKey",4096:"VerticalCSTypeGeoKey",4097:"VerticalCitationGeoKey",4098:"VerticalDatumGeoKey",4099:"VerticalUnitsGeoKey"},m={};for(const e in g)g.hasOwnProperty(e)&&(m[g[e]]=parseInt(e,10));function y(e,t){const{width:r,height:n}=e,i=new Uint8Array(r*n*3);let o;for(let r=0,n=0;r<e.length;++r,n+=3)o=256-e[r]/t*256,i[n]=o,i[n+1]=o,i[n+2]=o;return i}function b(e,t){const{width:r,height:n}=e,i=new Uint8Array(r*n*3);let o;for(let r=0,n=0;r<e.length;++r,n+=3)o=e[r]/t*256,i[n]=o,i[n+1]=o,i[n+2]=o;return i}function w(e,t){const{width:r,height:n}=e,i=new Uint8Array(r*n*3),o=t.length/3,s=t.length/3*2;for(let r=0,n=0;r<e.length;++r,n+=3){const a=e[r];i[n]=t[a]/65536*256,i[n+1]=t[a+o]/65536*256,i[n+2]=t[a+s]/65536*256;}return i}function v(e){const{width:t,height:r}=e,n=new Uint8Array(t*r*3);for(let t=0,r=0;t<e.length;t+=4,r+=3){const i=e[t],o=e[t+1],s=e[t+2],a=e[t+3];n[r]=(255-i)/256*255*((255-a)/256),n[r+1]=(255-o)/256*255*((255-a)/256),n[r+2]=(255-s)/256*255*((255-a)/256);}return n}function _(e){const{width:t,height:r}=e,n=new Uint8ClampedArray(t*r*3);for(let t=0,r=0;t<e.length;t+=3,r+=3){const i=e[t],o=e[t+1],s=e[t+2];n[r]=i+1.402*(s-128),n[r+1]=i-.34414*(o-128)-.71414*(s-128),n[r+2]=i+1.772*(o-128);}return n}function k(e){const{width:t,height:r}=e,n=new Uint8Array(t*r*3);for(let t=0,r=0;t<e.length;t+=3,r+=3){let i,o,s,a=(e[t+0]+16)/116,u=(e[t+1]<<24>>24)/500+a,c=a-(e[t+2]<<24>>24)/200;u=.95047*(u*u*u>.008856?u*u*u:(u-16/116)/7.787),a=1*(a*a*a>.008856?a*a*a:(a-16/116)/7.787),c=1.08883*(c*c*c>.008856?c*c*c:(c-16/116)/7.787),i=3.2406*u+-1.5372*a+-.4986*c,o=-.9689*u+1.8758*a+.0415*c,s=.0557*u+-.204*a+1.057*c,i=i>.0031308?1.055*i**(1/2.4)-.055:12.92*i,o=o>.0031308?1.055*o**(1/2.4)-.055:12.92*o,s=s>.0031308?1.055*s**(1/2.4)-.055:12.92*s,n[r]=255*Math.max(0,Math.min(1,i)),n[r+1]=255*Math.max(0,Math.min(1,o)),n[r+2]=255*Math.max(0,Math.min(1,s));}return n}function S(e,t){let r=e.length-t,n=0;do{for(let r=t;r>0;r--)e[n+t]+=e[n],n++;r-=t;}while(r>0)}function T(e,t,r){let n=0,i=e.length;const o=i/r;for(;i>t;){for(let r=t;r>0;--r)e[n+t]+=e[n],++n;i-=t;}const s=e.slice();for(let t=0;t<o;++t)for(let n=0;n<r;++n)e[r*t+n]=s[(r-n-1)*o+t];}class x{decode(e,t){const r=this.decodeBlock(t),n=e.Predictor||1;if(1!==n){const t=!e.StripOffsets;return function(e,t,r,n,i,o){if(!t||1===t)return e;for(let e=0;e<i.length;++e){if(i[e]%8!=0)throw new Error("When decoding with predictor, only multiple of 8 bits are supported.");if(i[e]!==i[0])throw new Error("When decoding with predictor, all samples must have the same size.")}const s=i[0]/8,a=2===o?1:i.length;for(let o=0;o<n&&!(o*a*r*s>=e.byteLength);++o){let n;if(2===t){switch(i[0]){case 8:n=new Uint8Array(e,o*a*r*s,a*r*s);break;case 16:n=new Uint16Array(e,o*a*r*s,a*r*s/2);break;case 32:n=new Uint32Array(e,o*a*r*s,a*r*s/4);break;default:throw new Error(`Predictor 2 not allowed with ${i[0]} bits per sample.`)}S(n,a);}else 3===t&&(n=new Uint8Array(e,o*a*r*s,a*r*s),T(n,a,s));}return e}(r,n,t?e.TileWidth:e.ImageWidth,t?e.TileLength:e.RowsPerStrip||e.ImageLength,e.BitsPerSample,e.PlanarConfiguration)}return r}}class E extends x{decodeBlock(e){return e}}function C(e,t){for(let r=t.length-1;r>=0;r--)e.push(t[r]);return e}function A(e){const t=new Uint16Array(4093),r=new Uint8Array(4093);for(let e=0;e<=257;e++)t[e]=4096,r[e]=e;let n=258,i=9,o=0;function s(){n=258,i=9;}function a(e){const t=function(e,t,r){const n=t%8,i=Math.floor(t/8),o=8-n,s=t+r-8*(i+1);let a=8*(i+2)-(t+r);const u=8*(i+2)-t;if(a=Math.max(0,a),i>=e.length)return console.warn("ran off the end of the buffer before finding EOI_CODE (end on input code)"),257;let c=e[i]&2**(8-n)-1;c<<=r-o;let l=c;if(i+1<e.length){let t=e[i+1]>>>a;t<<=Math.max(0,r-u),l+=t;}if(s>8&&i+2<e.length){const n=8*(i+3)-(t+r);l+=e[i+2]>>>n;}return l}(e,o,i);return o+=i,t}function u(e,i){return r[n]=i,t[n]=e,n++,n-1}function c(e){const n=[];for(let i=e;4096!==i;i=t[i])n.push(r[i]);return n}const l=[];s();const f=new Uint8Array(e);let h,d=a(f);for(;257!==d;){if(256===d){for(s(),d=a(f);256===d;)d=a(f);if(257===d)break;if(d>256)throw new Error("corrupted code at scanline "+d);C(l,c(d)),h=d;}else if(d<n){const e=c(d);C(l,e),u(h,e[e.length-1]),h=d;}else {const e=c(h);if(!e)throw new Error(`Bogus entry. Not in dictionary, ${h} / ${n}, position: ${o}`);C(l,e),l.push(e[e.length-1]),u(h,e[e.length-1]),h=d;}n+1>=2**i&&(12===i?h=void 0:i++),d=a(f);}return new Uint8Array(l)}class O extends x{decodeBlock(e){return A(e).buffer}}const R=new Int32Array([0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63]);function I(e,t){let r=0;const n=[];let i=16;for(;i>0&&!e[i-1];)--i;n.push({children:[],index:0});let o,s=n[0];for(let a=0;a<i;a++){for(let i=0;i<e[a];i++){for(s=n.pop(),s.children[s.index]=t[r];s.index>0;)s=n.pop();for(s.index++,n.push(s);n.length<=a;)n.push(o={children:[],index:0}),s.children[s.index]=o.children,s=o;r++;}a+1<i&&(n.push(o={children:[],index:0}),s.children[s.index]=o.children,s=o);}return n[0].children}function P(e,t,r,n,i,o,s,a,u){const{mcusPerLine:c,progressive:l}=r,f=t;let h=t,d=0,p=0;function g(){if(p>0)return p--,d>>p&1;if(d=e[h++],255===d){const t=e[h++];if(t)throw new Error("unexpected marker: "+(d<<8|t).toString(16))}return p=7,d>>>7}function m(e){let t,r=e;for(;null!==(t=g());){if(r=r[t],"number"==typeof r)return r;if("object"!=typeof r)throw new Error("invalid huffman sequence")}return null}function y(e){let t=e,r=0;for(;t>0;){const e=g();if(null===e)return;r=r<<1|e,--t;}return r}function b(e){const t=y(e);return t>=1<<e-1?t:t+(-1<<e)+1}let w=0;let v,_=0;function k(e,t,r,n,i){const o=r%c,s=(r/c|0)*e.v+n,a=o*e.h+i;t(e,e.blocks[s][a]);}function S(e,t,r){const n=r/e.blocksPerLine|0,i=r%e.blocksPerLine;t(e,e.blocks[n][i]);}const T=n.length;let x,E,C,A,O,I;I=l?0===o?0===a?function(e,t){const r=m(e.huffmanTableDC),n=0===r?0:b(r)<<u;e.pred+=n,t[0]=e.pred;}:function(e,t){t[0]|=g()<<u;}:0===a?function(e,t){if(w>0)return void w--;let r=o;const n=s;for(;r<=n;){const n=m(e.huffmanTableAC),i=15&n,o=n>>4;if(0===i){if(o<15){w=y(o)+(1<<o)-1;break}r+=16;}else {r+=o;t[R[r]]=b(i)*(1<<u),r++;}}}:function(e,t){let r=o;const n=s;let i=0;for(;r<=n;){const n=R[r],o=t[n]<0?-1:1;switch(_){case 0:{const t=m(e.huffmanTableAC),r=15&t;if(i=t>>4,0===r)i<15?(w=y(i)+(1<<i),_=4):(i=16,_=1);else {if(1!==r)throw new Error("invalid ACn encoding");v=b(r),_=i?2:3;}continue}case 1:case 2:t[n]?t[n]+=(g()<<u)*o:(i--,0===i&&(_=2===_?3:0));break;case 3:t[n]?t[n]+=(g()<<u)*o:(t[n]=v<<u,_=0);break;case 4:t[n]&&(t[n]+=(g()<<u)*o);}r++;}4===_&&(w--,0===w&&(_=0));}:function(e,t){const r=m(e.huffmanTableDC),n=0===r?0:b(r);e.pred+=n,t[0]=e.pred;let i=1;for(;i<64;){const r=m(e.huffmanTableAC),n=15&r,o=r>>4;if(0===n){if(o<15)break;i+=16;}else {i+=o;t[R[i]]=b(n),i++;}}};let P,M,D=0;M=1===T?n[0].blocksPerLine*n[0].blocksPerColumn:c*r.mcusPerColumn;const L=i||M;for(;D<M;){for(E=0;E<T;E++)n[E].pred=0;if(w=0,1===T)for(x=n[0],O=0;O<L;O++)S(x,I,D),D++;else for(O=0;O<L;O++){for(E=0;E<T;E++){x=n[E];const{h:e,v:t}=x;for(C=0;C<t;C++)for(A=0;A<e;A++)k(x,I,D,C,A);}if(D++,D===M)break}if(p=0,P=e[h]<<8|e[h+1],P<65280)throw new Error("marker was not found");if(!(P>=65488&&P<=65495))break;h+=2;}return h-f}function M(e,t){const r=[],{blocksPerLine:n,blocksPerColumn:i}=t,o=n<<3,s=new Int32Array(64),a=new Uint8Array(64);function u(e,r,n){const i=t.quantizationTable;let o,s,a,u,c,l,f,h,d;const p=n;let g;for(g=0;g<64;g++)p[g]=e[g]*i[g];for(g=0;g<8;++g){const e=8*g;0!==p[1+e]||0!==p[2+e]||0!==p[3+e]||0!==p[4+e]||0!==p[5+e]||0!==p[6+e]||0!==p[7+e]?(o=5793*p[0+e]+128>>8,s=5793*p[4+e]+128>>8,a=p[2+e],u=p[6+e],c=2896*(p[1+e]-p[7+e])+128>>8,h=2896*(p[1+e]+p[7+e])+128>>8,l=p[3+e]<<4,f=p[5+e]<<4,d=o-s+1>>1,o=o+s+1>>1,s=d,d=3784*a+1567*u+128>>8,a=1567*a-3784*u+128>>8,u=d,d=c-f+1>>1,c=c+f+1>>1,f=d,d=h+l+1>>1,l=h-l+1>>1,h=d,d=o-u+1>>1,o=o+u+1>>1,u=d,d=s-a+1>>1,s=s+a+1>>1,a=d,d=2276*c+3406*h+2048>>12,c=3406*c-2276*h+2048>>12,h=d,d=799*l+4017*f+2048>>12,l=4017*l-799*f+2048>>12,f=d,p[0+e]=o+h,p[7+e]=o-h,p[1+e]=s+f,p[6+e]=s-f,p[2+e]=a+l,p[5+e]=a-l,p[3+e]=u+c,p[4+e]=u-c):(d=5793*p[0+e]+512>>10,p[0+e]=d,p[1+e]=d,p[2+e]=d,p[3+e]=d,p[4+e]=d,p[5+e]=d,p[6+e]=d,p[7+e]=d);}for(g=0;g<8;++g){const e=g;0!==p[8+e]||0!==p[16+e]||0!==p[24+e]||0!==p[32+e]||0!==p[40+e]||0!==p[48+e]||0!==p[56+e]?(o=5793*p[0+e]+2048>>12,s=5793*p[32+e]+2048>>12,a=p[16+e],u=p[48+e],c=2896*(p[8+e]-p[56+e])+2048>>12,h=2896*(p[8+e]+p[56+e])+2048>>12,l=p[24+e],f=p[40+e],d=o-s+1>>1,o=o+s+1>>1,s=d,d=3784*a+1567*u+2048>>12,a=1567*a-3784*u+2048>>12,u=d,d=c-f+1>>1,c=c+f+1>>1,f=d,d=h+l+1>>1,l=h-l+1>>1,h=d,d=o-u+1>>1,o=o+u+1>>1,u=d,d=s-a+1>>1,s=s+a+1>>1,a=d,d=2276*c+3406*h+2048>>12,c=3406*c-2276*h+2048>>12,h=d,d=799*l+4017*f+2048>>12,l=4017*l-799*f+2048>>12,f=d,p[0+e]=o+h,p[56+e]=o-h,p[8+e]=s+f,p[48+e]=s-f,p[16+e]=a+l,p[40+e]=a-l,p[24+e]=u+c,p[32+e]=u-c):(d=5793*n[g+0]+8192>>14,p[0+e]=d,p[8+e]=d,p[16+e]=d,p[24+e]=d,p[32+e]=d,p[40+e]=d,p[48+e]=d,p[56+e]=d);}for(g=0;g<64;++g){const e=128+(p[g]+8>>4);r[g]=e<0?0:e>255?255:e;}}for(let e=0;e<i;e++){const i=e<<3;for(let e=0;e<8;e++)r.push(new Uint8Array(o));for(let o=0;o<n;o++){u(t.blocks[e][o],a,s);let n=0;const c=o<<3;for(let e=0;e<8;e++){const t=r[i+e];for(let e=0;e<8;e++)t[c+e]=a[n++];}}}return r}class D{constructor(){this.jfif=null,this.adobe=null,this.quantizationTables=[],this.huffmanTablesAC=[],this.huffmanTablesDC=[],this.resetFrames();}resetFrames(){this.frames=[];}parse(e){let t=0;function r(){const r=e[t]<<8|e[t+1];return t+=2,r}function n(){const n=r(),i=e.subarray(t,t+n-2);return t+=i.length,i}function i(e){let t,r,n=0,i=0;for(r in e.components)e.components.hasOwnProperty(r)&&(t=e.components[r],n<t.h&&(n=t.h),i<t.v&&(i=t.v));const o=Math.ceil(e.samplesPerLine/8/n),s=Math.ceil(e.scanLines/8/i);for(r in e.components)if(e.components.hasOwnProperty(r)){t=e.components[r];const a=Math.ceil(Math.ceil(e.samplesPerLine/8)*t.h/n),u=Math.ceil(Math.ceil(e.scanLines/8)*t.v/i),c=o*t.h,l=s*t.v,f=[];for(let e=0;e<l;e++){const e=[];for(let t=0;t<c;t++)e.push(new Int32Array(64));f.push(e);}t.blocksPerLine=a,t.blocksPerColumn=u,t.blocks=f;}e.maxH=n,e.maxV=i,e.mcusPerLine=o,e.mcusPerColumn=s;}let o=r();if(65496!==o)throw new Error("SOI not found");for(o=r();65497!==o;){switch(o){case 65280:break;case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:case 65534:{const e=n();65504===o&&74===e[0]&&70===e[1]&&73===e[2]&&70===e[3]&&0===e[4]&&(this.jfif={version:{major:e[5],minor:e[6]},densityUnits:e[7],xDensity:e[8]<<8|e[9],yDensity:e[10]<<8|e[11],thumbWidth:e[12],thumbHeight:e[13],thumbData:e.subarray(14,14+3*e[12]*e[13])}),65518===o&&65===e[0]&&100===e[1]&&111===e[2]&&98===e[3]&&101===e[4]&&0===e[5]&&(this.adobe={version:e[6],flags0:e[7]<<8|e[8],flags1:e[9]<<8|e[10],transformCode:e[11]});break}case 65499:{const n=r()+t-2;for(;t<n;){const n=e[t++],i=new Int32Array(64);if(n>>4==0)for(let r=0;r<64;r++){i[R[r]]=e[t++];}else {if(n>>4!=1)throw new Error("DQT: invalid table spec");for(let e=0;e<64;e++){i[R[e]]=r();}}this.quantizationTables[15&n]=i;}break}case 65472:case 65473:case 65474:{r();const n={extended:65473===o,progressive:65474===o,precision:e[t++],scanLines:r(),samplesPerLine:r(),components:{},componentsOrder:[]},s=e[t++];let a;for(let r=0;r<s;r++){a=e[t];const r=e[t+1]>>4,i=15&e[t+1],o=e[t+2];n.componentsOrder.push(a),n.components[a]={h:r,v:i,quantizationIdx:o},t+=3;}i(n),this.frames.push(n);break}case 65476:{const n=r();for(let r=2;r<n;){const n=e[t++],i=new Uint8Array(16);let o=0;for(let r=0;r<16;r++,t++)i[r]=e[t],o+=i[r];const s=new Uint8Array(o);for(let r=0;r<o;r++,t++)s[r]=e[t];r+=17+o,n>>4==0?this.huffmanTablesDC[15&n]=I(i,s):this.huffmanTablesAC[15&n]=I(i,s);}break}case 65501:r(),this.resetInterval=r();break;case 65498:{r();const n=e[t++],i=[],o=this.frames[0];for(let r=0;r<n;r++){const r=o.components[e[t++]],n=e[t++];r.huffmanTableDC=this.huffmanTablesDC[n>>4],r.huffmanTableAC=this.huffmanTablesAC[15&n],i.push(r);}const s=e[t++],a=e[t++],u=e[t++],c=P(e,t,o,i,this.resetInterval,s,a,u>>4,15&u);t+=c;break}case 65535:255!==e[t]&&t--;break;default:if(255===e[t-3]&&e[t-2]>=192&&e[t-2]<=254){t-=3;break}throw new Error("unknown JPEG marker "+o.toString(16))}o=r();}}getResult(){const{frames:e}=this;if(0===this.frames.length)throw new Error("no frames were decoded");this.frames.length>1&&console.warn("more than one frame is not supported");for(let e=0;e<this.frames.length;e++){const t=this.frames[e].components;for(const e of Object.keys(t))t[e].quantizationTable=this.quantizationTables[t[e].quantizationIdx],delete t[e].quantizationIdx;}const t=e[0],{components:r,componentsOrder:n}=t,i=[],o=t.samplesPerLine,s=t.scanLines;for(let e=0;e<n.length;e++){const o=r[n[e]];i.push({lines:M(0,o),scaleX:o.h/t.maxH,scaleY:o.v/t.maxV});}const a=new Uint8Array(o*s*i.length);let u=0;for(let e=0;e<s;++e)for(let t=0;t<o;++t)for(let r=0;r<i.length;++r){const n=i[r];a[u]=n.lines[0|e*n.scaleY][0|t*n.scaleX],++u;}return a}}class L extends x{constructor(e){super(),this.reader=new D,e.JPEGTables&&this.reader.parse(e.JPEGTables);}decodeBlock(e){return this.reader.resetFrames(),this.reader.parse(new Uint8Array(e)),this.reader.getResult().buffer}}var U=r(39);class j extends x{decodeBlock(e){return Object(U.inflate)(new Uint8Array(e)).buffer}}class F extends x{decodeBlock(e){const t=new DataView(e),r=[];for(let n=0;n<e.byteLength;++n){let e=t.getInt8(n);if(e<0){const i=t.getUint8(n+1);e=-e;for(let t=0;t<=e;++t)r.push(i);n+=1;}else {for(let i=0;i<=e;++i)r.push(t.getUint8(n+i+1));n+=e+1;}}return new Uint8Array(r).buffer}}function B(e){switch(e.Compression){case void 0:case 1:return new E;case 5:return new O;case 6:throw new Error("old style JPEG compression is not supported.");case 7:return new L(e);case 8:case 32946:return new j;case 32773:return new F;default:throw new Error("Unknown compression method identifier: "+e.Compression)}}function N(e,t,r,n=1){return new(Object.getPrototypeOf(e).constructor)(t*r*n)}function G(e,t,r){return (1-r)*e+r*t}function q(e,t,r,n,i,o="nearest"){switch(o.toLowerCase()){case"nearest":return function(e,t,r,n,i){const o=t/n,s=r/i;return e.map(e=>{const a=N(e,n,i);for(let u=0;u<i;++u){const i=Math.min(Math.round(s*u),r-1);for(let r=0;r<n;++r){const s=Math.min(Math.round(o*r),t-1),c=e[i*t+s];a[u*n+r]=c;}}return a})}(e,t,r,n,i);case"bilinear":case"linear":return function(e,t,r,n,i){const o=t/n,s=r/i;return e.map(e=>{const a=N(e,n,i);for(let u=0;u<i;++u){const i=s*u,c=Math.floor(i),l=Math.min(Math.ceil(i),r-1);for(let r=0;r<n;++r){const s=o*r,f=s%1,h=Math.floor(s),d=Math.min(Math.ceil(s),t-1),p=e[c*t+h],g=e[c*t+d],m=e[l*t+h],y=e[l*t+d],b=G(G(p,g,f),G(m,y,f),i%1);a[u*n+r]=b;}}return a})}(e,t,r,n,i);default:throw new Error(`Unsupported resampling method: '${o}'`)}}function H(e,t,r,n,i,o,s="nearest"){switch(s.toLowerCase()){case"nearest":return function(e,t,r,n,i,o){const s=t/n,a=r/i,u=N(e,n,i,o);for(let c=0;c<i;++c){const i=Math.min(Math.round(a*c),r-1);for(let r=0;r<n;++r){const a=Math.min(Math.round(s*r),t-1);for(let s=0;s<o;++s){const l=e[i*t*o+a*o+s];u[c*n*o+r*o+s]=l;}}}return u}(e,t,r,n,i,o);case"bilinear":case"linear":return function(e,t,r,n,i,o){const s=t/n,a=r/i,u=N(e,n,i,o);for(let c=0;c<i;++c){const i=a*c,l=Math.floor(i),f=Math.min(Math.ceil(i),r-1);for(let r=0;r<n;++r){const a=s*r,h=a%1,d=Math.floor(a),p=Math.min(Math.ceil(a),t-1);for(let s=0;s<o;++s){const a=e[l*t*o+d*o+s],g=e[l*t*o+p*o+s],m=e[f*t*o+d*o+s],y=e[f*t*o+p*o+s],b=G(G(a,g,h),G(m,y,h),i%1);u[c*n*o+r*o+s]=b;}}}return u}(e,t,r,n,i,o);default:throw new Error(`Unsupported resampling method: '${s}'`)}}function z(e,t,r){let n=0;for(let i=t;i<r;++i)n+=e[i];return n}function K(e,t,r){switch(e){case 1:switch(t){case 8:return new Uint8Array(r);case 16:return new Uint16Array(r);case 32:return new Uint32Array(r)}break;case 2:switch(t){case 8:return new Int8Array(r);case 16:return new Int16Array(r);case 32:return new Int32Array(r)}break;case 3:switch(t){case 32:return new Float32Array(r);case 64:return new Float64Array(r)}}throw Error("Unsupported data format/bitsPerSample")}var W=class{constructor(e,t,r,n,i,o){this.fileDirectory=e,this.geoKeys=t,this.dataView=r,this.littleEndian=n,this.tiles=i?{}:null,this.isTiled=!e.StripOffsets;const s=e.PlanarConfiguration;if(this.planarConfiguration=void 0===s?1:s,1!==this.planarConfiguration&&2!==this.planarConfiguration)throw new Error("Invalid planar configuration.");this.source=o;}getFileDirectory(){return this.fileDirectory}getGeoKeys(){return this.geoKeys}getWidth(){return this.fileDirectory.ImageWidth}getHeight(){return this.fileDirectory.ImageLength}getSamplesPerPixel(){return this.fileDirectory.SamplesPerPixel}getTileWidth(){return this.isTiled?this.fileDirectory.TileWidth:this.getWidth()}getTileHeight(){return this.isTiled?this.fileDirectory.TileLength:void 0!==this.fileDirectory.RowsPerStrip?Math.min(this.fileDirectory.RowsPerStrip,this.getHeight()):this.getHeight()}getBytesPerPixel(){let e=0;for(let t=0;t<this.fileDirectory.BitsPerSample.length;++t){const r=this.fileDirectory.BitsPerSample[t];if(r%8!=0)throw new Error(`Sample bit-width of ${r} is not supported.`);if(r!==this.fileDirectory.BitsPerSample[0])throw new Error("Differing size of samples in a pixel are not supported.");e+=r;}return e/8}getSampleByteSize(e){if(e>=this.fileDirectory.BitsPerSample.length)throw new RangeError(`Sample index ${e} is out of range.`);const t=this.fileDirectory.BitsPerSample[e];if(t%8!=0)throw new Error(`Sample bit-width of ${t} is not supported.`);return t/8}getReaderForSample(e){const t=this.fileDirectory.SampleFormat?this.fileDirectory.SampleFormat[e]:1,r=this.fileDirectory.BitsPerSample[e];switch(t){case 1:switch(r){case 8:return DataView.prototype.getUint8;case 16:return DataView.prototype.getUint16;case 32:return DataView.prototype.getUint32}break;case 2:switch(r){case 8:return DataView.prototype.getInt8;case 16:return DataView.prototype.getInt16;case 32:return DataView.prototype.getInt32}break;case 3:switch(r){case 32:return DataView.prototype.getFloat32;case 64:return DataView.prototype.getFloat64}}throw Error("Unsupported data format/bitsPerSample")}getArrayForSample(e,t){return K(this.fileDirectory.SampleFormat?this.fileDirectory.SampleFormat[e]:1,this.fileDirectory.BitsPerSample[e],t)}async getTileOrStrip(e,t,r,n){const i=Math.ceil(this.getWidth()/this.getTileWidth()),o=Math.ceil(this.getHeight()/this.getTileHeight());let s;const{tiles:a}=this;let u,c;1===this.planarConfiguration?s=t*i+e:2===this.planarConfiguration&&(s=r*i*o+t*i+e),this.isTiled?(u=this.fileDirectory.TileOffsets[s],c=this.fileDirectory.TileByteCounts[s]):(u=this.fileDirectory.StripOffsets[s],c=this.fileDirectory.StripByteCounts[s]);const l=await this.source.fetch(u,c);let f;return null===a?f=n.decode(this.fileDirectory,l):a[s]||(f=n.decode(this.fileDirectory,l),a[s]=f),{x:e,y:t,sample:r,data:await f}}async _readRaster(e,t,r,n,i,o,s,a){const u=this.getTileWidth(),c=this.getTileHeight(),l=Math.max(Math.floor(e[0]/u),0),f=Math.min(Math.ceil(e[2]/u),Math.ceil(this.getWidth()/this.getTileWidth())),h=Math.max(Math.floor(e[1]/c),0),d=Math.min(Math.ceil(e[3]/c),Math.ceil(this.getHeight()/this.getTileHeight())),p=e[2]-e[0];let g=this.getBytesPerPixel();const m=[],y=[];for(let e=0;e<t.length;++e)1===this.planarConfiguration?m.push(z(this.fileDirectory.BitsPerSample,0,t[e])/8):m.push(0),y.push(this.getReaderForSample(t[e]));const b=[],{littleEndian:w}=this;for(let o=h;o<d;++o)for(let s=l;s<f;++s)for(let a=0;a<t.length;++a){const l=a,f=t[a];2===this.planarConfiguration&&(g=this.getSampleByteSize(f));const h=this.getTileOrStrip(s,o,f,i);b.push(h),h.then(i=>{const o=i.data,s=new DataView(o),a=i.y*c,f=i.x*u,h=(i.y+1)*c,d=(i.x+1)*u,b=y[l],v=Math.min(c,c-(h-e[3])),_=Math.min(u,u-(d-e[2]));for(let i=Math.max(0,e[1]-a);i<v;++i)for(let o=Math.max(0,e[0]-f);o<_;++o){const c=(i*u+o)*g,h=b.call(s,c+m[l],w);let d;n?(d=(i+a-e[1])*p*t.length+(o+f-e[0])*t.length+l,r[d]=h):(d=(i+a-e[1])*p+o+f-e[0],r[l][d]=h);}});}if(await Promise.all(b),o&&e[2]-e[0]!==o||s&&e[3]-e[1]!==s){let i;return i=n?H(r,e[2]-e[0],e[3]-e[1],o,s,t.length,a):q(r,e[2]-e[0],e[3]-e[1],o,s,a),i.width=o,i.height=s,i}return r.width=o||e[2]-e[0],r.height=s||e[3]-e[1],r}async readRasters({window:e,samples:t=[],interleave:r,pool:n=null,width:i,height:o,resampleMethod:s,fillValue:a}={}){const u=e||[0,0,this.getWidth(),this.getHeight()];if(u[0]>u[2]||u[1]>u[3])throw new Error("Invalid subsets");const c=(u[2]-u[0])*(u[3]-u[1]);if(t&&t.length){for(let e=0;e<t.length;++e)if(t[e]>=this.fileDirectory.SamplesPerPixel)return Promise.reject(new RangeError(`Invalid sample index '${t[e]}'.`))}else for(let e=0;e<this.fileDirectory.SamplesPerPixel;++e)t.push(e);let l;if(r){l=K(this.fileDirectory.SampleFormat?Math.max.apply(null,this.fileDirectory.SampleFormat):1,Math.max.apply(null,this.fileDirectory.BitsPerSample),c*t.length),a&&l.fill(a);}else {l=[];for(let e=0;e<t.length;++e){const r=this.getArrayForSample(t[e],c);Array.isArray(a)&&e<a.length?r.fill(a[e]):a&&!Array.isArray(a)&&r.fill(a),l.push(r);}}const f=n||B(this.fileDirectory);return await this._readRaster(u,t,l,r,f,i,o,s)}async readRGB({window:e,pool:t=null,width:r,height:n,resampleMethod:i,enableAlpha:o=!1}={}){const s=e||[0,0,this.getWidth(),this.getHeight()];if(s[0]>s[2]||s[1]>s[3])throw new Error("Invalid subsets");const a=this.fileDirectory.PhotometricInterpretation;if(a===d.RGB){let i=[0,1,2];if(this.fileDirectory.ExtraSamples!==p.Unspecified&&o){i=[];for(let e=0;e<this.fileDirectory.BitsPerSample.length;e+=1)i.push(e);}return this.readRasters({window:e,interleave:!0,samples:i,pool:t,width:r,height:n})}let u;switch(a){case d.WhiteIsZero:case d.BlackIsZero:case d.Palette:u=[0];break;case d.CMYK:u=[0,1,2,3];break;case d.YCbCr:case d.CIELab:u=[0,1,2];break;default:throw new Error("Invalid or unsupported photometric interpretation.")}const c={window:s,interleave:!0,samples:u,pool:t,width:r,height:n,resampleMethod:i},{fileDirectory:l}=this,f=await this.readRasters(c),h=2**this.fileDirectory.BitsPerSample[0];let g;switch(a){case d.WhiteIsZero:g=y(f,h);break;case d.BlackIsZero:g=b(f,h);break;case d.Palette:g=w(f,l.ColorMap);break;case d.CMYK:g=v(f);break;case d.YCbCr:g=_(f);break;case d.CIELab:g=k(f);break;default:throw new Error("Unsupported photometric interpretation.")}return g.width=f.width,g.height=f.height,g}getTiePoints(){if(!this.fileDirectory.ModelTiepoint)return [];const e=[];for(let t=0;t<this.fileDirectory.ModelTiepoint.length;t+=6)e.push({i:this.fileDirectory.ModelTiepoint[t],j:this.fileDirectory.ModelTiepoint[t+1],k:this.fileDirectory.ModelTiepoint[t+2],x:this.fileDirectory.ModelTiepoint[t+3],y:this.fileDirectory.ModelTiepoint[t+4],z:this.fileDirectory.ModelTiepoint[t+5]});return e}getGDALMetadata(e=null){const t={};if(!this.fileDirectory.GDAL_METADATA)return null;const r=this.fileDirectory.GDAL_METADATA,n=s()(r.substring(0,r.length-1));if(!n[0].tagName)throw new Error("Failed to parse GDAL metadata XML.");const i=n[0];if("GDALMetadata"!==i.tagName)throw new Error("Unexpected GDAL metadata XML tag.");let o=i.children.filter(e=>"Item"===e.tagName);e&&(o=o.filter(t=>Number(t.attributes.sample)===e));for(let e=0;e<o.length;++e){const r=o[e];t[r.attributes.name]=r.children[0];}return t}getGDALNoData(){if(!this.fileDirectory.GDAL_NODATA)return null;const e=this.fileDirectory.GDAL_NODATA;return Number(e.substring(0,e.length-1))}getOrigin(){const e=this.fileDirectory.ModelTiepoint,t=this.fileDirectory.ModelTransformation;if(e&&6===e.length)return [e[3],e[4],e[5]];if(t)return [t[3],t[7],t[11]];throw new Error("The image does not have an affine transformation.")}getResolution(e=null){const t=this.fileDirectory.ModelPixelScale,r=this.fileDirectory.ModelTransformation;if(t)return [t[0],-t[1],t[2]];if(r)return [r[0],r[5],r[10]];if(e){const[t,r,n]=e.getResolution();return [t*e.getWidth()/this.getWidth(),r*e.getHeight()/this.getHeight(),n*e.getWidth()/this.getWidth()]}throw new Error("The image does not have an affine transformation.")}pixelIsArea(){return 1===this.geoKeys.GTRasterTypeGeoKey}getBoundingBox(){const e=this.getOrigin(),t=this.getResolution(),r=e[0],n=e[1],i=r+t[0]*this.getWidth(),o=n+t[1]*this.getHeight();return [Math.min(r,i),Math.min(n,o),Math.max(r,i),Math.max(n,o)]}};class V{constructor(e){this._dataView=new DataView(e);}get buffer(){return this._dataView.buffer}getUint64(e,t){const r=this.getUint32(e,t),n=this.getUint32(e+4,t);let i;if(t){if(i=r+2**32*n,!Number.isSafeInteger(i))throw new Error(i+" exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues");return i}if(i=2**32*r+n,!Number.isSafeInteger(i))throw new Error(i+" exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues");return i}getInt64(e,t){let r=0;const n=(128&this._dataView.getUint8(e+(t?7:0)))>0;let i=!0;for(let o=0;o<8;o++){let s=this._dataView.getUint8(e+(t?o:7-o));n&&(i?0!==s&&(s=255&~(s-1),i=!1):s=255&~s),r+=s*256**o;}return n&&(r=-r),r}getUint8(e,t){return this._dataView.getUint8(e,t)}getInt8(e,t){return this._dataView.getInt8(e,t)}getUint16(e,t){return this._dataView.getUint16(e,t)}getInt16(e,t){return this._dataView.getInt16(e,t)}getUint32(e,t){return this._dataView.getUint32(e,t)}getInt32(e,t){return this._dataView.getInt32(e,t)}getFloat32(e,t){return this._dataView.getFloat32(e,t)}getFloat64(e,t){return this._dataView.getFloat64(e,t)}}class Y{constructor(e,t,r,n){this._dataView=new DataView(e),this._sliceOffset=t,this._littleEndian=r,this._bigTiff=n;}get sliceOffset(){return this._sliceOffset}get sliceTop(){return this._sliceOffset+this.buffer.byteLength}get littleEndian(){return this._littleEndian}get bigTiff(){return this._bigTiff}get buffer(){return this._dataView.buffer}covers(e,t){return this.sliceOffset<=e&&this.sliceTop>=e+t}readUint8(e){return this._dataView.getUint8(e-this._sliceOffset,this._littleEndian)}readInt8(e){return this._dataView.getInt8(e-this._sliceOffset,this._littleEndian)}readUint16(e){return this._dataView.getUint16(e-this._sliceOffset,this._littleEndian)}readInt16(e){return this._dataView.getInt16(e-this._sliceOffset,this._littleEndian)}readUint32(e){return this._dataView.getUint32(e-this._sliceOffset,this._littleEndian)}readInt32(e){return this._dataView.getInt32(e-this._sliceOffset,this._littleEndian)}readFloat32(e){return this._dataView.getFloat32(e-this._sliceOffset,this._littleEndian)}readFloat64(e){return this._dataView.getFloat64(e-this._sliceOffset,this._littleEndian)}readUint64(e){const t=this.readUint32(e),r=this.readUint32(e+4);let n;if(this._littleEndian){if(n=t+2**32*r,!Number.isSafeInteger(n))throw new Error(n+" exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues");return n}if(n=2**32*t+r,!Number.isSafeInteger(n))throw new Error(n+" exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues");return n}readInt64(e){let t=0;const r=(128&this._dataView.getUint8(e+(this._littleEndian?7:0)))>0;let n=!0;for(let i=0;i<8;i++){let o=this._dataView.getUint8(e+(this._littleEndian?i:7-i));r&&(n?0!==o&&(o=255&~(o-1),n=!1):o=255&~o),t+=o*256**i;}return r&&(t=-t),t}readOffset(e){return this._bigTiff?this.readUint64(e):this.readUint32(e)}}var Z=r(33),$=r(2),X=r(12),Q=r(18),J=r.n(Q),ee=r(43),te=r.n(ee),re=r(17),ne=r.n(re);class ie{constructor(e,{blockSize:t=65536}={}){this.retrievalFunction=e,this.blockSize=t,this.blockRequests=new Map,this.blocks=new Map,this.blockIdsAwaitingRequest=null;}async fetch(e,t,r=!1){const n=e+t,i=[],o=[],s=[];for(let t=Math.floor(e/this.blockSize)*this.blockSize;t<n;t+=this.blockSize){const e=Math.floor(t/this.blockSize);this.blocks.has(e)||this.blockRequests.has(e)||o.push(e),this.blockRequests.has(e)&&s.push(this.blockRequests.get(e)),i.push(e);}if(this.blockIdsAwaitingRequest)for(let e=0;e<o.length;++e){const t=o[e];this.blockIdsAwaitingRequest.add(t);}else this.blockIdsAwaitingRequest=new Set(o);if(r||await async function(e){return new Promise(t=>setTimeout(t,e))}(),this.blockIdsAwaitingRequest){const e=function(e){if(0===e.length)return [];const t=[];let r=[];t.push(r);for(let n=0;n<e.length;++n)0===n||e[n]===e[n-1]+1?r.push(e[n]):(r=[e[n]],t.push(r));return t}(Array.from(this.blockIdsAwaitingRequest).sort());for(const t of e){const e=this.requestData(t[0]*this.blockSize,t.length*this.blockSize);for(let r=0;r<t.length;++r){const n=t[r];this.blockRequests.set(n,(async()=>{const t=await e,i=r*this.blockSize,o=Math.min(i+this.blockSize,t.data.byteLength),s=t.data.slice(i,o);this.blockRequests.delete(n),this.blocks.set(n,{data:s,offset:t.offset+i,length:s.byteLength,top:t.offset+o});})());}}this.blockIdsAwaitingRequest=null;}const a=[];for(const e of o)this.blockRequests.has(e)&&a.push(this.blockRequests.get(e));await Promise.all(a),await Promise.all(s);return function(e,t,r){const n=t+r,i=new ArrayBuffer(r),o=new Uint8Array(i);for(const r of e){const e=r.offset-t,i=r.top-n;let s,a=0,u=0;e<0?a=-e:e>0&&(u=e),s=i<0?r.length-a:n-r.offset-a;const c=new Uint8Array(r.data,a,s);o.set(c,u);}return i}(i.map(e=>this.blocks.get(e)),e,t)}async requestData(e,t){const r=await this.retrievalFunction(e,t);return r.length?r.length!==r.data.byteLength&&(r.data=r.data.slice(0,r.length)):r.length=r.data.byteLength,r.top=r.offset+r.length,r}}function oe(e,t){const{forceXHR:r}=t;if("function"==typeof fetch&&!r)return function(e,{headers:t={},blockSize:r}={}){return new ie(async(r,n)=>{const i=await fetch(e,{headers:{...t,Range:`bytes=${r}-${r+n-1}`}});if(i.ok){if(206===i.status){return {data:i.arrayBuffer?await i.arrayBuffer():(await i.buffer()).buffer,offset:r,length:n}}{const e=i.arrayBuffer?await i.arrayBuffer():(await i.buffer()).buffer;return {data:e,offset:0,length:e.byteLength}}}throw new Error("Error fetching data.")},{blockSize:r})}(e,t);if("undefined"!=typeof XMLHttpRequest)return function(e,{headers:t={},blockSize:r}={}){return new ie(async(r,n)=>new Promise((i,o)=>{const s=new XMLHttpRequest;s.open("GET",e),s.responseType="arraybuffer";const a={...t,Range:`bytes=${r}-${r+n-1}`};for(const[e,t]of Object.entries(a))s.setRequestHeader(e,t);s.onload=()=>{const e=s.response;206===s.status?i({data:e,offset:r,length:n}):i({data:e,offset:0,length:e.byteLength});},s.onerror=o,s.send();}),{blockSize:r})}(e,t);if(J.a.get)return function(e,{headers:t={},blockSize:r}={}){return new ie(async(r,n)=>new Promise((i,o)=>{const s=ne.a.parse(e);("http:"===s.protocol?J.a:te.a).get({...s,headers:{...t,Range:`bytes=${r}-${r+n-1}`}},e=>{const t=[];e.on("data",e=>{t.push(e);}),e.on("end",()=>{const e=$.Buffer.concat(t).buffer;i({data:e,offset:r,length:e.byteLength});});}).on("error",o);}),{blockSize:r})}(e,t);throw new Error("No remote source available")}function se(e){const t=function(e,t,r){return new Promise((n,i)=>{Object(X.open)(e,t,r,(e,t)=>{e?i(e):n(t);});})}(e,"r");return {async fetch(e,r){const n=await t,{buffer:i}=await function(...e){return new Promise((t,r)=>{Object(X.read)(...e,(e,n,i)=>{e?r(e):t({bytesRead:n,buffer:i});});})}(n,$.Buffer.alloc(r),0,r,e);return i.buffer},async close(){const e=await t;return await function(e){return new Promise((t,r)=>{Object(X.close)(e,e=>{e?r(e):t();});})}(e)}}}function ae(e,t){for(const r in t)t.hasOwnProperty(r)&&(e[r]=t[r]);}function ue(e,t){if(e.length<t.length)return !1;return e.substr(e.length-t.length)===t}function ce(e){const t={};for(const r in e)if(e.hasOwnProperty(r)){t[e[r]]=r;}return t}function le(e,t){const r=[];for(let n=0;n<e;n++)r.push(t(n));return r}const fe=ce(a),he=ce(g),de={};ae(de,fe),ae(de,he);const pe=ce(f),ge={nextZero:(e,t)=>{let r=t;for(;0!==e[r];)r++;return r},readUshort:(e,t)=>e[t]<<8|e[t+1],readShort:(e,t)=>{const r=ge.ui8;return r[0]=e[t+1],r[1]=e[t+0],ge.i16[0]},readInt:(e,t)=>{const r=ge.ui8;return r[0]=e[t+3],r[1]=e[t+2],r[2]=e[t+1],r[3]=e[t+0],ge.i32[0]},readUint:(e,t)=>{const r=ge.ui8;return r[0]=e[t+3],r[1]=e[t+2],r[2]=e[t+1],r[3]=e[t+0],ge.ui32[0]},readASCII:(e,t,r)=>r.map(r=>String.fromCharCode(e[t+r])).join(""),readFloat:(e,t)=>{const r=ge.ui8;return le(4,n=>{r[n]=e[t+3-n];}),ge.fl32[0]},readDouble:(e,t)=>{const r=ge.ui8;return le(8,n=>{r[n]=e[t+7-n];}),ge.fl64[0]},writeUshort:(e,t,r)=>{e[t]=r>>8&255,e[t+1]=255&r;},writeUint:(e,t,r)=>{e[t]=r>>24&255,e[t+1]=r>>16&255,e[t+2]=r>>8&255,e[t+3]=r>>0&255;},writeASCII:(e,t,r)=>{le(r.length,n=>{e[t+n]=r.charCodeAt(n);});},ui8:new Uint8Array(8)};ge.fl64=new Float64Array(ge.ui8.buffer),ge.writeDouble=(e,t,r)=>{ge.fl64[0]=r,le(8,r=>{e[t+r]=ge.ui8[7-r];});};const me=e=>{const t=new Uint8Array(1e3);let r=4;const n=ge;t[0]=77,t[1]=77,t[3]=42;let i=8;if(n.writeUint(t,r,i),r+=4,e.forEach((r,o)=>{const s=((e,t,r,n)=>{let i=r;const o=Object.keys(n).filter(e=>null!=e&&"undefined"!==e);e.writeUshort(t,i,o.length),i+=2;let s=i+12*o.length+4;for(const r of o){let o=null;"number"==typeof r?o=r:"string"==typeof r&&(o=parseInt(r,10));const a=c[o],u=pe[a];if(null==a||void 0===a||void 0===a)throw new Error("unknown type of tag: "+o);let l=n[r];if(void 0===l)throw new Error("failed to get value for key "+r);"ASCII"===a&&"string"==typeof l&&!1===ue(l,"\0")&&(l+="\0");const f=l.length;e.writeUshort(t,i,o),i+=2,e.writeUshort(t,i,u),i+=2,e.writeUint(t,i,f),i+=4;let h=[-1,1,1,2,4,8,0,0,0,0,0,0,8][u]*f,d=i;h>4&&(e.writeUint(t,i,s),d=s),"ASCII"===a?e.writeASCII(t,d,l):"SHORT"===a?le(f,r=>{e.writeUshort(t,d+2*r,l[r]);}):"LONG"===a?le(f,r=>{e.writeUint(t,d+4*r,l[r]);}):"RATIONAL"===a?le(f,r=>{e.writeUint(t,d+8*r,Math.round(1e4*l[r])),e.writeUint(t,d+8*r+4,1e4);}):"DOUBLE"===a&&le(f,r=>{e.writeDouble(t,d+8*r,l[r]);}),h>4&&(h+=1&h,s+=h),i+=4;}return [i,s]})(n,t,i,r);i=s[1],o<e.length-1&&n.writeUint(t,s[0],i);}),t.slice)return t.slice(0,i).buffer;const o=new Uint8Array(i);for(let e=0;e<i;e++)o[e]=t[e];return o.buffer},ye=[["Compression",1],["PlanarConfiguration",1],["XPosition",0],["YPosition",0],["ResolutionUnit",1],["ExtraSamples",0],["GeoAsciiParams","WGS 84\0"],["ModelTiepoint",[0,0,0,-180,90,0]],["GTModelTypeGeoKey",2],["GTRasterTypeGeoKey",1],["GeographicTypeGeoKey",4326],["GeogCitationGeoKey","WGS 84"]];function be(e,t){let r,n,i,o;"number"==typeof e[0]?(r=t.height||t.ImageLength,i=t.width||t.ImageWidth,n=e.length/(r*i),o=e):(n=e.length,r=e[0].length,i=e[0][0].length,o=[],le(r,t=>{le(i,r=>{le(n,n=>{o.push(e[n][t][r]);});});})),t.ImageLength=r,delete t.height,t.ImageWidth=i,delete t.width,t.BitsPerSample||(t.BitsPerSample=le(n,()=>8)),ye.forEach(e=>{const r=e[0];if(!t[r]){const n=e[1];t[r]=n;}}),t.PhotometricInterpretation||(t.PhotometricInterpretation=3===t.BitsPerSample.length?2:1),t.SamplesPerPixel||(t.SamplesPerPixel=[n]),t.StripByteCounts||(t.StripByteCounts=[n*r*i]),t.ModelPixelScale||(t.ModelPixelScale=[360/i,180/r,0]),t.SampleFormat||(t.SampleFormat=le(n,()=>1));const s=Object.keys(t).filter(e=>ue(e,"GeoKey")).sort((e,t)=>de[e]-de[t]);if(!t.GeoKeyDirectory){const e=[1,1,0,s.length];s.forEach(r=>{const n=Number(de[r]);let i,o,s;e.push(n),"SHORT"===c[n]?(i=1,o=0,s=t[r]):"GeogCitationGeoKey"===r?(i=t.GeoAsciiParams.length,o=Number(de.GeoAsciiParams),s=0):console.log("[geotiff.js] couldn't get TIFFTagLocation for "+r),e.push(o),e.push(i),e.push(s);}),t.GeoKeyDirectory=e;}for(const e in s)s.hasOwnProperty(e)&&delete t[e];["Compression","ExtraSamples","GeographicTypeGeoKey","GTModelTypeGeoKey","GTRasterTypeGeoKey","ImageLength","ImageWidth","PhotometricInterpretation","PlanarConfiguration","ResolutionUnit","SamplesPerPixel","XPosition","YPosition"].forEach(e=>{var r;t[e]&&(t[e]=(r=t[e],Array.isArray(r)?r:[r]));});const a=(e=>{const t={};for(const r in e)"StripOffsets"!==r&&(de[r]||console.error(r,"not in name2code:",Object.keys(de)),t[de[r]]=e[r]);return t})(t);return ((e,t,r,n)=>{if(null==r)throw new Error("you passed into encodeImage a width of type "+r);if(null==t)throw new Error("you passed into encodeImage a width of type "+t);const i={256:[t],257:[r],273:[1e3],278:[r],305:"geotiff.js"};if(n)for(const e in n)n.hasOwnProperty(e)&&(i[e]=n[e]);const o=new Uint8Array(me([i])),s=new Uint8Array(e),a=i[277],u=new Uint8Array(1e3+t*r*a);return le(o.length,e=>{u[e]=o[e];}),function(e,t){const{length:r}=e;for(let n=0;n<r;n++)t(e[n],n);}(s,(e,t)=>{u[1e3+t]=e;}),u.buffer})(o,i,r,a)}class we{log(){}info(){}warn(){}error(){}time(){}timeEnd(){}}function _e(e=new we){}function ke(e){switch(e){case h.BYTE:case h.ASCII:case h.SBYTE:case h.UNDEFINED:return 1;case h.SHORT:case h.SSHORT:return 2;case h.LONG:case h.SLONG:case h.FLOAT:case h.IFD:return 4;case h.RATIONAL:case h.SRATIONAL:case h.DOUBLE:case h.LONG8:case h.SLONG8:case h.IFD8:return 8;default:throw new RangeError("Invalid field type: "+e)}}function Se(e,t,r,n){let i=null,o=null;const s=ke(t);switch(t){case h.BYTE:case h.ASCII:case h.UNDEFINED:i=new Uint8Array(r),o=e.readUint8;break;case h.SBYTE:i=new Int8Array(r),o=e.readInt8;break;case h.SHORT:i=new Uint16Array(r),o=e.readUint16;break;case h.SSHORT:i=new Int16Array(r),o=e.readInt16;break;case h.LONG:case h.IFD:i=new Uint32Array(r),o=e.readUint32;break;case h.SLONG:i=new Int32Array(r),o=e.readInt32;break;case h.LONG8:case h.IFD8:i=new Array(r),o=e.readUint64;break;case h.SLONG8:i=new Array(r),o=e.readInt64;break;case h.RATIONAL:i=new Uint32Array(2*r),o=e.readUint32;break;case h.SRATIONAL:i=new Int32Array(2*r),o=e.readInt32;break;case h.FLOAT:i=new Float32Array(r),o=e.readFloat32;break;case h.DOUBLE:i=new Float64Array(r),o=e.readFloat64;break;default:throw new RangeError("Invalid field type: "+t)}if(t!==h.RATIONAL&&t!==h.SRATIONAL)for(let t=0;t<r;++t)i[t]=o.call(e,n+t*s);else for(let t=0;t<r;t+=2)i[t]=o.call(e,n+t*s),i[t+1]=o.call(e,n+(t*s+4));return t===h.ASCII?String.fromCharCode.apply(null,i):i}class Te{constructor(e,t,r){this.fileDirectory=e,this.geoKeyDirectory=t,this.nextIFDByteOffset=r;}}class xe extends Error{constructor(e){super("No image at index "+e),this.index=e;}}class Ee{async readRasters(e={}){const{window:t,width:r,height:n}=e;let{resX:i,resY:o,bbox:s}=e;const a=await this.getImage();let u=a;const c=await this.getImageCount(),l=a.getBoundingBox();if(t&&s)throw new Error('Both "bbox" and "window" passed.');if(r||n){if(t){const[e,r]=a.getOrigin(),[n,i]=a.getResolution();s=[e+t[0]*n,r+t[1]*i,e+t[2]*n,r+t[3]*i];}const e=s||l;if(r){if(i)throw new Error("Both width and resX passed");i=(e[2]-e[0])/r;}if(n){if(o)throw new Error("Both width and resY passed");o=(e[3]-e[1])/n;}}if(i||o){const e=[];for(let t=0;t<c;++t){const r=await this.getImage(t),{SubfileType:n,NewSubfileType:i}=r.fileDirectory;(0===t||2===n||1&i)&&e.push(r);}e.sort((e,t)=>e.getWidth()-t.getWidth());for(let t=0;t<e.length;++t){const r=e[t],n=(l[2]-l[0])/r.getWidth(),s=(l[3]-l[1])/r.getHeight();if(u=r,i&&i>n||o&&o>s)break}}let f=t;if(s){const[e,t]=a.getOrigin(),[r,n]=u.getResolution(a);f=[Math.round((s[0]-e)/r),Math.round((s[1]-t)/n),Math.round((s[2]-e)/r),Math.round((s[3]-t)/n)],f=[Math.min(f[0],f[2]),Math.min(f[1],f[3]),Math.max(f[0],f[2]),Math.max(f[1],f[3])];}return u.readRasters({...e,window:f})}}class Ce extends Ee{constructor(e,t,r,n,i={}){super(),this.source=e,this.littleEndian=t,this.bigTiff=r,this.firstIFDOffset=n,this.cache=i.cache||!1,this.ifdRequests=[],this.ghostValues=null;}async getSlice(e,t){const r=this.bigTiff?4048:1024;return new Y(await this.source.fetch(e,void 0!==t?t:r),e,this.littleEndian,this.bigTiff)}async parseFileDirectoryAt(e){const t=this.bigTiff?20:12,r=this.bigTiff?8:2;let n=await this.getSlice(e);const i=this.bigTiff?n.readUint64(e):n.readUint16(e),o=i*t+(this.bigTiff?16:6);n.covers(e,o)||(n=await this.getSlice(e,o));const s={};let u=e+(this.bigTiff?8:2);for(let e=0;e<i;u+=t,++e){const e=n.readUint16(u),t=n.readUint16(u+2),r=this.bigTiff?n.readUint64(u+4):n.readUint32(u+4);let i,o;const c=ke(t),f=u+(this.bigTiff?12:8);if(c*r<=(this.bigTiff?8:4))i=Se(n,t,r,f);else {const e=n.readOffset(f),o=ke(t)*r;if(n.covers(e,o))i=Se(n,t,r,e);else {i=Se(await this.getSlice(e,o),t,r,e);}}o=1===r&&-1===l.indexOf(e)&&t!==h.RATIONAL&&t!==h.SRATIONAL?i[0]:i,s[a[e]]=o;}const c=function(e){const t=e.GeoKeyDirectory;if(!t)return null;const r={};for(let n=4;n<=4*t[3];n+=4){const i=g[t[n]],o=t[n+1]?a[t[n+1]]:null,s=t[n+2],u=t[n+3];let c=null;if(o){if(c=e[o],null==c)throw new Error(`Could not get value of geoKey '${i}'.`);"string"==typeof c?c=c.substring(u,u+s-1):c.subarray&&(c=c.subarray(u,u+s),1===s&&(c=c[0]));}else c=u;r[i]=c;}return r}(s),f=n.readOffset(e+r+t*i);return new Te(s,c,f)}async requestIFD(e){if(this.ifdRequests[e])return this.ifdRequests[e];if(0===e)return this.ifdRequests[e]=this.parseFileDirectoryAt(this.firstIFDOffset),this.ifdRequests[e];if(!this.ifdRequests[e-1])try{this.ifdRequests[e-1]=this.requestIFD(e-1);}catch(t){if(t instanceof xe)throw new xe(e);throw t}return this.ifdRequests[e]=(async()=>{const t=await this.ifdRequests[e-1];if(0===t.nextIFDByteOffset)throw new xe(e);return this.parseFileDirectoryAt(t.nextIFDByteOffset)})(),this.ifdRequests[e]}async getImage(e=0){const t=await this.requestIFD(e);return new W(t.fileDirectory,t.geoKeyDirectory,this.dataView,this.littleEndian,this.cache,this.source)}async getImageCount(){let e=0,t=!0;for(;t;)try{await this.requestIFD(e),++e;}catch(e){if(!(e instanceof xe))throw e;t=!1;}return e}async getGhostValues(){const e=this.bigTiff?16:8;if(this.ghostValues)return this.ghostValues;const t="GDAL_STRUCTURAL_METADATA_SIZE=",r=t.length+100;let n=await this.getSlice(e,r);if(t===Se(n,h.ASCII,t.length,e)){const t=Se(n,h.ASCII,r,e).split("\n")[0],i=Number(t.split("=")[1].split(" ")[0])+t.length;i>r&&(n=await this.getSlice(e,i));const o=Se(n,h.ASCII,i,e);this.ghostValues={},o.split("\n").filter(e=>e.length>0).map(e=>e.split("=")).forEach(([e,t])=>{this.ghostValues[e]=t;});}return this.ghostValues}static async fromSource(e,t){const r=await e.fetch(0,1024),n=new V(r),i=n.getUint16(0,0);let o;if(18761===i)o=!0;else {if(19789!==i)throw new TypeError("Invalid byte order value.");o=!1;}const s=n.getUint16(2,o);let a;if(42===s)a=!1;else {if(43!==s)throw new TypeError("Invalid magic number.");a=!0;if(8!==n.getUint16(4,o))throw new Error("Unsupported offset byte-size.")}const u=a?n.getUint64(8,o):n.getUint32(4,o);return new Ce(e,o,a,u,t)}close(){return "function"==typeof this.source.close&&this.source.close()}}t.default=Ce;class Ae extends Ee{constructor(e,t){super(),this.mainFile=e,this.overviewFiles=t,this.imageFiles=[e].concat(t),this.fileDirectoriesPerFile=null,this.fileDirectoriesPerFileParsing=null,this.imageCount=null;}async parseFileDirectoriesPerFile(){const e=[this.mainFile.parseFileDirectoryAt(this.mainFile.firstIFDOffset)].concat(this.overviewFiles.map(e=>e.parseFileDirectoryAt(e.firstIFDOffset)));return this.fileDirectoriesPerFile=await Promise.all(e),this.fileDirectoriesPerFile}async getImage(e=0){await this.getImageCount(),await this.parseFileDirectoriesPerFile();let t=0,r=0;for(let n=0;n<this.imageFiles.length;n++){const i=this.imageFiles[n];for(let o=0;o<this.imageCounts[n];o++){if(e===t){const e=await i.requestIFD(r);return new W(e.fileDirectory,i.geoKeyDirectory,i.dataView,i.littleEndian,i.cache,i.source)}t++,r++;}r=0;}throw new RangeError("Invalid image index")}async getImageCount(){if(null!==this.imageCount)return this.imageCount;const e=[this.mainFile.getImageCount()].concat(this.overviewFiles.map(e=>e.getImageCount()));return this.imageCounts=await Promise.all(e),this.imageCount=this.imageCounts.reduce((e,t)=>e+t,0),this.imageCount}}async function Oe(e,t={}){return Ce.fromSource(oe(e,t))}async function Re(e){return Ce.fromSource(function(e){return {fetch:async(t,r)=>e.slice(t,t+r)}}(e))}async function Ie(e){return Ce.fromSource(se(e))}async function Pe(e){return Ce.fromSource((t=e,{fetch:async(e,r)=>new Promise((n,i)=>{const o=t.slice(e,e+r),s=new FileReader;s.onload=e=>n(e.target.result),s.onerror=i,s.readAsArrayBuffer(o);})}));var t;}async function Me(e,t=[],r={}){const n=await Ce.fromSource(oe(e,r)),i=await Promise.all(t.map(e=>Ce.fromSource(oe(e,r))));return new Ae(n,i)}async function De(e,t){return be(e,t)}},function(e,t,r){function n(e,t){var r=(t=t||{}).pos||0,i="<".charCodeAt(0),o=">".charCodeAt(0),s="-".charCodeAt(0),a="/".charCodeAt(0),u="!".charCodeAt(0),c="'".charCodeAt(0),l='"'.charCodeAt(0);function f(){for(var t=[];e[r];)if(e.charCodeAt(r)==i){if(e.charCodeAt(r+1)===a)return (r=e.indexOf(">",r))+1&&(r+=1),t;if(e.charCodeAt(r+1)===u){if(e.charCodeAt(r+2)==s){for(;-1!==r&&(e.charCodeAt(r)!==o||e.charCodeAt(r-1)!=s||e.charCodeAt(r-2)!=s||-1==r);)r=e.indexOf(">",r+1);-1===r&&(r=e.length);}else for(r+=2;e.charCodeAt(r)!==o&&e[r];)r++;r++;continue}var n=g();t.push(n);}else {var c=h();c.trim().length>0&&t.push(c),r++;}return t}function h(){var t=r;return -2===(r=e.indexOf("<",r)-1)&&(r=e.length),e.slice(t,r+1)}function d(){for(var t=r;-1==="\n\t>/= ".indexOf(e[r])&&e[r];)r++;return e.slice(t,r)}var p=t.noChildNodes||["img","br","input","meta","link"];function g(){r++;const t=d(),n={};let i=[];for(;e.charCodeAt(r)!==o&&e[r];){var s=e.charCodeAt(r);if(s>64&&s<91||s>96&&s<123){for(var u=d(),h=e.charCodeAt(r);h&&h!==c&&h!==l&&!(h>64&&h<91||h>96&&h<123)&&h!==o;)r++,h=e.charCodeAt(r);if(h===c||h===l){var g=m();if(-1===r)return {tagName:t,attributes:n,children:i}}else g=null,r--;n[u]=g;}r++;}if(e.charCodeAt(r-1)!==a)if("script"==t){var y=r+1;r=e.indexOf("<\/script>",r),i=[e.slice(y,r-1)],r+=9;}else if("style"==t){y=r+1;r=e.indexOf("</style>",r),i=[e.slice(y,r-1)],r+=8;}else -1==p.indexOf(t)&&(r++,i=f());else r++;return {tagName:t,attributes:n,children:i}}function m(){var t=e[r],n=++r;return r=e.indexOf(t,n),e.slice(n,r)}var y,b=null;if(void 0!==t.attrValue){t.attrName=t.attrName||"id";for(b=[];-1!==(y=void 0,y=new RegExp("\\s"+t.attrName+"\\s*=['\"]"+t.attrValue+"['\"]").exec(e),r=y?y.index:-1);)-1!==(r=e.lastIndexOf("<",r))&&b.push(g()),e=e.substr(r),r=0;}else b=t.parseNode?g():f();return t.filter&&(b=n.filter(b,t.filter)),t.setPos&&(b.pos=r),b}n.simplify=function(e){var t={};if(!e.length)return "";if(1===e.length&&"string"==typeof e[0])return e[0];for(var r in e.forEach((function(e){if("object"==typeof e){t[e.tagName]||(t[e.tagName]=[]);var r=n.simplify(e.children||[]);t[e.tagName].push(r),e.attributes&&(r._attributes=e.attributes);}})),t)1==t[r].length&&(t[r]=t[r][0]);return t},n.filter=function(e,t){var r=[];return e.forEach((function(e){if("object"==typeof e&&t(e)&&r.push(e),e.children){var i=n.filter(e.children,t);r=r.concat(i);}})),r},n.stringify=function(e){var t="";function r(e){if(e)for(var r=0;r<e.length;r++)"string"==typeof e[r]?t+=e[r].trim():n(e[r]);}function n(e){for(var n in t+="<"+e.tagName,e.attributes)null===e.attributes[n]?t+=" "+n:-1===e.attributes[n].indexOf('"')?t+=" "+n+'="'+e.attributes[n].trim()+'"':t+=" "+n+"='"+e.attributes[n].trim()+"'";t+=">",r(e.children),t+="</"+e.tagName+">";}return r(e),t},n.toContentString=function(e){if(Array.isArray(e)){var t="";return e.forEach((function(e){t=(t+=" "+n.toContentString(e)).trim();})),t}return "object"==typeof e?n.toContentString(e.children):" "+e},n.getElementById=function(e,t,r){var i=n(e,{attrValue:t});return r?n.simplify(i):i[0]},n.getElementsByClassName=function(e,t,r){const i=n(e,{attrName:"class",attrValue:"[a-zA-Z0-9-s ]*"+t+"[a-zA-Z0-9-s ]*"});return r?n.simplify(i):i},n.parseStream=function(e,t){if("string"==typeof t&&(t=t.length+2),"string"==typeof e){var i=r(12);e=i.createReadStream(e,{start:t}),t=0;}var o=t,s="";return e.on("data",(function(t){s+=t;for(var r=0;;){if(!(o=s.indexOf("<",o)+1))return void(o=r);if("/"!==s[o+1]){var i=n(s,{pos:o-1,parseNode:!0,setPos:!0});if((o=i.pos)>s.length-1||o<r)return s=s.slice(r),o=0,void(r=0);e.emit("xml",i),r=o;}else o+=1,r=pos;}})),e.on("end",(function(){console.log("end");})),e},n.transformStream=function(e){const t=r(51);"string"==typeof e&&(e=e.length+2);var i=e||0,o="";return t({readableObjectMode:!0},(function(e,t,r){o+=e;for(var s=0;;){if(!(i=o.indexOf("<",i)+1))return i=s,r();if("/"!==o[i+1]){var a=n(o,{pos:i-1,parseNode:!0,setPos:!0});if((i=a.pos)>o.length-1||i<s)return o=o.slice(s),i=0,s=0,r();this.push(a),s=i;}else i+=1,s=pos;}r();}))},e.exports=n,n.xml=n;},function(e,t,r){var n=r(60),i=r(16),o=r(65),s=r(66),a=r(67),u=r(68),c=r(69),l=Object.prototype.toString;function f(e){if(!(this instanceof f))return new f(e);this.options=i.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&t.windowBits>=0&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(t.windowBits>=0&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),t.windowBits>15&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new u,this.strm.avail_out=0;var r=n.inflateInit2(this.strm,t.windowBits);if(r!==s.Z_OK)throw new Error(a[r]);if(this.header=new c,n.inflateGetHeader(this.strm,this.header),t.dictionary&&("string"==typeof t.dictionary?t.dictionary=o.string2buf(t.dictionary):"[object ArrayBuffer]"===l.call(t.dictionary)&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(r=n.inflateSetDictionary(this.strm,t.dictionary))!==s.Z_OK))throw new Error(a[r])}function h(e,t){var r=new f(t);if(r.push(e,!0),r.err)throw r.msg||a[r.err];return r.result}f.prototype.push=function(e,t){var r,a,u,c,f,h=this.strm,d=this.options.chunkSize,p=this.options.dictionary,g=!1;if(this.ended)return !1;a=t===~~t?t:!0===t?s.Z_FINISH:s.Z_NO_FLUSH,"string"==typeof e?h.input=o.binstring2buf(e):"[object ArrayBuffer]"===l.call(e)?h.input=new Uint8Array(e):h.input=e,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new i.Buf8(d),h.next_out=0,h.avail_out=d),(r=n.inflate(h,s.Z_NO_FLUSH))===s.Z_NEED_DICT&&p&&(r=n.inflateSetDictionary(this.strm,p)),r===s.Z_BUF_ERROR&&!0===g&&(r=s.Z_OK,g=!1),r!==s.Z_STREAM_END&&r!==s.Z_OK)return this.onEnd(r),this.ended=!0,!1;h.next_out&&(0!==h.avail_out&&r!==s.Z_STREAM_END&&(0!==h.avail_in||a!==s.Z_FINISH&&a!==s.Z_SYNC_FLUSH)||("string"===this.options.to?(u=o.utf8border(h.output,h.next_out),c=h.next_out-u,f=o.buf2string(h.output,u),h.next_out=c,h.avail_out=d-c,c&&i.arraySet(h.output,h.output,u,c,0),this.onData(f)):this.onData(i.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(g=!0);}while((h.avail_in>0||0===h.avail_out)&&r!==s.Z_STREAM_END);return r===s.Z_STREAM_END&&(a=s.Z_FINISH),a===s.Z_FINISH?(r=n.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===s.Z_OK):a!==s.Z_SYNC_FLUSH||(this.onEnd(s.Z_OK),h.avail_out=0,!0)},f.prototype.onData=function(e){this.chunks.push(e);},f.prototype.onEnd=function(e){e===s.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=i.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg;},t.Inflate=f,t.inflate=h,t.inflateRaw=function(e,t){return (t=t||{}).raw=!0,h(e,t)},t.ungzip=h;},function(e,t,r){var n=r(13);class i extends n.a{constructor(){super(e=>(this._observers.add(e),()=>this._observers.delete(e))),this._observers=new Set;}next(e){for(const t of this._observers)t.next(e);}error(e){for(const t of this._observers)t.error(e);}complete(){for(const e of this._observers)e.complete();}}t.a=i;},function(e,t,r){r.d(t,"a",(function(){return i}));const n=()=>{};function i(){let e,t=!1,r=n;return [new Promise(n=>{t?n(e):r=n;}),n=>{t=!0,e=n,r();}]}},function(e,t,r){r.d(t,"a",(function(){return i}));var n=r(0);function i(e){return e&&"object"==typeof e&&e[n.d]}},function(e,t,r){var n=r(18),i=r(17),o=e.exports;for(var s in n)n.hasOwnProperty(s)&&(o[s]=n[s]);function a(e){if("string"==typeof e&&(e=i.parse(e)),e.protocol||(e.protocol="https:"),"https:"!==e.protocol)throw new Error('Protocol "'+e.protocol+'" not supported. Expected "https:"');return e}o.request=function(e,t){return e=a(e),n.request.call(this,e,t)},o.get=function(e,t){return e=a(e),n.get.call(this,e,t)};},function(e,t,r){(function(t){var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},i=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),o=f(r(47)),s=f(r(48)),a=f(r(50)),u=r(36),c=r(37),l=f(r(84));function f(e){return e&&e.__esModule?e:{default:e}}function h(e,t){var r=t.left,n=t.top,i=t.right,o=t.bottom,s=t.width,a=t.height,c=t.resampleMethod;return e.readRasters({window:[r,n,i,o],width:s,height:a,resampleMethod:c||"bilinear"}).then((function(e){return e.map((function(e){return (0, u.unflatten)(e,{height:a,width:s})}))}))}var d=function(){function e(r,i,o){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),o&&console.log("starting GeoRaster.constructor with",r,i),this._web_worker_is_available="undefined"!=typeof window&&"undefined"!==window.Worker,this._blob_is_available="undefined"!=typeof Blob,this._url_is_available="undefined"!=typeof URL,"object"===(void 0===r?"undefined":n(r))&&r.constructor&&"Buffer"===r.constructor.name&&!1===t.isBuffer(r)&&(r=new t(r)),"string"==typeof r?(o&&console.log("data is a url"),this._data=r,this._url=r,this.rasterType="geotiff",this.sourceType="url"):void 0!==t&&t.isBuffer(r)?(o&&console.log("data is a buffer"),this._data=r.buffer.slice(r.byteOffset,r.byteOffset+r.byteLength),this.rasterType="geotiff",this.sourceType="Buffer"):r instanceof ArrayBuffer?(this._data=r,this.rasterType="geotiff",this.sourceType="ArrayBuffer"):Array.isArray(r)&&i&&(this._data=r,this.rasterType="object",this._metadata=i),o&&console.log("this after construction:",this);}return i(e,[{key:"preinitialize",value:function(e){var t=this;if(e&&console.log("starting preinitialize"),this._url){var r=this._url+".ovr";return function(e){try{return (0,o.default)(e,{method:"HEAD"}).then((function(e){return 200===e.status})).catch((function(e){return !1}))}catch(e){return Promise.resolve(!1)}}(r).then((function(n){return e&&console.log("overview exists:",n),n?(0, c.fromUrls)(t._url,[r],{cache:!0,forceXHR:!1}):(0, c.fromUrl)(t._url,{cache:!0,forceXHR:!1})}))}return Promise.resolve()}},{key:"initialize",value:function(e){var t=this;return this.preinitialize(e).then((function(r){return new Promise((function(n,i){if(e&&console.log("starting GeoRaster.initialize"),e&&console.log("this",t),"object"===t.rasterType||"geotiff"===t.rasterType||"tiff"===t.rasterType)if(t._web_worker_is_available){var o=new s.default;o.onmessage=function(i){e&&console.log("main thread received message:",i);var o=i.data;for(var s in o)t[s]=o[s];t._url&&(t._geotiff=r,t.getValues=function(e){return h(this._geotiff,e)}),t.toCanvas=function(e){return (0, l.default)(this,e)},n(t);},e&&console.log("about to postMessage"),t._data instanceof ArrayBuffer?o.postMessage({data:t._data,rasterType:t.rasterType,sourceType:t.sourceType,metadata:t._metadata},[t._data]):o.postMessage({data:t._data,rasterType:t.rasterType,sourceType:t.sourceType,metadata:t._metadata});}else e&&console.log("web worker is not available"),(0, a.default)({data:t._data,rasterType:t.rasterType,sourceType:t.sourceType,metadata:t._metadata},e).then((function(i){e&&console.log("result:",i),t._url&&(i._geotiff=r,i.getValues=function(e){return h(this._geotiff,e)}),i.toCanvas=function(e){return (0, l.default)(this,e)},n(i);})).catch(i);else i("couldn't find a way to parse");}))}))}}]),e}(),p=function(e,t,r){if(r&&console.log("starting parseGeoraster with ",e,t),void 0===e){throw Error("[Georaster.parseGeoraster] Error. You passed in undefined to parseGeoraster. We can't make a raster out of nothing!")}return new d(e,t,r).initialize(r)};void 0!==e.exports&&(e.exports=p),"undefined"!=typeof window?window.parseGeoraster=p:"undefined"!=typeof self&&(self.parseGeoraster=p);}).call(this,r(2).Buffer);},function(e,t,r){t.byteLength=function(e){var t=c(e),r=t[0],n=t[1];return 3*(r+n)/4-n},t.toByteArray=function(e){var t,r,n=c(e),s=n[0],a=n[1],u=new o(function(e,t,r){return 3*(t+r)/4-r}(0,s,a)),l=0,f=a>0?s-4:s;for(r=0;r<f;r+=4)t=i[e.charCodeAt(r)]<<18|i[e.charCodeAt(r+1)]<<12|i[e.charCodeAt(r+2)]<<6|i[e.charCodeAt(r+3)],u[l++]=t>>16&255,u[l++]=t>>8&255,u[l++]=255&t;2===a&&(t=i[e.charCodeAt(r)]<<2|i[e.charCodeAt(r+1)]>>4,u[l++]=255&t);1===a&&(t=i[e.charCodeAt(r)]<<10|i[e.charCodeAt(r+1)]<<4|i[e.charCodeAt(r+2)]>>2,u[l++]=t>>8&255,u[l++]=255&t);return u},t.fromByteArray=function(e){for(var t,r=e.length,i=r%3,o=[],s=0,a=r-i;s<a;s+=16383)o.push(l(e,s,s+16383>a?a:s+16383));1===i?(t=e[r-1],o.push(n[t>>2]+n[t<<4&63]+"==")):2===i&&(t=(e[r-2]<<8)+e[r-1],o.push(n[t>>10]+n[t>>4&63]+n[t<<2&63]+"="));return o.join("")};for(var n=[],i=[],o="undefined"!=typeof Uint8Array?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",a=0,u=s.length;a<u;++a)n[a]=s[a],i[s.charCodeAt(a)]=a;function c(e){var t=e.length;if(t%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=e.indexOf("=");return -1===r&&(r=t),[r,r===t?0:4-r%4]}function l(e,t,r){for(var i,o,s=[],a=t;a<r;a+=3)i=(e[a]<<16&16711680)+(e[a+1]<<8&65280)+(255&e[a+2]),s.push(n[(o=i)>>18&63]+n[o>>12&63]+n[o>>6&63]+n[63&o]);return s.join("")}i["-".charCodeAt(0)]=62,i["_".charCodeAt(0)]=63;},function(e,t){
    /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
    t.read=function(e,t,r,n,i){var o,s,a=8*i-n-1,u=(1<<a)-1,c=u>>1,l=-7,f=r?i-1:0,h=r?-1:1,d=e[t+f];for(f+=h,o=d&(1<<-l)-1,d>>=-l,l+=a;l>0;o=256*o+e[t+f],f+=h,l-=8);for(s=o&(1<<-l)-1,o>>=-l,l+=n;l>0;s=256*s+e[t+f],f+=h,l-=8);if(0===o)o=1-c;else {if(o===u)return s?NaN:1/0*(d?-1:1);s+=Math.pow(2,n),o-=c;}return (d?-1:1)*s*Math.pow(2,o-n)},t.write=function(e,t,r,n,i,o){var s,a,u,c=8*o-i-1,l=(1<<c)-1,f=l>>1,h=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,d=n?0:o-1,p=n?1:-1,g=t<0||0===t&&1/t<0?1:0;for(t=Math.abs(t),isNaN(t)||t===1/0?(a=isNaN(t)?1:0,s=l):(s=Math.floor(Math.log(t)/Math.LN2),t*(u=Math.pow(2,-s))<1&&(s--,u*=2),(t+=s+f>=1?h/u:h*Math.pow(2,1-f))*u>=2&&(s++,u/=2),s+f>=l?(a=0,s=l):s+f>=1?(a=(t*u-1)*Math.pow(2,i),s+=f):(a=t*Math.pow(2,f-1)*Math.pow(2,i),s=0));i>=8;e[r+d]=255&a,d+=p,a/=256,i-=8);for(s=s<<i|a,c+=i;c>0;e[r+d]=255&s,d+=p,s/=256,c-=8);e[r+d-p]|=128*g;};},function(e,t){var r="undefined"!=typeof self?self:this,n=function(){function e(){this.fetch=!1,this.DOMException=r.DOMException;}return e.prototype=r,new e}();!function(e){!function(t){var r="URLSearchParams"in e,n="Symbol"in e&&"iterator"in Symbol,i="FileReader"in e&&"Blob"in e&&function(){try{return new Blob,!0}catch(e){return !1}}(),o="FormData"in e,s="ArrayBuffer"in e;if(s)var a=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],u=ArrayBuffer.isView||function(e){return e&&a.indexOf(Object.prototype.toString.call(e))>-1};function c(e){if("string"!=typeof e&&(e=String(e)),/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(e))throw new TypeError("Invalid character in header field name");return e.toLowerCase()}function l(e){return "string"!=typeof e&&(e=String(e)),e}function f(e){var t={next:function(){var t=e.shift();return {done:void 0===t,value:t}}};return n&&(t[Symbol.iterator]=function(){return t}),t}function h(e){this.map={},e instanceof h?e.forEach((function(e,t){this.append(t,e);}),this):Array.isArray(e)?e.forEach((function(e){this.append(e[0],e[1]);}),this):e&&Object.getOwnPropertyNames(e).forEach((function(t){this.append(t,e[t]);}),this);}function d(e){if(e.bodyUsed)return Promise.reject(new TypeError("Already read"));e.bodyUsed=!0;}function p(e){return new Promise((function(t,r){e.onload=function(){t(e.result);},e.onerror=function(){r(e.error);};}))}function g(e){var t=new FileReader,r=p(t);return t.readAsArrayBuffer(e),r}function m(e){if(e.slice)return e.slice(0);var t=new Uint8Array(e.byteLength);return t.set(new Uint8Array(e)),t.buffer}function y(){return this.bodyUsed=!1,this._initBody=function(e){var t;this._bodyInit=e,e?"string"==typeof e?this._bodyText=e:i&&Blob.prototype.isPrototypeOf(e)?this._bodyBlob=e:o&&FormData.prototype.isPrototypeOf(e)?this._bodyFormData=e:r&&URLSearchParams.prototype.isPrototypeOf(e)?this._bodyText=e.toString():s&&i&&((t=e)&&DataView.prototype.isPrototypeOf(t))?(this._bodyArrayBuffer=m(e.buffer),this._bodyInit=new Blob([this._bodyArrayBuffer])):s&&(ArrayBuffer.prototype.isPrototypeOf(e)||u(e))?this._bodyArrayBuffer=m(e):this._bodyText=e=Object.prototype.toString.call(e):this._bodyText="",this.headers.get("content-type")||("string"==typeof e?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):r&&URLSearchParams.prototype.isPrototypeOf(e)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"));},i&&(this.blob=function(){var e=d(this);if(e)return e;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?d(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(g)}),this.text=function(){var e,t,r,n=d(this);if(n)return n;if(this._bodyBlob)return e=this._bodyBlob,t=new FileReader,r=p(t),t.readAsText(e),r;if(this._bodyArrayBuffer)return Promise.resolve(function(e){for(var t=new Uint8Array(e),r=new Array(t.length),n=0;n<t.length;n++)r[n]=String.fromCharCode(t[n]);return r.join("")}(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},o&&(this.formData=function(){return this.text().then(v)}),this.json=function(){return this.text().then(JSON.parse)},this}h.prototype.append=function(e,t){e=c(e),t=l(t);var r=this.map[e];this.map[e]=r?r+", "+t:t;},h.prototype.delete=function(e){delete this.map[c(e)];},h.prototype.get=function(e){return e=c(e),this.has(e)?this.map[e]:null},h.prototype.has=function(e){return this.map.hasOwnProperty(c(e))},h.prototype.set=function(e,t){this.map[c(e)]=l(t);},h.prototype.forEach=function(e,t){for(var r in this.map)this.map.hasOwnProperty(r)&&e.call(t,this.map[r],r,this);},h.prototype.keys=function(){var e=[];return this.forEach((function(t,r){e.push(r);})),f(e)},h.prototype.values=function(){var e=[];return this.forEach((function(t){e.push(t);})),f(e)},h.prototype.entries=function(){var e=[];return this.forEach((function(t,r){e.push([r,t]);})),f(e)},n&&(h.prototype[Symbol.iterator]=h.prototype.entries);var b=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];function w(e,t){var r,n,i=(t=t||{}).body;if(e instanceof w){if(e.bodyUsed)throw new TypeError("Already read");this.url=e.url,this.credentials=e.credentials,t.headers||(this.headers=new h(e.headers)),this.method=e.method,this.mode=e.mode,this.signal=e.signal,i||null==e._bodyInit||(i=e._bodyInit,e.bodyUsed=!0);}else this.url=String(e);if(this.credentials=t.credentials||this.credentials||"same-origin",!t.headers&&this.headers||(this.headers=new h(t.headers)),this.method=(r=t.method||this.method||"GET",n=r.toUpperCase(),b.indexOf(n)>-1?n:r),this.mode=t.mode||this.mode||null,this.signal=t.signal||this.signal,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&i)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(i);}function v(e){var t=new FormData;return e.trim().split("&").forEach((function(e){if(e){var r=e.split("="),n=r.shift().replace(/\+/g," "),i=r.join("=").replace(/\+/g," ");t.append(decodeURIComponent(n),decodeURIComponent(i));}})),t}function _(e,t){t||(t={}),this.type="default",this.status=void 0===t.status?200:t.status,this.ok=this.status>=200&&this.status<300,this.statusText="statusText"in t?t.statusText:"OK",this.headers=new h(t.headers),this.url=t.url||"",this._initBody(e);}w.prototype.clone=function(){return new w(this,{body:this._bodyInit})},y.call(w.prototype),y.call(_.prototype),_.prototype.clone=function(){return new _(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new h(this.headers),url:this.url})},_.error=function(){var e=new _(null,{status:0,statusText:""});return e.type="error",e};var k=[301,302,303,307,308];_.redirect=function(e,t){if(-1===k.indexOf(t))throw new RangeError("Invalid status code");return new _(null,{status:t,headers:{location:e}})},t.DOMException=e.DOMException;try{new t.DOMException;}catch(e){t.DOMException=function(e,t){this.message=e,this.name=t;var r=Error(e);this.stack=r.stack;},t.DOMException.prototype=Object.create(Error.prototype),t.DOMException.prototype.constructor=t.DOMException;}function S(e,r){return new Promise((function(n,o){var s=new w(e,r);if(s.signal&&s.signal.aborted)return o(new t.DOMException("Aborted","AbortError"));var a=new XMLHttpRequest;function u(){a.abort();}a.onload=function(){var e,t,r={status:a.status,statusText:a.statusText,headers:(e=a.getAllResponseHeaders()||"",t=new h,e.replace(/\r?\n[\t ]+/g," ").split(/\r?\n/).forEach((function(e){var r=e.split(":"),n=r.shift().trim();if(n){var i=r.join(":").trim();t.append(n,i);}})),t)};r.url="responseURL"in a?a.responseURL:r.headers.get("X-Request-URL");var i="response"in a?a.response:a.responseText;n(new _(i,r));},a.onerror=function(){o(new TypeError("Network request failed"));},a.ontimeout=function(){o(new TypeError("Network request failed"));},a.onabort=function(){o(new t.DOMException("Aborted","AbortError"));},a.open(s.method,s.url,!0),"include"===s.credentials?a.withCredentials=!0:"omit"===s.credentials&&(a.withCredentials=!1),"responseType"in a&&i&&(a.responseType="blob"),s.headers.forEach((function(e,t){a.setRequestHeader(t,e);})),s.signal&&(s.signal.addEventListener("abort",u),a.onreadystatechange=function(){4===a.readyState&&s.signal.removeEventListener("abort",u);}),a.send(void 0===s._bodyInit?null:s._bodyInit);}))}S.polyfill=!0,e.fetch||(e.fetch=S,e.Headers=h,e.Request=w,e.Response=_),t.Headers=h,t.Request=w,t.Response=_,t.fetch=S,Object.defineProperty(t,"__esModule",{value:!0});}({});}(n),n.fetch.ponyfill=!0,delete n.fetch.polyfill;var i=n;(t=i.fetch).default=i.fetch,t.fetch=i.fetch,t.Headers=i.Headers,t.Request=i.Request,t.Response=i.Response,e.exports=t;},function(e,t,r){e.exports=function(){return r(49)('!function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=43)}([function(e,t,r){"use strict";r.d(t,"a",(function(){return n})),r.d(t,"b",(function(){return i})),r.d(t,"c",(function(){return o})),r.d(t,"d",(function(){return s})),r.d(t,"e",(function(){return a}));const n=Symbol("thread.errors"),i=Symbol("thread.events"),o=Symbol("thread.terminate"),s=Symbol("thread.transferable"),a=Symbol("thread.worker")},function(e,t){var r;r=function(){return this}();try{r=r||new Function("return this")()}catch(e){"object"==typeof window&&(r=window)}e.exports=r},function(e,t){var r,n,i=e.exports={};function o(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function a(e){if(r===setTimeout)return setTimeout(e,0);if((r===o||!r)&&setTimeout)return r=setTimeout,setTimeout(e,0);try{return r(e,0)}catch(t){try{return r.call(null,e,0)}catch(t){return r.call(this,e,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:o}catch(e){r=o}try{n="function"==typeof clearTimeout?clearTimeout:s}catch(e){n=s}}();var u,c=[],l=!1,f=-1;function h(){l&&u&&(l=!1,u.length?c=u.concat(c):f=-1,c.length&&d())}function d(){if(!l){var e=a(h);l=!0;for(var t=c.length;t;){for(u=c,c=[];++f<t;)u&&u[f].run();f=-1,t=c.length}u=null,l=!1,function(e){if(n===clearTimeout)return clearTimeout(e);if((n===s||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(e);try{n(e)}catch(t){try{return n.call(null,e)}catch(t){return n.call(this,e)}}}(e)}}function p(e,t){this.fun=e,this.array=t}function g(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];c.push(new p(e,t)),1!==c.length||l||a(d)},p.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=g,i.addListener=g,i.once=g,i.off=g,i.removeListener=g,i.removeAllListeners=g,i.emit=g,i.prependListener=g,i.prependOnceListener=g,i.listeners=function(e){return[]},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},function(e,t,r){"use strict";(function(e){\n/*!\n * The buffer module from node.js, for the browser.\n *\n * @author   Feross Aboukhadijeh <http://feross.org>\n * @license  MIT\n */\nvar n=r(45),i=r(46),o=r(26);function s(){return u.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function a(e,t){if(s()<t)throw new RangeError("Invalid typed array length");return u.TYPED_ARRAY_SUPPORT?(e=new Uint8Array(t)).__proto__=u.prototype:(null===e&&(e=new u(t)),e.length=t),e}function u(e,t,r){if(!(u.TYPED_ARRAY_SUPPORT||this instanceof u))return new u(e,t,r);if("number"==typeof e){if("string"==typeof t)throw new Error("If encoding is specified then the first argument must be a string");return f(this,e)}return c(this,e,t,r)}function c(e,t,r,n){if("number"==typeof t)throw new TypeError(\'"value" argument must not be a number\');return"undefined"!=typeof ArrayBuffer&&t instanceof ArrayBuffer?function(e,t,r,n){if(t.byteLength,r<0||t.byteLength<r)throw new RangeError("\'offset\' is out of bounds");if(t.byteLength<r+(n||0))throw new RangeError("\'length\' is out of bounds");t=void 0===r&&void 0===n?new Uint8Array(t):void 0===n?new Uint8Array(t,r):new Uint8Array(t,r,n);u.TYPED_ARRAY_SUPPORT?(e=t).__proto__=u.prototype:e=h(e,t);return e}(e,t,r,n):"string"==typeof t?function(e,t,r){"string"==typeof r&&""!==r||(r="utf8");if(!u.isEncoding(r))throw new TypeError(\'"encoding" must be a valid string encoding\');var n=0|p(t,r),i=(e=a(e,n)).write(t,r);i!==n&&(e=e.slice(0,i));return e}(e,t,r):function(e,t){if(u.isBuffer(t)){var r=0|d(t.length);return 0===(e=a(e,r)).length||t.copy(e,0,0,r),e}if(t){if("undefined"!=typeof ArrayBuffer&&t.buffer instanceof ArrayBuffer||"length"in t)return"number"!=typeof t.length||(n=t.length)!=n?a(e,0):h(e,t);if("Buffer"===t.type&&o(t.data))return h(e,t.data)}var n;throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(e,t)}function l(e){if("number"!=typeof e)throw new TypeError(\'"size" argument must be a number\');if(e<0)throw new RangeError(\'"size" argument must not be negative\')}function f(e,t){if(l(t),e=a(e,t<0?0:0|d(t)),!u.TYPED_ARRAY_SUPPORT)for(var r=0;r<t;++r)e[r]=0;return e}function h(e,t){var r=t.length<0?0:0|d(t.length);e=a(e,r);for(var n=0;n<r;n+=1)e[n]=255&t[n];return e}function d(e){if(e>=s())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+s().toString(16)+" bytes");return 0|e}function p(e,t){if(u.isBuffer(e))return e.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(e)||e instanceof ArrayBuffer))return e.byteLength;"string"!=typeof e&&(e=""+e);var r=e.length;if(0===r)return 0;for(var n=!1;;)switch(t){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":case void 0:return N(e).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return G(e).length;default:if(n)return N(e).length;t=(""+t).toLowerCase(),n=!0}}function g(e,t,r){var n=!1;if((void 0===t||t<0)&&(t=0),t>this.length)return"";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return"";if((r>>>=0)<=(t>>>=0))return"";for(e||(e="utf8");;)switch(e){case"hex":return O(this,t,r);case"utf8":case"utf-8":return T(this,t,r);case"ascii":return x(this,t,r);case"latin1":case"binary":return A(this,t,r);case"base64":return E(this,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return R(this,t,r);default:if(n)throw new TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase(),n=!0}}function m(e,t,r){var n=e[t];e[t]=e[r],e[r]=n}function y(e,t,r,n,i){if(0===e.length)return-1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),r=+r,isNaN(r)&&(r=i?0:e.length-1),r<0&&(r=e.length+r),r>=e.length){if(i)return-1;r=e.length-1}else if(r<0){if(!i)return-1;r=0}if("string"==typeof t&&(t=u.from(t,n)),u.isBuffer(t))return 0===t.length?-1:b(e,t,r,n,i);if("number"==typeof t)return t&=255,u.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(e,t,r):Uint8Array.prototype.lastIndexOf.call(e,t,r):b(e,[t],r,n,i);throw new TypeError("val must be string, number or Buffer")}function b(e,t,r,n,i){var o,s=1,a=e.length,u=t.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(e.length<2||t.length<2)return-1;s=2,a/=2,u/=2,r/=2}function c(e,t){return 1===s?e[t]:e.readUInt16BE(t*s)}if(i){var l=-1;for(o=r;o<a;o++)if(c(e,o)===c(t,-1===l?0:o-l)){if(-1===l&&(l=o),o-l+1===u)return l*s}else-1!==l&&(o-=o-l),l=-1}else for(r+u>a&&(r=a-u),o=r;o>=0;o--){for(var f=!0,h=0;h<u;h++)if(c(e,o+h)!==c(t,h)){f=!1;break}if(f)return o}return-1}function w(e,t,r,n){r=Number(r)||0;var i=e.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=t.length;if(o%2!=0)throw new TypeError("Invalid hex string");n>o/2&&(n=o/2);for(var s=0;s<n;++s){var a=parseInt(t.substr(2*s,2),16);if(isNaN(a))return s;e[r+s]=a}return s}function v(e,t,r,n){return q(N(t,e.length-r),e,r,n)}function _(e,t,r,n){return q(function(e){for(var t=[],r=0;r<e.length;++r)t.push(255&e.charCodeAt(r));return t}(t),e,r,n)}function S(e,t,r,n){return _(e,t,r,n)}function k(e,t,r,n){return q(G(t),e,r,n)}function C(e,t,r,n){return q(function(e,t){for(var r,n,i,o=[],s=0;s<e.length&&!((t-=2)<0);++s)r=e.charCodeAt(s),n=r>>8,i=r%256,o.push(i),o.push(n);return o}(t,e.length-r),e,r,n)}function E(e,t,r){return 0===t&&r===e.length?n.fromByteArray(e):n.fromByteArray(e.slice(t,r))}function T(e,t,r){r=Math.min(e.length,r);for(var n=[],i=t;i<r;){var o,s,a,u,c=e[i],l=null,f=c>239?4:c>223?3:c>191?2:1;if(i+f<=r)switch(f){case 1:c<128&&(l=c);break;case 2:128==(192&(o=e[i+1]))&&(u=(31&c)<<6|63&o)>127&&(l=u);break;case 3:o=e[i+1],s=e[i+2],128==(192&o)&&128==(192&s)&&(u=(15&c)<<12|(63&o)<<6|63&s)>2047&&(u<55296||u>57343)&&(l=u);break;case 4:o=e[i+1],s=e[i+2],a=e[i+3],128==(192&o)&&128==(192&s)&&128==(192&a)&&(u=(15&c)<<18|(63&o)<<12|(63&s)<<6|63&a)>65535&&u<1114112&&(l=u)}null===l?(l=65533,f=1):l>65535&&(l-=65536,n.push(l>>>10&1023|55296),l=56320|1023&l),n.push(l),i+=f}return function(e){var t=e.length;if(t<=4096)return String.fromCharCode.apply(String,e);var r="",n=0;for(;n<t;)r+=String.fromCharCode.apply(String,e.slice(n,n+=4096));return r}(n)}t.Buffer=u,t.SlowBuffer=function(e){+e!=e&&(e=0);return u.alloc(+e)},t.INSPECT_MAX_BYTES=50,u.TYPED_ARRAY_SUPPORT=void 0!==e.TYPED_ARRAY_SUPPORT?e.TYPED_ARRAY_SUPPORT:function(){try{var e=new Uint8Array(1);return e.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===e.foo()&&"function"==typeof e.subarray&&0===e.subarray(1,1).byteLength}catch(e){return!1}}(),t.kMaxLength=s(),u.poolSize=8192,u._augment=function(e){return e.__proto__=u.prototype,e},u.from=function(e,t,r){return c(null,e,t,r)},u.TYPED_ARRAY_SUPPORT&&(u.prototype.__proto__=Uint8Array.prototype,u.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&u[Symbol.species]===u&&Object.defineProperty(u,Symbol.species,{value:null,configurable:!0})),u.alloc=function(e,t,r){return function(e,t,r,n){return l(t),t<=0?a(e,t):void 0!==r?"string"==typeof n?a(e,t).fill(r,n):a(e,t).fill(r):a(e,t)}(null,e,t,r)},u.allocUnsafe=function(e){return f(null,e)},u.allocUnsafeSlow=function(e){return f(null,e)},u.isBuffer=function(e){return!(null==e||!e._isBuffer)},u.compare=function(e,t){if(!u.isBuffer(e)||!u.isBuffer(t))throw new TypeError("Arguments must be Buffers");if(e===t)return 0;for(var r=e.length,n=t.length,i=0,o=Math.min(r,n);i<o;++i)if(e[i]!==t[i]){r=e[i],n=t[i];break}return r<n?-1:n<r?1:0},u.isEncoding=function(e){switch(String(e).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},u.concat=function(e,t){if(!o(e))throw new TypeError(\'"list" argument must be an Array of Buffers\');if(0===e.length)return u.alloc(0);var r;if(void 0===t)for(t=0,r=0;r<e.length;++r)t+=e[r].length;var n=u.allocUnsafe(t),i=0;for(r=0;r<e.length;++r){var s=e[r];if(!u.isBuffer(s))throw new TypeError(\'"list" argument must be an Array of Buffers\');s.copy(n,i),i+=s.length}return n},u.byteLength=p,u.prototype._isBuffer=!0,u.prototype.swap16=function(){var e=this.length;if(e%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var t=0;t<e;t+=2)m(this,t,t+1);return this},u.prototype.swap32=function(){var e=this.length;if(e%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var t=0;t<e;t+=4)m(this,t,t+3),m(this,t+1,t+2);return this},u.prototype.swap64=function(){var e=this.length;if(e%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var t=0;t<e;t+=8)m(this,t,t+7),m(this,t+1,t+6),m(this,t+2,t+5),m(this,t+3,t+4);return this},u.prototype.toString=function(){var e=0|this.length;return 0===e?"":0===arguments.length?T(this,0,e):g.apply(this,arguments)},u.prototype.equals=function(e){if(!u.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e||0===u.compare(this,e)},u.prototype.inspect=function(){var e="",r=t.INSPECT_MAX_BYTES;return this.length>0&&(e=this.toString("hex",0,r).match(/.{2}/g).join(" "),this.length>r&&(e+=" ... ")),"<Buffer "+e+">"},u.prototype.compare=function(e,t,r,n,i){if(!u.isBuffer(e))throw new TypeError("Argument must be a Buffer");if(void 0===t&&(t=0),void 0===r&&(r=e?e.length:0),void 0===n&&(n=0),void 0===i&&(i=this.length),t<0||r>e.length||n<0||i>this.length)throw new RangeError("out of range index");if(n>=i&&t>=r)return 0;if(n>=i)return-1;if(t>=r)return 1;if(this===e)return 0;for(var o=(i>>>=0)-(n>>>=0),s=(r>>>=0)-(t>>>=0),a=Math.min(o,s),c=this.slice(n,i),l=e.slice(t,r),f=0;f<a;++f)if(c[f]!==l[f]){o=c[f],s=l[f];break}return o<s?-1:s<o?1:0},u.prototype.includes=function(e,t,r){return-1!==this.indexOf(e,t,r)},u.prototype.indexOf=function(e,t,r){return y(this,e,t,r,!0)},u.prototype.lastIndexOf=function(e,t,r){return y(this,e,t,r,!1)},u.prototype.write=function(e,t,r,n){if(void 0===t)n="utf8",r=this.length,t=0;else if(void 0===r&&"string"==typeof t)n=t,r=this.length,t=0;else{if(!isFinite(t))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");t|=0,isFinite(r)?(r|=0,void 0===n&&(n="utf8")):(n=r,r=void 0)}var i=this.length-t;if((void 0===r||r>i)&&(r=i),e.length>0&&(r<0||t<0)||t>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return w(this,e,t,r);case"utf8":case"utf-8":return v(this,e,t,r);case"ascii":return _(this,e,t,r);case"latin1":case"binary":return S(this,e,t,r);case"base64":return k(this,e,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return C(this,e,t,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0}},u.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function x(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;++i)n+=String.fromCharCode(127&e[i]);return n}function A(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;++i)n+=String.fromCharCode(e[i]);return n}function O(e,t,r){var n=e.length;(!t||t<0)&&(t=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=t;o<r;++o)i+=B(e[o]);return i}function R(e,t,r){for(var n=e.slice(t,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function I(e,t,r){if(e%1!=0||e<0)throw new RangeError("offset is not uint");if(e+t>r)throw new RangeError("Trying to access beyond buffer length")}function P(e,t,r,n,i,o){if(!u.isBuffer(e))throw new TypeError(\'"buffer" argument must be a Buffer instance\');if(t>i||t<o)throw new RangeError(\'"value" argument is out of bounds\');if(r+n>e.length)throw new RangeError("Index out of range")}function M(e,t,r,n){t<0&&(t=65535+t+1);for(var i=0,o=Math.min(e.length-r,2);i<o;++i)e[r+i]=(t&255<<8*(n?i:1-i))>>>8*(n?i:1-i)}function D(e,t,r,n){t<0&&(t=4294967295+t+1);for(var i=0,o=Math.min(e.length-r,4);i<o;++i)e[r+i]=t>>>8*(n?i:3-i)&255}function L(e,t,r,n,i,o){if(r+n>e.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function U(e,t,r,n,o){return o||L(e,0,r,4),i.write(e,t,r,n,23,4),r+4}function F(e,t,r,n,o){return o||L(e,0,r,8),i.write(e,t,r,n,52,8),r+8}u.prototype.slice=function(e,t){var r,n=this.length;if((e=~~e)<0?(e+=n)<0&&(e=0):e>n&&(e=n),(t=void 0===t?n:~~t)<0?(t+=n)<0&&(t=0):t>n&&(t=n),t<e&&(t=e),u.TYPED_ARRAY_SUPPORT)(r=this.subarray(e,t)).__proto__=u.prototype;else{var i=t-e;r=new u(i,void 0);for(var o=0;o<i;++o)r[o]=this[o+e]}return r},u.prototype.readUIntLE=function(e,t,r){e|=0,t|=0,r||I(e,t,this.length);for(var n=this[e],i=1,o=0;++o<t&&(i*=256);)n+=this[e+o]*i;return n},u.prototype.readUIntBE=function(e,t,r){e|=0,t|=0,r||I(e,t,this.length);for(var n=this[e+--t],i=1;t>0&&(i*=256);)n+=this[e+--t]*i;return n},u.prototype.readUInt8=function(e,t){return t||I(e,1,this.length),this[e]},u.prototype.readUInt16LE=function(e,t){return t||I(e,2,this.length),this[e]|this[e+1]<<8},u.prototype.readUInt16BE=function(e,t){return t||I(e,2,this.length),this[e]<<8|this[e+1]},u.prototype.readUInt32LE=function(e,t){return t||I(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+16777216*this[e+3]},u.prototype.readUInt32BE=function(e,t){return t||I(e,4,this.length),16777216*this[e]+(this[e+1]<<16|this[e+2]<<8|this[e+3])},u.prototype.readIntLE=function(e,t,r){e|=0,t|=0,r||I(e,t,this.length);for(var n=this[e],i=1,o=0;++o<t&&(i*=256);)n+=this[e+o]*i;return n>=(i*=128)&&(n-=Math.pow(2,8*t)),n},u.prototype.readIntBE=function(e,t,r){e|=0,t|=0,r||I(e,t,this.length);for(var n=t,i=1,o=this[e+--n];n>0&&(i*=256);)o+=this[e+--n]*i;return o>=(i*=128)&&(o-=Math.pow(2,8*t)),o},u.prototype.readInt8=function(e,t){return t||I(e,1,this.length),128&this[e]?-1*(255-this[e]+1):this[e]},u.prototype.readInt16LE=function(e,t){t||I(e,2,this.length);var r=this[e]|this[e+1]<<8;return 32768&r?4294901760|r:r},u.prototype.readInt16BE=function(e,t){t||I(e,2,this.length);var r=this[e+1]|this[e]<<8;return 32768&r?4294901760|r:r},u.prototype.readInt32LE=function(e,t){return t||I(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},u.prototype.readInt32BE=function(e,t){return t||I(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},u.prototype.readFloatLE=function(e,t){return t||I(e,4,this.length),i.read(this,e,!0,23,4)},u.prototype.readFloatBE=function(e,t){return t||I(e,4,this.length),i.read(this,e,!1,23,4)},u.prototype.readDoubleLE=function(e,t){return t||I(e,8,this.length),i.read(this,e,!0,52,8)},u.prototype.readDoubleBE=function(e,t){return t||I(e,8,this.length),i.read(this,e,!1,52,8)},u.prototype.writeUIntLE=function(e,t,r,n){(e=+e,t|=0,r|=0,n)||P(this,e,t,r,Math.pow(2,8*r)-1,0);var i=1,o=0;for(this[t]=255&e;++o<r&&(i*=256);)this[t+o]=e/i&255;return t+r},u.prototype.writeUIntBE=function(e,t,r,n){(e=+e,t|=0,r|=0,n)||P(this,e,t,r,Math.pow(2,8*r)-1,0);var i=r-1,o=1;for(this[t+i]=255&e;--i>=0&&(o*=256);)this[t+i]=e/o&255;return t+r},u.prototype.writeUInt8=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,1,255,0),u.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),this[t]=255&e,t+1},u.prototype.writeUInt16LE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[t]=255&e,this[t+1]=e>>>8):M(this,e,t,!0),t+2},u.prototype.writeUInt16BE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[t]=e>>>8,this[t+1]=255&e):M(this,e,t,!1),t+2},u.prototype.writeUInt32LE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=255&e):D(this,e,t,!0),t+4},u.prototype.writeUInt32BE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e):D(this,e,t,!1),t+4},u.prototype.writeIntLE=function(e,t,r,n){if(e=+e,t|=0,!n){var i=Math.pow(2,8*r-1);P(this,e,t,r,i-1,-i)}var o=0,s=1,a=0;for(this[t]=255&e;++o<r&&(s*=256);)e<0&&0===a&&0!==this[t+o-1]&&(a=1),this[t+o]=(e/s>>0)-a&255;return t+r},u.prototype.writeIntBE=function(e,t,r,n){if(e=+e,t|=0,!n){var i=Math.pow(2,8*r-1);P(this,e,t,r,i-1,-i)}var o=r-1,s=1,a=0;for(this[t+o]=255&e;--o>=0&&(s*=256);)e<0&&0===a&&0!==this[t+o+1]&&(a=1),this[t+o]=(e/s>>0)-a&255;return t+r},u.prototype.writeInt8=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,1,127,-128),u.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),e<0&&(e=255+e+1),this[t]=255&e,t+1},u.prototype.writeInt16LE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[t]=255&e,this[t+1]=e>>>8):M(this,e,t,!0),t+2},u.prototype.writeInt16BE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[t]=e>>>8,this[t+1]=255&e):M(this,e,t,!1),t+2},u.prototype.writeInt32LE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,4,2147483647,-2147483648),u.TYPED_ARRAY_SUPPORT?(this[t]=255&e,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24):D(this,e,t,!0),t+4},u.prototype.writeInt32BE=function(e,t,r){return e=+e,t|=0,r||P(this,e,t,4,2147483647,-2147483648),e<0&&(e=4294967295+e+1),u.TYPED_ARRAY_SUPPORT?(this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e):D(this,e,t,!1),t+4},u.prototype.writeFloatLE=function(e,t,r){return U(this,e,t,!0,r)},u.prototype.writeFloatBE=function(e,t,r){return U(this,e,t,!1,r)},u.prototype.writeDoubleLE=function(e,t,r){return F(this,e,t,!0,r)},u.prototype.writeDoubleBE=function(e,t,r){return F(this,e,t,!1,r)},u.prototype.copy=function(e,t,r,n){if(r||(r=0),n||0===n||(n=this.length),t>=e.length&&(t=e.length),t||(t=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===e.length||0===this.length)return 0;if(t<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),e.length-t<n-r&&(n=e.length-t+r);var i,o=n-r;if(this===e&&r<t&&t<n)for(i=o-1;i>=0;--i)e[i+t]=this[i+r];else if(o<1e3||!u.TYPED_ARRAY_SUPPORT)for(i=0;i<o;++i)e[i+t]=this[i+r];else Uint8Array.prototype.set.call(e,this.subarray(r,r+o),t);return o},u.prototype.fill=function(e,t,r,n){if("string"==typeof e){if("string"==typeof t?(n=t,t=0,r=this.length):"string"==typeof r&&(n=r,r=this.length),1===e.length){var i=e.charCodeAt(0);i<256&&(e=i)}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else"number"==typeof e&&(e&=255);if(t<0||this.length<t||this.length<r)throw new RangeError("Out of range index");if(r<=t)return this;var o;if(t>>>=0,r=void 0===r?this.length:r>>>0,e||(e=0),"number"==typeof e)for(o=t;o<r;++o)this[o]=e;else{var s=u.isBuffer(e)?e:N(new u(e,n).toString()),a=s.length;for(o=0;o<r-t;++o)this[o+t]=s[o%a]}return this};var j=/[^+\\/0-9A-Za-z-_]/g;function B(e){return e<16?"0"+e.toString(16):e.toString(16)}function N(e,t){var r;t=t||1/0;for(var n=e.length,i=null,o=[],s=0;s<n;++s){if((r=e.charCodeAt(s))>55295&&r<57344){if(!i){if(r>56319){(t-=3)>-1&&o.push(239,191,189);continue}if(s+1===n){(t-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(t-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320)}else i&&(t-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((t-=1)<0)break;o.push(r)}else if(r<2048){if((t-=2)<0)break;o.push(r>>6|192,63&r|128)}else if(r<65536){if((t-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(r<1114112))throw new Error("Invalid code point");if((t-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return o}function G(e){return n.toByteArray(function(e){if((e=function(e){return e.trim?e.trim():e.replace(/^\\s+|\\s+$/g,"")}(e).replace(j,"")).length<2)return"";for(;e.length%4!=0;)e+="=";return e}(e))}function q(e,t,r,n){for(var i=0;i<n&&!(i+r>=t.length||i>=e.length);++i)t[i+r]=e[i];return i}}).call(this,r(1))},function(e,t){"function"==typeof Object.create?e.exports=function(e,t){t&&(e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}))}:e.exports=function(e,t){if(t){e.super_=t;var r=function(){};r.prototype=t.prototype,e.prototype=new r,e.prototype.constructor=e}}},function(e,t,r){(function(n){t.formatArgs=function(t){if(t[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+t[0]+(this.useColors?"%c ":" ")+"+"+e.exports.humanize(this.diff),!this.useColors)return;const r="color: "+this.color;t.splice(1,0,r,"color: inherit");let n=0,i=0;t[0].replace(/%[a-zA-Z%]/g,e=>{"%%"!==e&&(n++,"%c"===e&&(i=n))}),t.splice(i,0,r)},t.save=function(e){try{e?t.storage.setItem("debug",e):t.storage.removeItem("debug")}catch(e){}},t.load=function(){let e;try{e=t.storage.getItem("debug")}catch(e){}!e&&void 0!==n&&"env"in n&&(e=n.env.DEBUG);return e},t.useColors=function(){if("undefined"!=typeof window&&window.process&&("renderer"===window.process.type||window.process.__nwjs))return!0;if("undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\\/(\\d+)/))return!1;return"undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\\/(\\d+)/)&&parseInt(RegExp.$1,10)>=31||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\\/(\\d+)/)},t.storage=function(){try{return localStorage}catch(e){}}(),t.destroy=(()=>{let e=!1;return()=>{e||(e=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))}})(),t.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],t.log=console.debug||console.log||(()=>{}),e.exports=r(66)(t);const{formatters:i}=e.exports;i.j=function(e){try{return JSON.stringify(e)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}}}).call(this,r(2))},function(e,t,r){"use strict";r.d(t,"a",(function(){return o})),r.d(t,"b",(function(){return s}));const n={deserialize:e=>Object.assign(Error(e.message),{name:e.name,stack:e.stack}),serialize:e=>({__error_marker:"$$error",message:e.message,name:e.name,stack:e.stack})};let i={deserialize(e){return(t=e)&&"object"==typeof t&&"__error_marker"in t&&"$$error"===t.__error_marker?n.deserialize(e):e;var t},serialize:e=>e instanceof Error?n.serialize(e):e};function o(e){return i.deserialize(e)}function s(e){return i.serialize(e)}},function(e,t,r){"use strict";var n=r(15),i=Object.keys||function(e){var t=[];for(var r in e)t.push(r);return t};e.exports=f;var o=Object.create(r(10));o.inherits=r(4);var s=r(25),a=r(30);o.inherits(f,s);for(var u=i(a.prototype),c=0;c<u.length;c++){var l=u[c];f.prototype[l]||(f.prototype[l]=a.prototype[l])}function f(e){if(!(this instanceof f))return new f(e);s.call(this,e),a.call(this,e),e&&!1===e.readable&&(this.readable=!1),e&&!1===e.writable&&(this.writable=!1),this.allowHalfOpen=!0,e&&!1===e.allowHalfOpen&&(this.allowHalfOpen=!1),this.once("end",h)}function h(){this.allowHalfOpen||this._writableState.ended||n.nextTick(d,this)}function d(e){e.end()}Object.defineProperty(f.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(f.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed&&this._writableState.destroyed)},set:function(e){void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed=e,this._writableState.destroyed=e)}}),f.prototype._destroy=function(e,t){this.push(null),this.end(),n.nextTick(t,e)}},function(e,t,r){"use strict";let n;function i(){return n||(n=function(){try{throw new Error}catch(e){const t=(""+e.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\\/\\/[^)\\n]+/g);if(t)return(""+t[0]).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\\/\\/.+)?\\/[^/]+(?:\\?.*)?$/,"$1")+"/"}return"/"}()),n}r.d(t,"a",(function(){return o})),r.d(t,"b",(function(){return c}));const o="undefined"!=typeof navigator&&navigator.hardwareConcurrency?navigator.hardwareConcurrency:4,s=e=>/^(file|https?:)?\\/\\//i.test(e);function a(e){const t=new Blob([e],{type:"application/javascript"});return URL.createObjectURL(t)}let u;function c(){return u||(u=function(){if("undefined"==typeof Worker)return class{constructor(){throw Error("No web worker implementation available. You might have tried to spawn a worker within a worker in a browser that doesn\'t support workers in workers.")}};class e extends Worker{constructor(e,t){"string"==typeof e&&t&&t._baseURL?e=new URL(e,t._baseURL):"string"==typeof e&&!s(e)&&i().match(/^file:\\/\\//i)&&(e=new URL(e,i().replace(/\\/[^\\/]+$/,"/")),e=a(`importScripts(${JSON.stringify(e)});`)),"string"==typeof e&&s(e)&&(e=a(`importScripts(${JSON.stringify(e)});`)),super(e,t)}}class t extends e{constructor(e,t){super(window.URL.createObjectURL(e),t)}static fromText(e,r){const n=new window.Blob([e],{type:"text/javascript"});return new t(n,r)}}return{blob:t,default:e}}()),u}},function(e,t,r){"use strict";var n,i;r.d(t,"a",(function(){return n})),r.d(t,"b",(function(){return i})),function(e){e.cancel="cancel",e.run="run"}(n||(n={})),function(e){e.error="error",e.init="init",e.result="result",e.running="running",e.uncaughtError="uncaughtError"}(i||(i={}))},function(e,t,r){(function(e){function r(e){return Object.prototype.toString.call(e)}t.isArray=function(e){return Array.isArray?Array.isArray(e):"[object Array]"===r(e)},t.isBoolean=function(e){return"boolean"==typeof e},t.isNull=function(e){return null===e},t.isNullOrUndefined=function(e){return null==e},t.isNumber=function(e){return"number"==typeof e},t.isString=function(e){return"string"==typeof e},t.isSymbol=function(e){return"symbol"==typeof e},t.isUndefined=function(e){return void 0===e},t.isRegExp=function(e){return"[object RegExp]"===r(e)},t.isObject=function(e){return"object"==typeof e&&null!==e},t.isDate=function(e){return"[object Date]"===r(e)},t.isError=function(e){return"[object Error]"===r(e)||e instanceof Error},t.isFunction=function(e){return"function"==typeof e},t.isPrimitive=function(e){return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||void 0===e},t.isBuffer=e.isBuffer}).call(this,r(3).Buffer)},function(e,t,r){"use strict";r.d(t,"a",(function(){return o}));var n=r(0);function i(e){throw Error(e)}const o={errors:e=>e[n.a]||i("Error observable not found. Make sure to pass a thread instance as returned by the spawn() promise."),events:e=>e[n.b]||i("Events observable not found. Make sure to pass a thread instance as returned by the spawn() promise."),terminate:e=>e[n.c]()}},function(e,t){},function(e,t,r){"use strict";const n=()=>"function"==typeof Symbol,i=e=>n()&&Boolean(Symbol[e]),o=e=>i(e)?Symbol[e]:"@@"+e;i("asyncIterator")||(Symbol.asyncIterator=Symbol.asyncIterator||Symbol.for("Symbol.asyncIterator"));const s=o("iterator"),a=o("observable"),u=o("species");function c(e,t){const r=e[t];if(null!=r){if("function"!=typeof r)throw new TypeError(r+" is not a function");return r}}function l(e){let t=e.constructor;return void 0!==t&&(t=t[u],null===t&&(t=void 0)),void 0!==t?t:w}function f(e){f.log?f.log(e):setTimeout(()=>{throw e},0)}function h(e){Promise.resolve().then(()=>{try{e()}catch(e){f(e)}})}function d(e){const t=e._cleanup;if(void 0!==t&&(e._cleanup=void 0,t))try{if("function"==typeof t)t();else{const e=c(t,"unsubscribe");e&&e.call(t)}}catch(e){f(e)}}function p(e){e._observer=void 0,e._queue=void 0,e._state="closed"}function g(e,t,r){e._state="running";const n=e._observer;try{const i=n?c(n,t):void 0;switch(t){case"next":i&&i.call(n,r);break;case"error":if(p(e),!i)throw r;i.call(n,r);break;case"complete":p(e),i&&i.call(n)}}catch(e){f(e)}"closed"===e._state?d(e):"running"===e._state&&(e._state="ready")}function m(e,t,r){if("closed"!==e._state)return"buffering"===e._state?(e._queue=e._queue||[],void e._queue.push({type:t,value:r})):"ready"!==e._state?(e._state="buffering",e._queue=[{type:t,value:r}],void h(()=>function(e){const t=e._queue;if(t){e._queue=void 0,e._state="ready";for(const r of t)if(g(e,r.type,r.value),"closed"===e._state)break}}(e))):void g(e,t,r)}class y{constructor(e,t){this._cleanup=void 0,this._observer=e,this._queue=void 0,this._state="initializing";const r=new b(this);try{this._cleanup=t.call(void 0,r)}catch(e){r.error(e)}"initializing"===this._state&&(this._state="ready")}get closed(){return"closed"===this._state}unsubscribe(){"closed"!==this._state&&(p(this),d(this))}}class b{constructor(e){this._subscription=e}get closed(){return"closed"===this._subscription._state}next(e){m(this._subscription,"next",e)}error(e){m(this._subscription,"error",e)}complete(){m(this._subscription,"complete")}}class w{constructor(e){if(!(this instanceof w))throw new TypeError("Observable cannot be called as a function");if("function"!=typeof e)throw new TypeError("Observable initializer must be a function");this._subscriber=e}subscribe(e,t,r){return"object"==typeof e&&null!==e||(e={next:e,error:t,complete:r}),new y(e,this._subscriber)}pipe(e,...t){let r=this;for(const n of[e,...t])r=n(r);return r}tap(e,t,r){const n="object"!=typeof e||null===e?{next:e,error:t,complete:r}:e;return new w(e=>this.subscribe({next(t){n.next&&n.next(t),e.next(t)},error(t){n.error&&n.error(t),e.error(t)},complete(){n.complete&&n.complete(),e.complete()},start(e){n.start&&n.start(e)}}))}forEach(e){return new Promise((t,r)=>{if("function"!=typeof e)return void r(new TypeError(e+" is not a function"));function n(){i.unsubscribe(),t()}const i=this.subscribe({next(t){try{e(t,n)}catch(e){r(e),i.unsubscribe()}},error:r,complete:t})})}map(e){if("function"!=typeof e)throw new TypeError(e+" is not a function");return new(l(this))(t=>this.subscribe({next(r){let n=r;try{n=e(r)}catch(e){return t.error(e)}t.next(n)},error(e){t.error(e)},complete(){t.complete()}}))}filter(e){if("function"!=typeof e)throw new TypeError(e+" is not a function");return new(l(this))(t=>this.subscribe({next(r){try{if(!e(r))return}catch(e){return t.error(e)}t.next(r)},error(e){t.error(e)},complete(){t.complete()}}))}reduce(e,t){if("function"!=typeof e)throw new TypeError(e+" is not a function");const r=l(this),n=arguments.length>1;let i=!1,o=t;return new r(t=>this.subscribe({next(r){const s=!i;if(i=!0,!s||n)try{o=e(o,r)}catch(e){return t.error(e)}else o=r},error(e){t.error(e)},complete(){if(!i&&!n)return t.error(new TypeError("Cannot reduce an empty sequence"));t.next(o),t.complete()}}))}concat(...e){const t=l(this);return new t(r=>{let n,i=0;return function o(s){n=s.subscribe({next(e){r.next(e)},error(e){r.error(e)},complete(){i===e.length?(n=void 0,r.complete()):o(t.from(e[i++]))}})}(this),()=>{n&&(n.unsubscribe(),n=void 0)}})}flatMap(e){if("function"!=typeof e)throw new TypeError(e+" is not a function");const t=l(this);return new t(r=>{const n=[],i=this.subscribe({next(i){let s;if(e)try{s=e(i)}catch(e){return r.error(e)}else s=i;const a=t.from(s).subscribe({next(e){r.next(e)},error(e){r.error(e)},complete(){const e=n.indexOf(a);e>=0&&n.splice(e,1),o()}});n.push(a)},error(e){r.error(e)},complete(){o()}});function o(){i.closed&&0===n.length&&r.complete()}return()=>{n.forEach(e=>e.unsubscribe()),i.unsubscribe()}})}[a](){return this}static from(e){const t="function"==typeof this?this:w;if(null==e)throw new TypeError(e+" is not an object");const r=c(e,a);if(r){const n=r.call(e);if(Object(n)!==n)throw new TypeError(n+" is not an object");return function(e){return e instanceof w}(n)&&n.constructor===t?n:new t(e=>n.subscribe(e))}if(i("iterator")){const r=c(e,s);if(r)return new t(t=>{h(()=>{if(!t.closed){for(const n of r.call(e))if(t.next(n),t.closed)return;t.complete()}})})}if(Array.isArray(e))return new t(t=>{h(()=>{if(!t.closed){for(const r of e)if(t.next(r),t.closed)return;t.complete()}})});throw new TypeError(e+" is not observable")}static of(...e){return new("function"==typeof this?this:w)(t=>{h(()=>{if(!t.closed){for(const r of e)if(t.next(r),t.closed)return;t.complete()}})})}static get[u](){return this}}n()&&Object.defineProperty(w,Symbol("extensions"),{value:{symbol:a,hostReportError:f},configurable:!0});t.a=w},function(e,t,r){"use strict";var n;r.d(t,"a",(function(){return n})),function(e){e.internalError="internalError",e.message="message",e.termination="termination"}(n||(n={}))},function(e,t,r){"use strict";(function(t){void 0===t||!t.version||0===t.version.indexOf("v0.")||0===t.version.indexOf("v1.")&&0!==t.version.indexOf("v1.8.")?e.exports={nextTick:function(e,r,n,i){if("function"!=typeof e)throw new TypeError(\'"callback" argument must be a function\');var o,s,a=arguments.length;switch(a){case 0:case 1:return t.nextTick(e);case 2:return t.nextTick((function(){e.call(null,r)}));case 3:return t.nextTick((function(){e.call(null,r,n)}));case 4:return t.nextTick((function(){e.call(null,r,n,i)}));default:for(o=new Array(a-1),s=0;s<o.length;)o[s++]=arguments[s];return t.nextTick((function(){e.apply(null,o)}))}}}:e.exports=t}).call(this,r(2))},function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;function i(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)i(r,n)&&(e[n]=r[n])}}return e},t.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var o={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var o=0;o<n;o++)e[i+o]=t[r+o]},flattenChunks:function(e){var t,r,n,i,o,s;for(n=0,t=0,r=e.length;t<r;t++)n+=e[t].length;for(s=new Uint8Array(n),i=0,t=0,r=e.length;t<r;t++)o=e[t],s.set(o,i),i+=o.length;return s}},s={arraySet:function(e,t,r,n,i){for(var o=0;o<n;o++)e[i+o]=t[r+o]},flattenChunks:function(e){return[].concat.apply([],e)}};t.setTyped=function(e){e?(t.Buf8=Uint8Array,t.Buf16=Uint16Array,t.Buf32=Int32Array,t.assign(t,o)):(t.Buf8=Array,t.Buf16=Array,t.Buf32=Array,t.assign(t,s))},t.setTyped(n)},function(e,t,r){"use strict";var n=r(72),i=r(74);function o(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}t.parse=w,t.resolve=function(e,t){return w(e,!1,!0).resolve(t)},t.resolveObject=function(e,t){return e?w(e,!1,!0).resolveObject(t):t},t.format=function(e){i.isString(e)&&(e=w(e));return e instanceof o?e.format():o.prototype.format.call(e)},t.Url=o;var s=/^([a-z0-9.+-]+:)/i,a=/:[0-9]*$/,u=/^(\\/\\/?(?!\\/)[^\\?\\s]*)(\\?[^\\s]*)?$/,c=["{","}","|","\\\\","^","`"].concat(["<",">",\'"\',"`"," ","\\r","\\n","\\t"]),l=["\'"].concat(c),f=["%","/","?",";","#"].concat(l),h=["/","?","#"],d=/^[+a-z0-9A-Z_-]{0,63}$/,p=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,g={javascript:!0,"javascript:":!0},m={javascript:!0,"javascript:":!0},y={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},b=r(75);function w(e,t,r){if(e&&i.isObject(e)&&e instanceof o)return e;var n=new o;return n.parse(e,t,r),n}o.prototype.parse=function(e,t,r){if(!i.isString(e))throw new TypeError("Parameter \'url\' must be a string, not "+typeof e);var o=e.indexOf("?"),a=-1!==o&&o<e.indexOf("#")?"?":"#",c=e.split(a);c[0]=c[0].replace(/\\\\/g,"/");var w=e=c.join(a);if(w=w.trim(),!r&&1===e.split("#").length){var v=u.exec(w);if(v)return this.path=w,this.href=w,this.pathname=v[1],v[2]?(this.search=v[2],this.query=t?b.parse(this.search.substr(1)):this.search.substr(1)):t&&(this.search="",this.query={}),this}var _=s.exec(w);if(_){var S=(_=_[0]).toLowerCase();this.protocol=S,w=w.substr(_.length)}if(r||_||w.match(/^\\/\\/[^@\\/]+@[^@\\/]+/)){var k="//"===w.substr(0,2);!k||_&&m[_]||(w=w.substr(2),this.slashes=!0)}if(!m[_]&&(k||_&&!y[_])){for(var C,E,T=-1,x=0;x<h.length;x++){-1!==(A=w.indexOf(h[x]))&&(-1===T||A<T)&&(T=A)}-1!==(E=-1===T?w.lastIndexOf("@"):w.lastIndexOf("@",T))&&(C=w.slice(0,E),w=w.slice(E+1),this.auth=decodeURIComponent(C)),T=-1;for(x=0;x<f.length;x++){var A;-1!==(A=w.indexOf(f[x]))&&(-1===T||A<T)&&(T=A)}-1===T&&(T=w.length),this.host=w.slice(0,T),w=w.slice(T),this.parseHost(),this.hostname=this.hostname||"";var O="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!O)for(var R=this.hostname.split(/\\./),I=(x=0,R.length);x<I;x++){var P=R[x];if(P&&!P.match(d)){for(var M="",D=0,L=P.length;D<L;D++)P.charCodeAt(D)>127?M+="x":M+=P[D];if(!M.match(d)){var U=R.slice(0,x),F=R.slice(x+1),j=P.match(p);j&&(U.push(j[1]),F.unshift(j[2])),F.length&&(w="/"+F.join(".")+w),this.hostname=U.join(".");break}}}this.hostname.length>255?this.hostname="":this.hostname=this.hostname.toLowerCase(),O||(this.hostname=n.toASCII(this.hostname));var B=this.port?":"+this.port:"",N=this.hostname||"";this.host=N+B,this.href+=this.host,O&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==w[0]&&(w="/"+w))}if(!g[S])for(x=0,I=l.length;x<I;x++){var G=l[x];if(-1!==w.indexOf(G)){var q=encodeURIComponent(G);q===G&&(q=escape(G)),w=w.split(G).join(q)}}var H=w.indexOf("#");-1!==H&&(this.hash=w.substr(H),w=w.slice(0,H));var z=w.indexOf("?");if(-1!==z?(this.search=w.substr(z),this.query=w.substr(z+1),t&&(this.query=b.parse(this.query)),w=w.slice(0,z)):t&&(this.search="",this.query={}),w&&(this.pathname=w),y[S]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){B=this.pathname||"";var K=this.search||"";this.path=B+K}return this.href=this.format(),this},o.prototype.format=function(){var e=this.auth||"";e&&(e=(e=encodeURIComponent(e)).replace(/%3A/i,":"),e+="@");var t=this.protocol||"",r=this.pathname||"",n=this.hash||"",o=!1,s="";this.host?o=e+this.host:this.hostname&&(o=e+(-1===this.hostname.indexOf(":")?this.hostname:"["+this.hostname+"]"),this.port&&(o+=":"+this.port)),this.query&&i.isObject(this.query)&&Object.keys(this.query).length&&(s=b.stringify(this.query));var a=this.search||s&&"?"+s||"";return t&&":"!==t.substr(-1)&&(t+=":"),this.slashes||(!t||y[t])&&!1!==o?(o="//"+(o||""),r&&"/"!==r.charAt(0)&&(r="/"+r)):o||(o=""),n&&"#"!==n.charAt(0)&&(n="#"+n),a&&"?"!==a.charAt(0)&&(a="?"+a),t+o+(r=r.replace(/[?#]/g,(function(e){return encodeURIComponent(e)})))+(a=a.replace("#","%23"))+n},o.prototype.resolve=function(e){return this.resolveObject(w(e,!1,!0)).format()},o.prototype.resolveObject=function(e){if(i.isString(e)){var t=new o;t.parse(e,!1,!0),e=t}for(var r=new o,n=Object.keys(this),s=0;s<n.length;s++){var a=n[s];r[a]=this[a]}if(r.hash=e.hash,""===e.href)return r.href=r.format(),r;if(e.slashes&&!e.protocol){for(var u=Object.keys(e),c=0;c<u.length;c++){var l=u[c];"protocol"!==l&&(r[l]=e[l])}return y[r.protocol]&&r.hostname&&!r.pathname&&(r.path=r.pathname="/"),r.href=r.format(),r}if(e.protocol&&e.protocol!==r.protocol){if(!y[e.protocol]){for(var f=Object.keys(e),h=0;h<f.length;h++){var d=f[h];r[d]=e[d]}return r.href=r.format(),r}if(r.protocol=e.protocol,e.host||m[e.protocol])r.pathname=e.pathname;else{for(var p=(e.pathname||"").split("/");p.length&&!(e.host=p.shift()););e.host||(e.host=""),e.hostname||(e.hostname=""),""!==p[0]&&p.unshift(""),p.length<2&&p.unshift(""),r.pathname=p.join("/")}if(r.search=e.search,r.query=e.query,r.host=e.host||"",r.auth=e.auth,r.hostname=e.hostname||e.host,r.port=e.port,r.pathname||r.search){var g=r.pathname||"",b=r.search||"";r.path=g+b}return r.slashes=r.slashes||e.slashes,r.href=r.format(),r}var w=r.pathname&&"/"===r.pathname.charAt(0),v=e.host||e.pathname&&"/"===e.pathname.charAt(0),_=v||w||r.host&&e.pathname,S=_,k=r.pathname&&r.pathname.split("/")||[],C=(p=e.pathname&&e.pathname.split("/")||[],r.protocol&&!y[r.protocol]);if(C&&(r.hostname="",r.port=null,r.host&&(""===k[0]?k[0]=r.host:k.unshift(r.host)),r.host="",e.protocol&&(e.hostname=null,e.port=null,e.host&&(""===p[0]?p[0]=e.host:p.unshift(e.host)),e.host=null),_=_&&(""===p[0]||""===k[0])),v)r.host=e.host||""===e.host?e.host:r.host,r.hostname=e.hostname||""===e.hostname?e.hostname:r.hostname,r.search=e.search,r.query=e.query,k=p;else if(p.length)k||(k=[]),k.pop(),k=k.concat(p),r.search=e.search,r.query=e.query;else if(!i.isNullOrUndefined(e.search)){if(C)r.hostname=r.host=k.shift(),(O=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=O.shift(),r.host=r.hostname=O.shift());return r.search=e.search,r.query=e.query,i.isNull(r.pathname)&&i.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.href=r.format(),r}if(!k.length)return r.pathname=null,r.search?r.path="/"+r.search:r.path=null,r.href=r.format(),r;for(var E=k.slice(-1)[0],T=(r.host||e.host||k.length>1)&&("."===E||".."===E)||""===E,x=0,A=k.length;A>=0;A--)"."===(E=k[A])?k.splice(A,1):".."===E?(k.splice(A,1),x++):x&&(k.splice(A,1),x--);if(!_&&!S)for(;x--;x)k.unshift("..");!_||""===k[0]||k[0]&&"/"===k[0].charAt(0)||k.unshift(""),T&&"/"!==k.join("/").substr(-1)&&k.push("");var O,R=""===k[0]||k[0]&&"/"===k[0].charAt(0);C&&(r.hostname=r.host=R?"":k.length?k.shift():"",(O=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=O.shift(),r.host=r.hostname=O.shift()));return(_=_||r.host&&k.length)&&!R&&k.unshift(""),k.length?r.pathname=k.join("/"):(r.pathname=null,r.path=null),i.isNull(r.pathname)&&i.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.auth=e.auth||r.auth,r.slashes=r.slashes||e.slashes,r.href=r.format(),r},o.prototype.parseHost=function(){var e=this.host,t=a.exec(e);t&&(":"!==(t=t[0])&&(this.port=t.substr(1)),e=e.substr(0,e.length-t.length)),e&&(this.hostname=e)}},function(e,t,r){(function(e){var n=r(68),i=r(35),o=r(70),s=r(71),a=r(17),u=t;u.request=function(t,r){t="string"==typeof t?a.parse(t):o(t);var i=-1===e.location.protocol.search(/^https?:$/)?"http:":"",s=t.protocol||i,u=t.hostname||t.host,c=t.port,l=t.path||"/";u&&-1!==u.indexOf(":")&&(u="["+u+"]"),t.url=(u?s+"//"+u:"")+(c?":"+c:"")+l,t.method=(t.method||"GET").toUpperCase(),t.headers=t.headers||{};var f=new n(t);return r&&f.on("response",r),f},u.get=function(e,t){var r=u.request(e,t);return r.end(),r},u.ClientRequest=n,u.IncomingMessage=i.IncomingMessage,u.Agent=function(){},u.Agent.defaultMaxSockets=4,u.globalAgent=new u.Agent,u.STATUS_CODES=s,u.METHODS=["CHECKOUT","CONNECT","COPY","DELETE","GET","HEAD","LOCK","M-SEARCH","MERGE","MKACTIVITY","MKCOL","MOVE","NOTIFY","OPTIONS","PATCH","POST","PROPFIND","PROPPATCH","PURGE","PUT","REPORT","SEARCH","SUBSCRIBE","TRACE","UNLOCK","UNSUBSCRIBE"]}).call(this,r(1))},,function(e,t,r){(t=e.exports=r(25)).Stream=t,t.Readable=t,t.Writable=r(30),t.Duplex=r(7),t.Transform=r(32),t.PassThrough=r(54)},function(e,t,r){var n=r(3),i=n.Buffer;function o(e,t){for(var r in e)t[r]=e[r]}function s(e,t,r){return i(e,t,r)}i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow?e.exports=n:(o(n,t),t.Buffer=s),o(i,s),s.from=function(e,t,r){if("number"==typeof e)throw new TypeError("Argument must not be a number");return i(e,t,r)},s.alloc=function(e,t,r){if("number"!=typeof e)throw new TypeError("Argument must be a number");var n=i(e);return void 0!==t?"string"==typeof r?n.fill(t,r):n.fill(t):n.fill(0),n},s.allocUnsafe=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return i(e)},s.allocUnsafeSlow=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return n.SlowBuffer(e)}},function(e,t,r){"use strict";(function(e){r.d(t,"a",(function(){return y}));var n=r(5),i=r.n(n),o=r(13),s=r(6),a=r(40),u=r(0),c=r(14),l=r(24),f=function(e,t,r,n){return new(r||(r=Promise))((function(i,o){function s(e){try{u(n.next(e))}catch(e){o(e)}}function a(e){try{u(n.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(s,a)}u((n=n.apply(e,t||[])).next())}))};const h=i()("threads:master:messages"),d=i()("threads:master:spawn"),p=i()("threads:master:thread-utils"),g=void 0!==e&&e.env.THREADS_WORKER_INIT_TIMEOUT?Number.parseInt(e.env.THREADS_WORKER_INIT_TIMEOUT,10):1e4;function m(e,t,r,n){const i=r.filter(e=>e.type===c.a.internalError).map(e=>e.error);return Object.assign(e,{[u.a]:i,[u.b]:r,[u.c]:n,[u.e]:t})}function y(e,t){return f(this,void 0,void 0,(function*(){d("Initializing new thread");const r=(yield function(e,t,r){return f(this,void 0,void 0,(function*(){let n;const i=new Promise((e,i)=>{n=setTimeout(()=>i(Error(r)),t)}),o=yield Promise.race([e,i]);return clearTimeout(n),o}))}(function(e){return new Promise((t,r)=>{const n=i=>{var o;h("Message from worker before finishing initialization:",i.data),(o=i.data)&&"init"===o.type?(e.removeEventListener("message",n),t(i.data)):(e=>e&&"uncaughtError"===e.type)(i.data)&&(e.removeEventListener("message",n),r(Object(s.a)(i.data.error)))};e.addEventListener("message",n)})}(e),t&&t.timeout?t.timeout:g,`Timeout: Did not receive an init message from worker after ${g}ms. Make sure the worker calls expose().`)).exposed,{termination:n,terminate:i}=function(e){const[t,r]=Object(a.a)();return{terminate:()=>f(this,void 0,void 0,(function*(){p("Terminating worker"),yield e.terminate(),r()})),termination:t}}(e),u=function(e,t){return new o.a(r=>{const n=e=>{const t={type:c.a.message,data:e.data};r.next(t)},i=e=>{p("Unhandled promise rejection event in thread:",e);const t={type:c.a.internalError,error:Error(e.reason)};r.next(t)};e.addEventListener("message",n),e.addEventListener("unhandledrejection",i),t.then(()=>{const t={type:c.a.termination};e.removeEventListener("message",n),e.removeEventListener("unhandledrejection",i),r.next(t),r.complete()})})}(e,n);if("function"===r.type){return m(Object(l.a)(e),e,u,i)}if("module"===r.type){return m(Object(l.b)(e,r.methods),e,u,i)}{const e=r.type;throw Error("Worker init message states unexpected type of expose(): "+e)}}))}}).call(this,r(2))},function(e,t,r){"use strict";r.d(t,"a",(function(){return m}));var n=r(5),i=r.n(n),o=r(39),s=r(83),a=r(13);function u(e){return Promise.all(e.map(e=>{const t=e=>({status:"fulfilled",value:e}),r=e=>({status:"rejected",reason:e}),n=Promise.resolve(e);try{return n.then(t,r)}catch(e){return Promise.reject(e)}}))}var c,l=r(8);!function(e){e.initialized="initialized",e.taskCanceled="taskCanceled",e.taskCompleted="taskCompleted",e.taskFailed="taskFailed",e.taskQueued="taskQueued",e.taskQueueDrained="taskQueueDrained",e.taskStart="taskStart",e.terminated="terminated"}(c||(c={}));var f=r(11),h=function(e,t,r,n){return new(r||(r=Promise))((function(i,o){function s(e){try{u(n.next(e))}catch(e){o(e)}}function a(e){try{u(n.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(s,a)}u((n=n.apply(e,t||[])).next())}))};let d=1;class p{constructor(e,t){this.eventSubject=new o.a,this.initErrors=[],this.isClosing=!1,this.nextTaskID=1,this.taskQueue=[];const r="number"==typeof t?{size:t}:t||{},{size:n=l.a}=r;this.debug=i()("threads:pool:"+(r.name||String(d++)).replace(/\\W/g," ").trim().replace(/\\s+/g,"-")),this.options=r,this.workers=function(e,t){return function(e){const t=[];for(let r=0;r<e;r++)t.push(r);return t}(t).map(()=>({init:e(),runningTasks:[]}))}(e,n),this.eventObservable=Object(s.a)(a.a.from(this.eventSubject)),Promise.all(this.workers.map(e=>e.init)).then(()=>this.eventSubject.next({type:c.initialized,size:this.workers.length}),e=>{this.debug("Error while initializing pool worker:",e),this.eventSubject.error(e),this.initErrors.push(e)})}findIdlingWorker(){const{concurrency:e=1}=this.options;return this.workers.find(t=>t.runningTasks.length<e)}runPoolTask(e,t){return h(this,void 0,void 0,(function*(){const r=this.workers.indexOf(e)+1;this.debug(`Running task #${t.id} on worker #${r}...`),this.eventSubject.next({type:c.taskStart,taskID:t.id,workerID:r});try{const n=yield t.run(yield e.init);this.debug(`Task #${t.id} completed successfully`),this.eventSubject.next({type:c.taskCompleted,returnValue:n,taskID:t.id,workerID:r})}catch(e){this.debug(`Task #${t.id} failed`),this.eventSubject.next({type:c.taskFailed,taskID:t.id,error:e,workerID:r})}}))}run(e,t){return h(this,void 0,void 0,(function*(){const r=(()=>h(this,void 0,void 0,(function*(){var n;yield(n=0,new Promise(e=>setTimeout(e,n)));try{yield this.runPoolTask(e,t)}finally{e.runningTasks=e.runningTasks.filter(e=>e!==r),this.isClosing||this.scheduleWork()}})))();e.runningTasks.push(r)}))}scheduleWork(){this.debug("Attempt de-queueing a task in order to run it...");const e=this.findIdlingWorker();if(!e)return;const t=this.taskQueue.shift();if(!t)return this.debug("Task queue is empty"),void this.eventSubject.next({type:c.taskQueueDrained});this.run(e,t)}taskCompletion(e){return new Promise((t,r)=>{const n=this.events().subscribe(i=>{i.type===c.taskCompleted&&i.taskID===e?(n.unsubscribe(),t(i.returnValue)):i.type===c.taskFailed&&i.taskID===e?(n.unsubscribe(),r(i.error)):i.type===c.terminated&&(n.unsubscribe(),r(Error("Pool has been terminated before task was run.")))})})}settled(e=!1){return h(this,void 0,void 0,(function*(){const t=()=>{return e=this.workers,t=e=>e.runningTasks,e.reduce((e,r)=>[...e,...t(r)],[]);var e,t},r=[],n=this.eventObservable.subscribe(e=>{e.type===c.taskFailed&&r.push(e.error)});return this.initErrors.length>0?Promise.reject(this.initErrors[0]):e&&0===this.taskQueue.length?(yield u(t()),r):(yield new Promise((e,t)=>{const r=this.eventObservable.subscribe({next(t){t.type===c.taskQueueDrained&&(r.unsubscribe(),e())},error:t})}),yield u(t()),n.unsubscribe(),r)}))}completed(e=!1){return h(this,void 0,void 0,(function*(){const t=this.settled(e),r=new Promise((e,r)=>{const n=this.eventObservable.subscribe({next(i){i.type===c.taskQueueDrained?(n.unsubscribe(),e(t)):i.type===c.taskFailed&&(n.unsubscribe(),r(i.error))},error:r})}),n=yield Promise.race([t,r]);if(n.length>0)throw n[0]}))}events(){return this.eventObservable}queue(e){const{maxQueuedJobs:t=1/0}=this.options;if(this.isClosing)throw Error("Cannot schedule pool tasks after terminate() has been called.");if(this.initErrors.length>0)throw this.initErrors[0];const r=this.nextTaskID++,n=this.taskCompletion(r);n.catch(e=>{this.debug(`Task #${r} errored:`,e)});const i={id:r,run:e,cancel:()=>{-1!==this.taskQueue.indexOf(i)&&(this.taskQueue=this.taskQueue.filter(e=>e!==i),this.eventSubject.next({type:c.taskCanceled,taskID:i.id}))},then:n.then.bind(n)};if(this.taskQueue.length>=t)throw Error("Maximum number of pool tasks queued. Refusing to queue another one.\\nThis usually happens for one of two reasons: We are either at peak workload right now or some tasks just won\'t finish, thus blocking the pool.");return this.debug(`Queueing task #${i.id}...`),this.taskQueue.push(i),this.eventSubject.next({type:c.taskQueued,taskID:i.id}),this.scheduleWork(),i}terminate(e){return h(this,void 0,void 0,(function*(){this.isClosing=!0,e||(yield this.completed(!0)),this.eventSubject.next({type:c.terminated,remainingQueue:[...this.taskQueue]}),this.eventSubject.complete(),yield Promise.all(this.workers.map(e=>h(this,void 0,void 0,(function*(){return f.a.terminate(yield e.init)}))))}))}}function g(e,t){return new p(e,t)}p.EventType=c,g.EventType=c;const m=g},function(e,t,r){"use strict";r.d(t,"a",(function(){return b})),r.d(t,"b",(function(){return w}));var n=r(5),i=r.n(n),o=r(13),s=r(83),a=r(6);const u=()=>{},c=e=>e,l=e=>Promise.resolve().then(e);function f(e){throw e}class h extends o.a{constructor(e){super(t=>{const r=this,n=Object.assign(Object.assign({},t),{complete(){t.complete(),r.onCompletion()},error(e){t.error(e),r.onError(e)},next(e){t.next(e),r.onNext(e)}});try{return this.initHasRun=!0,e(n)}catch(e){n.error(e)}}),this.initHasRun=!1,this.fulfillmentCallbacks=[],this.rejectionCallbacks=[],this.firstValueSet=!1,this.state="pending"}onNext(e){this.firstValueSet||(this.firstValue=e,this.firstValueSet=!0)}onError(e){this.state="rejected",this.rejection=e;for(const t of this.rejectionCallbacks)l(()=>t(e))}onCompletion(){this.state="fulfilled";for(const e of this.fulfillmentCallbacks)l(()=>e(this.firstValue))}then(e,t){const r=e||c,n=t||f;let i=!1;return new Promise((e,t)=>{const o=r=>{if(!i){i=!0;try{e(n(r))}catch(e){t(e)}}};return this.initHasRun||this.subscribe({error:o}),"fulfilled"===this.state?e(r(this.firstValue)):"rejected"===this.state?(i=!0,e(n(this.rejection))):(this.fulfillmentCallbacks.push(t=>{try{e(r(t))}catch(e){o(e)}}),void this.rejectionCallbacks.push(o))})}catch(e){return this.then(void 0,e)}finally(e){const t=e||u;return this.then(e=>(t(),e),()=>t())}static from(e){return function(e){return e&&"function"==typeof e.then}(e)?new h(t=>{e.then(e=>{t.next(e),t.complete()},e=>{t.error(e)})}):super.from(e)}}var d=r(41),p=r(9);const g=i()("threads:master:messages");let m=1;function y(e,t){return new o.a(r=>{let n;const i=o=>{var s;if(g("Message from worker:",o.data),o.data&&o.data.uid===t)if((s=o.data)&&s.type===p.b.running)n=o.data.resultType;else if((e=>e&&e.type===p.b.result)(o.data))"promise"===n?(void 0!==o.data.payload&&r.next(Object(a.a)(o.data.payload)),r.complete(),e.removeEventListener("message",i)):(o.data.payload&&r.next(Object(a.a)(o.data.payload)),o.data.complete&&(r.complete(),e.removeEventListener("message",i)));else if((e=>e&&e.type===p.b.error)(o.data)){const t=Object(a.a)(o.data.error);r.error(t),e.removeEventListener("message",i)}};return e.addEventListener("message",i),()=>{if("observable"===n||!n){const r={type:p.a.cancel,uid:t};e.postMessage(r)}e.removeEventListener("message",i)}})}function b(e,t){return(...r)=>{const n=m++,{args:i,transferables:o}=function(e){if(0===e.length)return{args:[],transferables:[]};const t=[],r=[];for(const n of e)Object(d.a)(n)?(t.push(Object(a.b)(n.send)),r.push(...n.transferables)):t.push(Object(a.b)(n));return{args:t,transferables:0===r.length?r:(n=r,Array.from(new Set(n)))};var n}(r),u={type:p.a.run,uid:n,method:t,args:i};g("Sending command to run function to worker:",u);try{e.postMessage(u,o)}catch(e){return h.from(Promise.reject(e))}return h.from(Object(s.a)(y(e,n)))}}function w(e,t){const r={};for(const n of t)r[n]=b(e,n);return r}},function(e,t,r){"use strict";(function(t,n){var i=r(15);e.exports=w;var o,s=r(26);w.ReadableState=b;r(27).EventEmitter;var a=function(e,t){return e.listeners(t).length},u=r(28),c=r(21).Buffer,l=t.Uint8Array||function(){};var f=Object.create(r(10));f.inherits=r(4);var h=r(47),d=void 0;d=h&&h.debuglog?h.debuglog("stream"):function(){};var p,g=r(48),m=r(29);f.inherits(w,u);var y=["error","close","destroy","pause","resume"];function b(e,t){e=e||{};var n=t instanceof(o=o||r(7));this.objectMode=!!e.objectMode,n&&(this.objectMode=this.objectMode||!!e.readableObjectMode);var i=e.highWaterMark,s=e.readableHighWaterMark,a=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(s||0===s)?s:a,this.highWaterMark=Math.floor(this.highWaterMark),this.buffer=new g,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.destroyed=!1,this.defaultEncoding=e.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,e.encoding&&(p||(p=r(31).StringDecoder),this.decoder=new p(e.encoding),this.encoding=e.encoding)}function w(e){if(o=o||r(7),!(this instanceof w))return new w(e);this._readableState=new b(e,this),this.readable=!0,e&&("function"==typeof e.read&&(this._read=e.read),"function"==typeof e.destroy&&(this._destroy=e.destroy)),u.call(this)}function v(e,t,r,n,i){var o,s=e._readableState;null===t?(s.reading=!1,function(e,t){if(t.ended)return;if(t.decoder){var r=t.decoder.end();r&&r.length&&(t.buffer.push(r),t.length+=t.objectMode?1:r.length)}t.ended=!0,k(e)}(e,s)):(i||(o=function(e,t){var r;n=t,c.isBuffer(n)||n instanceof l||"string"==typeof t||void 0===t||e.objectMode||(r=new TypeError("Invalid non-string/buffer chunk"));var n;return r}(s,t)),o?e.emit("error",o):s.objectMode||t&&t.length>0?("string"==typeof t||s.objectMode||Object.getPrototypeOf(t)===c.prototype||(t=function(e){return c.from(e)}(t)),n?s.endEmitted?e.emit("error",new Error("stream.unshift() after end event")):_(e,s,t,!0):s.ended?e.emit("error",new Error("stream.push() after EOF")):(s.reading=!1,s.decoder&&!r?(t=s.decoder.write(t),s.objectMode||0!==t.length?_(e,s,t,!1):E(e,s)):_(e,s,t,!1))):n||(s.reading=!1));return function(e){return!e.ended&&(e.needReadable||e.length<e.highWaterMark||0===e.length)}(s)}function _(e,t,r,n){t.flowing&&0===t.length&&!t.sync?(e.emit("data",r),e.read(0)):(t.length+=t.objectMode?1:r.length,n?t.buffer.unshift(r):t.buffer.push(r),t.needReadable&&k(e)),E(e,t)}Object.defineProperty(w.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&this._readableState.destroyed},set:function(e){this._readableState&&(this._readableState.destroyed=e)}}),w.prototype.destroy=m.destroy,w.prototype._undestroy=m.undestroy,w.prototype._destroy=function(e,t){this.push(null),t(e)},w.prototype.push=function(e,t){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof e&&((t=t||n.defaultEncoding)!==n.encoding&&(e=c.from(e,t),t=""),r=!0),v(this,e,t,!1,r)},w.prototype.unshift=function(e){return v(this,e,null,!0,!1)},w.prototype.isPaused=function(){return!1===this._readableState.flowing},w.prototype.setEncoding=function(e){return p||(p=r(31).StringDecoder),this._readableState.decoder=new p(e),this._readableState.encoding=e,this};function S(e,t){return e<=0||0===t.length&&t.ended?0:t.objectMode?1:e!=e?t.flowing&&t.length?t.buffer.head.data.length:t.length:(e>t.highWaterMark&&(t.highWaterMark=function(e){return e>=8388608?e=8388608:(e--,e|=e>>>1,e|=e>>>2,e|=e>>>4,e|=e>>>8,e|=e>>>16,e++),e}(e)),e<=t.length?e:t.ended?t.length:(t.needReadable=!0,0))}function k(e){var t=e._readableState;t.needReadable=!1,t.emittedReadable||(d("emitReadable",t.flowing),t.emittedReadable=!0,t.sync?i.nextTick(C,e):C(e))}function C(e){d("emit readable"),e.emit("readable"),O(e)}function E(e,t){t.readingMore||(t.readingMore=!0,i.nextTick(T,e,t))}function T(e,t){for(var r=t.length;!t.reading&&!t.flowing&&!t.ended&&t.length<t.highWaterMark&&(d("maybeReadMore read 0"),e.read(0),r!==t.length);)r=t.length;t.readingMore=!1}function x(e){d("readable nexttick read 0"),e.read(0)}function A(e,t){t.reading||(d("resume read 0"),e.read(0)),t.resumeScheduled=!1,t.awaitDrain=0,e.emit("resume"),O(e),t.flowing&&!t.reading&&e.read(0)}function O(e){var t=e._readableState;for(d("flow",t.flowing);t.flowing&&null!==e.read(););}function R(e,t){return 0===t.length?null:(t.objectMode?r=t.buffer.shift():!e||e>=t.length?(r=t.decoder?t.buffer.join(""):1===t.buffer.length?t.buffer.head.data:t.buffer.concat(t.length),t.buffer.clear()):r=function(e,t,r){var n;e<t.head.data.length?(n=t.head.data.slice(0,e),t.head.data=t.head.data.slice(e)):n=e===t.head.data.length?t.shift():r?function(e,t){var r=t.head,n=1,i=r.data;e-=i.length;for(;r=r.next;){var o=r.data,s=e>o.length?o.length:e;if(s===o.length?i+=o:i+=o.slice(0,e),0===(e-=s)){s===o.length?(++n,r.next?t.head=r.next:t.head=t.tail=null):(t.head=r,r.data=o.slice(s));break}++n}return t.length-=n,i}(e,t):function(e,t){var r=c.allocUnsafe(e),n=t.head,i=1;n.data.copy(r),e-=n.data.length;for(;n=n.next;){var o=n.data,s=e>o.length?o.length:e;if(o.copy(r,r.length-e,0,s),0===(e-=s)){s===o.length?(++i,n.next?t.head=n.next:t.head=t.tail=null):(t.head=n,n.data=o.slice(s));break}++i}return t.length-=i,r}(e,t);return n}(e,t.buffer,t.decoder),r);var r}function I(e){var t=e._readableState;if(t.length>0)throw new Error(\'"endReadable()" called on non-empty stream\');t.endEmitted||(t.ended=!0,i.nextTick(P,t,e))}function P(e,t){e.endEmitted||0!==e.length||(e.endEmitted=!0,t.readable=!1,t.emit("end"))}function M(e,t){for(var r=0,n=e.length;r<n;r++)if(e[r]===t)return r;return-1}w.prototype.read=function(e){d("read",e),e=parseInt(e,10);var t=this._readableState,r=e;if(0!==e&&(t.emittedReadable=!1),0===e&&t.needReadable&&(t.length>=t.highWaterMark||t.ended))return d("read: emitReadable",t.length,t.ended),0===t.length&&t.ended?I(this):k(this),null;if(0===(e=S(e,t))&&t.ended)return 0===t.length&&I(this),null;var n,i=t.needReadable;return d("need readable",i),(0===t.length||t.length-e<t.highWaterMark)&&d("length less than watermark",i=!0),t.ended||t.reading?d("reading or ended",i=!1):i&&(d("do read"),t.reading=!0,t.sync=!0,0===t.length&&(t.needReadable=!0),this._read(t.highWaterMark),t.sync=!1,t.reading||(e=S(r,t))),null===(n=e>0?R(e,t):null)?(t.needReadable=!0,e=0):t.length-=e,0===t.length&&(t.ended||(t.needReadable=!0),r!==e&&t.ended&&I(this)),null!==n&&this.emit("data",n),n},w.prototype._read=function(e){this.emit("error",new Error("_read() is not implemented"))},w.prototype.pipe=function(e,t){var r=this,o=this._readableState;switch(o.pipesCount){case 0:o.pipes=e;break;case 1:o.pipes=[o.pipes,e];break;default:o.pipes.push(e)}o.pipesCount+=1,d("pipe count=%d opts=%j",o.pipesCount,t);var u=(!t||!1!==t.end)&&e!==n.stdout&&e!==n.stderr?l:w;function c(t,n){d("onunpipe"),t===r&&n&&!1===n.hasUnpiped&&(n.hasUnpiped=!0,d("cleanup"),e.removeListener("close",y),e.removeListener("finish",b),e.removeListener("drain",f),e.removeListener("error",m),e.removeListener("unpipe",c),r.removeListener("end",l),r.removeListener("end",w),r.removeListener("data",g),h=!0,!o.awaitDrain||e._writableState&&!e._writableState.needDrain||f())}function l(){d("onend"),e.end()}o.endEmitted?i.nextTick(u):r.once("end",u),e.on("unpipe",c);var f=function(e){return function(){var t=e._readableState;d("pipeOnDrain",t.awaitDrain),t.awaitDrain&&t.awaitDrain--,0===t.awaitDrain&&a(e,"data")&&(t.flowing=!0,O(e))}}(r);e.on("drain",f);var h=!1;var p=!1;function g(t){d("ondata"),p=!1,!1!==e.write(t)||p||((1===o.pipesCount&&o.pipes===e||o.pipesCount>1&&-1!==M(o.pipes,e))&&!h&&(d("false write response, pause",r._readableState.awaitDrain),r._readableState.awaitDrain++,p=!0),r.pause())}function m(t){d("onerror",t),w(),e.removeListener("error",m),0===a(e,"error")&&e.emit("error",t)}function y(){e.removeListener("finish",b),w()}function b(){d("onfinish"),e.removeListener("close",y),w()}function w(){d("unpipe"),r.unpipe(e)}return r.on("data",g),function(e,t,r){if("function"==typeof e.prependListener)return e.prependListener(t,r);e._events&&e._events[t]?s(e._events[t])?e._events[t].unshift(r):e._events[t]=[r,e._events[t]]:e.on(t,r)}(e,"error",m),e.once("close",y),e.once("finish",b),e.emit("pipe",r),o.flowing||(d("pipe resume"),r.resume()),e},w.prototype.unpipe=function(e){var t=this._readableState,r={hasUnpiped:!1};if(0===t.pipesCount)return this;if(1===t.pipesCount)return e&&e!==t.pipes||(e||(e=t.pipes),t.pipes=null,t.pipesCount=0,t.flowing=!1,e&&e.emit("unpipe",this,r)),this;if(!e){var n=t.pipes,i=t.pipesCount;t.pipes=null,t.pipesCount=0,t.flowing=!1;for(var o=0;o<i;o++)n[o].emit("unpipe",this,r);return this}var s=M(t.pipes,e);return-1===s||(t.pipes.splice(s,1),t.pipesCount-=1,1===t.pipesCount&&(t.pipes=t.pipes[0]),e.emit("unpipe",this,r)),this},w.prototype.on=function(e,t){var r=u.prototype.on.call(this,e,t);if("data"===e)!1!==this._readableState.flowing&&this.resume();else if("readable"===e){var n=this._readableState;n.endEmitted||n.readableListening||(n.readableListening=n.needReadable=!0,n.emittedReadable=!1,n.reading?n.length&&k(this):i.nextTick(x,this))}return r},w.prototype.addListener=w.prototype.on,w.prototype.resume=function(){var e=this._readableState;return e.flowing||(d("resume"),e.flowing=!0,function(e,t){t.resumeScheduled||(t.resumeScheduled=!0,i.nextTick(A,e,t))}(this,e)),this},w.prototype.pause=function(){return d("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(d("pause"),this._readableState.flowing=!1,this.emit("pause")),this},w.prototype.wrap=function(e){var t=this,r=this._readableState,n=!1;for(var i in e.on("end",(function(){if(d("wrapped end"),r.decoder&&!r.ended){var e=r.decoder.end();e&&e.length&&t.push(e)}t.push(null)})),e.on("data",(function(i){(d("wrapped data"),r.decoder&&(i=r.decoder.write(i)),r.objectMode&&null==i)||(r.objectMode||i&&i.length)&&(t.push(i)||(n=!0,e.pause()))})),e)void 0===this[i]&&"function"==typeof e[i]&&(this[i]=function(t){return function(){return e[t].apply(e,arguments)}}(i));for(var o=0;o<y.length;o++)e.on(y[o],this.emit.bind(this,y[o]));return this._read=function(t){d("wrapped _read",t),n&&(n=!1,e.resume())},this},Object.defineProperty(w.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),w._fromList=R}).call(this,r(1),r(2))},function(e,t){var r={}.toString;e.exports=Array.isArray||function(e){return"[object Array]"==r.call(e)}},function(e,t,r){"use strict";var n,i="object"==typeof Reflect?Reflect:null,o=i&&"function"==typeof i.apply?i.apply:function(e,t,r){return Function.prototype.apply.call(e,t,r)};n=i&&"function"==typeof i.ownKeys?i.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var s=Number.isNaN||function(e){return e!=e};function a(){a.init.call(this)}e.exports=a,e.exports.once=function(e,t){return new Promise((function(r,n){function i(r){e.removeListener(t,o),n(r)}function o(){"function"==typeof e.removeListener&&e.removeListener("error",i),r([].slice.call(arguments))}y(e,t,o,{once:!0}),"error"!==t&&function(e,t,r){"function"==typeof e.on&&y(e,"error",t,r)}(e,i,{once:!0})}))},a.EventEmitter=a,a.prototype._events=void 0,a.prototype._eventsCount=0,a.prototype._maxListeners=void 0;var u=10;function c(e){if("function"!=typeof e)throw new TypeError(\'The "listener" argument must be of type Function. Received type \'+typeof e)}function l(e){return void 0===e._maxListeners?a.defaultMaxListeners:e._maxListeners}function f(e,t,r,n){var i,o,s,a;if(c(r),void 0===(o=e._events)?(o=e._events=Object.create(null),e._eventsCount=0):(void 0!==o.newListener&&(e.emit("newListener",t,r.listener?r.listener:r),o=e._events),s=o[t]),void 0===s)s=o[t]=r,++e._eventsCount;else if("function"==typeof s?s=o[t]=n?[r,s]:[s,r]:n?s.unshift(r):s.push(r),(i=l(e))>0&&s.length>i&&!s.warned){s.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+s.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=e,u.type=t,u.count=s.length,a=u,console&&console.warn&&console.warn(a)}return e}function h(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function d(e,t,r){var n={fired:!1,wrapFn:void 0,target:e,type:t,listener:r},i=h.bind(n);return i.listener=r,n.wrapFn=i,i}function p(e,t,r){var n=e._events;if(void 0===n)return[];var i=n[t];return void 0===i?[]:"function"==typeof i?r?[i.listener||i]:[i]:r?function(e){for(var t=new Array(e.length),r=0;r<t.length;++r)t[r]=e[r].listener||e[r];return t}(i):m(i,i.length)}function g(e){var t=this._events;if(void 0!==t){var r=t[e];if("function"==typeof r)return 1;if(void 0!==r)return r.length}return 0}function m(e,t){for(var r=new Array(t),n=0;n<t;++n)r[n]=e[n];return r}function y(e,t,r,n){if("function"==typeof e.on)n.once?e.once(t,r):e.on(t,r);else{if("function"!=typeof e.addEventListener)throw new TypeError(\'The "emitter" argument must be of type EventEmitter. Received type \'+typeof e);e.addEventListener(t,(function i(o){n.once&&e.removeEventListener(t,i),r(o)}))}}Object.defineProperty(a,"defaultMaxListeners",{enumerable:!0,get:function(){return u},set:function(e){if("number"!=typeof e||e<0||s(e))throw new RangeError(\'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received \'+e+".");u=e}}),a.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},a.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||s(e))throw new RangeError(\'The value of "n" is out of range. It must be a non-negative number. Received \'+e+".");return this._maxListeners=e,this},a.prototype.getMaxListeners=function(){return l(this)},a.prototype.emit=function(e){for(var t=[],r=1;r<arguments.length;r++)t.push(arguments[r]);var n="error"===e,i=this._events;if(void 0!==i)n=n&&void 0===i.error;else if(!n)return!1;if(n){var s;if(t.length>0&&(s=t[0]),s instanceof Error)throw s;var a=new Error("Unhandled error."+(s?" ("+s.message+")":""));throw a.context=s,a}var u=i[e];if(void 0===u)return!1;if("function"==typeof u)o(u,this,t);else{var c=u.length,l=m(u,c);for(r=0;r<c;++r)o(l[r],this,t)}return!0},a.prototype.addListener=function(e,t){return f(this,e,t,!1)},a.prototype.on=a.prototype.addListener,a.prototype.prependListener=function(e,t){return f(this,e,t,!0)},a.prototype.once=function(e,t){return c(t),this.on(e,d(this,e,t)),this},a.prototype.prependOnceListener=function(e,t){return c(t),this.prependListener(e,d(this,e,t)),this},a.prototype.removeListener=function(e,t){var r,n,i,o,s;if(c(t),void 0===(n=this._events))return this;if(void 0===(r=n[e]))return this;if(r===t||r.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete n[e],n.removeListener&&this.emit("removeListener",e,r.listener||t));else if("function"!=typeof r){for(i=-1,o=r.length-1;o>=0;o--)if(r[o]===t||r[o].listener===t){s=r[o].listener,i=o;break}if(i<0)return this;0===i?r.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}(r,i),1===r.length&&(n[e]=r[0]),void 0!==n.removeListener&&this.emit("removeListener",e,s||t)}return this},a.prototype.off=a.prototype.removeListener,a.prototype.removeAllListeners=function(e){var t,r,n;if(void 0===(r=this._events))return this;if(void 0===r.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==r[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete r[e]),this;if(0===arguments.length){var i,o=Object.keys(r);for(n=0;n<o.length;++n)"removeListener"!==(i=o[n])&&this.removeAllListeners(i);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=r[e]))this.removeListener(e,t);else if(void 0!==t)for(n=t.length-1;n>=0;n--)this.removeListener(e,t[n]);return this},a.prototype.listeners=function(e){return p(this,e,!0)},a.prototype.rawListeners=function(e){return p(this,e,!1)},a.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):g.call(e,t)},a.prototype.listenerCount=g,a.prototype.eventNames=function(){return this._eventsCount>0?n(this._events):[]}},function(e,t,r){e.exports=r(27).EventEmitter},function(e,t,r){"use strict";var n=r(15);function i(e,t){e.emit("error",t)}e.exports={destroy:function(e,t){var r=this,o=this._readableState&&this._readableState.destroyed,s=this._writableState&&this._writableState.destroyed;return o||s?(t?t(e):!e||this._writableState&&this._writableState.errorEmitted||n.nextTick(i,this,e),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(e||null,(function(e){!t&&e?(n.nextTick(i,r,e),r._writableState&&(r._writableState.errorEmitted=!0)):t&&t(e)})),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1)}}},function(e,t,r){"use strict";(function(t,n,i){var o=r(15);function s(e){var t=this;this.next=null,this.entry=null,this.finish=function(){!function(e,t,r){var n=e.entry;e.entry=null;for(;n;){var i=n.callback;t.pendingcb--,i(r),n=n.next}t.corkedRequestsFree?t.corkedRequestsFree.next=e:t.corkedRequestsFree=e}(t,e)}}e.exports=b;var a,u=!t.browser&&["v0.10","v0.9."].indexOf(t.version.slice(0,5))>-1?n:o.nextTick;b.WritableState=y;var c=Object.create(r(10));c.inherits=r(4);var l={deprecate:r(52)},f=r(28),h=r(21).Buffer,d=i.Uint8Array||function(){};var p,g=r(29);function m(){}function y(e,t){a=a||r(7),e=e||{};var n=t instanceof a;this.objectMode=!!e.objectMode,n&&(this.objectMode=this.objectMode||!!e.writableObjectMode);var i=e.highWaterMark,c=e.writableHighWaterMark,l=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(c||0===c)?c:l,this.highWaterMark=Math.floor(this.highWaterMark),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var f=!1===e.decodeStrings;this.decodeStrings=!f,this.defaultEncoding=e.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(e){!function(e,t){var r=e._writableState,n=r.sync,i=r.writecb;if(function(e){e.writing=!1,e.writecb=null,e.length-=e.writelen,e.writelen=0}(r),t)!function(e,t,r,n,i){--t.pendingcb,r?(o.nextTick(i,n),o.nextTick(C,e,t),e._writableState.errorEmitted=!0,e.emit("error",n)):(i(n),e._writableState.errorEmitted=!0,e.emit("error",n),C(e,t))}(e,r,n,t,i);else{var s=S(r);s||r.corked||r.bufferProcessing||!r.bufferedRequest||_(e,r),n?u(v,e,r,s,i):v(e,r,s,i)}}(t,e)},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.bufferedRequestCount=0,this.corkedRequestsFree=new s(this)}function b(e){if(a=a||r(7),!(p.call(b,this)||this instanceof a))return new b(e);this._writableState=new y(e,this),this.writable=!0,e&&("function"==typeof e.write&&(this._write=e.write),"function"==typeof e.writev&&(this._writev=e.writev),"function"==typeof e.destroy&&(this._destroy=e.destroy),"function"==typeof e.final&&(this._final=e.final)),f.call(this)}function w(e,t,r,n,i,o,s){t.writelen=n,t.writecb=s,t.writing=!0,t.sync=!0,r?e._writev(i,t.onwrite):e._write(i,o,t.onwrite),t.sync=!1}function v(e,t,r,n){r||function(e,t){0===t.length&&t.needDrain&&(t.needDrain=!1,e.emit("drain"))}(e,t),t.pendingcb--,n(),C(e,t)}function _(e,t){t.bufferProcessing=!0;var r=t.bufferedRequest;if(e._writev&&r&&r.next){var n=t.bufferedRequestCount,i=new Array(n),o=t.corkedRequestsFree;o.entry=r;for(var a=0,u=!0;r;)i[a]=r,r.isBuf||(u=!1),r=r.next,a+=1;i.allBuffers=u,w(e,t,!0,t.length,i,"",o.finish),t.pendingcb++,t.lastBufferedRequest=null,o.next?(t.corkedRequestsFree=o.next,o.next=null):t.corkedRequestsFree=new s(t),t.bufferedRequestCount=0}else{for(;r;){var c=r.chunk,l=r.encoding,f=r.callback;if(w(e,t,!1,t.objectMode?1:c.length,c,l,f),r=r.next,t.bufferedRequestCount--,t.writing)break}null===r&&(t.lastBufferedRequest=null)}t.bufferedRequest=r,t.bufferProcessing=!1}function S(e){return e.ending&&0===e.length&&null===e.bufferedRequest&&!e.finished&&!e.writing}function k(e,t){e._final((function(r){t.pendingcb--,r&&e.emit("error",r),t.prefinished=!0,e.emit("prefinish"),C(e,t)}))}function C(e,t){var r=S(t);return r&&(!function(e,t){t.prefinished||t.finalCalled||("function"==typeof e._final?(t.pendingcb++,t.finalCalled=!0,o.nextTick(k,e,t)):(t.prefinished=!0,e.emit("prefinish")))}(e,t),0===t.pendingcb&&(t.finished=!0,e.emit("finish"))),r}c.inherits(b,f),y.prototype.getBuffer=function(){for(var e=this.bufferedRequest,t=[];e;)t.push(e),e=e.next;return t},function(){try{Object.defineProperty(y.prototype,"buffer",{get:l.deprecate((function(){return this.getBuffer()}),"_writableState.buffer is deprecated. Use _writableState.getBuffer instead.","DEP0003")})}catch(e){}}(),"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(p=Function.prototype[Symbol.hasInstance],Object.defineProperty(b,Symbol.hasInstance,{value:function(e){return!!p.call(this,e)||this===b&&(e&&e._writableState instanceof y)}})):p=function(e){return e instanceof this},b.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"))},b.prototype.write=function(e,t,r){var n,i=this._writableState,s=!1,a=!i.objectMode&&(n=e,h.isBuffer(n)||n instanceof d);return a&&!h.isBuffer(e)&&(e=function(e){return h.from(e)}(e)),"function"==typeof t&&(r=t,t=null),a?t="buffer":t||(t=i.defaultEncoding),"function"!=typeof r&&(r=m),i.ended?function(e,t){var r=new Error("write after end");e.emit("error",r),o.nextTick(t,r)}(this,r):(a||function(e,t,r,n){var i=!0,s=!1;return null===r?s=new TypeError("May not write null values to stream"):"string"==typeof r||void 0===r||t.objectMode||(s=new TypeError("Invalid non-string/buffer chunk")),s&&(e.emit("error",s),o.nextTick(n,s),i=!1),i}(this,i,e,r))&&(i.pendingcb++,s=function(e,t,r,n,i,o){if(!r){var s=function(e,t,r){e.objectMode||!1===e.decodeStrings||"string"!=typeof t||(t=h.from(t,r));return t}(t,n,i);n!==s&&(r=!0,i="buffer",n=s)}var a=t.objectMode?1:n.length;t.length+=a;var u=t.length<t.highWaterMark;u||(t.needDrain=!0);if(t.writing||t.corked){var c=t.lastBufferedRequest;t.lastBufferedRequest={chunk:n,encoding:i,isBuf:r,callback:o,next:null},c?c.next=t.lastBufferedRequest:t.bufferedRequest=t.lastBufferedRequest,t.bufferedRequestCount+=1}else w(e,t,!1,a,n,i,o);return u}(this,i,a,e,t,r)),s},b.prototype.cork=function(){this._writableState.corked++},b.prototype.uncork=function(){var e=this._writableState;e.corked&&(e.corked--,e.writing||e.corked||e.finished||e.bufferProcessing||!e.bufferedRequest||_(this,e))},b.prototype.setDefaultEncoding=function(e){if("string"==typeof e&&(e=e.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((e+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+e);return this._writableState.defaultEncoding=e,this},Object.defineProperty(b.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),b.prototype._write=function(e,t,r){r(new Error("_write() is not implemented"))},b.prototype._writev=null,b.prototype.end=function(e,t,r){var n=this._writableState;"function"==typeof e?(r=e,e=null,t=null):"function"==typeof t&&(r=t,t=null),null!=e&&this.write(e,t),n.corked&&(n.corked=1,this.uncork()),n.ending||n.finished||function(e,t,r){t.ending=!0,C(e,t),r&&(t.finished?o.nextTick(r):e.once("finish",r));t.ended=!0,e.writable=!1}(this,n,r)},Object.defineProperty(b.prototype,"destroyed",{get:function(){return void 0!==this._writableState&&this._writableState.destroyed},set:function(e){this._writableState&&(this._writableState.destroyed=e)}}),b.prototype.destroy=g.destroy,b.prototype._undestroy=g.undestroy,b.prototype._destroy=function(e,t){this.end(),t(e)}}).call(this,r(2),r(50).setImmediate,r(1))},function(e,t,r){"use strict";var n=r(53).Buffer,i=n.isEncoding||function(e){switch((e=""+e)&&e.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}};function o(e){var t;switch(this.encoding=function(e){var t=function(e){if(!e)return"utf8";for(var t;;)switch(e){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return e;default:if(t)return;e=(""+e).toLowerCase(),t=!0}}(e);if("string"!=typeof t&&(n.isEncoding===i||!i(e)))throw new Error("Unknown encoding: "+e);return t||e}(e),this.encoding){case"utf16le":this.text=u,this.end=c,t=4;break;case"utf8":this.fillLast=a,t=4;break;case"base64":this.text=l,this.end=f,t=3;break;default:return this.write=h,void(this.end=d)}this.lastNeed=0,this.lastTotal=0,this.lastChar=n.allocUnsafe(t)}function s(e){return e<=127?0:e>>5==6?2:e>>4==14?3:e>>3==30?4:-1}function a(e){var t=this.lastTotal-this.lastNeed,r=function(e,t,r){if(128!=(192&t[0]))return e.lastNeed=0,"�".repeat(r);if(e.lastNeed>1&&t.length>1){if(128!=(192&t[1]))return e.lastNeed=1,"�".repeat(r+1);if(e.lastNeed>2&&t.length>2&&128!=(192&t[2]))return e.lastNeed=2,"�".repeat(r+2)}}(this,e,t);return void 0!==r?r:this.lastNeed<=e.length?(e.copy(this.lastChar,t,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(e.copy(this.lastChar,t,0,e.length),void(this.lastNeed-=e.length))}function u(e,t){if((e.length-t)%2==0){var r=e.toString("utf16le",t);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=e[e.length-1],e.toString("utf16le",t,e.length-1)}function c(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return t+this.lastChar.toString("utf16le",0,r)}return t}function l(e,t){var r=(e.length-t)%3;return 0===r?e.toString("base64",t):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=e[e.length-1]:(this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1]),e.toString("base64",t,e.length-r))}function f(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+this.lastChar.toString("base64",0,3-this.lastNeed):t}function h(e){return e.toString(this.encoding)}function d(e){return e&&e.length?this.write(e):""}t.StringDecoder=o,o.prototype.write=function(e){if(0===e.length)return"";var t,r;if(this.lastNeed){if(void 0===(t=this.fillLast(e)))return"";r=this.lastNeed,this.lastNeed=0}else r=0;return r<e.length?t?t+this.text(e,r):this.text(e,r):t||""},o.prototype.end=function(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+"�".repeat(this.lastTotal-this.lastNeed):t},o.prototype.text=function(e,t){var r=function(e,t,r){var n=t.length-1;if(n<r)return 0;var i=s(t[n]);if(i>=0)return i>0&&(e.lastNeed=i-1),i;if(--n<r)return 0;if((i=s(t[n]))>=0)return i>0&&(e.lastNeed=i-2),i;if(--n<r)return 0;if((i=s(t[n]))>=0)return i>0&&(2===i?i=0:e.lastNeed=i-3),i;return 0}(this,e,t);if(!this.lastNeed)return e.toString("utf8",t);this.lastTotal=r;var n=e.length-(r-this.lastNeed);return e.copy(this.lastChar,0,n),e.toString("utf8",t,n)},o.prototype.fillLast=function(e){if(this.lastNeed<=e.length)return e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,e.length),this.lastNeed-=e.length}},function(e,t,r){"use strict";e.exports=s;var n=r(7),i=Object.create(r(10));function o(e,t){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(!n)return this.emit("error",new Error("write callback called multiple times"));r.writechunk=null,r.writecb=null,null!=t&&this.push(t),n(e);var i=this._readableState;i.reading=!1,(i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}function s(e){if(!(this instanceof s))return new s(e);n.call(this,e),this._transformState={afterTransform:o.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,e&&("function"==typeof e.transform&&(this._transform=e.transform),"function"==typeof e.flush&&(this._flush=e.flush)),this.on("prefinish",a)}function a(){var e=this;"function"==typeof this._flush?this._flush((function(t,r){u(e,t,r)})):u(this,null,null)}function u(e,t,r){if(t)return e.emit("error",t);if(null!=r&&e.push(r),e._writableState.length)throw new Error("Calling transform done when ws.length != 0");if(e._transformState.transforming)throw new Error("Calling transform done when still transforming");return e.push(null)}i.inherits=r(4),i.inherits(s,n),s.prototype.push=function(e,t){return this._transformState.needTransform=!1,n.prototype.push.call(this,e,t)},s.prototype._transform=function(e,t,r){throw new Error("_transform() is not implemented")},s.prototype._write=function(e,t,r){var n=this._transformState;if(n.writecb=r,n.writechunk=e,n.writeencoding=t,!n.transforming){var i=this._readableState;(n.needTransform||i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}},s.prototype._read=function(e){var t=this._transformState;null!==t.writechunk&&t.writecb&&!t.transforming?(t.transforming=!0,this._transform(t.writechunk,t.writeencoding,t.afterTransform)):t.needTransform=!0},s.prototype._destroy=function(e,t){var r=this;n.prototype._destroy.call(this,e,(function(e){t(e),r.emit("close")}))}},function(e,t,r){"use strict";(function(e){var n=r(81),i=r(23),o=r(22);const s="undefined"!=typeof navigator?navigator.hardwareConcurrency:null;t.a=class{constructor(t=s){const r=new n.a(e);this.pool=Object(i.a)(()=>Object(o.a)(r),t)}async decode(e,t){return new Promise((r,n)=>{this.pool.queue(async i=>{try{const n=await i(e,t);r(n)}catch(e){n(e)}})})}destroy(){this.pool.terminate(!0)}}}).call(this,r(65))},function(e,t,r){(function(e){t.fetch=a(e.fetch)&&a(e.ReadableStream),t.writableStream=a(e.WritableStream),t.abortController=a(e.AbortController),t.blobConstructor=!1;try{new Blob([new ArrayBuffer(1)]),t.blobConstructor=!0}catch(e){}var r;function n(){if(void 0!==r)return r;if(e.XMLHttpRequest){r=new e.XMLHttpRequest;try{r.open("GET",e.XDomainRequest?"/":"https://example.com")}catch(e){r=null}}else r=null;return r}function i(e){var t=n();if(!t)return!1;try{return t.responseType=e,t.responseType===e}catch(e){}return!1}var o=void 0!==e.ArrayBuffer,s=o&&a(e.ArrayBuffer.prototype.slice);function a(e){return"function"==typeof e}t.arraybuffer=t.fetch||o&&i("arraybuffer"),t.msstream=!t.fetch&&s&&i("ms-stream"),t.mozchunkedarraybuffer=!t.fetch&&o&&i("moz-chunked-arraybuffer"),t.overrideMimeType=t.fetch||!!n()&&a(n().overrideMimeType),t.vbArray=a(e.VBArray),r=null}).call(this,r(1))},function(e,t,r){(function(e,n,i){var o=r(34),s=r(4),a=r(20),u=t.readyStates={UNSENT:0,OPENED:1,HEADERS_RECEIVED:2,LOADING:3,DONE:4},c=t.IncomingMessage=function(t,r,s,u){var c=this;if(a.Readable.call(c),c._mode=s,c.headers={},c.rawHeaders=[],c.trailers={},c.rawTrailers=[],c.on("end",(function(){e.nextTick((function(){c.emit("close")}))})),"fetch"===s){if(c._fetchResponse=r,c.url=r.url,c.statusCode=r.status,c.statusMessage=r.statusText,r.headers.forEach((function(e,t){c.headers[t.toLowerCase()]=e,c.rawHeaders.push(t,e)})),o.writableStream){var l=new WritableStream({write:function(e){return new Promise((function(t,r){c._destroyed?r():c.push(new n(e))?t():c._resumeFetch=t}))},close:function(){i.clearTimeout(u),c._destroyed||c.push(null)},abort:function(e){c._destroyed||c.emit("error",e)}});try{return void r.body.pipeTo(l).catch((function(e){i.clearTimeout(u),c._destroyed||c.emit("error",e)}))}catch(e){}}var f=r.body.getReader();!function e(){f.read().then((function(t){if(!c._destroyed){if(t.done)return i.clearTimeout(u),void c.push(null);c.push(new n(t.value)),e()}})).catch((function(e){i.clearTimeout(u),c._destroyed||c.emit("error",e)}))}()}else{if(c._xhr=t,c._pos=0,c.url=t.responseURL,c.statusCode=t.status,c.statusMessage=t.statusText,t.getAllResponseHeaders().split(/\\r?\\n/).forEach((function(e){var t=e.match(/^([^:]+):\\s*(.*)/);if(t){var r=t[1].toLowerCase();"set-cookie"===r?(void 0===c.headers[r]&&(c.headers[r]=[]),c.headers[r].push(t[2])):void 0!==c.headers[r]?c.headers[r]+=", "+t[2]:c.headers[r]=t[2],c.rawHeaders.push(t[1],t[2])}})),c._charset="x-user-defined",!o.overrideMimeType){var h=c.rawHeaders["mime-type"];if(h){var d=h.match(/;\\s*charset=([^;])(;|$)/);d&&(c._charset=d[1].toLowerCase())}c._charset||(c._charset="utf-8")}}};s(c,a.Readable),c.prototype._read=function(){var e=this._resumeFetch;e&&(this._resumeFetch=null,e())},c.prototype._onXHRProgress=function(){var e=this,t=e._xhr,r=null;switch(e._mode){case"text:vbarray":if(t.readyState!==u.DONE)break;try{r=new i.VBArray(t.responseBody).toArray()}catch(e){}if(null!==r){e.push(new n(r));break}case"text":try{r=t.responseText}catch(t){e._mode="text:vbarray";break}if(r.length>e._pos){var o=r.substr(e._pos);if("x-user-defined"===e._charset){for(var s=new n(o.length),a=0;a<o.length;a++)s[a]=255&o.charCodeAt(a);e.push(s)}else e.push(o,e._charset);e._pos=r.length}break;case"arraybuffer":if(t.readyState!==u.DONE||!t.response)break;r=t.response,e.push(new n(new Uint8Array(r)));break;case"moz-chunked-arraybuffer":if(r=t.response,t.readyState!==u.LOADING||!r)break;e.push(new n(new Uint8Array(r)));break;case"ms-stream":if(r=t.response,t.readyState!==u.LOADING)break;var c=new i.MSStreamReader;c.onprogress=function(){c.result.byteLength>e._pos&&(e.push(new n(new Uint8Array(c.result.slice(e._pos)))),e._pos=c.result.byteLength)},c.onload=function(){e.push(null)},c.readAsArrayBuffer(r)}e._xhr.readyState===u.DONE&&"ms-stream"!==e._mode&&e.push(null)}}).call(this,r(2),r(3).Buffer,r(1))},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,t){var r=[],n=!0,i=!1,o=void 0;try{for(var s,a=e[Symbol.iterator]();!(n=(s=a.next()).done)&&(r.push(s.value),!t||r.length!==t);n=!0);}catch(e){i=!0,o=e}finally{try{!n&&a.return&&a.return()}finally{if(i)throw o}}return r}(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")},i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};t.default=function(e,t){return new Promise((function(r,c){try{t&&console.log("starting parseData with",e),t&&console.log("\\tGeoTIFF:","undefined"==typeof GeoTIFF?"undefined":i(GeoTIFF));var l={},f=void 0,h=void 0;if("object"===e.rasterType)l.values=e.data,l.height=f=e.metadata.height||l.values[0].length,l.width=h=e.metadata.width||l.values[0][0].length,l.pixelHeight=e.metadata.pixelHeight,l.pixelWidth=e.metadata.pixelWidth,l.projection=e.metadata.projection,l.xmin=e.metadata.xmin,l.ymax=e.metadata.ymax,l.noDataValue=e.metadata.noDataValue,l.numberOfRasters=l.values.length,l.xmax=l.xmin+l.width*l.pixelWidth,l.ymin=l.ymax-l.height*l.pixelHeight,l._data=null,r(u(l));else if("geotiff"===e.rasterType){l._data=e.data;var d=o.fromArrayBuffer;"url"===e.sourceType&&(d=o.fromUrl),t&&console.log("data.rasterType is geotiff"),r(d(e.data).then((function(r){return t&&console.log("geotiff:",r),r.getImage().then((function(r){t&&console.log("image:",r);var i=r.fileDirectory,o=r.getGeoKeys(),c=o.GeographicTypeGeoKey,d=o.ProjectedCSTypeGeoKey;l.projection=c||d,t&&console.log("projection:",l.projection),l.height=f=r.getHeight(),t&&console.log("result.height:",l.height),l.width=h=r.getWidth(),t&&console.log("result.width:",l.width);var p=r.getResolution(),g=n(p,2),m=g[0],y=g[1];l.pixelHeight=Math.abs(y),l.pixelWidth=Math.abs(m);var b=r.getOrigin(),w=n(b,2),v=w[0],_=w[1];return l.xmin=v,l.xmax=l.xmin+h*l.pixelWidth,l.ymax=_,l.ymin=l.ymax-f*l.pixelHeight,l.noDataValue=i.GDAL_NODATA?parseFloat(i.GDAL_NODATA):null,l.numberOfRasters=i.SamplesPerPixel,i.ColorMap&&(l.palette=(0,s.getPalette)(r)),"url"!==e.sourceType?r.readRasters().then((function(e){return l.values=e.map((function(e){return(0,a.unflatten)(e,{height:f,width:h})})),u(l)})):l}))})))}}catch(e){c(e),console.error("[georaster] error parsing georaster:",e)}}))};var o=r(80),s=r(78),a=r(79);function u(e,t){var r=e.noDataValue,n=e.height,i=e.width;return new Promise((function(o,s){e.maxs=[],e.mins=[],e.ranges=[];for(var a=void 0,u=void 0,c=0;c<e.numberOfRasters;c++){var l=e.values[c];t&&console.log("[georaster] rows:",l);for(var f=0;f<n;f++)for(var h=l[f],d=0;d<i;d++){var p=h[d];p==r||isNaN(p)||(void 0===u||p<u?u=p:(void 0===a||p>a)&&(a=p))}e.maxs.push(a),e.mins.push(u),e.ranges.push(a-u)}o(e)}))}},function(e,t,r){function n(e,t){"use strict";var r=(t=t||{}).pos||0,i="<".charCodeAt(0),o=">".charCodeAt(0),s="-".charCodeAt(0),a="/".charCodeAt(0),u="!".charCodeAt(0),c="\'".charCodeAt(0),l=\'"\'.charCodeAt(0);function f(){for(var t=[];e[r];)if(e.charCodeAt(r)==i){if(e.charCodeAt(r+1)===a)return(r=e.indexOf(">",r))+1&&(r+=1),t;if(e.charCodeAt(r+1)===u){if(e.charCodeAt(r+2)==s){for(;-1!==r&&(e.charCodeAt(r)!==o||e.charCodeAt(r-1)!=s||e.charCodeAt(r-2)!=s||-1==r);)r=e.indexOf(">",r+1);-1===r&&(r=e.length)}else for(r+=2;e.charCodeAt(r)!==o&&e[r];)r++;r++;continue}var n=g();t.push(n)}else{var c=h();c.trim().length>0&&t.push(c),r++}return t}function h(){var t=r;return-2===(r=e.indexOf("<",r)-1)&&(r=e.length),e.slice(t,r+1)}function d(){for(var t=r;-1==="\\n\\t>/= ".indexOf(e[r])&&e[r];)r++;return e.slice(t,r)}var p=t.noChildNodes||["img","br","input","meta","link"];function g(){r++;const t=d(),n={};let i=[];for(;e.charCodeAt(r)!==o&&e[r];){var s=e.charCodeAt(r);if(s>64&&s<91||s>96&&s<123){for(var u=d(),h=e.charCodeAt(r);h&&h!==c&&h!==l&&!(h>64&&h<91||h>96&&h<123)&&h!==o;)r++,h=e.charCodeAt(r);if(h===c||h===l){var g=m();if(-1===r)return{tagName:t,attributes:n,children:i}}else g=null,r--;n[u]=g}r++}if(e.charCodeAt(r-1)!==a)if("script"==t){var y=r+1;r=e.indexOf("<\\/script>",r),i=[e.slice(y,r-1)],r+=9}else if("style"==t){y=r+1;r=e.indexOf("</style>",r),i=[e.slice(y,r-1)],r+=8}else-1==p.indexOf(t)&&(r++,i=f());else r++;return{tagName:t,attributes:n,children:i}}function m(){var t=e[r],n=++r;return r=e.indexOf(t,n),e.slice(n,r)}var y,b=null;if(void 0!==t.attrValue){t.attrName=t.attrName||"id";for(b=[];-1!==(y=void 0,y=new RegExp("\\\\s"+t.attrName+"\\\\s*=[\'\\"]"+t.attrValue+"[\'\\"]").exec(e),r=y?y.index:-1);)-1!==(r=e.lastIndexOf("<",r))&&b.push(g()),e=e.substr(r),r=0}else b=t.parseNode?g():f();return t.filter&&(b=n.filter(b,t.filter)),t.setPos&&(b.pos=r),b}n.simplify=function(e){var t={};if(!e.length)return"";if(1===e.length&&"string"==typeof e[0])return e[0];for(var r in e.forEach((function(e){if("object"==typeof e){t[e.tagName]||(t[e.tagName]=[]);var r=n.simplify(e.children||[]);t[e.tagName].push(r),e.attributes&&(r._attributes=e.attributes)}})),t)1==t[r].length&&(t[r]=t[r][0]);return t},n.filter=function(e,t){var r=[];return e.forEach((function(e){if("object"==typeof e&&t(e)&&r.push(e),e.children){var i=n.filter(e.children,t);r=r.concat(i)}})),r},n.stringify=function(e){var t="";function r(e){if(e)for(var r=0;r<e.length;r++)"string"==typeof e[r]?t+=e[r].trim():n(e[r])}function n(e){for(var n in t+="<"+e.tagName,e.attributes)null===e.attributes[n]?t+=" "+n:-1===e.attributes[n].indexOf(\'"\')?t+=" "+n+\'="\'+e.attributes[n].trim()+\'"\':t+=" "+n+"=\'"+e.attributes[n].trim()+"\'";t+=">",r(e.children),t+="</"+e.tagName+">"}return r(e),t},n.toContentString=function(e){if(Array.isArray(e)){var t="";return e.forEach((function(e){t=(t+=" "+n.toContentString(e)).trim()})),t}return"object"==typeof e?n.toContentString(e.children):" "+e},n.getElementById=function(e,t,r){var i=n(e,{attrValue:t});return r?n.simplify(i):i[0]},n.getElementsByClassName=function(e,t,r){const i=n(e,{attrName:"class",attrValue:"[a-zA-Z0-9-s ]*"+t+"[a-zA-Z0-9-s ]*"});return r?n.simplify(i):i},n.parseStream=function(e,t){if("string"==typeof t&&(t=t.length+2),"string"==typeof e){var i=r(12);e=i.createReadStream(e,{start:t}),t=0}var o=t,s="";return e.on("data",(function(t){s+=t;for(var r=0;;){if(!(o=s.indexOf("<",o)+1))return void(o=r);if("/"!==s[o+1]){var i=n(s,{pos:o-1,parseNode:!0,setPos:!0});if((o=i.pos)>s.length-1||o<r)return s=s.slice(r),o=0,void(r=0);e.emit("xml",i),r=o}else o+=1,r=pos}})),e.on("end",(function(){console.log("end")})),e},n.transformStream=function(e){const t=r(44);"string"==typeof e&&(e=e.length+2);var i=e||0,o="";return t({readableObjectMode:!0},(function(e,t,r){o+=e;for(var s=0;;){if(!(i=o.indexOf("<",i)+1))return i=s,r();if("/"!==o[i+1]){var a=n(o,{pos:i-1,parseNode:!0,setPos:!0});if((i=a.pos)>o.length-1||i<s)return o=o.slice(s),i=0,s=0,r();this.push(a),s=i}else i+=1,s=pos}r()}))},e.exports=n,n.xml=n},function(e,t,r){"use strict";var n=r(55),i=r(16),o=r(60),s=r(61),a=r(62),u=r(63),c=r(64),l=Object.prototype.toString;function f(e){if(!(this instanceof f))return new f(e);this.options=i.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&t.windowBits>=0&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(t.windowBits>=0&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),t.windowBits>15&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new u,this.strm.avail_out=0;var r=n.inflateInit2(this.strm,t.windowBits);if(r!==s.Z_OK)throw new Error(a[r]);if(this.header=new c,n.inflateGetHeader(this.strm,this.header),t.dictionary&&("string"==typeof t.dictionary?t.dictionary=o.string2buf(t.dictionary):"[object ArrayBuffer]"===l.call(t.dictionary)&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(r=n.inflateSetDictionary(this.strm,t.dictionary))!==s.Z_OK))throw new Error(a[r])}function h(e,t){var r=new f(t);if(r.push(e,!0),r.err)throw r.msg||a[r.err];return r.result}f.prototype.push=function(e,t){var r,a,u,c,f,h=this.strm,d=this.options.chunkSize,p=this.options.dictionary,g=!1;if(this.ended)return!1;a=t===~~t?t:!0===t?s.Z_FINISH:s.Z_NO_FLUSH,"string"==typeof e?h.input=o.binstring2buf(e):"[object ArrayBuffer]"===l.call(e)?h.input=new Uint8Array(e):h.input=e,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new i.Buf8(d),h.next_out=0,h.avail_out=d),(r=n.inflate(h,s.Z_NO_FLUSH))===s.Z_NEED_DICT&&p&&(r=n.inflateSetDictionary(this.strm,p)),r===s.Z_BUF_ERROR&&!0===g&&(r=s.Z_OK,g=!1),r!==s.Z_STREAM_END&&r!==s.Z_OK)return this.onEnd(r),this.ended=!0,!1;h.next_out&&(0!==h.avail_out&&r!==s.Z_STREAM_END&&(0!==h.avail_in||a!==s.Z_FINISH&&a!==s.Z_SYNC_FLUSH)||("string"===this.options.to?(u=o.utf8border(h.output,h.next_out),c=h.next_out-u,f=o.buf2string(h.output,u),h.next_out=c,h.avail_out=d-c,c&&i.arraySet(h.output,h.output,u,c,0),this.onData(f)):this.onData(i.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(g=!0)}while((h.avail_in>0||0===h.avail_out)&&r!==s.Z_STREAM_END);return r===s.Z_STREAM_END&&(a=s.Z_FINISH),a===s.Z_FINISH?(r=n.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===s.Z_OK):a!==s.Z_SYNC_FLUSH||(this.onEnd(s.Z_OK),h.avail_out=0,!0)},f.prototype.onData=function(e){this.chunks.push(e)},f.prototype.onEnd=function(e){e===s.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=i.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},t.Inflate=f,t.inflate=h,t.inflateRaw=function(e,t){return(t=t||{}).raw=!0,h(e,t)},t.ungzip=h},function(e,t,r){"use strict";var n=r(13);class i extends n.a{constructor(){super(e=>(this._observers.add(e),()=>this._observers.delete(e))),this._observers=new Set}next(e){for(const t of this._observers)t.next(e)}error(e){for(const t of this._observers)t.error(e)}complete(){for(const e of this._observers)e.complete()}}t.a=i},function(e,t,r){"use strict";r.d(t,"a",(function(){return i}));const n=()=>{};function i(){let e,t=!1,r=n;return[new Promise(n=>{t?n(e):r=n}),n=>{t=!0,e=n,r()}]}},function(e,t,r){"use strict";r.d(t,"a",(function(){return i}));var n=r(0);function i(e){return e&&"object"==typeof e&&e[n.d]}},function(e,t,r){var n=r(18),i=r(17),o=e.exports;for(var s in n)n.hasOwnProperty(s)&&(o[s]=n[s]);function a(e){if("string"==typeof e&&(e=i.parse(e)),e.protocol||(e.protocol="https:"),"https:"!==e.protocol)throw new Error(\'Protocol "\'+e.protocol+\'" not supported. Expected "https:"\');return e}o.request=function(e,t){return e=a(e),n.request.call(this,e,t)},o.get=function(e,t){return e=a(e),n.get.call(this,e,t)}},function(e,t,r){"use strict";r.r(t);var n=r(36),i=r.n(n);self;onmessage=e=>{const t=e.data;i()(t).then(e=>{e._data instanceof ArrayBuffer?postMessage(e,[e._data]):postMessage(e),close()})}},function(e,t,r){(function(t){var n=r(20).Transform,i=r(4);function o(e){n.call(this,e),this._destroyed=!1}function s(e,t,r){r(null,e)}function a(e){return function(t,r,n){return"function"==typeof t&&(n=r,r=t,t={}),"function"!=typeof r&&(r=s),"function"!=typeof n&&(n=null),e(t,r,n)}}i(o,n),o.prototype.destroy=function(e){if(!this._destroyed){this._destroyed=!0;var r=this;t.nextTick((function(){e&&r.emit("error",e),r.emit("close")}))}},e.exports=a((function(e,t,r){var n=new o(e);return n._transform=t,r&&(n._flush=r),n})),e.exports.ctor=a((function(e,t,r){function n(t){if(!(this instanceof n))return new n(t);this.options=Object.assign({},e,t),o.call(this,this.options)}return i(n,o),n.prototype._transform=t,r&&(n.prototype._flush=r),n})),e.exports.obj=a((function(e,t,r){var n=new o(Object.assign({objectMode:!0,highWaterMark:16},e));return n._transform=t,r&&(n._flush=r),n}))}).call(this,r(2))},function(e,t,r){"use strict";t.byteLength=function(e){var t=c(e),r=t[0],n=t[1];return 3*(r+n)/4-n},t.toByteArray=function(e){var t,r,n=c(e),s=n[0],a=n[1],u=new o(function(e,t,r){return 3*(t+r)/4-r}(0,s,a)),l=0,f=a>0?s-4:s;for(r=0;r<f;r+=4)t=i[e.charCodeAt(r)]<<18|i[e.charCodeAt(r+1)]<<12|i[e.charCodeAt(r+2)]<<6|i[e.charCodeAt(r+3)],u[l++]=t>>16&255,u[l++]=t>>8&255,u[l++]=255&t;2===a&&(t=i[e.charCodeAt(r)]<<2|i[e.charCodeAt(r+1)]>>4,u[l++]=255&t);1===a&&(t=i[e.charCodeAt(r)]<<10|i[e.charCodeAt(r+1)]<<4|i[e.charCodeAt(r+2)]>>2,u[l++]=t>>8&255,u[l++]=255&t);return u},t.fromByteArray=function(e){for(var t,r=e.length,i=r%3,o=[],s=0,a=r-i;s<a;s+=16383)o.push(l(e,s,s+16383>a?a:s+16383));1===i?(t=e[r-1],o.push(n[t>>2]+n[t<<4&63]+"==")):2===i&&(t=(e[r-2]<<8)+e[r-1],o.push(n[t>>10]+n[t>>4&63]+n[t<<2&63]+"="));return o.join("")};for(var n=[],i=[],o="undefined"!=typeof Uint8Array?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",a=0,u=s.length;a<u;++a)n[a]=s[a],i[s.charCodeAt(a)]=a;function c(e){var t=e.length;if(t%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=e.indexOf("=");return-1===r&&(r=t),[r,r===t?0:4-r%4]}function l(e,t,r){for(var i,o,s=[],a=t;a<r;a+=3)i=(e[a]<<16&16711680)+(e[a+1]<<8&65280)+(255&e[a+2]),s.push(n[(o=i)>>18&63]+n[o>>12&63]+n[o>>6&63]+n[63&o]);return s.join("")}i["-".charCodeAt(0)]=62,i["_".charCodeAt(0)]=63},function(e,t){\n/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */\nt.read=function(e,t,r,n,i){var o,s,a=8*i-n-1,u=(1<<a)-1,c=u>>1,l=-7,f=r?i-1:0,h=r?-1:1,d=e[t+f];for(f+=h,o=d&(1<<-l)-1,d>>=-l,l+=a;l>0;o=256*o+e[t+f],f+=h,l-=8);for(s=o&(1<<-l)-1,o>>=-l,l+=n;l>0;s=256*s+e[t+f],f+=h,l-=8);if(0===o)o=1-c;else{if(o===u)return s?NaN:1/0*(d?-1:1);s+=Math.pow(2,n),o-=c}return(d?-1:1)*s*Math.pow(2,o-n)},t.write=function(e,t,r,n,i,o){var s,a,u,c=8*o-i-1,l=(1<<c)-1,f=l>>1,h=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,d=n?0:o-1,p=n?1:-1,g=t<0||0===t&&1/t<0?1:0;for(t=Math.abs(t),isNaN(t)||t===1/0?(a=isNaN(t)?1:0,s=l):(s=Math.floor(Math.log(t)/Math.LN2),t*(u=Math.pow(2,-s))<1&&(s--,u*=2),(t+=s+f>=1?h/u:h*Math.pow(2,1-f))*u>=2&&(s++,u/=2),s+f>=l?(a=0,s=l):s+f>=1?(a=(t*u-1)*Math.pow(2,i),s+=f):(a=t*Math.pow(2,f-1)*Math.pow(2,i),s=0));i>=8;e[r+d]=255&a,d+=p,a/=256,i-=8);for(s=s<<i|a,c+=i;c>0;e[r+d]=255&s,d+=p,s/=256,c-=8);e[r+d-p]|=128*g}},function(e,t){},function(e,t,r){"use strict";var n=r(21).Buffer,i=r(49);e.exports=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.head=null,this.tail=null,this.length=0}return e.prototype.push=function(e){var t={data:e,next:null};this.length>0?this.tail.next=t:this.head=t,this.tail=t,++this.length},e.prototype.unshift=function(e){var t={data:e,next:this.head};0===this.length&&(this.tail=t),this.head=t,++this.length},e.prototype.shift=function(){if(0!==this.length){var e=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,e}},e.prototype.clear=function(){this.head=this.tail=null,this.length=0},e.prototype.join=function(e){if(0===this.length)return"";for(var t=this.head,r=""+t.data;t=t.next;)r+=e+t.data;return r},e.prototype.concat=function(e){if(0===this.length)return n.alloc(0);if(1===this.length)return this.head.data;for(var t,r,i,o=n.allocUnsafe(e>>>0),s=this.head,a=0;s;)t=s.data,r=o,i=a,t.copy(r,i),a+=s.data.length,s=s.next;return o},e}(),i&&i.inspect&&i.inspect.custom&&(e.exports.prototype[i.inspect.custom]=function(){var e=i.inspect({length:this.length});return this.constructor.name+" "+e})},function(e,t){},function(e,t,r){(function(e){var n=void 0!==e&&e||"undefined"!=typeof self&&self||window,i=Function.prototype.apply;function o(e,t){this._id=e,this._clearFn=t}t.setTimeout=function(){return new o(i.call(setTimeout,n,arguments),clearTimeout)},t.setInterval=function(){return new o(i.call(setInterval,n,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e&&e.close()},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(n,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout((function(){e._onTimeout&&e._onTimeout()}),t))},r(51),t.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==e&&e.setImmediate||this&&this.setImmediate,t.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==e&&e.clearImmediate||this&&this.clearImmediate}).call(this,r(1))},function(e,t,r){(function(e,t){!function(e,r){"use strict";if(!e.setImmediate){var n,i,o,s,a,u=1,c={},l=!1,f=e.document,h=Object.getPrototypeOf&&Object.getPrototypeOf(e);h=h&&h.setTimeout?h:e,"[object process]"==={}.toString.call(e.process)?n=function(e){t.nextTick((function(){p(e)}))}:!function(){if(e.postMessage&&!e.importScripts){var t=!0,r=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage("","*"),e.onmessage=r,t}}()?e.MessageChannel?((o=new MessageChannel).port1.onmessage=function(e){p(e.data)},n=function(e){o.port2.postMessage(e)}):f&&"onreadystatechange"in f.createElement("script")?(i=f.documentElement,n=function(e){var t=f.createElement("script");t.onreadystatechange=function(){p(e),t.onreadystatechange=null,i.removeChild(t),t=null},i.appendChild(t)}):n=function(e){setTimeout(p,0,e)}:(s="setImmediate$"+Math.random()+"$",a=function(t){t.source===e&&"string"==typeof t.data&&0===t.data.indexOf(s)&&p(+t.data.slice(s.length))},e.addEventListener?e.addEventListener("message",a,!1):e.attachEvent("onmessage",a),n=function(t){e.postMessage(s+t,"*")}),h.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),r=0;r<t.length;r++)t[r]=arguments[r+1];var i={callback:e,args:t};return c[u]=i,n(u),u++},h.clearImmediate=d}function d(e){delete c[e]}function p(e){if(l)setTimeout(p,0,e);else{var t=c[e];if(t){l=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(void 0,r)}}(t)}finally{d(e),l=!1}}}}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,r(1),r(2))},function(e,t,r){(function(t){function r(e){try{if(!t.localStorage)return!1}catch(e){return!1}var r=t.localStorage[e];return null!=r&&"true"===String(r).toLowerCase()}e.exports=function(e,t){if(r("noDeprecation"))return e;var n=!1;return function(){if(!n){if(r("throwDeprecation"))throw new Error(t);r("traceDeprecation")?console.trace(t):console.warn(t),n=!0}return e.apply(this,arguments)}}}).call(this,r(1))},function(e,t,r){var n=r(3),i=n.Buffer;function o(e,t){for(var r in e)t[r]=e[r]}function s(e,t,r){return i(e,t,r)}i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow?e.exports=n:(o(n,t),t.Buffer=s),o(i,s),s.from=function(e,t,r){if("number"==typeof e)throw new TypeError("Argument must not be a number");return i(e,t,r)},s.alloc=function(e,t,r){if("number"!=typeof e)throw new TypeError("Argument must be a number");var n=i(e);return void 0!==t?"string"==typeof r?n.fill(t,r):n.fill(t):n.fill(0),n},s.allocUnsafe=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return i(e)},s.allocUnsafeSlow=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return n.SlowBuffer(e)}},function(e,t,r){"use strict";e.exports=o;var n=r(32),i=Object.create(r(10));function o(e){if(!(this instanceof o))return new o(e);n.call(this,e)}i.inherits=r(4),i.inherits(o,n),o.prototype._transform=function(e,t,r){r(null,e)}},function(e,t,r){"use strict";var n=r(16),i=r(56),o=r(57),s=r(58),a=r(59);function u(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function c(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new n.Buf16(320),this.work=new n.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function l(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=1,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new n.Buf32(852),t.distcode=t.distdyn=new n.Buf32(592),t.sane=1,t.back=-1,0):-2}function f(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,l(e)):-2}function h(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?-2:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,f(e))):-2}function d(e,t){var r,n;return e?(n=new c,e.state=n,n.window=null,0!==(r=h(e,t))&&(e.state=null),r):-2}var p,g,m=!0;function y(e){if(m){var t;for(p=new n.Buf32(512),g=new n.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(a(1,e.lens,0,288,p,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;a(2,e.lens,0,32,g,0,e.work,{bits:5}),m=!1}e.lencode=p,e.lenbits=9,e.distcode=g,e.distbits=5}function b(e,t,r,i){var o,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new n.Buf8(s.wsize)),i>=s.wsize?(n.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):((o=s.wsize-s.wnext)>i&&(o=i),n.arraySet(s.window,t,r-i,o,s.wnext),(i-=o)?(n.arraySet(s.window,t,r-i,i,0),s.wnext=i,s.whave=s.wsize):(s.wnext+=o,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=o))),0}t.inflateReset=f,t.inflateReset2=h,t.inflateResetKeep=l,t.inflateInit=function(e){return d(e,15)},t.inflateInit2=d,t.inflate=function(e,t){var r,c,l,f,h,d,p,g,m,w,v,_,S,k,C,E,T,x,A,O,R,I,P,M,D=0,L=new n.Buf8(4),U=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return-2;12===(r=e.state).mode&&(r.mode=13),h=e.next_out,l=e.output,p=e.avail_out,f=e.next_in,c=e.input,d=e.avail_in,g=r.hold,m=r.bits,w=d,v=p,I=0;e:for(;;)switch(r.mode){case 1:if(0===r.wrap){r.mode=13;break}for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if(2&r.wrap&&35615===g){r.check=0,L[0]=255&g,L[1]=g>>>8&255,r.check=o(r.check,L,2,0),g=0,m=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&g)<<8)+(g>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&g)){e.msg="unknown compression method",r.mode=30;break}if(m-=4,R=8+(15&(g>>>=4)),0===r.wbits)r.wbits=R;else if(R>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<R,e.adler=r.check=1,r.mode=512&g?10:12,g=0,m=0;break;case 2:for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if(r.flags=g,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=g>>8&1),512&r.flags&&(L[0]=255&g,L[1]=g>>>8&255,r.check=o(r.check,L,2,0)),g=0,m=0,r.mode=3;case 3:for(;m<32;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}r.head&&(r.head.time=g),512&r.flags&&(L[0]=255&g,L[1]=g>>>8&255,L[2]=g>>>16&255,L[3]=g>>>24&255,r.check=o(r.check,L,4,0)),g=0,m=0,r.mode=4;case 4:for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}r.head&&(r.head.xflags=255&g,r.head.os=g>>8),512&r.flags&&(L[0]=255&g,L[1]=g>>>8&255,r.check=o(r.check,L,2,0)),g=0,m=0,r.mode=5;case 5:if(1024&r.flags){for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}r.length=g,r.head&&(r.head.extra_len=g),512&r.flags&&(L[0]=255&g,L[1]=g>>>8&255,r.check=o(r.check,L,2,0)),g=0,m=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&((_=r.length)>d&&(_=d),_&&(r.head&&(R=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),n.arraySet(r.head.extra,c,f,_,R)),512&r.flags&&(r.check=o(r.check,c,_,f)),d-=_,f+=_,r.length-=_),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===d)break e;_=0;do{R=c[f+_++],r.head&&R&&r.length<65536&&(r.head.name+=String.fromCharCode(R))}while(R&&_<d);if(512&r.flags&&(r.check=o(r.check,c,_,f)),d-=_,f+=_,R)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===d)break e;_=0;do{R=c[f+_++],r.head&&R&&r.length<65536&&(r.head.comment+=String.fromCharCode(R))}while(R&&_<d);if(512&r.flags&&(r.check=o(r.check,c,_,f)),d-=_,f+=_,R)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if(g!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}g=0,m=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;m<32;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}e.adler=r.check=u(g),g=0,m=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=h,e.avail_out=p,e.next_in=f,e.avail_in=d,r.hold=g,r.bits=m,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){g>>>=7&m,m-=7&m,r.mode=27;break}for(;m<3;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}switch(r.last=1&g,m-=1,3&(g>>>=1)){case 0:r.mode=14;break;case 1:if(y(r),r.mode=20,6===t){g>>>=2,m-=2;break e}break;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30}g>>>=2,m-=2;break;case 14:for(g>>>=7&m,m-=7&m;m<32;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if((65535&g)!=(g>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&g,g=0,m=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(_=r.length){if(_>d&&(_=d),_>p&&(_=p),0===_)break e;n.arraySet(l,c,f,_,h),d-=_,f+=_,p-=_,h+=_,r.length-=_;break}r.mode=12;break;case 17:for(;m<14;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if(r.nlen=257+(31&g),g>>>=5,m-=5,r.ndist=1+(31&g),g>>>=5,m-=5,r.ncode=4+(15&g),g>>>=4,m-=4,r.nlen>286||r.ndist>30){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;m<3;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}r.lens[U[r.have++]]=7&g,g>>>=3,m-=3}for(;r.have<19;)r.lens[U[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,P={bits:r.lenbits},I=a(0,r.lens,0,19,r.lencode,0,r.work,P),r.lenbits=P.bits,I){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;E=(D=r.lencode[g&(1<<r.lenbits)-1])>>>16&255,T=65535&D,!((C=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if(T<16)g>>>=C,m-=C,r.lens[r.have++]=T;else{if(16===T){for(M=C+2;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if(g>>>=C,m-=C,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}R=r.lens[r.have-1],_=3+(3&g),g>>>=2,m-=2}else if(17===T){for(M=C+3;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}m-=C,R=0,_=3+(7&(g>>>=C)),g>>>=3,m-=3}else{for(M=C+7;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}m-=C,R=0,_=11+(127&(g>>>=C)),g>>>=7,m-=7}if(r.have+_>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;_--;)r.lens[r.have++]=R}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,P={bits:r.lenbits},I=a(1,r.lens,0,r.nlen,r.lencode,0,r.work,P),r.lenbits=P.bits,I){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,P={bits:r.distbits},I=a(2,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,P),r.distbits=P.bits,I){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(d>=6&&p>=258){e.next_out=h,e.avail_out=p,e.next_in=f,e.avail_in=d,r.hold=g,r.bits=m,s(e,v),h=e.next_out,l=e.output,p=e.avail_out,f=e.next_in,c=e.input,d=e.avail_in,g=r.hold,m=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;E=(D=r.lencode[g&(1<<r.lenbits)-1])>>>16&255,T=65535&D,!((C=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if(E&&0==(240&E)){for(x=C,A=E,O=T;E=(D=r.lencode[O+((g&(1<<x+A)-1)>>x)])>>>16&255,T=65535&D,!(x+(C=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}g>>>=x,m-=x,r.back+=x}if(g>>>=C,m-=C,r.back+=C,r.length=T,0===E){r.mode=26;break}if(32&E){r.back=-1,r.mode=12;break}if(64&E){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&E,r.mode=22;case 22:if(r.extra){for(M=r.extra;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}r.length+=g&(1<<r.extra)-1,g>>>=r.extra,m-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;E=(D=r.distcode[g&(1<<r.distbits)-1])>>>16&255,T=65535&D,!((C=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if(0==(240&E)){for(x=C,A=E,O=T;E=(D=r.distcode[O+((g&(1<<x+A)-1)>>x)])>>>16&255,T=65535&D,!(x+(C=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}g>>>=x,m-=x,r.back+=x}if(g>>>=C,m-=C,r.back+=C,64&E){e.msg="invalid distance code",r.mode=30;break}r.offset=T,r.extra=15&E,r.mode=24;case 24:if(r.extra){for(M=r.extra;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}r.offset+=g&(1<<r.extra)-1,g>>>=r.extra,m-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===p)break e;if(_=v-p,r.offset>_){if((_=r.offset-_)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}_>r.wnext?(_-=r.wnext,S=r.wsize-_):S=r.wnext-_,_>r.length&&(_=r.length),k=r.window}else k=l,S=h-r.offset,_=r.length;_>p&&(_=p),p-=_,r.length-=_;do{l[h++]=k[S++]}while(--_);0===r.length&&(r.mode=21);break;case 26:if(0===p)break e;l[h++]=r.length,p--,r.mode=21;break;case 27:if(r.wrap){for(;m<32;){if(0===d)break e;d--,g|=c[f++]<<m,m+=8}if(v-=p,e.total_out+=v,r.total+=v,v&&(e.adler=r.check=r.flags?o(r.check,l,v,h-v):i(r.check,l,v,h-v)),v=p,(r.flags?g:u(g))!==r.check){e.msg="incorrect data check",r.mode=30;break}g=0,m=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;m<32;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8}if(g!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}g=0,m=0}r.mode=29;case 29:I=1;break e;case 30:I=-3;break e;case 31:return-4;case 32:default:return-2}return e.next_out=h,e.avail_out=p,e.next_in=f,e.avail_in=d,r.hold=g,r.bits=m,(r.wsize||v!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&b(e,e.output,e.next_out,v-e.avail_out)?(r.mode=31,-4):(w-=e.avail_in,v-=e.avail_out,e.total_in+=w,e.total_out+=v,r.total+=v,r.wrap&&v&&(e.adler=r.check=r.flags?o(r.check,l,v,e.next_out-v):i(r.check,l,v,e.next_out-v)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0===w&&0===v||4===t)&&0===I&&(I=-5),I)},t.inflateEnd=function(e){if(!e||!e.state)return-2;var t=e.state;return t.window&&(t.window=null),e.state=null,0},t.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?-2:(r.head=t,t.done=!1,0):-2},t.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?-2:11===r.mode&&i(1,t,n,0)!==r.check?-3:b(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,0):-2},t.inflateInfo="pako inflate (from Nodeca project)"},function(e,t,r){"use strict";e.exports=function(e,t,r,n){for(var i=65535&e|0,o=e>>>16&65535|0,s=0;0!==r;){r-=s=r>2e3?2e3:r;do{o=o+(i=i+t[n++]|0)|0}while(--s);i%=65521,o%=65521}return i|o<<16|0}},function(e,t,r){"use strict";var n=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();e.exports=function(e,t,r,i){var o=n,s=i+r;e^=-1;for(var a=i;a<s;a++)e=e>>>8^o[255&(e^t[a])];return-1^e}},function(e,t,r){"use strict";e.exports=function(e,t){var r,n,i,o,s,a,u,c,l,f,h,d,p,g,m,y,b,w,v,_,S,k,C,E,T;r=e.state,n=e.next_in,E=e.input,i=n+(e.avail_in-5),o=e.next_out,T=e.output,s=o-(t-e.avail_out),a=o+(e.avail_out-257),u=r.dmax,c=r.wsize,l=r.whave,f=r.wnext,h=r.window,d=r.hold,p=r.bits,g=r.lencode,m=r.distcode,y=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;e:do{p<15&&(d+=E[n++]<<p,p+=8,d+=E[n++]<<p,p+=8),w=g[d&y];t:for(;;){if(d>>>=v=w>>>24,p-=v,0===(v=w>>>16&255))T[o++]=65535&w;else{if(!(16&v)){if(0==(64&v)){w=g[(65535&w)+(d&(1<<v)-1)];continue t}if(32&v){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}_=65535&w,(v&=15)&&(p<v&&(d+=E[n++]<<p,p+=8),_+=d&(1<<v)-1,d>>>=v,p-=v),p<15&&(d+=E[n++]<<p,p+=8,d+=E[n++]<<p,p+=8),w=m[d&b];r:for(;;){if(d>>>=v=w>>>24,p-=v,!(16&(v=w>>>16&255))){if(0==(64&v)){w=m[(65535&w)+(d&(1<<v)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(S=65535&w,p<(v&=15)&&(d+=E[n++]<<p,(p+=8)<v&&(d+=E[n++]<<p,p+=8)),(S+=d&(1<<v)-1)>u){e.msg="invalid distance too far back",r.mode=30;break e}if(d>>>=v,p-=v,S>(v=o-s)){if((v=S-v)>l&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(k=0,C=h,0===f){if(k+=c-v,v<_){_-=v;do{T[o++]=h[k++]}while(--v);k=o-S,C=T}}else if(f<v){if(k+=c+f-v,(v-=f)<_){_-=v;do{T[o++]=h[k++]}while(--v);if(k=0,f<_){_-=v=f;do{T[o++]=h[k++]}while(--v);k=o-S,C=T}}}else if(k+=f-v,v<_){_-=v;do{T[o++]=h[k++]}while(--v);k=o-S,C=T}for(;_>2;)T[o++]=C[k++],T[o++]=C[k++],T[o++]=C[k++],_-=3;_&&(T[o++]=C[k++],_>1&&(T[o++]=C[k++]))}else{k=o-S;do{T[o++]=T[k++],T[o++]=T[k++],T[o++]=T[k++],_-=3}while(_>2);_&&(T[o++]=T[k++],_>1&&(T[o++]=T[k++]))}break}}break}}while(n<i&&o<a);n-=_=p>>3,d&=(1<<(p-=_<<3))-1,e.next_in=n,e.next_out=o,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=o<a?a-o+257:257-(o-a),r.hold=d,r.bits=p}},function(e,t,r){"use strict";var n=r(16),i=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],o=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],a=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(e,t,r,u,c,l,f,h){var d,p,g,m,y,b,w,v,_,S=h.bits,k=0,C=0,E=0,T=0,x=0,A=0,O=0,R=0,I=0,P=0,M=null,D=0,L=new n.Buf16(16),U=new n.Buf16(16),F=null,j=0;for(k=0;k<=15;k++)L[k]=0;for(C=0;C<u;C++)L[t[r+C]]++;for(x=S,T=15;T>=1&&0===L[T];T--);if(x>T&&(x=T),0===T)return c[l++]=20971520,c[l++]=20971520,h.bits=1,0;for(E=1;E<T&&0===L[E];E++);for(x<E&&(x=E),R=1,k=1;k<=15;k++)if(R<<=1,(R-=L[k])<0)return-1;if(R>0&&(0===e||1!==T))return-1;for(U[1]=0,k=1;k<15;k++)U[k+1]=U[k]+L[k];for(C=0;C<u;C++)0!==t[r+C]&&(f[U[t[r+C]]++]=C);if(0===e?(M=F=f,b=19):1===e?(M=i,D-=257,F=o,j-=257,b=256):(M=s,F=a,b=-1),P=0,C=0,k=E,y=l,A=x,O=0,g=-1,m=(I=1<<x)-1,1===e&&I>852||2===e&&I>592)return 1;for(;;){w=k-O,f[C]<b?(v=0,_=f[C]):f[C]>b?(v=F[j+f[C]],_=M[D+f[C]]):(v=96,_=0),d=1<<k-O,E=p=1<<A;do{c[y+(P>>O)+(p-=d)]=w<<24|v<<16|_|0}while(0!==p);for(d=1<<k-1;P&d;)d>>=1;if(0!==d?(P&=d-1,P+=d):P=0,C++,0==--L[k]){if(k===T)break;k=t[r+f[C]]}if(k>x&&(P&m)!==g){for(0===O&&(O=x),y+=E,R=1<<(A=k-O);A+O<T&&!((R-=L[A+O])<=0);)A++,R<<=1;if(I+=1<<A,1===e&&I>852||2===e&&I>592)return 1;c[g=P&m]=x<<24|A<<16|y-l|0}}return 0!==P&&(c[y+P]=k-O<<24|64<<16|0),h.bits=x,0}},function(e,t,r){"use strict";var n=r(16),i=!0,o=!0;try{String.fromCharCode.apply(null,[0])}catch(e){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){o=!1}for(var s=new n.Buf8(256),a=0;a<256;a++)s[a]=a>=252?6:a>=248?5:a>=240?4:a>=224?3:a>=192?2:1;function u(e,t){if(t<65534&&(e.subarray&&o||!e.subarray&&i))return String.fromCharCode.apply(null,n.shrinkBuf(e,t));for(var r="",s=0;s<t;s++)r+=String.fromCharCode(e[s]);return r}s[254]=s[254]=1,t.string2buf=function(e){var t,r,i,o,s,a=e.length,u=0;for(o=0;o<a;o++)55296==(64512&(r=e.charCodeAt(o)))&&o+1<a&&56320==(64512&(i=e.charCodeAt(o+1)))&&(r=65536+(r-55296<<10)+(i-56320),o++),u+=r<128?1:r<2048?2:r<65536?3:4;for(t=new n.Buf8(u),s=0,o=0;s<u;o++)55296==(64512&(r=e.charCodeAt(o)))&&o+1<a&&56320==(64512&(i=e.charCodeAt(o+1)))&&(r=65536+(r-55296<<10)+(i-56320),o++),r<128?t[s++]=r:r<2048?(t[s++]=192|r>>>6,t[s++]=128|63&r):r<65536?(t[s++]=224|r>>>12,t[s++]=128|r>>>6&63,t[s++]=128|63&r):(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63,t[s++]=128|r>>>6&63,t[s++]=128|63&r);return t},t.buf2binstring=function(e){return u(e,e.length)},t.binstring2buf=function(e){for(var t=new n.Buf8(e.length),r=0,i=t.length;r<i;r++)t[r]=e.charCodeAt(r);return t},t.buf2string=function(e,t){var r,n,i,o,a=t||e.length,c=new Array(2*a);for(n=0,r=0;r<a;)if((i=e[r++])<128)c[n++]=i;else if((o=s[i])>4)c[n++]=65533,r+=o-1;else{for(i&=2===o?31:3===o?15:7;o>1&&r<a;)i=i<<6|63&e[r++],o--;o>1?c[n++]=65533:i<65536?c[n++]=i:(i-=65536,c[n++]=55296|i>>10&1023,c[n++]=56320|1023&i)}return u(c,n)},t.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;r>=0&&128==(192&e[r]);)r--;return r<0||0===r?t:r+s[e[r]]>t?r:t}},function(e,t,r){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},function(e,t,r){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},function(e,t,r){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},function(e,t,r){"use strict";e.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},function(e,t,r){e.exports=r.p+"0.8a1ffd3a2c74f606cfd5.worker.worker.js"},function(e,t,r){e.exports=function(e){function t(e){let r,i=null;function o(...e){if(!o.enabled)return;const n=o,i=Number(new Date),s=i-(r||i);n.diff=s,n.prev=r,n.curr=i,r=i,e[0]=t.coerce(e[0]),"string"!=typeof e[0]&&e.unshift("%O");let a=0;e[0]=e[0].replace(/%([a-zA-Z%])/g,(r,i)=>{if("%%"===r)return"%";a++;const o=t.formatters[i];if("function"==typeof o){const t=e[a];r=o.call(n,t),e.splice(a,1),a--}return r}),t.formatArgs.call(n,e);(n.log||t.log).apply(n,e)}return o.namespace=e,o.useColors=t.useColors(),o.color=t.selectColor(e),o.extend=n,o.destroy=t.destroy,Object.defineProperty(o,"enabled",{enumerable:!0,configurable:!1,get:()=>null===i?t.enabled(e):i,set:e=>{i=e}}),"function"==typeof t.init&&t.init(o),o}function n(e,r){const n=t(this.namespace+(void 0===r?":":r)+e);return n.log=this.log,n}function i(e){return e.toString().substring(2,e.toString().length-2).replace(/\\.\\*\\?$/,"*")}return t.debug=t,t.default=t,t.coerce=function(e){if(e instanceof Error)return e.stack||e.message;return e},t.disable=function(){const e=[...t.names.map(i),...t.skips.map(i).map(e=>"-"+e)].join(",");return t.enable(""),e},t.enable=function(e){let r;t.save(e),t.names=[],t.skips=[];const n=("string"==typeof e?e:"").split(/[\\s,]+/),i=n.length;for(r=0;r<i;r++)n[r]&&("-"===(e=n[r].replace(/\\*/g,".*?"))[0]?t.skips.push(new RegExp("^"+e.substr(1)+"$")):t.names.push(new RegExp("^"+e+"$")))},t.enabled=function(e){if("*"===e[e.length-1])return!0;let r,n;for(r=0,n=t.skips.length;r<n;r++)if(t.skips[r].test(e))return!1;for(r=0,n=t.names.length;r<n;r++)if(t.names[r].test(e))return!0;return!1},t.humanize=r(67),t.destroy=function(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")},Object.keys(e).forEach(r=>{t[r]=e[r]}),t.names=[],t.skips=[],t.formatters={},t.selectColor=function(e){let r=0;for(let t=0;t<e.length;t++)r=(r<<5)-r+e.charCodeAt(t),r|=0;return t.colors[Math.abs(r)%t.colors.length]},t.enable(t.load()),t}},function(e,t){var r=1e3,n=6e4,i=60*n,o=24*i;function s(e,t,r,n){var i=t>=1.5*r;return Math.round(e/r)+" "+n+(i?"s":"")}e.exports=function(e,t){t=t||{};var a=typeof e;if("string"===a&&e.length>0)return function(e){if((e=String(e)).length>100)return;var t=/^(-?(?:\\d+)?\\.?\\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(e);if(!t)return;var s=parseFloat(t[1]);switch((t[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return 315576e5*s;case"weeks":case"week":case"w":return 6048e5*s;case"days":case"day":case"d":return s*o;case"hours":case"hour":case"hrs":case"hr":case"h":return s*i;case"minutes":case"minute":case"mins":case"min":case"m":return s*n;case"seconds":case"second":case"secs":case"sec":case"s":return s*r;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return s;default:return}}(e);if("number"===a&&isFinite(e))return t.long?function(e){var t=Math.abs(e);if(t>=o)return s(e,t,o,"day");if(t>=i)return s(e,t,i,"hour");if(t>=n)return s(e,t,n,"minute");if(t>=r)return s(e,t,r,"second");return e+" ms"}(e):function(e){var t=Math.abs(e);if(t>=o)return Math.round(e/o)+"d";if(t>=i)return Math.round(e/i)+"h";if(t>=n)return Math.round(e/n)+"m";if(t>=r)return Math.round(e/r)+"s";return e+"ms"}(e);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))}},function(e,t,r){(function(t,n,i){var o=r(34),s=r(4),a=r(35),u=r(20),c=r(69),l=a.IncomingMessage,f=a.readyStates;var h=e.exports=function(e){var r,n=this;u.Writable.call(n),n._opts=e,n._body=[],n._headers={},e.auth&&n.setHeader("Authorization","Basic "+new t(e.auth).toString("base64")),Object.keys(e.headers).forEach((function(t){n.setHeader(t,e.headers[t])}));var i=!0;if("disable-fetch"===e.mode||"requestTimeout"in e&&!o.abortController)i=!1,r=!0;else if("prefer-streaming"===e.mode)r=!1;else if("allow-wrong-content-type"===e.mode)r=!o.overrideMimeType;else{if(e.mode&&"default"!==e.mode&&"prefer-fast"!==e.mode)throw new Error("Invalid value for opts.mode");r=!0}n._mode=function(e,t){return o.fetch&&t?"fetch":o.mozchunkedarraybuffer?"moz-chunked-arraybuffer":o.msstream?"ms-stream":o.arraybuffer&&e?"arraybuffer":o.vbArray&&e?"text:vbarray":"text"}(r,i),n._fetchTimer=null,n.on("finish",(function(){n._onFinish()}))};s(h,u.Writable),h.prototype.setHeader=function(e,t){var r=e.toLowerCase();-1===d.indexOf(r)&&(this._headers[r]={name:e,value:t})},h.prototype.getHeader=function(e){var t=this._headers[e.toLowerCase()];return t?t.value:null},h.prototype.removeHeader=function(e){delete this._headers[e.toLowerCase()]},h.prototype._onFinish=function(){var e=this;if(!e._destroyed){var r=e._opts,s=e._headers,a=null;"GET"!==r.method&&"HEAD"!==r.method&&(a=o.arraybuffer?c(t.concat(e._body)):o.blobConstructor?new n.Blob(e._body.map((function(e){return c(e)})),{type:(s["content-type"]||{}).value||""}):t.concat(e._body).toString());var u=[];if(Object.keys(s).forEach((function(e){var t=s[e].name,r=s[e].value;Array.isArray(r)?r.forEach((function(e){u.push([t,e])})):u.push([t,r])})),"fetch"===e._mode){var l=null;if(o.abortController){var h=new AbortController;l=h.signal,e._fetchAbortController=h,"requestTimeout"in r&&0!==r.requestTimeout&&(e._fetchTimer=n.setTimeout((function(){e.emit("requestTimeout"),e._fetchAbortController&&e._fetchAbortController.abort()}),r.requestTimeout))}n.fetch(e._opts.url,{method:e._opts.method,headers:u,body:a||void 0,mode:"cors",credentials:r.withCredentials?"include":"same-origin",signal:l}).then((function(t){e._fetchResponse=t,e._connect()}),(function(t){n.clearTimeout(e._fetchTimer),e._destroyed||e.emit("error",t)}))}else{var d=e._xhr=new n.XMLHttpRequest;try{d.open(e._opts.method,e._opts.url,!0)}catch(t){return void i.nextTick((function(){e.emit("error",t)}))}"responseType"in d&&(d.responseType=e._mode.split(":")[0]),"withCredentials"in d&&(d.withCredentials=!!r.withCredentials),"text"===e._mode&&"overrideMimeType"in d&&d.overrideMimeType("text/plain; charset=x-user-defined"),"requestTimeout"in r&&(d.timeout=r.requestTimeout,d.ontimeout=function(){e.emit("requestTimeout")}),u.forEach((function(e){d.setRequestHeader(e[0],e[1])})),e._response=null,d.onreadystatechange=function(){switch(d.readyState){case f.LOADING:case f.DONE:e._onXHRProgress()}},"moz-chunked-arraybuffer"===e._mode&&(d.onprogress=function(){e._onXHRProgress()}),d.onerror=function(){e._destroyed||e.emit("error",new Error("XHR error"))};try{d.send(a)}catch(t){return void i.nextTick((function(){e.emit("error",t)}))}}}},h.prototype._onXHRProgress=function(){(function(e){try{var t=e.status;return null!==t&&0!==t}catch(e){return!1}})(this._xhr)&&!this._destroyed&&(this._response||this._connect(),this._response._onXHRProgress())},h.prototype._connect=function(){var e=this;e._destroyed||(e._response=new l(e._xhr,e._fetchResponse,e._mode,e._fetchTimer),e._response.on("error",(function(t){e.emit("error",t)})),e.emit("response",e._response))},h.prototype._write=function(e,t,r){this._body.push(e),r()},h.prototype.abort=h.prototype.destroy=function(){this._destroyed=!0,n.clearTimeout(this._fetchTimer),this._response&&(this._response._destroyed=!0),this._xhr?this._xhr.abort():this._fetchAbortController&&this._fetchAbortController.abort()},h.prototype.end=function(e,t,r){"function"==typeof e&&(r=e,e=void 0),u.Writable.prototype.end.call(this,e,t,r)},h.prototype.flushHeaders=function(){},h.prototype.setTimeout=function(){},h.prototype.setNoDelay=function(){},h.prototype.setSocketKeepAlive=function(){};var d=["accept-charset","accept-encoding","access-control-request-headers","access-control-request-method","connection","content-length","cookie","cookie2","date","dnt","expect","host","keep-alive","origin","referer","te","trailer","transfer-encoding","upgrade","via"]}).call(this,r(3).Buffer,r(1),r(2))},function(e,t,r){var n=r(3).Buffer;e.exports=function(e){if(e instanceof Uint8Array){if(0===e.byteOffset&&e.byteLength===e.buffer.byteLength)return e.buffer;if("function"==typeof e.buffer.slice)return e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength)}if(n.isBuffer(e)){for(var t=new Uint8Array(e.length),r=e.length,i=0;i<r;i++)t[i]=e[i];return t.buffer}throw new Error("Argument must be a Buffer")}},function(e,t){e.exports=function(){for(var e={},t=0;t<arguments.length;t++){var n=arguments[t];for(var i in n)r.call(n,i)&&(e[i]=n[i])}return e};var r=Object.prototype.hasOwnProperty},function(e,t){e.exports={100:"Continue",101:"Switching Protocols",102:"Processing",200:"OK",201:"Created",202:"Accepted",203:"Non-Authoritative Information",204:"No Content",205:"Reset Content",206:"Partial Content",207:"Multi-Status",208:"Already Reported",226:"IM Used",300:"Multiple Choices",301:"Moved Permanently",302:"Found",303:"See Other",304:"Not Modified",305:"Use Proxy",307:"Temporary Redirect",308:"Permanent Redirect",400:"Bad Request",401:"Unauthorized",402:"Payment Required",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",406:"Not Acceptable",407:"Proxy Authentication Required",408:"Request Timeout",409:"Conflict",410:"Gone",411:"Length Required",412:"Precondition Failed",413:"Payload Too Large",414:"URI Too Long",415:"Unsupported Media Type",416:"Range Not Satisfiable",417:"Expectation Failed",418:"I\'m a teapot",421:"Misdirected Request",422:"Unprocessable Entity",423:"Locked",424:"Failed Dependency",425:"Unordered Collection",426:"Upgrade Required",428:"Precondition Required",429:"Too Many Requests",431:"Request Header Fields Too Large",451:"Unavailable For Legal Reasons",500:"Internal Server Error",501:"Not Implemented",502:"Bad Gateway",503:"Service Unavailable",504:"Gateway Timeout",505:"HTTP Version Not Supported",506:"Variant Also Negotiates",507:"Insufficient Storage",508:"Loop Detected",509:"Bandwidth Limit Exceeded",510:"Not Extended",511:"Network Authentication Required"}},function(e,t,r){(function(e,n){var i;/*! https://mths.be/punycode v1.4.1 by @mathias */!function(o){t&&t.nodeType,e&&e.nodeType;var s="object"==typeof n&&n;s.global!==s&&s.window!==s&&s.self;var a,u=2147483647,c=/^xn--/,l=/[^\\x20-\\x7E]/,f=/[\\x2E\\u3002\\uFF0E\\uFF61]/g,h={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},d=Math.floor,p=String.fromCharCode;function g(e){throw new RangeError(h[e])}function m(e,t){for(var r=e.length,n=[];r--;)n[r]=t(e[r]);return n}function y(e,t){var r=e.split("@"),n="";return r.length>1&&(n=r[0]+"@",e=r[1]),n+m((e=e.replace(f,".")).split("."),t).join(".")}function b(e){for(var t,r,n=[],i=0,o=e.length;i<o;)(t=e.charCodeAt(i++))>=55296&&t<=56319&&i<o?56320==(64512&(r=e.charCodeAt(i++)))?n.push(((1023&t)<<10)+(1023&r)+65536):(n.push(t),i--):n.push(t);return n}function w(e){return m(e,(function(e){var t="";return e>65535&&(t+=p((e-=65536)>>>10&1023|55296),e=56320|1023&e),t+=p(e)})).join("")}function v(e,t){return e+22+75*(e<26)-((0!=t)<<5)}function _(e,t,r){var n=0;for(e=r?d(e/700):e>>1,e+=d(e/t);e>455;n+=36)e=d(e/35);return d(n+36*e/(e+38))}function S(e){var t,r,n,i,o,s,a,c,l,f,h,p=[],m=e.length,y=0,b=128,v=72;for((r=e.lastIndexOf("-"))<0&&(r=0),n=0;n<r;++n)e.charCodeAt(n)>=128&&g("not-basic"),p.push(e.charCodeAt(n));for(i=r>0?r+1:0;i<m;){for(o=y,s=1,a=36;i>=m&&g("invalid-input"),((c=(h=e.charCodeAt(i++))-48<10?h-22:h-65<26?h-65:h-97<26?h-97:36)>=36||c>d((u-y)/s))&&g("overflow"),y+=c*s,!(c<(l=a<=v?1:a>=v+26?26:a-v));a+=36)s>d(u/(f=36-l))&&g("overflow"),s*=f;v=_(y-o,t=p.length+1,0==o),d(y/t)>u-b&&g("overflow"),b+=d(y/t),y%=t,p.splice(y++,0,b)}return w(p)}function k(e){var t,r,n,i,o,s,a,c,l,f,h,m,y,w,S,k=[];for(m=(e=b(e)).length,t=128,r=0,o=72,s=0;s<m;++s)(h=e[s])<128&&k.push(p(h));for(n=i=k.length,i&&k.push("-");n<m;){for(a=u,s=0;s<m;++s)(h=e[s])>=t&&h<a&&(a=h);for(a-t>d((u-r)/(y=n+1))&&g("overflow"),r+=(a-t)*y,t=a,s=0;s<m;++s)if((h=e[s])<t&&++r>u&&g("overflow"),h==t){for(c=r,l=36;!(c<(f=l<=o?1:l>=o+26?26:l-o));l+=36)S=c-f,w=36-f,k.push(p(v(f+S%w,0))),c=d(S/w);k.push(p(v(c,0))),o=_(r,y,n==i),r=0,++n}++r,++t}return k.join("")}a={version:"1.4.1",ucs2:{decode:b,encode:w},decode:S,encode:k,toASCII:function(e){return y(e,(function(e){return l.test(e)?"xn--"+k(e):e}))},toUnicode:function(e){return y(e,(function(e){return c.test(e)?S(e.slice(4).toLowerCase()):e}))}},void 0===(i=function(){return a}.call(t,r,t,e))||(e.exports=i)}()}).call(this,r(73)(e),r(1))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e}},function(e,t,r){"use strict";e.exports={isString:function(e){return"string"==typeof e},isObject:function(e){return"object"==typeof e&&null!==e},isNull:function(e){return null===e},isNullOrUndefined:function(e){return null==e}}},function(e,t,r){"use strict";t.decode=t.parse=r(76),t.encode=t.stringify=r(77)},function(e,t,r){"use strict";function n(e,t){return Object.prototype.hasOwnProperty.call(e,t)}e.exports=function(e,t,r,o){t=t||"&",r=r||"=";var s={};if("string"!=typeof e||0===e.length)return s;var a=/\\+/g;e=e.split(t);var u=1e3;o&&"number"==typeof o.maxKeys&&(u=o.maxKeys);var c=e.length;u>0&&c>u&&(c=u);for(var l=0;l<c;++l){var f,h,d,p,g=e[l].replace(a,"%20"),m=g.indexOf(r);m>=0?(f=g.substr(0,m),h=g.substr(m+1)):(f=g,h=""),d=decodeURIComponent(f),p=decodeURIComponent(h),n(s,d)?i(s[d])?s[d].push(p):s[d]=[s[d],p]:s[d]=p}return s};var i=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)}},function(e,t,r){"use strict";var n=function(e){switch(typeof e){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return""}};e.exports=function(e,t,r,a){return t=t||"&",r=r||"=",null===e&&(e=void 0),"object"==typeof e?o(s(e),(function(s){var a=encodeURIComponent(n(s))+r;return i(e[s])?o(e[s],(function(e){return a+encodeURIComponent(n(e))})).join(t):a+encodeURIComponent(n(e[s]))})).join(t):a?encodeURIComponent(n(a))+r+encodeURIComponent(n(e)):""};var i=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};function o(e,t){if(e.map)return e.map(t);for(var r=[],n=0;n<e.length;n++)r.push(t(e[n],n));return r}var s=Object.keys||function(e){var t=[];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.push(r);return t}},function(e,t){e.exports={getPalette:(e,{debug:t=!1}={debug:!1})=>{t&&console.log("starting getPalette with image",e);const{fileDirectory:r}=e,{BitsPerSample:n,ColorMap:i,ImageLength:o,ImageWidth:s,PhotometricInterpretation:a,SampleFormat:u,SamplesPerPixel:c}=r;if(!i)throw new Error("[geotiff-palette]: the image does not contain a color map, so we can\'t make a palette.");const l=Math.pow(2,n);t&&console.log("[geotiff-palette]: count:",l);const f=i.length/3;if(t&&console.log("[geotiff-palette]: bandSize:",f),f!==l)throw new Error("[geotiff-palette]: can\'t handle situations where the color map has more or less values than the number of possible values in a raster");const h=f,d=h+f,p=[];for(let e=0;e<l;e++)p.push([Math.floor(i[e]/256),Math.floor(i[h+e]/256),Math.floor(i[d+e]/256),255]);return t&&console.log("[geotiff-palette]: result is ",p),p}}},function(e,t,r){"use strict";e.exports={countIn1D:function(e){return e.reduce((function(e,t){return void 0===e[t]?e[t]=1:e[t]++,e}),{})},countIn2D:function(e){return e.reduce((function(e,t){return t.forEach((function(t){void 0===e[t]?e[t]=1:e[t]++})),e}),{})},unflatten:function(e,t){for(var r=t.height,n=t.width,i=[],o=0;o<r;o++){var s=o*n,a=s+n;i.push(e.slice(s,a))}return i}}},function(e,t,r){"use strict";r.r(t),r.d(t,"globals",(function(){return n})),r.d(t,"rgb",(function(){return i})),r.d(t,"getDecoder",(function(){return B})),r.d(t,"setLogger",(function(){return _e})),r.d(t,"GeoTIFF",(function(){return xe})),r.d(t,"MultiGeoTIFF",(function(){return Ae})),r.d(t,"fromUrl",(function(){return Oe})),r.d(t,"fromArrayBuffer",(function(){return Re})),r.d(t,"fromFile",(function(){return Ie})),r.d(t,"fromBlob",(function(){return Pe})),r.d(t,"fromUrls",(function(){return Me})),r.d(t,"writeArrayBuffer",(function(){return De})),r.d(t,"Pool",(function(){return Z.a}));var n={};r.r(n),r.d(n,"fieldTagNames",(function(){return a})),r.d(n,"fieldTags",(function(){return u})),r.d(n,"fieldTagTypes",(function(){return c})),r.d(n,"arrayFields",(function(){return l})),r.d(n,"fieldTypeNames",(function(){return f})),r.d(n,"fieldTypes",(function(){return h})),r.d(n,"photometricInterpretations",(function(){return d})),r.d(n,"ExtraSamplesValues",(function(){return p})),r.d(n,"geoKeyNames",(function(){return g})),r.d(n,"geoKeys",(function(){return m}));var i={};r.r(i),r.d(i,"fromWhiteIsZero",(function(){return y})),r.d(i,"fromBlackIsZero",(function(){return b})),r.d(i,"fromPalette",(function(){return w})),r.d(i,"fromCMYK",(function(){return v})),r.d(i,"fromYCbCr",(function(){return _})),r.d(i,"fromCIELab",(function(){return S}));var o=r(37),s=r.n(o);const a={315:"Artist",258:"BitsPerSample",265:"CellLength",264:"CellWidth",320:"ColorMap",259:"Compression",33432:"Copyright",306:"DateTime",338:"ExtraSamples",266:"FillOrder",289:"FreeByteCounts",288:"FreeOffsets",291:"GrayResponseCurve",290:"GrayResponseUnit",316:"HostComputer",270:"ImageDescription",257:"ImageLength",256:"ImageWidth",271:"Make",281:"MaxSampleValue",280:"MinSampleValue",272:"Model",254:"NewSubfileType",274:"Orientation",262:"PhotometricInterpretation",284:"PlanarConfiguration",296:"ResolutionUnit",278:"RowsPerStrip",277:"SamplesPerPixel",305:"Software",279:"StripByteCounts",273:"StripOffsets",255:"SubfileType",263:"Threshholding",282:"XResolution",283:"YResolution",326:"BadFaxLines",327:"CleanFaxData",343:"ClipPath",328:"ConsecutiveBadFaxLines",433:"Decode",434:"DefaultImageColor",269:"DocumentName",336:"DotRange",321:"HalftoneHints",346:"Indexed",347:"JPEGTables",285:"PageName",297:"PageNumber",317:"Predictor",319:"PrimaryChromaticities",532:"ReferenceBlackWhite",339:"SampleFormat",340:"SMinSampleValue",341:"SMaxSampleValue",559:"StripRowCounts",330:"SubIFDs",292:"T4Options",293:"T6Options",325:"TileByteCounts",323:"TileLength",324:"TileOffsets",322:"TileWidth",301:"TransferFunction",318:"WhitePoint",344:"XClipPathUnits",286:"XPosition",529:"YCbCrCoefficients",531:"YCbCrPositioning",530:"YCbCrSubSampling",345:"YClipPathUnits",287:"YPosition",37378:"ApertureValue",40961:"ColorSpace",36868:"DateTimeDigitized",36867:"DateTimeOriginal",34665:"Exif IFD",36864:"ExifVersion",33434:"ExposureTime",41728:"FileSource",37385:"Flash",40960:"FlashpixVersion",33437:"FNumber",42016:"ImageUniqueID",37384:"LightSource",37500:"MakerNote",37377:"ShutterSpeedValue",37510:"UserComment",33723:"IPTC",34675:"ICC Profile",700:"XMP",42112:"GDAL_METADATA",42113:"GDAL_NODATA",34377:"Photoshop",33550:"ModelPixelScale",33922:"ModelTiepoint",34264:"ModelTransformation",34735:"GeoKeyDirectory",34736:"GeoDoubleParams",34737:"GeoAsciiParams"},u={};for(const e in a)a.hasOwnProperty(e)&&(u[a[e]]=parseInt(e,10));const c={256:"SHORT",257:"SHORT",258:"SHORT",259:"SHORT",262:"SHORT",273:"LONG",274:"SHORT",277:"SHORT",278:"LONG",279:"LONG",282:"RATIONAL",283:"RATIONAL",284:"SHORT",286:"SHORT",287:"RATIONAL",296:"SHORT",305:"ASCII",306:"ASCII",338:"SHORT",339:"SHORT",513:"LONG",514:"LONG",1024:"SHORT",1025:"SHORT",2048:"SHORT",2049:"ASCII",33550:"DOUBLE",33922:"DOUBLE",34665:"LONG",34735:"SHORT",34737:"ASCII",42113:"ASCII"},l=[u.BitsPerSample,u.ExtraSamples,u.SampleFormat,u.StripByteCounts,u.StripOffsets,u.StripRowCounts,u.TileByteCounts,u.TileOffsets],f={1:"BYTE",2:"ASCII",3:"SHORT",4:"LONG",5:"RATIONAL",6:"SBYTE",7:"UNDEFINED",8:"SSHORT",9:"SLONG",10:"SRATIONAL",11:"FLOAT",12:"DOUBLE",13:"IFD",16:"LONG8",17:"SLONG8",18:"IFD8"},h={};for(const e in f)f.hasOwnProperty(e)&&(h[f[e]]=parseInt(e,10));const d={WhiteIsZero:0,BlackIsZero:1,RGB:2,Palette:3,TransparencyMask:4,CMYK:5,YCbCr:6,CIELab:8,ICCLab:9},p={Unspecified:0,Assocalpha:1,Unassalpha:2},g={1024:"GTModelTypeGeoKey",1025:"GTRasterTypeGeoKey",1026:"GTCitationGeoKey",2048:"GeographicTypeGeoKey",2049:"GeogCitationGeoKey",2050:"GeogGeodeticDatumGeoKey",2051:"GeogPrimeMeridianGeoKey",2052:"GeogLinearUnitsGeoKey",2053:"GeogLinearUnitSizeGeoKey",2054:"GeogAngularUnitsGeoKey",2055:"GeogAngularUnitSizeGeoKey",2056:"GeogEllipsoidGeoKey",2057:"GeogSemiMajorAxisGeoKey",2058:"GeogSemiMinorAxisGeoKey",2059:"GeogInvFlatteningGeoKey",2060:"GeogAzimuthUnitsGeoKey",2061:"GeogPrimeMeridianLongGeoKey",2062:"GeogTOWGS84GeoKey",3072:"ProjectedCSTypeGeoKey",3073:"PCSCitationGeoKey",3074:"ProjectionGeoKey",3075:"ProjCoordTransGeoKey",3076:"ProjLinearUnitsGeoKey",3077:"ProjLinearUnitSizeGeoKey",3078:"ProjStdParallel1GeoKey",3079:"ProjStdParallel2GeoKey",3080:"ProjNatOriginLongGeoKey",3081:"ProjNatOriginLatGeoKey",3082:"ProjFalseEastingGeoKey",3083:"ProjFalseNorthingGeoKey",3084:"ProjFalseOriginLongGeoKey",3085:"ProjFalseOriginLatGeoKey",3086:"ProjFalseOriginEastingGeoKey",3087:"ProjFalseOriginNorthingGeoKey",3088:"ProjCenterLongGeoKey",3089:"ProjCenterLatGeoKey",3090:"ProjCenterEastingGeoKey",3091:"ProjCenterNorthingGeoKey",3092:"ProjScaleAtNatOriginGeoKey",3093:"ProjScaleAtCenterGeoKey",3094:"ProjAzimuthAngleGeoKey",3095:"ProjStraightVertPoleLongGeoKey",3096:"ProjRectifiedGridAngleGeoKey",4096:"VerticalCSTypeGeoKey",4097:"VerticalCitationGeoKey",4098:"VerticalDatumGeoKey",4099:"VerticalUnitsGeoKey"},m={};for(const e in g)g.hasOwnProperty(e)&&(m[g[e]]=parseInt(e,10));function y(e,t){const{width:r,height:n}=e,i=new Uint8Array(r*n*3);let o;for(let r=0,n=0;r<e.length;++r,n+=3)o=256-e[r]/t*256,i[n]=o,i[n+1]=o,i[n+2]=o;return i}function b(e,t){const{width:r,height:n}=e,i=new Uint8Array(r*n*3);let o;for(let r=0,n=0;r<e.length;++r,n+=3)o=e[r]/t*256,i[n]=o,i[n+1]=o,i[n+2]=o;return i}function w(e,t){const{width:r,height:n}=e,i=new Uint8Array(r*n*3),o=t.length/3,s=t.length/3*2;for(let r=0,n=0;r<e.length;++r,n+=3){const a=e[r];i[n]=t[a]/65536*256,i[n+1]=t[a+o]/65536*256,i[n+2]=t[a+s]/65536*256}return i}function v(e){const{width:t,height:r}=e,n=new Uint8Array(t*r*3);for(let t=0,r=0;t<e.length;t+=4,r+=3){const i=e[t],o=e[t+1],s=e[t+2],a=e[t+3];n[r]=(255-i)/256*255*((255-a)/256),n[r+1]=(255-o)/256*255*((255-a)/256),n[r+2]=(255-s)/256*255*((255-a)/256)}return n}function _(e){const{width:t,height:r}=e,n=new Uint8ClampedArray(t*r*3);for(let t=0,r=0;t<e.length;t+=3,r+=3){const i=e[t],o=e[t+1],s=e[t+2];n[r]=i+1.402*(s-128),n[r+1]=i-.34414*(o-128)-.71414*(s-128),n[r+2]=i+1.772*(o-128)}return n}function S(e){const{width:t,height:r}=e,n=new Uint8Array(t*r*3);for(let t=0,r=0;t<e.length;t+=3,r+=3){let i,o,s,a=(e[t+0]+16)/116,u=(e[t+1]<<24>>24)/500+a,c=a-(e[t+2]<<24>>24)/200;u=.95047*(u*u*u>.008856?u*u*u:(u-16/116)/7.787),a=1*(a*a*a>.008856?a*a*a:(a-16/116)/7.787),c=1.08883*(c*c*c>.008856?c*c*c:(c-16/116)/7.787),i=3.2406*u+-1.5372*a+-.4986*c,o=-.9689*u+1.8758*a+.0415*c,s=.0557*u+-.204*a+1.057*c,i=i>.0031308?1.055*i**(1/2.4)-.055:12.92*i,o=o>.0031308?1.055*o**(1/2.4)-.055:12.92*o,s=s>.0031308?1.055*s**(1/2.4)-.055:12.92*s,n[r]=255*Math.max(0,Math.min(1,i)),n[r+1]=255*Math.max(0,Math.min(1,o)),n[r+2]=255*Math.max(0,Math.min(1,s))}return n}function k(e,t){let r=e.length-t,n=0;do{for(let r=t;r>0;r--)e[n+t]+=e[n],n++;r-=t}while(r>0)}function C(e,t,r){let n=0,i=e.length;const o=i/r;for(;i>t;){for(let r=t;r>0;--r)e[n+t]+=e[n],++n;i-=t}const s=e.slice();for(let t=0;t<o;++t)for(let n=0;n<r;++n)e[r*t+n]=s[(r-n-1)*o+t]}class E{decode(e,t){const r=this.decodeBlock(t),n=e.Predictor||1;if(1!==n){const t=!e.StripOffsets;return function(e,t,r,n,i,o){if(!t||1===t)return e;for(let e=0;e<i.length;++e){if(i[e]%8!=0)throw new Error("When decoding with predictor, only multiple of 8 bits are supported.");if(i[e]!==i[0])throw new Error("When decoding with predictor, all samples must have the same size.")}const s=i[0]/8,a=2===o?1:i.length;for(let o=0;o<n&&!(o*a*r*s>=e.byteLength);++o){let n;if(2===t){switch(i[0]){case 8:n=new Uint8Array(e,o*a*r*s,a*r*s);break;case 16:n=new Uint16Array(e,o*a*r*s,a*r*s/2);break;case 32:n=new Uint32Array(e,o*a*r*s,a*r*s/4);break;default:throw new Error(`Predictor 2 not allowed with ${i[0]} bits per sample.`)}k(n,a)}else 3===t&&(n=new Uint8Array(e,o*a*r*s,a*r*s),C(n,a,s))}return e}(r,n,t?e.TileWidth:e.ImageWidth,t?e.TileLength:e.RowsPerStrip||e.ImageLength,e.BitsPerSample,e.PlanarConfiguration)}return r}}class T extends E{decodeBlock(e){return e}}function x(e,t){for(let r=t.length-1;r>=0;r--)e.push(t[r]);return e}function A(e){const t=new Uint16Array(4093),r=new Uint8Array(4093);for(let e=0;e<=257;e++)t[e]=4096,r[e]=e;let n=258,i=9,o=0;function s(){n=258,i=9}function a(e){const t=function(e,t,r){const n=t%8,i=Math.floor(t/8),o=8-n,s=t+r-8*(i+1);let a=8*(i+2)-(t+r);const u=8*(i+2)-t;if(a=Math.max(0,a),i>=e.length)return console.warn("ran off the end of the buffer before finding EOI_CODE (end on input code)"),257;let c=e[i]&2**(8-n)-1;c<<=r-o;let l=c;if(i+1<e.length){let t=e[i+1]>>>a;t<<=Math.max(0,r-u),l+=t}if(s>8&&i+2<e.length){const n=8*(i+3)-(t+r);l+=e[i+2]>>>n}return l}(e,o,i);return o+=i,t}function u(e,i){return r[n]=i,t[n]=e,n++,n-1}function c(e){const n=[];for(let i=e;4096!==i;i=t[i])n.push(r[i]);return n}const l=[];s();const f=new Uint8Array(e);let h,d=a(f);for(;257!==d;){if(256===d){for(s(),d=a(f);256===d;)d=a(f);if(257===d)break;if(d>256)throw new Error("corrupted code at scanline "+d);x(l,c(d)),h=d}else if(d<n){const e=c(d);x(l,e),u(h,e[e.length-1]),h=d}else{const e=c(h);if(!e)throw new Error(`Bogus entry. Not in dictionary, ${h} / ${n}, position: ${o}`);x(l,e),l.push(e[e.length-1]),u(h,e[e.length-1]),h=d}n+1>=2**i&&(12===i?h=void 0:i++),d=a(f)}return new Uint8Array(l)}class O extends E{decodeBlock(e){return A(e).buffer}}const R=new Int32Array([0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63]);function I(e,t){let r=0;const n=[];let i=16;for(;i>0&&!e[i-1];)--i;n.push({children:[],index:0});let o,s=n[0];for(let a=0;a<i;a++){for(let i=0;i<e[a];i++){for(s=n.pop(),s.children[s.index]=t[r];s.index>0;)s=n.pop();for(s.index++,n.push(s);n.length<=a;)n.push(o={children:[],index:0}),s.children[s.index]=o.children,s=o;r++}a+1<i&&(n.push(o={children:[],index:0}),s.children[s.index]=o.children,s=o)}return n[0].children}function P(e,t,r,n,i,o,s,a,u){const{mcusPerLine:c,progressive:l}=r,f=t;let h=t,d=0,p=0;function g(){if(p>0)return p--,d>>p&1;if(d=e[h++],255===d){const t=e[h++];if(t)throw new Error("unexpected marker: "+(d<<8|t).toString(16))}return p=7,d>>>7}function m(e){let t,r=e;for(;null!==(t=g());){if(r=r[t],"number"==typeof r)return r;if("object"!=typeof r)throw new Error("invalid huffman sequence")}return null}function y(e){let t=e,r=0;for(;t>0;){const e=g();if(null===e)return;r=r<<1|e,--t}return r}function b(e){const t=y(e);return t>=1<<e-1?t:t+(-1<<e)+1}let w=0;let v,_=0;function S(e,t,r,n,i){const o=r%c,s=(r/c|0)*e.v+n,a=o*e.h+i;t(e,e.blocks[s][a])}function k(e,t,r){const n=r/e.blocksPerLine|0,i=r%e.blocksPerLine;t(e,e.blocks[n][i])}const C=n.length;let E,T,x,A,O,I;I=l?0===o?0===a?function(e,t){const r=m(e.huffmanTableDC),n=0===r?0:b(r)<<u;e.pred+=n,t[0]=e.pred}:function(e,t){t[0]|=g()<<u}:0===a?function(e,t){if(w>0)return void w--;let r=o;const n=s;for(;r<=n;){const n=m(e.huffmanTableAC),i=15&n,o=n>>4;if(0===i){if(o<15){w=y(o)+(1<<o)-1;break}r+=16}else{r+=o;t[R[r]]=b(i)*(1<<u),r++}}}:function(e,t){let r=o;const n=s;let i=0;for(;r<=n;){const n=R[r],o=t[n]<0?-1:1;switch(_){case 0:{const t=m(e.huffmanTableAC),r=15&t;if(i=t>>4,0===r)i<15?(w=y(i)+(1<<i),_=4):(i=16,_=1);else{if(1!==r)throw new Error("invalid ACn encoding");v=b(r),_=i?2:3}continue}case 1:case 2:t[n]?t[n]+=(g()<<u)*o:(i--,0===i&&(_=2===_?3:0));break;case 3:t[n]?t[n]+=(g()<<u)*o:(t[n]=v<<u,_=0);break;case 4:t[n]&&(t[n]+=(g()<<u)*o)}r++}4===_&&(w--,0===w&&(_=0))}:function(e,t){const r=m(e.huffmanTableDC),n=0===r?0:b(r);e.pred+=n,t[0]=e.pred;let i=1;for(;i<64;){const r=m(e.huffmanTableAC),n=15&r,o=r>>4;if(0===n){if(o<15)break;i+=16}else{i+=o;t[R[i]]=b(n),i++}}};let P,M,D=0;M=1===C?n[0].blocksPerLine*n[0].blocksPerColumn:c*r.mcusPerColumn;const L=i||M;for(;D<M;){for(T=0;T<C;T++)n[T].pred=0;if(w=0,1===C)for(E=n[0],O=0;O<L;O++)k(E,I,D),D++;else for(O=0;O<L;O++){for(T=0;T<C;T++){E=n[T];const{h:e,v:t}=E;for(x=0;x<t;x++)for(A=0;A<e;A++)S(E,I,D,x,A)}if(D++,D===M)break}if(p=0,P=e[h]<<8|e[h+1],P<65280)throw new Error("marker was not found");if(!(P>=65488&&P<=65495))break;h+=2}return h-f}function M(e,t){const r=[],{blocksPerLine:n,blocksPerColumn:i}=t,o=n<<3,s=new Int32Array(64),a=new Uint8Array(64);function u(e,r,n){const i=t.quantizationTable;let o,s,a,u,c,l,f,h,d;const p=n;let g;for(g=0;g<64;g++)p[g]=e[g]*i[g];for(g=0;g<8;++g){const e=8*g;0!==p[1+e]||0!==p[2+e]||0!==p[3+e]||0!==p[4+e]||0!==p[5+e]||0!==p[6+e]||0!==p[7+e]?(o=5793*p[0+e]+128>>8,s=5793*p[4+e]+128>>8,a=p[2+e],u=p[6+e],c=2896*(p[1+e]-p[7+e])+128>>8,h=2896*(p[1+e]+p[7+e])+128>>8,l=p[3+e]<<4,f=p[5+e]<<4,d=o-s+1>>1,o=o+s+1>>1,s=d,d=3784*a+1567*u+128>>8,a=1567*a-3784*u+128>>8,u=d,d=c-f+1>>1,c=c+f+1>>1,f=d,d=h+l+1>>1,l=h-l+1>>1,h=d,d=o-u+1>>1,o=o+u+1>>1,u=d,d=s-a+1>>1,s=s+a+1>>1,a=d,d=2276*c+3406*h+2048>>12,c=3406*c-2276*h+2048>>12,h=d,d=799*l+4017*f+2048>>12,l=4017*l-799*f+2048>>12,f=d,p[0+e]=o+h,p[7+e]=o-h,p[1+e]=s+f,p[6+e]=s-f,p[2+e]=a+l,p[5+e]=a-l,p[3+e]=u+c,p[4+e]=u-c):(d=5793*p[0+e]+512>>10,p[0+e]=d,p[1+e]=d,p[2+e]=d,p[3+e]=d,p[4+e]=d,p[5+e]=d,p[6+e]=d,p[7+e]=d)}for(g=0;g<8;++g){const e=g;0!==p[8+e]||0!==p[16+e]||0!==p[24+e]||0!==p[32+e]||0!==p[40+e]||0!==p[48+e]||0!==p[56+e]?(o=5793*p[0+e]+2048>>12,s=5793*p[32+e]+2048>>12,a=p[16+e],u=p[48+e],c=2896*(p[8+e]-p[56+e])+2048>>12,h=2896*(p[8+e]+p[56+e])+2048>>12,l=p[24+e],f=p[40+e],d=o-s+1>>1,o=o+s+1>>1,s=d,d=3784*a+1567*u+2048>>12,a=1567*a-3784*u+2048>>12,u=d,d=c-f+1>>1,c=c+f+1>>1,f=d,d=h+l+1>>1,l=h-l+1>>1,h=d,d=o-u+1>>1,o=o+u+1>>1,u=d,d=s-a+1>>1,s=s+a+1>>1,a=d,d=2276*c+3406*h+2048>>12,c=3406*c-2276*h+2048>>12,h=d,d=799*l+4017*f+2048>>12,l=4017*l-799*f+2048>>12,f=d,p[0+e]=o+h,p[56+e]=o-h,p[8+e]=s+f,p[48+e]=s-f,p[16+e]=a+l,p[40+e]=a-l,p[24+e]=u+c,p[32+e]=u-c):(d=5793*n[g+0]+8192>>14,p[0+e]=d,p[8+e]=d,p[16+e]=d,p[24+e]=d,p[32+e]=d,p[40+e]=d,p[48+e]=d,p[56+e]=d)}for(g=0;g<64;++g){const e=128+(p[g]+8>>4);r[g]=e<0?0:e>255?255:e}}for(let e=0;e<i;e++){const i=e<<3;for(let e=0;e<8;e++)r.push(new Uint8Array(o));for(let o=0;o<n;o++){u(t.blocks[e][o],a,s);let n=0;const c=o<<3;for(let e=0;e<8;e++){const t=r[i+e];for(let e=0;e<8;e++)t[c+e]=a[n++]}}}return r}class D{constructor(){this.jfif=null,this.adobe=null,this.quantizationTables=[],this.huffmanTablesAC=[],this.huffmanTablesDC=[],this.resetFrames()}resetFrames(){this.frames=[]}parse(e){let t=0;function r(){const r=e[t]<<8|e[t+1];return t+=2,r}function n(){const n=r(),i=e.subarray(t,t+n-2);return t+=i.length,i}function i(e){let t,r,n=0,i=0;for(r in e.components)e.components.hasOwnProperty(r)&&(t=e.components[r],n<t.h&&(n=t.h),i<t.v&&(i=t.v));const o=Math.ceil(e.samplesPerLine/8/n),s=Math.ceil(e.scanLines/8/i);for(r in e.components)if(e.components.hasOwnProperty(r)){t=e.components[r];const a=Math.ceil(Math.ceil(e.samplesPerLine/8)*t.h/n),u=Math.ceil(Math.ceil(e.scanLines/8)*t.v/i),c=o*t.h,l=s*t.v,f=[];for(let e=0;e<l;e++){const e=[];for(let t=0;t<c;t++)e.push(new Int32Array(64));f.push(e)}t.blocksPerLine=a,t.blocksPerColumn=u,t.blocks=f}e.maxH=n,e.maxV=i,e.mcusPerLine=o,e.mcusPerColumn=s}let o=r();if(65496!==o)throw new Error("SOI not found");for(o=r();65497!==o;){switch(o){case 65280:break;case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:case 65534:{const e=n();65504===o&&74===e[0]&&70===e[1]&&73===e[2]&&70===e[3]&&0===e[4]&&(this.jfif={version:{major:e[5],minor:e[6]},densityUnits:e[7],xDensity:e[8]<<8|e[9],yDensity:e[10]<<8|e[11],thumbWidth:e[12],thumbHeight:e[13],thumbData:e.subarray(14,14+3*e[12]*e[13])}),65518===o&&65===e[0]&&100===e[1]&&111===e[2]&&98===e[3]&&101===e[4]&&0===e[5]&&(this.adobe={version:e[6],flags0:e[7]<<8|e[8],flags1:e[9]<<8|e[10],transformCode:e[11]});break}case 65499:{const n=r()+t-2;for(;t<n;){const n=e[t++],i=new Int32Array(64);if(n>>4==0)for(let r=0;r<64;r++){i[R[r]]=e[t++]}else{if(n>>4!=1)throw new Error("DQT: invalid table spec");for(let e=0;e<64;e++){i[R[e]]=r()}}this.quantizationTables[15&n]=i}break}case 65472:case 65473:case 65474:{r();const n={extended:65473===o,progressive:65474===o,precision:e[t++],scanLines:r(),samplesPerLine:r(),components:{},componentsOrder:[]},s=e[t++];let a;for(let r=0;r<s;r++){a=e[t];const r=e[t+1]>>4,i=15&e[t+1],o=e[t+2];n.componentsOrder.push(a),n.components[a]={h:r,v:i,quantizationIdx:o},t+=3}i(n),this.frames.push(n);break}case 65476:{const n=r();for(let r=2;r<n;){const n=e[t++],i=new Uint8Array(16);let o=0;for(let r=0;r<16;r++,t++)i[r]=e[t],o+=i[r];const s=new Uint8Array(o);for(let r=0;r<o;r++,t++)s[r]=e[t];r+=17+o,n>>4==0?this.huffmanTablesDC[15&n]=I(i,s):this.huffmanTablesAC[15&n]=I(i,s)}break}case 65501:r(),this.resetInterval=r();break;case 65498:{r();const n=e[t++],i=[],o=this.frames[0];for(let r=0;r<n;r++){const r=o.components[e[t++]],n=e[t++];r.huffmanTableDC=this.huffmanTablesDC[n>>4],r.huffmanTableAC=this.huffmanTablesAC[15&n],i.push(r)}const s=e[t++],a=e[t++],u=e[t++],c=P(e,t,o,i,this.resetInterval,s,a,u>>4,15&u);t+=c;break}case 65535:255!==e[t]&&t--;break;default:if(255===e[t-3]&&e[t-2]>=192&&e[t-2]<=254){t-=3;break}throw new Error("unknown JPEG marker "+o.toString(16))}o=r()}}getResult(){const{frames:e}=this;if(0===this.frames.length)throw new Error("no frames were decoded");this.frames.length>1&&console.warn("more than one frame is not supported");for(let e=0;e<this.frames.length;e++){const t=this.frames[e].components;for(const e of Object.keys(t))t[e].quantizationTable=this.quantizationTables[t[e].quantizationIdx],delete t[e].quantizationIdx}const t=e[0],{components:r,componentsOrder:n}=t,i=[],o=t.samplesPerLine,s=t.scanLines;for(let e=0;e<n.length;e++){const o=r[n[e]];i.push({lines:M(0,o),scaleX:o.h/t.maxH,scaleY:o.v/t.maxV})}const a=new Uint8Array(o*s*i.length);let u=0;for(let e=0;e<s;++e)for(let t=0;t<o;++t)for(let r=0;r<i.length;++r){const n=i[r];a[u]=n.lines[0|e*n.scaleY][0|t*n.scaleX],++u}return a}}class L extends E{constructor(e){super(),this.reader=new D,e.JPEGTables&&this.reader.parse(e.JPEGTables)}decodeBlock(e){return this.reader.resetFrames(),this.reader.parse(new Uint8Array(e)),this.reader.getResult().buffer}}var U=r(38);class F extends E{decodeBlock(e){return Object(U.inflate)(new Uint8Array(e)).buffer}}class j extends E{decodeBlock(e){const t=new DataView(e),r=[];for(let n=0;n<e.byteLength;++n){let e=t.getInt8(n);if(e<0){const i=t.getUint8(n+1);e=-e;for(let t=0;t<=e;++t)r.push(i);n+=1}else{for(let i=0;i<=e;++i)r.push(t.getUint8(n+i+1));n+=e+1}}return new Uint8Array(r).buffer}}function B(e){switch(e.Compression){case void 0:case 1:return new T;case 5:return new O;case 6:throw new Error("old style JPEG compression is not supported.");case 7:return new L(e);case 8:case 32946:return new F;case 32773:return new j;default:throw new Error("Unknown compression method identifier: "+e.Compression)}}function N(e,t,r,n=1){return new(Object.getPrototypeOf(e).constructor)(t*r*n)}function G(e,t,r){return(1-r)*e+r*t}function q(e,t,r,n,i,o="nearest"){switch(o.toLowerCase()){case"nearest":return function(e,t,r,n,i){const o=t/n,s=r/i;return e.map(e=>{const a=N(e,n,i);for(let u=0;u<i;++u){const i=Math.min(Math.round(s*u),r-1);for(let r=0;r<n;++r){const s=Math.min(Math.round(o*r),t-1),c=e[i*t+s];a[u*n+r]=c}}return a})}(e,t,r,n,i);case"bilinear":case"linear":return function(e,t,r,n,i){const o=t/n,s=r/i;return e.map(e=>{const a=N(e,n,i);for(let u=0;u<i;++u){const i=s*u,c=Math.floor(i),l=Math.min(Math.ceil(i),r-1);for(let r=0;r<n;++r){const s=o*r,f=s%1,h=Math.floor(s),d=Math.min(Math.ceil(s),t-1),p=e[c*t+h],g=e[c*t+d],m=e[l*t+h],y=e[l*t+d],b=G(G(p,g,f),G(m,y,f),i%1);a[u*n+r]=b}}return a})}(e,t,r,n,i);default:throw new Error(`Unsupported resampling method: \'${o}\'`)}}function H(e,t,r,n,i,o,s="nearest"){switch(s.toLowerCase()){case"nearest":return function(e,t,r,n,i,o){const s=t/n,a=r/i,u=N(e,n,i,o);for(let c=0;c<i;++c){const i=Math.min(Math.round(a*c),r-1);for(let r=0;r<n;++r){const a=Math.min(Math.round(s*r),t-1);for(let s=0;s<o;++s){const l=e[i*t*o+a*o+s];u[c*n*o+r*o+s]=l}}}return u}(e,t,r,n,i,o);case"bilinear":case"linear":return function(e,t,r,n,i,o){const s=t/n,a=r/i,u=N(e,n,i,o);for(let c=0;c<i;++c){const i=a*c,l=Math.floor(i),f=Math.min(Math.ceil(i),r-1);for(let r=0;r<n;++r){const a=s*r,h=a%1,d=Math.floor(a),p=Math.min(Math.ceil(a),t-1);for(let s=0;s<o;++s){const a=e[l*t*o+d*o+s],g=e[l*t*o+p*o+s],m=e[f*t*o+d*o+s],y=e[f*t*o+p*o+s],b=G(G(a,g,h),G(m,y,h),i%1);u[c*n*o+r*o+s]=b}}}return u}(e,t,r,n,i,o);default:throw new Error(`Unsupported resampling method: \'${s}\'`)}}function z(e,t,r){let n=0;for(let i=t;i<r;++i)n+=e[i];return n}function K(e,t,r){switch(e){case 1:switch(t){case 8:return new Uint8Array(r);case 16:return new Uint16Array(r);case 32:return new Uint32Array(r)}break;case 2:switch(t){case 8:return new Int8Array(r);case 16:return new Int16Array(r);case 32:return new Int32Array(r)}break;case 3:switch(t){case 32:return new Float32Array(r);case 64:return new Float64Array(r)}}throw Error("Unsupported data format/bitsPerSample")}var W=class{constructor(e,t,r,n,i,o){this.fileDirectory=e,this.geoKeys=t,this.dataView=r,this.littleEndian=n,this.tiles=i?{}:null,this.isTiled=!e.StripOffsets;const s=e.PlanarConfiguration;if(this.planarConfiguration=void 0===s?1:s,1!==this.planarConfiguration&&2!==this.planarConfiguration)throw new Error("Invalid planar configuration.");this.source=o}getFileDirectory(){return this.fileDirectory}getGeoKeys(){return this.geoKeys}getWidth(){return this.fileDirectory.ImageWidth}getHeight(){return this.fileDirectory.ImageLength}getSamplesPerPixel(){return this.fileDirectory.SamplesPerPixel}getTileWidth(){return this.isTiled?this.fileDirectory.TileWidth:this.getWidth()}getTileHeight(){return this.isTiled?this.fileDirectory.TileLength:void 0!==this.fileDirectory.RowsPerStrip?Math.min(this.fileDirectory.RowsPerStrip,this.getHeight()):this.getHeight()}getBytesPerPixel(){let e=0;for(let t=0;t<this.fileDirectory.BitsPerSample.length;++t){const r=this.fileDirectory.BitsPerSample[t];if(r%8!=0)throw new Error(`Sample bit-width of ${r} is not supported.`);if(r!==this.fileDirectory.BitsPerSample[0])throw new Error("Differing size of samples in a pixel are not supported.");e+=r}return e/8}getSampleByteSize(e){if(e>=this.fileDirectory.BitsPerSample.length)throw new RangeError(`Sample index ${e} is out of range.`);const t=this.fileDirectory.BitsPerSample[e];if(t%8!=0)throw new Error(`Sample bit-width of ${t} is not supported.`);return t/8}getReaderForSample(e){const t=this.fileDirectory.SampleFormat?this.fileDirectory.SampleFormat[e]:1,r=this.fileDirectory.BitsPerSample[e];switch(t){case 1:switch(r){case 8:return DataView.prototype.getUint8;case 16:return DataView.prototype.getUint16;case 32:return DataView.prototype.getUint32}break;case 2:switch(r){case 8:return DataView.prototype.getInt8;case 16:return DataView.prototype.getInt16;case 32:return DataView.prototype.getInt32}break;case 3:switch(r){case 32:return DataView.prototype.getFloat32;case 64:return DataView.prototype.getFloat64}}throw Error("Unsupported data format/bitsPerSample")}getArrayForSample(e,t){return K(this.fileDirectory.SampleFormat?this.fileDirectory.SampleFormat[e]:1,this.fileDirectory.BitsPerSample[e],t)}async getTileOrStrip(e,t,r,n){const i=Math.ceil(this.getWidth()/this.getTileWidth()),o=Math.ceil(this.getHeight()/this.getTileHeight());let s;const{tiles:a}=this;let u,c;1===this.planarConfiguration?s=t*i+e:2===this.planarConfiguration&&(s=r*i*o+t*i+e),this.isTiled?(u=this.fileDirectory.TileOffsets[s],c=this.fileDirectory.TileByteCounts[s]):(u=this.fileDirectory.StripOffsets[s],c=this.fileDirectory.StripByteCounts[s]);const l=await this.source.fetch(u,c);let f;return null===a?f=n.decode(this.fileDirectory,l):a[s]||(f=n.decode(this.fileDirectory,l),a[s]=f),{x:e,y:t,sample:r,data:await f}}async _readRaster(e,t,r,n,i,o,s,a){const u=this.getTileWidth(),c=this.getTileHeight(),l=Math.max(Math.floor(e[0]/u),0),f=Math.min(Math.ceil(e[2]/u),Math.ceil(this.getWidth()/this.getTileWidth())),h=Math.max(Math.floor(e[1]/c),0),d=Math.min(Math.ceil(e[3]/c),Math.ceil(this.getHeight()/this.getTileHeight())),p=e[2]-e[0];let g=this.getBytesPerPixel();const m=[],y=[];for(let e=0;e<t.length;++e)1===this.planarConfiguration?m.push(z(this.fileDirectory.BitsPerSample,0,t[e])/8):m.push(0),y.push(this.getReaderForSample(t[e]));const b=[],{littleEndian:w}=this;for(let o=h;o<d;++o)for(let s=l;s<f;++s)for(let a=0;a<t.length;++a){const l=a,f=t[a];2===this.planarConfiguration&&(g=this.getSampleByteSize(f));const h=this.getTileOrStrip(s,o,f,i);b.push(h),h.then(i=>{const o=i.data,s=new DataView(o),a=i.y*c,f=i.x*u,h=(i.y+1)*c,d=(i.x+1)*u,b=y[l],v=Math.min(c,c-(h-e[3])),_=Math.min(u,u-(d-e[2]));for(let i=Math.max(0,e[1]-a);i<v;++i)for(let o=Math.max(0,e[0]-f);o<_;++o){const c=(i*u+o)*g,h=b.call(s,c+m[l],w);let d;n?(d=(i+a-e[1])*p*t.length+(o+f-e[0])*t.length+l,r[d]=h):(d=(i+a-e[1])*p+o+f-e[0],r[l][d]=h)}})}if(await Promise.all(b),o&&e[2]-e[0]!==o||s&&e[3]-e[1]!==s){let i;return i=n?H(r,e[2]-e[0],e[3]-e[1],o,s,t.length,a):q(r,e[2]-e[0],e[3]-e[1],o,s,a),i.width=o,i.height=s,i}return r.width=o||e[2]-e[0],r.height=s||e[3]-e[1],r}async readRasters({window:e,samples:t=[],interleave:r,pool:n=null,width:i,height:o,resampleMethod:s,fillValue:a}={}){const u=e||[0,0,this.getWidth(),this.getHeight()];if(u[0]>u[2]||u[1]>u[3])throw new Error("Invalid subsets");const c=(u[2]-u[0])*(u[3]-u[1]);if(t&&t.length){for(let e=0;e<t.length;++e)if(t[e]>=this.fileDirectory.SamplesPerPixel)return Promise.reject(new RangeError(`Invalid sample index \'${t[e]}\'.`))}else for(let e=0;e<this.fileDirectory.SamplesPerPixel;++e)t.push(e);let l;if(r){l=K(this.fileDirectory.SampleFormat?Math.max.apply(null,this.fileDirectory.SampleFormat):1,Math.max.apply(null,this.fileDirectory.BitsPerSample),c*t.length),a&&l.fill(a)}else{l=[];for(let e=0;e<t.length;++e){const r=this.getArrayForSample(t[e],c);Array.isArray(a)&&e<a.length?r.fill(a[e]):a&&!Array.isArray(a)&&r.fill(a),l.push(r)}}const f=n||B(this.fileDirectory);return await this._readRaster(u,t,l,r,f,i,o,s)}async readRGB({window:e,pool:t=null,width:r,height:n,resampleMethod:i,enableAlpha:o=!1}={}){const s=e||[0,0,this.getWidth(),this.getHeight()];if(s[0]>s[2]||s[1]>s[3])throw new Error("Invalid subsets");const a=this.fileDirectory.PhotometricInterpretation;if(a===d.RGB){let i=[0,1,2];if(this.fileDirectory.ExtraSamples!==p.Unspecified&&o){i=[];for(let e=0;e<this.fileDirectory.BitsPerSample.length;e+=1)i.push(e)}return this.readRasters({window:e,interleave:!0,samples:i,pool:t,width:r,height:n})}let u;switch(a){case d.WhiteIsZero:case d.BlackIsZero:case d.Palette:u=[0];break;case d.CMYK:u=[0,1,2,3];break;case d.YCbCr:case d.CIELab:u=[0,1,2];break;default:throw new Error("Invalid or unsupported photometric interpretation.")}const c={window:s,interleave:!0,samples:u,pool:t,width:r,height:n,resampleMethod:i},{fileDirectory:l}=this,f=await this.readRasters(c),h=2**this.fileDirectory.BitsPerSample[0];let g;switch(a){case d.WhiteIsZero:g=y(f,h);break;case d.BlackIsZero:g=b(f,h);break;case d.Palette:g=w(f,l.ColorMap);break;case d.CMYK:g=v(f);break;case d.YCbCr:g=_(f);break;case d.CIELab:g=S(f);break;default:throw new Error("Unsupported photometric interpretation.")}return g.width=f.width,g.height=f.height,g}getTiePoints(){if(!this.fileDirectory.ModelTiepoint)return[];const e=[];for(let t=0;t<this.fileDirectory.ModelTiepoint.length;t+=6)e.push({i:this.fileDirectory.ModelTiepoint[t],j:this.fileDirectory.ModelTiepoint[t+1],k:this.fileDirectory.ModelTiepoint[t+2],x:this.fileDirectory.ModelTiepoint[t+3],y:this.fileDirectory.ModelTiepoint[t+4],z:this.fileDirectory.ModelTiepoint[t+5]});return e}getGDALMetadata(e=null){const t={};if(!this.fileDirectory.GDAL_METADATA)return null;const r=this.fileDirectory.GDAL_METADATA,n=s()(r.substring(0,r.length-1));if(!n[0].tagName)throw new Error("Failed to parse GDAL metadata XML.");const i=n[0];if("GDALMetadata"!==i.tagName)throw new Error("Unexpected GDAL metadata XML tag.");let o=i.children.filter(e=>"Item"===e.tagName);e&&(o=o.filter(t=>Number(t.attributes.sample)===e));for(let e=0;e<o.length;++e){const r=o[e];t[r.attributes.name]=r.children[0]}return t}getGDALNoData(){if(!this.fileDirectory.GDAL_NODATA)return null;const e=this.fileDirectory.GDAL_NODATA;return Number(e.substring(0,e.length-1))}getOrigin(){const e=this.fileDirectory.ModelTiepoint,t=this.fileDirectory.ModelTransformation;if(e&&6===e.length)return[e[3],e[4],e[5]];if(t)return[t[3],t[7],t[11]];throw new Error("The image does not have an affine transformation.")}getResolution(e=null){const t=this.fileDirectory.ModelPixelScale,r=this.fileDirectory.ModelTransformation;if(t)return[t[0],-t[1],t[2]];if(r)return[r[0],r[5],r[10]];if(e){const[t,r,n]=e.getResolution();return[t*e.getWidth()/this.getWidth(),r*e.getHeight()/this.getHeight(),n*e.getWidth()/this.getWidth()]}throw new Error("The image does not have an affine transformation.")}pixelIsArea(){return 1===this.geoKeys.GTRasterTypeGeoKey}getBoundingBox(){const e=this.getOrigin(),t=this.getResolution(),r=e[0],n=e[1],i=r+t[0]*this.getWidth(),o=n+t[1]*this.getHeight();return[Math.min(r,i),Math.min(n,o),Math.max(r,i),Math.max(n,o)]}};class V{constructor(e){this._dataView=new DataView(e)}get buffer(){return this._dataView.buffer}getUint64(e,t){const r=this.getUint32(e,t),n=this.getUint32(e+4,t);let i;if(t){if(i=r+2**32*n,!Number.isSafeInteger(i))throw new Error(i+" exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues");return i}if(i=2**32*r+n,!Number.isSafeInteger(i))throw new Error(i+" exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues");return i}getInt64(e,t){let r=0;const n=(128&this._dataView.getUint8(e+(t?7:0)))>0;let i=!0;for(let o=0;o<8;o++){let s=this._dataView.getUint8(e+(t?o:7-o));n&&(i?0!==s&&(s=255&~(s-1),i=!1):s=255&~s),r+=s*256**o}return n&&(r=-r),r}getUint8(e,t){return this._dataView.getUint8(e,t)}getInt8(e,t){return this._dataView.getInt8(e,t)}getUint16(e,t){return this._dataView.getUint16(e,t)}getInt16(e,t){return this._dataView.getInt16(e,t)}getUint32(e,t){return this._dataView.getUint32(e,t)}getInt32(e,t){return this._dataView.getInt32(e,t)}getFloat32(e,t){return this._dataView.getFloat32(e,t)}getFloat64(e,t){return this._dataView.getFloat64(e,t)}}class Y{constructor(e,t,r,n){this._dataView=new DataView(e),this._sliceOffset=t,this._littleEndian=r,this._bigTiff=n}get sliceOffset(){return this._sliceOffset}get sliceTop(){return this._sliceOffset+this.buffer.byteLength}get littleEndian(){return this._littleEndian}get bigTiff(){return this._bigTiff}get buffer(){return this._dataView.buffer}covers(e,t){return this.sliceOffset<=e&&this.sliceTop>=e+t}readUint8(e){return this._dataView.getUint8(e-this._sliceOffset,this._littleEndian)}readInt8(e){return this._dataView.getInt8(e-this._sliceOffset,this._littleEndian)}readUint16(e){return this._dataView.getUint16(e-this._sliceOffset,this._littleEndian)}readInt16(e){return this._dataView.getInt16(e-this._sliceOffset,this._littleEndian)}readUint32(e){return this._dataView.getUint32(e-this._sliceOffset,this._littleEndian)}readInt32(e){return this._dataView.getInt32(e-this._sliceOffset,this._littleEndian)}readFloat32(e){return this._dataView.getFloat32(e-this._sliceOffset,this._littleEndian)}readFloat64(e){return this._dataView.getFloat64(e-this._sliceOffset,this._littleEndian)}readUint64(e){const t=this.readUint32(e),r=this.readUint32(e+4);let n;if(this._littleEndian){if(n=t+2**32*r,!Number.isSafeInteger(n))throw new Error(n+" exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues");return n}if(n=2**32*t+r,!Number.isSafeInteger(n))throw new Error(n+" exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues");return n}readInt64(e){let t=0;const r=(128&this._dataView.getUint8(e+(this._littleEndian?7:0)))>0;let n=!0;for(let i=0;i<8;i++){let o=this._dataView.getUint8(e+(this._littleEndian?i:7-i));r&&(n?0!==o&&(o=255&~(o-1),n=!1):o=255&~o),t+=o*256**i}return r&&(t=-t),t}readOffset(e){return this._bigTiff?this.readUint64(e):this.readUint32(e)}}var Z=r(33),$=r(3),X=r(12),Q=r(18),J=r.n(Q),ee=r(42),te=r.n(ee),re=r(17),ne=r.n(re);class ie{constructor(e,{blockSize:t=65536}={}){this.retrievalFunction=e,this.blockSize=t,this.blockRequests=new Map,this.blocks=new Map,this.blockIdsAwaitingRequest=null}async fetch(e,t,r=!1){const n=e+t,i=[],o=[],s=[];for(let t=Math.floor(e/this.blockSize)*this.blockSize;t<n;t+=this.blockSize){const e=Math.floor(t/this.blockSize);this.blocks.has(e)||this.blockRequests.has(e)||o.push(e),this.blockRequests.has(e)&&s.push(this.blockRequests.get(e)),i.push(e)}if(this.blockIdsAwaitingRequest)for(let e=0;e<o.length;++e){const t=o[e];this.blockIdsAwaitingRequest.add(t)}else this.blockIdsAwaitingRequest=new Set(o);if(r||await async function(e){return new Promise(t=>setTimeout(t,e))}(),this.blockIdsAwaitingRequest){const e=function(e){if(0===e.length)return[];const t=[];let r=[];t.push(r);for(let n=0;n<e.length;++n)0===n||e[n]===e[n-1]+1?r.push(e[n]):(r=[e[n]],t.push(r));return t}(Array.from(this.blockIdsAwaitingRequest).sort());for(const t of e){const e=this.requestData(t[0]*this.blockSize,t.length*this.blockSize);for(let r=0;r<t.length;++r){const n=t[r];this.blockRequests.set(n,(async()=>{const t=await e,i=r*this.blockSize,o=Math.min(i+this.blockSize,t.data.byteLength),s=t.data.slice(i,o);this.blockRequests.delete(n),this.blocks.set(n,{data:s,offset:t.offset+i,length:s.byteLength,top:t.offset+o})})())}}this.blockIdsAwaitingRequest=null}const a=[];for(const e of o)this.blockRequests.has(e)&&a.push(this.blockRequests.get(e));await Promise.all(a),await Promise.all(s);return function(e,t,r){const n=t+r,i=new ArrayBuffer(r),o=new Uint8Array(i);for(const r of e){const e=r.offset-t,i=r.top-n;let s,a=0,u=0;e<0?a=-e:e>0&&(u=e),s=i<0?r.length-a:n-r.offset-a;const c=new Uint8Array(r.data,a,s);o.set(c,u)}return i}(i.map(e=>this.blocks.get(e)),e,t)}async requestData(e,t){const r=await this.retrievalFunction(e,t);return r.length?r.length!==r.data.byteLength&&(r.data=r.data.slice(0,r.length)):r.length=r.data.byteLength,r.top=r.offset+r.length,r}}function oe(e,t){const{forceXHR:r}=t;if("function"==typeof fetch&&!r)return function(e,{headers:t={},blockSize:r}={}){return new ie(async(r,n)=>{const i=await fetch(e,{headers:{...t,Range:`bytes=${r}-${r+n-1}`}});if(i.ok){if(206===i.status){return{data:i.arrayBuffer?await i.arrayBuffer():(await i.buffer()).buffer,offset:r,length:n}}{const e=i.arrayBuffer?await i.arrayBuffer():(await i.buffer()).buffer;return{data:e,offset:0,length:e.byteLength}}}throw new Error("Error fetching data.")},{blockSize:r})}(e,t);if("undefined"!=typeof XMLHttpRequest)return function(e,{headers:t={},blockSize:r}={}){return new ie(async(r,n)=>new Promise((i,o)=>{const s=new XMLHttpRequest;s.open("GET",e),s.responseType="arraybuffer";const a={...t,Range:`bytes=${r}-${r+n-1}`};for(const[e,t]of Object.entries(a))s.setRequestHeader(e,t);s.onload=()=>{const e=s.response;206===s.status?i({data:e,offset:r,length:n}):i({data:e,offset:0,length:e.byteLength})},s.onerror=o,s.send()}),{blockSize:r})}(e,t);if(J.a.get)return function(e,{headers:t={},blockSize:r}={}){return new ie(async(r,n)=>new Promise((i,o)=>{const s=ne.a.parse(e);("http:"===s.protocol?J.a:te.a).get({...s,headers:{...t,Range:`bytes=${r}-${r+n-1}`}},e=>{const t=[];e.on("data",e=>{t.push(e)}),e.on("end",()=>{const e=$.Buffer.concat(t).buffer;i({data:e,offset:r,length:e.byteLength})})}).on("error",o)}),{blockSize:r})}(e,t);throw new Error("No remote source available")}function se(e){const t=function(e,t,r){return new Promise((n,i)=>{Object(X.open)(e,t,r,(e,t)=>{e?i(e):n(t)})})}(e,"r");return{async fetch(e,r){const n=await t,{buffer:i}=await function(...e){return new Promise((t,r)=>{Object(X.read)(...e,(e,n,i)=>{e?r(e):t({bytesRead:n,buffer:i})})})}(n,$.Buffer.alloc(r),0,r,e);return i.buffer},async close(){const e=await t;return await function(e){return new Promise((t,r)=>{Object(X.close)(e,e=>{e?r(e):t()})})}(e)}}}function ae(e,t){for(const r in t)t.hasOwnProperty(r)&&(e[r]=t[r])}function ue(e,t){if(e.length<t.length)return!1;return e.substr(e.length-t.length)===t}function ce(e){const t={};for(const r in e)if(e.hasOwnProperty(r)){t[e[r]]=r}return t}function le(e,t){const r=[];for(let n=0;n<e;n++)r.push(t(n));return r}const fe=ce(a),he=ce(g),de={};ae(de,fe),ae(de,he);const pe=ce(f),ge={nextZero:(e,t)=>{let r=t;for(;0!==e[r];)r++;return r},readUshort:(e,t)=>e[t]<<8|e[t+1],readShort:(e,t)=>{const r=ge.ui8;return r[0]=e[t+1],r[1]=e[t+0],ge.i16[0]},readInt:(e,t)=>{const r=ge.ui8;return r[0]=e[t+3],r[1]=e[t+2],r[2]=e[t+1],r[3]=e[t+0],ge.i32[0]},readUint:(e,t)=>{const r=ge.ui8;return r[0]=e[t+3],r[1]=e[t+2],r[2]=e[t+1],r[3]=e[t+0],ge.ui32[0]},readASCII:(e,t,r)=>r.map(r=>String.fromCharCode(e[t+r])).join(""),readFloat:(e,t)=>{const r=ge.ui8;return le(4,n=>{r[n]=e[t+3-n]}),ge.fl32[0]},readDouble:(e,t)=>{const r=ge.ui8;return le(8,n=>{r[n]=e[t+7-n]}),ge.fl64[0]},writeUshort:(e,t,r)=>{e[t]=r>>8&255,e[t+1]=255&r},writeUint:(e,t,r)=>{e[t]=r>>24&255,e[t+1]=r>>16&255,e[t+2]=r>>8&255,e[t+3]=r>>0&255},writeASCII:(e,t,r)=>{le(r.length,n=>{e[t+n]=r.charCodeAt(n)})},ui8:new Uint8Array(8)};ge.fl64=new Float64Array(ge.ui8.buffer),ge.writeDouble=(e,t,r)=>{ge.fl64[0]=r,le(8,r=>{e[t+r]=ge.ui8[7-r]})};const me=e=>{const t=new Uint8Array(1e3);let r=4;const n=ge;t[0]=77,t[1]=77,t[3]=42;let i=8;if(n.writeUint(t,r,i),r+=4,e.forEach((r,o)=>{const s=((e,t,r,n)=>{let i=r;const o=Object.keys(n).filter(e=>null!=e&&"undefined"!==e);e.writeUshort(t,i,o.length),i+=2;let s=i+12*o.length+4;for(const r of o){let o=null;"number"==typeof r?o=r:"string"==typeof r&&(o=parseInt(r,10));const a=c[o],u=pe[a];if(null==a||void 0===a||void 0===a)throw new Error("unknown type of tag: "+o);let l=n[r];if(void 0===l)throw new Error("failed to get value for key "+r);"ASCII"===a&&"string"==typeof l&&!1===ue(l,"\\0")&&(l+="\\0");const f=l.length;e.writeUshort(t,i,o),i+=2,e.writeUshort(t,i,u),i+=2,e.writeUint(t,i,f),i+=4;let h=[-1,1,1,2,4,8,0,0,0,0,0,0,8][u]*f,d=i;h>4&&(e.writeUint(t,i,s),d=s),"ASCII"===a?e.writeASCII(t,d,l):"SHORT"===a?le(f,r=>{e.writeUshort(t,d+2*r,l[r])}):"LONG"===a?le(f,r=>{e.writeUint(t,d+4*r,l[r])}):"RATIONAL"===a?le(f,r=>{e.writeUint(t,d+8*r,Math.round(1e4*l[r])),e.writeUint(t,d+8*r+4,1e4)}):"DOUBLE"===a&&le(f,r=>{e.writeDouble(t,d+8*r,l[r])}),h>4&&(h+=1&h,s+=h),i+=4}return[i,s]})(n,t,i,r);i=s[1],o<e.length-1&&n.writeUint(t,s[0],i)}),t.slice)return t.slice(0,i).buffer;const o=new Uint8Array(i);for(let e=0;e<i;e++)o[e]=t[e];return o.buffer},ye=[["Compression",1],["PlanarConfiguration",1],["XPosition",0],["YPosition",0],["ResolutionUnit",1],["ExtraSamples",0],["GeoAsciiParams","WGS 84\\0"],["ModelTiepoint",[0,0,0,-180,90,0]],["GTModelTypeGeoKey",2],["GTRasterTypeGeoKey",1],["GeographicTypeGeoKey",4326],["GeogCitationGeoKey","WGS 84"]];function be(e,t){let r,n,i,o;"number"==typeof e[0]?(r=t.height||t.ImageLength,i=t.width||t.ImageWidth,n=e.length/(r*i),o=e):(n=e.length,r=e[0].length,i=e[0][0].length,o=[],le(r,t=>{le(i,r=>{le(n,n=>{o.push(e[n][t][r])})})})),t.ImageLength=r,delete t.height,t.ImageWidth=i,delete t.width,t.BitsPerSample||(t.BitsPerSample=le(n,()=>8)),ye.forEach(e=>{const r=e[0];if(!t[r]){const n=e[1];t[r]=n}}),t.PhotometricInterpretation||(t.PhotometricInterpretation=3===t.BitsPerSample.length?2:1),t.SamplesPerPixel||(t.SamplesPerPixel=[n]),t.StripByteCounts||(t.StripByteCounts=[n*r*i]),t.ModelPixelScale||(t.ModelPixelScale=[360/i,180/r,0]),t.SampleFormat||(t.SampleFormat=le(n,()=>1));const s=Object.keys(t).filter(e=>ue(e,"GeoKey")).sort((e,t)=>de[e]-de[t]);if(!t.GeoKeyDirectory){const e=[1,1,0,s.length];s.forEach(r=>{const n=Number(de[r]);let i,o,s;e.push(n),"SHORT"===c[n]?(i=1,o=0,s=t[r]):"GeogCitationGeoKey"===r?(i=t.GeoAsciiParams.length,o=Number(de.GeoAsciiParams),s=0):console.log("[geotiff.js] couldn\'t get TIFFTagLocation for "+r),e.push(o),e.push(i),e.push(s)}),t.GeoKeyDirectory=e}for(const e in s)s.hasOwnProperty(e)&&delete t[e];["Compression","ExtraSamples","GeographicTypeGeoKey","GTModelTypeGeoKey","GTRasterTypeGeoKey","ImageLength","ImageWidth","PhotometricInterpretation","PlanarConfiguration","ResolutionUnit","SamplesPerPixel","XPosition","YPosition"].forEach(e=>{var r;t[e]&&(t[e]=(r=t[e],Array.isArray(r)?r:[r]))});const a=(e=>{const t={};for(const r in e)"StripOffsets"!==r&&(de[r]||console.error(r,"not in name2code:",Object.keys(de)),t[de[r]]=e[r]);return t})(t);return((e,t,r,n)=>{if(null==r)throw new Error("you passed into encodeImage a width of type "+r);if(null==t)throw new Error("you passed into encodeImage a width of type "+t);const i={256:[t],257:[r],273:[1e3],278:[r],305:"geotiff.js"};if(n)for(const e in n)n.hasOwnProperty(e)&&(i[e]=n[e]);const o=new Uint8Array(me([i])),s=new Uint8Array(e),a=i[277],u=new Uint8Array(1e3+t*r*a);return le(o.length,e=>{u[e]=o[e]}),function(e,t){const{length:r}=e;for(let n=0;n<r;n++)t(e[n],n)}(s,(e,t)=>{u[1e3+t]=e}),u.buffer})(o,i,r,a)}class we{log(){}info(){}warn(){}error(){}time(){}timeEnd(){}}let ve=new we;function _e(e=new we){ve=e}function Se(e){switch(e){case h.BYTE:case h.ASCII:case h.SBYTE:case h.UNDEFINED:return 1;case h.SHORT:case h.SSHORT:return 2;case h.LONG:case h.SLONG:case h.FLOAT:case h.IFD:return 4;case h.RATIONAL:case h.SRATIONAL:case h.DOUBLE:case h.LONG8:case h.SLONG8:case h.IFD8:return 8;default:throw new RangeError("Invalid field type: "+e)}}function ke(e,t,r,n){let i=null,o=null;const s=Se(t);switch(t){case h.BYTE:case h.ASCII:case h.UNDEFINED:i=new Uint8Array(r),o=e.readUint8;break;case h.SBYTE:i=new Int8Array(r),o=e.readInt8;break;case h.SHORT:i=new Uint16Array(r),o=e.readUint16;break;case h.SSHORT:i=new Int16Array(r),o=e.readInt16;break;case h.LONG:case h.IFD:i=new Uint32Array(r),o=e.readUint32;break;case h.SLONG:i=new Int32Array(r),o=e.readInt32;break;case h.LONG8:case h.IFD8:i=new Array(r),o=e.readUint64;break;case h.SLONG8:i=new Array(r),o=e.readInt64;break;case h.RATIONAL:i=new Uint32Array(2*r),o=e.readUint32;break;case h.SRATIONAL:i=new Int32Array(2*r),o=e.readInt32;break;case h.FLOAT:i=new Float32Array(r),o=e.readFloat32;break;case h.DOUBLE:i=new Float64Array(r),o=e.readFloat64;break;default:throw new RangeError("Invalid field type: "+t)}if(t!==h.RATIONAL&&t!==h.SRATIONAL)for(let t=0;t<r;++t)i[t]=o.call(e,n+t*s);else for(let t=0;t<r;t+=2)i[t]=o.call(e,n+t*s),i[t+1]=o.call(e,n+(t*s+4));return t===h.ASCII?String.fromCharCode.apply(null,i):i}class Ce{constructor(e,t,r){this.fileDirectory=e,this.geoKeyDirectory=t,this.nextIFDByteOffset=r}}class Ee extends Error{constructor(e){super("No image at index "+e),this.index=e}}class Te{async readRasters(e={}){const{window:t,width:r,height:n}=e;let{resX:i,resY:o,bbox:s}=e;const a=await this.getImage();let u=a;const c=await this.getImageCount(),l=a.getBoundingBox();if(t&&s)throw new Error(\'Both "bbox" and "window" passed.\');if(r||n){if(t){const[e,r]=a.getOrigin(),[n,i]=a.getResolution();s=[e+t[0]*n,r+t[1]*i,e+t[2]*n,r+t[3]*i]}const e=s||l;if(r){if(i)throw new Error("Both width and resX passed");i=(e[2]-e[0])/r}if(n){if(o)throw new Error("Both width and resY passed");o=(e[3]-e[1])/n}}if(i||o){const e=[];for(let t=0;t<c;++t){const r=await this.getImage(t),{SubfileType:n,NewSubfileType:i}=r.fileDirectory;(0===t||2===n||1&i)&&e.push(r)}e.sort((e,t)=>e.getWidth()-t.getWidth());for(let t=0;t<e.length;++t){const r=e[t],n=(l[2]-l[0])/r.getWidth(),s=(l[3]-l[1])/r.getHeight();if(u=r,i&&i>n||o&&o>s)break}}let f=t;if(s){const[e,t]=a.getOrigin(),[r,n]=u.getResolution(a);f=[Math.round((s[0]-e)/r),Math.round((s[1]-t)/n),Math.round((s[2]-e)/r),Math.round((s[3]-t)/n)],f=[Math.min(f[0],f[2]),Math.min(f[1],f[3]),Math.max(f[0],f[2]),Math.max(f[1],f[3])]}return u.readRasters({...e,window:f})}}class xe extends Te{constructor(e,t,r,n,i={}){super(),this.source=e,this.littleEndian=t,this.bigTiff=r,this.firstIFDOffset=n,this.cache=i.cache||!1,this.ifdRequests=[],this.ghostValues=null}async getSlice(e,t){const r=this.bigTiff?4048:1024;return new Y(await this.source.fetch(e,void 0!==t?t:r),e,this.littleEndian,this.bigTiff)}async parseFileDirectoryAt(e){const t=this.bigTiff?20:12,r=this.bigTiff?8:2;let n=await this.getSlice(e);const i=this.bigTiff?n.readUint64(e):n.readUint16(e),o=i*t+(this.bigTiff?16:6);n.covers(e,o)||(n=await this.getSlice(e,o));const s={};let u=e+(this.bigTiff?8:2);for(let e=0;e<i;u+=t,++e){const e=n.readUint16(u),t=n.readUint16(u+2),r=this.bigTiff?n.readUint64(u+4):n.readUint32(u+4);let i,o;const c=Se(t),f=u+(this.bigTiff?12:8);if(c*r<=(this.bigTiff?8:4))i=ke(n,t,r,f);else{const e=n.readOffset(f),o=Se(t)*r;if(n.covers(e,o))i=ke(n,t,r,e);else{i=ke(await this.getSlice(e,o),t,r,e)}}o=1===r&&-1===l.indexOf(e)&&t!==h.RATIONAL&&t!==h.SRATIONAL?i[0]:i,s[a[e]]=o}const c=function(e){const t=e.GeoKeyDirectory;if(!t)return null;const r={};for(let n=4;n<=4*t[3];n+=4){const i=g[t[n]],o=t[n+1]?a[t[n+1]]:null,s=t[n+2],u=t[n+3];let c=null;if(o){if(c=e[o],null==c)throw new Error(`Could not get value of geoKey \'${i}\'.`);"string"==typeof c?c=c.substring(u,u+s-1):c.subarray&&(c=c.subarray(u,u+s),1===s&&(c=c[0]))}else c=u;r[i]=c}return r}(s),f=n.readOffset(e+r+t*i);return new Ce(s,c,f)}async requestIFD(e){if(this.ifdRequests[e])return this.ifdRequests[e];if(0===e)return this.ifdRequests[e]=this.parseFileDirectoryAt(this.firstIFDOffset),this.ifdRequests[e];if(!this.ifdRequests[e-1])try{this.ifdRequests[e-1]=this.requestIFD(e-1)}catch(t){if(t instanceof Ee)throw new Ee(e);throw t}return this.ifdRequests[e]=(async()=>{const t=await this.ifdRequests[e-1];if(0===t.nextIFDByteOffset)throw new Ee(e);return this.parseFileDirectoryAt(t.nextIFDByteOffset)})(),this.ifdRequests[e]}async getImage(e=0){const t=await this.requestIFD(e);return new W(t.fileDirectory,t.geoKeyDirectory,this.dataView,this.littleEndian,this.cache,this.source)}async getImageCount(){let e=0,t=!0;for(;t;)try{await this.requestIFD(e),++e}catch(e){if(!(e instanceof Ee))throw e;t=!1}return e}async getGhostValues(){const e=this.bigTiff?16:8;if(this.ghostValues)return this.ghostValues;const t="GDAL_STRUCTURAL_METADATA_SIZE=",r=t.length+100;let n=await this.getSlice(e,r);if(t===ke(n,h.ASCII,t.length,e)){const t=ke(n,h.ASCII,r,e).split("\\n")[0],i=Number(t.split("=")[1].split(" ")[0])+t.length;i>r&&(n=await this.getSlice(e,i));const o=ke(n,h.ASCII,i,e);this.ghostValues={},o.split("\\n").filter(e=>e.length>0).map(e=>e.split("=")).forEach(([e,t])=>{this.ghostValues[e]=t})}return this.ghostValues}static async fromSource(e,t){const r=await e.fetch(0,1024),n=new V(r),i=n.getUint16(0,0);let o;if(18761===i)o=!0;else{if(19789!==i)throw new TypeError("Invalid byte order value.");o=!1}const s=n.getUint16(2,o);let a;if(42===s)a=!1;else{if(43!==s)throw new TypeError("Invalid magic number.");a=!0;if(8!==n.getUint16(4,o))throw new Error("Unsupported offset byte-size.")}const u=a?n.getUint64(8,o):n.getUint32(4,o);return new xe(e,o,a,u,t)}close(){return"function"==typeof this.source.close&&this.source.close()}}t.default=xe;class Ae extends Te{constructor(e,t){super(),this.mainFile=e,this.overviewFiles=t,this.imageFiles=[e].concat(t),this.fileDirectoriesPerFile=null,this.fileDirectoriesPerFileParsing=null,this.imageCount=null}async parseFileDirectoriesPerFile(){const e=[this.mainFile.parseFileDirectoryAt(this.mainFile.firstIFDOffset)].concat(this.overviewFiles.map(e=>e.parseFileDirectoryAt(e.firstIFDOffset)));return this.fileDirectoriesPerFile=await Promise.all(e),this.fileDirectoriesPerFile}async getImage(e=0){await this.getImageCount(),await this.parseFileDirectoriesPerFile();let t=0,r=0;for(let n=0;n<this.imageFiles.length;n++){const i=this.imageFiles[n];for(let o=0;o<this.imageCounts[n];o++){if(e===t){const e=await i.requestIFD(r);return new W(e.fileDirectory,i.geoKeyDirectory,i.dataView,i.littleEndian,i.cache,i.source)}t++,r++}r=0}throw new RangeError("Invalid image index")}async getImageCount(){if(null!==this.imageCount)return this.imageCount;const e=[this.mainFile.getImageCount()].concat(this.overviewFiles.map(e=>e.getImageCount()));return this.imageCounts=await Promise.all(e),this.imageCount=this.imageCounts.reduce((e,t)=>e+t,0),this.imageCount}}async function Oe(e,t={}){return xe.fromSource(oe(e,t))}async function Re(e){return xe.fromSource(function(e){return{fetch:async(t,r)=>e.slice(t,t+r)}}(e))}async function Ie(e){return xe.fromSource(se(e))}async function Pe(e){return xe.fromSource((t=e,{fetch:async(e,r)=>new Promise((n,i)=>{const o=t.slice(e,e+r),s=new FileReader;s.onload=e=>n(e.target.result),s.onerror=i,s.readAsArrayBuffer(o)})}));var t}async function Me(e,t=[],r={}){const n=await xe.fromSource(oe(e,r)),i=await Promise.all(t.map(e=>xe.fromSource(oe(e,r))));return new Ae(n,i)}async function De(e,t){return be(e,t)}},function(e,t,r){"use strict";r.d(t,"a",(function(){return i}));var n=r(8);Object(n.b)().blob;const i=Object(n.b)().default},,function(e,t,r){"use strict";var n=r(13),i=r(39);var o=function(e){"function"==typeof e?e():e&&"function"==typeof e.unsubscribe&&e.unsubscribe()};t.a=function(e){const t=new i.a;let r,s=0;return new n.a(n=>{r||(r=e.subscribe(t));const i=t.subscribe(n);return s++,()=>{s--,i.unsubscribe(),0===s&&(o(r),r=void 0)}})}}]);',null)};},function(e,t,r){var n=window.URL||window.webkitURL;e.exports=function(e,t){try{try{var r;try{(r=new(window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder)).append(e),r=r.getBlob();}catch(t){r=new Blob([e]);}return new Worker(n.createObjectURL(r))}catch(t){return new Worker("data:application/javascript,"+encodeURIComponent(e))}}catch(e){if(!t)throw Error("Inline worker is not supported");return new Worker(t)}};},function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0});var n=function(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,t){var r=[],n=!0,i=!1,o=void 0;try{for(var s,a=e[Symbol.iterator]();!(n=(s=a.next()).done)&&(r.push(s.value),!t||r.length!==t);n=!0);}catch(e){i=!0,o=e;}finally{try{!n&&a.return&&a.return();}finally{if(i)throw o}}return r}(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")},i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};t.default=function(e,t){return new Promise((function(r,c){try{t&&console.log("starting parseData with",e),t&&console.log("\tGeoTIFF:","undefined"==typeof GeoTIFF?"undefined":i(GeoTIFF));var l={},f=void 0,h=void 0;if("object"===e.rasterType)l.values=e.data,l.height=f=e.metadata.height||l.values[0].length,l.width=h=e.metadata.width||l.values[0][0].length,l.pixelHeight=e.metadata.pixelHeight,l.pixelWidth=e.metadata.pixelWidth,l.projection=e.metadata.projection,l.xmin=e.metadata.xmin,l.ymax=e.metadata.ymax,l.noDataValue=e.metadata.noDataValue,l.numberOfRasters=l.values.length,l.xmax=l.xmin+l.width*l.pixelWidth,l.ymin=l.ymax-l.height*l.pixelHeight,l._data=null,r(u(l));else if("geotiff"===e.rasterType){l._data=e.data;var d=o.fromArrayBuffer;"url"===e.sourceType&&(d=o.fromUrl),t&&console.log("data.rasterType is geotiff"),r(d(e.data).then((function(r){return t&&console.log("geotiff:",r),r.getImage().then((function(r){t&&console.log("image:",r);var i=r.fileDirectory,o=r.getGeoKeys(),c=o.GeographicTypeGeoKey,d=o.ProjectedCSTypeGeoKey;l.projection=c||d,t&&console.log("projection:",l.projection),l.height=f=r.getHeight(),t&&console.log("result.height:",l.height),l.width=h=r.getWidth(),t&&console.log("result.width:",l.width);var p=r.getResolution(),g=n(p,2),m=g[0],y=g[1];l.pixelHeight=Math.abs(y),l.pixelWidth=Math.abs(m);var b=r.getOrigin(),w=n(b,2),v=w[0],_=w[1];return l.xmin=v,l.xmax=l.xmin+h*l.pixelWidth,l.ymax=_,l.ymin=l.ymax-f*l.pixelHeight,l.noDataValue=i.GDAL_NODATA?parseFloat(i.GDAL_NODATA):null,l.numberOfRasters=i.SamplesPerPixel,i.ColorMap&&(l.palette=(0,s.getPalette)(r)),"url"!==e.sourceType?r.readRasters().then((function(e){return l.values=e.map((function(e){return (0,a.unflatten)(e,{height:f,width:h})})),u(l)})):l}))})));}}catch(e){c(e),console.error("[georaster] error parsing georaster:",e);}}))};var o=r(37),s=r(83),a=r(36);function u(e,t){var r=e.noDataValue,n=e.height,i=e.width;return new Promise((function(o,s){e.maxs=[],e.mins=[],e.ranges=[];for(var a=void 0,u=void 0,c=0;c<e.numberOfRasters;c++){var l=e.values[c];t&&console.log("[georaster] rows:",l);for(var f=0;f<n;f++)for(var h=l[f],d=0;d<i;d++){var p=h[d];p==r||isNaN(p)||(void 0===u||p<u?u=p:(void 0===a||p>a)&&(a=p));}e.maxs.push(a),e.mins.push(u),e.ranges.push(a-u);}o(e);}))}},function(e,t,r){(function(t){var n=r(20).Transform,i=r(4);function o(e){n.call(this,e),this._destroyed=!1;}function s(e,t,r){r(null,e);}function a(e){return function(t,r,n){return "function"==typeof t&&(n=r,r=t,t={}),"function"!=typeof r&&(r=s),"function"!=typeof n&&(n=null),e(t,r,n)}}i(o,n),o.prototype.destroy=function(e){if(!this._destroyed){this._destroyed=!0;var r=this;t.nextTick((function(){e&&r.emit("error",e),r.emit("close");}));}},e.exports=a((function(e,t,r){var n=new o(e);return n._transform=t,r&&(n._flush=r),n})),e.exports.ctor=a((function(e,t,r){function n(t){if(!(this instanceof n))return new n(t);this.options=Object.assign({},e,t),o.call(this,this.options);}return i(n,o),n.prototype._transform=t,r&&(n.prototype._flush=r),n})),e.exports.obj=a((function(e,t,r){var n=new o(Object.assign({objectMode:!0,highWaterMark:16},e));return n._transform=t,r&&(n._flush=r),n}));}).call(this,r(3));},function(e,t){},function(e,t,r){var n=r(21).Buffer,i=r(54);e.exports=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.head=null,this.tail=null,this.length=0;}return e.prototype.push=function(e){var t={data:e,next:null};this.length>0?this.tail.next=t:this.head=t,this.tail=t,++this.length;},e.prototype.unshift=function(e){var t={data:e,next:this.head};0===this.length&&(this.tail=t),this.head=t,++this.length;},e.prototype.shift=function(){if(0!==this.length){var e=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,e}},e.prototype.clear=function(){this.head=this.tail=null,this.length=0;},e.prototype.join=function(e){if(0===this.length)return "";for(var t=this.head,r=""+t.data;t=t.next;)r+=e+t.data;return r},e.prototype.concat=function(e){if(0===this.length)return n.alloc(0);if(1===this.length)return this.head.data;for(var t,r,i,o=n.allocUnsafe(e>>>0),s=this.head,a=0;s;)t=s.data,r=o,i=a,t.copy(r,i),a+=s.data.length,s=s.next;return o},e}(),i&&i.inspect&&i.inspect.custom&&(e.exports.prototype[i.inspect.custom]=function(){var e=i.inspect({length:this.length});return this.constructor.name+" "+e});},function(e,t){},function(e,t,r){(function(e){var n=void 0!==e&&e||"undefined"!=typeof self&&self||window,i=Function.prototype.apply;function o(e,t){this._id=e,this._clearFn=t;}t.setTimeout=function(){return new o(i.call(setTimeout,n,arguments),clearTimeout)},t.setInterval=function(){return new o(i.call(setInterval,n,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e&&e.close();},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(n,this._id);},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t;},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1;},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout((function(){e._onTimeout&&e._onTimeout();}),t));},r(56),t.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==e&&e.setImmediate||this&&this.setImmediate,t.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==e&&e.clearImmediate||this&&this.clearImmediate;}).call(this,r(1));},function(e,t,r){(function(e,t){!function(e,r){if(!e.setImmediate){var n,i,o,s,a,u=1,c={},l=!1,f=e.document,h=Object.getPrototypeOf&&Object.getPrototypeOf(e);h=h&&h.setTimeout?h:e,"[object process]"==={}.toString.call(e.process)?n=function(e){t.nextTick((function(){p(e);}));}:!function(){if(e.postMessage&&!e.importScripts){var t=!0,r=e.onmessage;return e.onmessage=function(){t=!1;},e.postMessage("","*"),e.onmessage=r,t}}()?e.MessageChannel?((o=new MessageChannel).port1.onmessage=function(e){p(e.data);},n=function(e){o.port2.postMessage(e);}):f&&"onreadystatechange"in f.createElement("script")?(i=f.documentElement,n=function(e){var t=f.createElement("script");t.onreadystatechange=function(){p(e),t.onreadystatechange=null,i.removeChild(t),t=null;},i.appendChild(t);}):n=function(e){setTimeout(p,0,e);}:(s="setImmediate$"+Math.random()+"$",a=function(t){t.source===e&&"string"==typeof t.data&&0===t.data.indexOf(s)&&p(+t.data.slice(s.length));},e.addEventListener?e.addEventListener("message",a,!1):e.attachEvent("onmessage",a),n=function(t){e.postMessage(s+t,"*");}),h.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),r=0;r<t.length;r++)t[r]=arguments[r+1];var i={callback:e,args:t};return c[u]=i,n(u),u++},h.clearImmediate=d;}function d(e){delete c[e];}function p(e){if(l)setTimeout(p,0,e);else {var t=c[e];if(t){l=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(void 0,r);}}(t);}finally{d(e),l=!1;}}}}}("undefined"==typeof self?void 0===e?this:e:self);}).call(this,r(1),r(3));},function(e,t,r){(function(t){function r(e){try{if(!t.localStorage)return !1}catch(e){return !1}var r=t.localStorage[e];return null!=r&&"true"===String(r).toLowerCase()}e.exports=function(e,t){if(r("noDeprecation"))return e;var n=!1;return function(){if(!n){if(r("throwDeprecation"))throw new Error(t);r("traceDeprecation")?console.trace(t):console.warn(t),n=!0;}return e.apply(this,arguments)}};}).call(this,r(1));},function(e,t,r){var n=r(2),i=n.Buffer;function o(e,t){for(var r in e)t[r]=e[r];}function s(e,t,r){return i(e,t,r)}i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow?e.exports=n:(o(n,t),t.Buffer=s),o(i,s),s.from=function(e,t,r){if("number"==typeof e)throw new TypeError("Argument must not be a number");return i(e,t,r)},s.alloc=function(e,t,r){if("number"!=typeof e)throw new TypeError("Argument must be a number");var n=i(e);return void 0!==t?"string"==typeof r?n.fill(t,r):n.fill(t):n.fill(0),n},s.allocUnsafe=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return i(e)},s.allocUnsafeSlow=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return n.SlowBuffer(e)};},function(e,t,r){e.exports=o;var n=r(32),i=Object.create(r(10));function o(e){if(!(this instanceof o))return new o(e);n.call(this,e);}i.inherits=r(4),i.inherits(o,n),o.prototype._transform=function(e,t,r){r(null,e);};},function(e,t,r){var n=r(16),i=r(61),o=r(62),s=r(63),a=r(64);function u(e){return (e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function c(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new n.Buf16(320),this.work=new n.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0;}function l(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=1,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new n.Buf32(852),t.distcode=t.distdyn=new n.Buf32(592),t.sane=1,t.back=-1,0):-2}function f(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,l(e)):-2}function h(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?-2:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,f(e))):-2}function d(e,t){var r,n;return e?(n=new c,e.state=n,n.window=null,0!==(r=h(e,t))&&(e.state=null),r):-2}var p,g,m=!0;function y(e){if(m){var t;for(p=new n.Buf32(512),g=new n.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(a(1,e.lens,0,288,p,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;a(2,e.lens,0,32,g,0,e.work,{bits:5}),m=!1;}e.lencode=p,e.lenbits=9,e.distcode=g,e.distbits=5;}function b(e,t,r,i){var o,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new n.Buf8(s.wsize)),i>=s.wsize?(n.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):((o=s.wsize-s.wnext)>i&&(o=i),n.arraySet(s.window,t,r-i,o,s.wnext),(i-=o)?(n.arraySet(s.window,t,r-i,i,0),s.wnext=i,s.whave=s.wsize):(s.wnext+=o,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=o))),0}t.inflateReset=f,t.inflateReset2=h,t.inflateResetKeep=l,t.inflateInit=function(e){return d(e,15)},t.inflateInit2=d,t.inflate=function(e,t){var r,c,l,f,h,d,p,g,m,w,v,_,k,S,T,x,E,C,A,O,R,I,P,M,D=0,L=new n.Buf8(4),U=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return -2;12===(r=e.state).mode&&(r.mode=13),h=e.next_out,l=e.output,p=e.avail_out,f=e.next_in,c=e.input,d=e.avail_in,g=r.hold,m=r.bits,w=d,v=p,I=0;e:for(;;)switch(r.mode){case 1:if(0===r.wrap){r.mode=13;break}for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if(2&r.wrap&&35615===g){r.check=0,L[0]=255&g,L[1]=g>>>8&255,r.check=o(r.check,L,2,0),g=0,m=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&g)<<8)+(g>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&g)){e.msg="unknown compression method",r.mode=30;break}if(m-=4,R=8+(15&(g>>>=4)),0===r.wbits)r.wbits=R;else if(R>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<R,e.adler=r.check=1,r.mode=512&g?10:12,g=0,m=0;break;case 2:for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if(r.flags=g,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=g>>8&1),512&r.flags&&(L[0]=255&g,L[1]=g>>>8&255,r.check=o(r.check,L,2,0)),g=0,m=0,r.mode=3;case 3:for(;m<32;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}r.head&&(r.head.time=g),512&r.flags&&(L[0]=255&g,L[1]=g>>>8&255,L[2]=g>>>16&255,L[3]=g>>>24&255,r.check=o(r.check,L,4,0)),g=0,m=0,r.mode=4;case 4:for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}r.head&&(r.head.xflags=255&g,r.head.os=g>>8),512&r.flags&&(L[0]=255&g,L[1]=g>>>8&255,r.check=o(r.check,L,2,0)),g=0,m=0,r.mode=5;case 5:if(1024&r.flags){for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}r.length=g,r.head&&(r.head.extra_len=g),512&r.flags&&(L[0]=255&g,L[1]=g>>>8&255,r.check=o(r.check,L,2,0)),g=0,m=0;}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&((_=r.length)>d&&(_=d),_&&(r.head&&(R=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),n.arraySet(r.head.extra,c,f,_,R)),512&r.flags&&(r.check=o(r.check,c,_,f)),d-=_,f+=_,r.length-=_),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===d)break e;_=0;do{R=c[f+_++],r.head&&R&&r.length<65536&&(r.head.name+=String.fromCharCode(R));}while(R&&_<d);if(512&r.flags&&(r.check=o(r.check,c,_,f)),d-=_,f+=_,R)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===d)break e;_=0;do{R=c[f+_++],r.head&&R&&r.length<65536&&(r.head.comment+=String.fromCharCode(R));}while(R&&_<d);if(512&r.flags&&(r.check=o(r.check,c,_,f)),d-=_,f+=_,R)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;m<16;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if(g!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}g=0,m=0;}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;m<32;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}e.adler=r.check=u(g),g=0,m=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=h,e.avail_out=p,e.next_in=f,e.avail_in=d,r.hold=g,r.bits=m,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){g>>>=7&m,m-=7&m,r.mode=27;break}for(;m<3;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}switch(r.last=1&g,m-=1,3&(g>>>=1)){case 0:r.mode=14;break;case 1:if(y(r),r.mode=20,6===t){g>>>=2,m-=2;break e}break;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30;}g>>>=2,m-=2;break;case 14:for(g>>>=7&m,m-=7&m;m<32;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if((65535&g)!=(g>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&g,g=0,m=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(_=r.length){if(_>d&&(_=d),_>p&&(_=p),0===_)break e;n.arraySet(l,c,f,_,h),d-=_,f+=_,p-=_,h+=_,r.length-=_;break}r.mode=12;break;case 17:for(;m<14;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if(r.nlen=257+(31&g),g>>>=5,m-=5,r.ndist=1+(31&g),g>>>=5,m-=5,r.ncode=4+(15&g),g>>>=4,m-=4,r.nlen>286||r.ndist>30){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;m<3;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}r.lens[U[r.have++]]=7&g,g>>>=3,m-=3;}for(;r.have<19;)r.lens[U[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,P={bits:r.lenbits},I=a(0,r.lens,0,19,r.lencode,0,r.work,P),r.lenbits=P.bits,I){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;x=(D=r.lencode[g&(1<<r.lenbits)-1])>>>16&255,E=65535&D,!((T=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if(E<16)g>>>=T,m-=T,r.lens[r.have++]=E;else {if(16===E){for(M=T+2;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if(g>>>=T,m-=T,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}R=r.lens[r.have-1],_=3+(3&g),g>>>=2,m-=2;}else if(17===E){for(M=T+3;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}m-=T,R=0,_=3+(7&(g>>>=T)),g>>>=3,m-=3;}else {for(M=T+7;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}m-=T,R=0,_=11+(127&(g>>>=T)),g>>>=7,m-=7;}if(r.have+_>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;_--;)r.lens[r.have++]=R;}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,P={bits:r.lenbits},I=a(1,r.lens,0,r.nlen,r.lencode,0,r.work,P),r.lenbits=P.bits,I){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,P={bits:r.distbits},I=a(2,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,P),r.distbits=P.bits,I){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(d>=6&&p>=258){e.next_out=h,e.avail_out=p,e.next_in=f,e.avail_in=d,r.hold=g,r.bits=m,s(e,v),h=e.next_out,l=e.output,p=e.avail_out,f=e.next_in,c=e.input,d=e.avail_in,g=r.hold,m=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;x=(D=r.lencode[g&(1<<r.lenbits)-1])>>>16&255,E=65535&D,!((T=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if(x&&0==(240&x)){for(C=T,A=x,O=E;x=(D=r.lencode[O+((g&(1<<C+A)-1)>>C)])>>>16&255,E=65535&D,!(C+(T=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}g>>>=C,m-=C,r.back+=C;}if(g>>>=T,m-=T,r.back+=T,r.length=E,0===x){r.mode=26;break}if(32&x){r.back=-1,r.mode=12;break}if(64&x){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&x,r.mode=22;case 22:if(r.extra){for(M=r.extra;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}r.length+=g&(1<<r.extra)-1,g>>>=r.extra,m-=r.extra,r.back+=r.extra;}r.was=r.length,r.mode=23;case 23:for(;x=(D=r.distcode[g&(1<<r.distbits)-1])>>>16&255,E=65535&D,!((T=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if(0==(240&x)){for(C=T,A=x,O=E;x=(D=r.distcode[O+((g&(1<<C+A)-1)>>C)])>>>16&255,E=65535&D,!(C+(T=D>>>24)<=m);){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}g>>>=C,m-=C,r.back+=C;}if(g>>>=T,m-=T,r.back+=T,64&x){e.msg="invalid distance code",r.mode=30;break}r.offset=E,r.extra=15&x,r.mode=24;case 24:if(r.extra){for(M=r.extra;m<M;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}r.offset+=g&(1<<r.extra)-1,g>>>=r.extra,m-=r.extra,r.back+=r.extra;}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===p)break e;if(_=v-p,r.offset>_){if((_=r.offset-_)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}_>r.wnext?(_-=r.wnext,k=r.wsize-_):k=r.wnext-_,_>r.length&&(_=r.length),S=r.window;}else S=l,k=h-r.offset,_=r.length;_>p&&(_=p),p-=_,r.length-=_;do{l[h++]=S[k++];}while(--_);0===r.length&&(r.mode=21);break;case 26:if(0===p)break e;l[h++]=r.length,p--,r.mode=21;break;case 27:if(r.wrap){for(;m<32;){if(0===d)break e;d--,g|=c[f++]<<m,m+=8;}if(v-=p,e.total_out+=v,r.total+=v,v&&(e.adler=r.check=r.flags?o(r.check,l,v,h-v):i(r.check,l,v,h-v)),v=p,(r.flags?g:u(g))!==r.check){e.msg="incorrect data check",r.mode=30;break}g=0,m=0;}r.mode=28;case 28:if(r.wrap&&r.flags){for(;m<32;){if(0===d)break e;d--,g+=c[f++]<<m,m+=8;}if(g!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}g=0,m=0;}r.mode=29;case 29:I=1;break e;case 30:I=-3;break e;case 31:return -4;case 32:default:return -2}return e.next_out=h,e.avail_out=p,e.next_in=f,e.avail_in=d,r.hold=g,r.bits=m,(r.wsize||v!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&b(e,e.output,e.next_out,v-e.avail_out)?(r.mode=31,-4):(w-=e.avail_in,v-=e.avail_out,e.total_in+=w,e.total_out+=v,r.total+=v,r.wrap&&v&&(e.adler=r.check=r.flags?o(r.check,l,v,e.next_out-v):i(r.check,l,v,e.next_out-v)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0===w&&0===v||4===t)&&0===I&&(I=-5),I)},t.inflateEnd=function(e){if(!e||!e.state)return -2;var t=e.state;return t.window&&(t.window=null),e.state=null,0},t.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?-2:(r.head=t,t.done=!1,0):-2},t.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?-2:11===r.mode&&i(1,t,n,0)!==r.check?-3:b(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,0):-2},t.inflateInfo="pako inflate (from Nodeca project)";},function(e,t,r){e.exports=function(e,t,r,n){for(var i=65535&e|0,o=e>>>16&65535|0,s=0;0!==r;){r-=s=r>2e3?2e3:r;do{o=o+(i=i+t[n++]|0)|0;}while(--s);i%=65521,o%=65521;}return i|o<<16|0};},function(e,t,r){var n=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e;}return t}();e.exports=function(e,t,r,i){var o=n,s=i+r;e^=-1;for(var a=i;a<s;a++)e=e>>>8^o[255&(e^t[a])];return -1^e};},function(e,t,r){e.exports=function(e,t){var r,n,i,o,s,a,u,c,l,f,h,d,p,g,m,y,b,w,v,_,k,S,T,x,E;r=e.state,n=e.next_in,x=e.input,i=n+(e.avail_in-5),o=e.next_out,E=e.output,s=o-(t-e.avail_out),a=o+(e.avail_out-257),u=r.dmax,c=r.wsize,l=r.whave,f=r.wnext,h=r.window,d=r.hold,p=r.bits,g=r.lencode,m=r.distcode,y=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;e:do{p<15&&(d+=x[n++]<<p,p+=8,d+=x[n++]<<p,p+=8),w=g[d&y];t:for(;;){if(d>>>=v=w>>>24,p-=v,0===(v=w>>>16&255))E[o++]=65535&w;else {if(!(16&v)){if(0==(64&v)){w=g[(65535&w)+(d&(1<<v)-1)];continue t}if(32&v){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}_=65535&w,(v&=15)&&(p<v&&(d+=x[n++]<<p,p+=8),_+=d&(1<<v)-1,d>>>=v,p-=v),p<15&&(d+=x[n++]<<p,p+=8,d+=x[n++]<<p,p+=8),w=m[d&b];r:for(;;){if(d>>>=v=w>>>24,p-=v,!(16&(v=w>>>16&255))){if(0==(64&v)){w=m[(65535&w)+(d&(1<<v)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(k=65535&w,p<(v&=15)&&(d+=x[n++]<<p,(p+=8)<v&&(d+=x[n++]<<p,p+=8)),(k+=d&(1<<v)-1)>u){e.msg="invalid distance too far back",r.mode=30;break e}if(d>>>=v,p-=v,k>(v=o-s)){if((v=k-v)>l&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(S=0,T=h,0===f){if(S+=c-v,v<_){_-=v;do{E[o++]=h[S++];}while(--v);S=o-k,T=E;}}else if(f<v){if(S+=c+f-v,(v-=f)<_){_-=v;do{E[o++]=h[S++];}while(--v);if(S=0,f<_){_-=v=f;do{E[o++]=h[S++];}while(--v);S=o-k,T=E;}}}else if(S+=f-v,v<_){_-=v;do{E[o++]=h[S++];}while(--v);S=o-k,T=E;}for(;_>2;)E[o++]=T[S++],E[o++]=T[S++],E[o++]=T[S++],_-=3;_&&(E[o++]=T[S++],_>1&&(E[o++]=T[S++]));}else {S=o-k;do{E[o++]=E[S++],E[o++]=E[S++],E[o++]=E[S++],_-=3;}while(_>2);_&&(E[o++]=E[S++],_>1&&(E[o++]=E[S++]));}break}}break}}while(n<i&&o<a);n-=_=p>>3,d&=(1<<(p-=_<<3))-1,e.next_in=n,e.next_out=o,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=o<a?a-o+257:257-(o-a),r.hold=d,r.bits=p;};},function(e,t,r){var n=r(16),i=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],o=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],a=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(e,t,r,u,c,l,f,h){var d,p,g,m,y,b,w,v,_,k=h.bits,S=0,T=0,x=0,E=0,C=0,A=0,O=0,R=0,I=0,P=0,M=null,D=0,L=new n.Buf16(16),U=new n.Buf16(16),j=null,F=0;for(S=0;S<=15;S++)L[S]=0;for(T=0;T<u;T++)L[t[r+T]]++;for(C=k,E=15;E>=1&&0===L[E];E--);if(C>E&&(C=E),0===E)return c[l++]=20971520,c[l++]=20971520,h.bits=1,0;for(x=1;x<E&&0===L[x];x++);for(C<x&&(C=x),R=1,S=1;S<=15;S++)if(R<<=1,(R-=L[S])<0)return -1;if(R>0&&(0===e||1!==E))return -1;for(U[1]=0,S=1;S<15;S++)U[S+1]=U[S]+L[S];for(T=0;T<u;T++)0!==t[r+T]&&(f[U[t[r+T]]++]=T);if(0===e?(M=j=f,b=19):1===e?(M=i,D-=257,j=o,F-=257,b=256):(M=s,j=a,b=-1),P=0,T=0,S=x,y=l,A=C,O=0,g=-1,m=(I=1<<C)-1,1===e&&I>852||2===e&&I>592)return 1;for(;;){w=S-O,f[T]<b?(v=0,_=f[T]):f[T]>b?(v=j[F+f[T]],_=M[D+f[T]]):(v=96,_=0),d=1<<S-O,x=p=1<<A;do{c[y+(P>>O)+(p-=d)]=w<<24|v<<16|_|0;}while(0!==p);for(d=1<<S-1;P&d;)d>>=1;if(0!==d?(P&=d-1,P+=d):P=0,T++,0==--L[S]){if(S===E)break;S=t[r+f[T]];}if(S>C&&(P&m)!==g){for(0===O&&(O=C),y+=x,R=1<<(A=S-O);A+O<E&&!((R-=L[A+O])<=0);)A++,R<<=1;if(I+=1<<A,1===e&&I>852||2===e&&I>592)return 1;c[g=P&m]=C<<24|A<<16|y-l|0;}}return 0!==P&&(c[y+P]=S-O<<24|64<<16|0),h.bits=C,0};},function(e,t,r){var n=r(16),i=!0,o=!0;try{String.fromCharCode.apply(null,[0]);}catch(e){i=!1;}try{String.fromCharCode.apply(null,new Uint8Array(1));}catch(e){o=!1;}for(var s=new n.Buf8(256),a=0;a<256;a++)s[a]=a>=252?6:a>=248?5:a>=240?4:a>=224?3:a>=192?2:1;function u(e,t){if(t<65534&&(e.subarray&&o||!e.subarray&&i))return String.fromCharCode.apply(null,n.shrinkBuf(e,t));for(var r="",s=0;s<t;s++)r+=String.fromCharCode(e[s]);return r}s[254]=s[254]=1,t.string2buf=function(e){var t,r,i,o,s,a=e.length,u=0;for(o=0;o<a;o++)55296==(64512&(r=e.charCodeAt(o)))&&o+1<a&&56320==(64512&(i=e.charCodeAt(o+1)))&&(r=65536+(r-55296<<10)+(i-56320),o++),u+=r<128?1:r<2048?2:r<65536?3:4;for(t=new n.Buf8(u),s=0,o=0;s<u;o++)55296==(64512&(r=e.charCodeAt(o)))&&o+1<a&&56320==(64512&(i=e.charCodeAt(o+1)))&&(r=65536+(r-55296<<10)+(i-56320),o++),r<128?t[s++]=r:r<2048?(t[s++]=192|r>>>6,t[s++]=128|63&r):r<65536?(t[s++]=224|r>>>12,t[s++]=128|r>>>6&63,t[s++]=128|63&r):(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63,t[s++]=128|r>>>6&63,t[s++]=128|63&r);return t},t.buf2binstring=function(e){return u(e,e.length)},t.binstring2buf=function(e){for(var t=new n.Buf8(e.length),r=0,i=t.length;r<i;r++)t[r]=e.charCodeAt(r);return t},t.buf2string=function(e,t){var r,n,i,o,a=t||e.length,c=new Array(2*a);for(n=0,r=0;r<a;)if((i=e[r++])<128)c[n++]=i;else if((o=s[i])>4)c[n++]=65533,r+=o-1;else {for(i&=2===o?31:3===o?15:7;o>1&&r<a;)i=i<<6|63&e[r++],o--;o>1?c[n++]=65533:i<65536?c[n++]=i:(i-=65536,c[n++]=55296|i>>10&1023,c[n++]=56320|1023&i);}return u(c,n)},t.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;r>=0&&128==(192&e[r]);)r--;return r<0||0===r?t:r+s[e[r]]>t?r:t};},function(e,t,r){e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};},function(e,t,r){e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"};},function(e,t,r){e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0;};},function(e,t,r){e.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1;};},function(e,t,r){e.exports=r.p+"0.georaster.browser.bundle.min.worker.js";},function(e,t,r){e.exports=function(e){function t(e){let r,i=null;function o(...e){if(!o.enabled)return;const n=o,i=Number(new Date),s=i-(r||i);n.diff=s,n.prev=r,n.curr=i,r=i,e[0]=t.coerce(e[0]),"string"!=typeof e[0]&&e.unshift("%O");let a=0;e[0]=e[0].replace(/%([a-zA-Z%])/g,(r,i)=>{if("%%"===r)return "%";a++;const o=t.formatters[i];if("function"==typeof o){const t=e[a];r=o.call(n,t),e.splice(a,1),a--;}return r}),t.formatArgs.call(n,e);(n.log||t.log).apply(n,e);}return o.namespace=e,o.useColors=t.useColors(),o.color=t.selectColor(e),o.extend=n,o.destroy=t.destroy,Object.defineProperty(o,"enabled",{enumerable:!0,configurable:!1,get:()=>null===i?t.enabled(e):i,set:e=>{i=e;}}),"function"==typeof t.init&&t.init(o),o}function n(e,r){const n=t(this.namespace+(void 0===r?":":r)+e);return n.log=this.log,n}function i(e){return e.toString().substring(2,e.toString().length-2).replace(/\.\*\?$/,"*")}return t.debug=t,t.default=t,t.coerce=function(e){if(e instanceof Error)return e.stack||e.message;return e},t.disable=function(){const e=[...t.names.map(i),...t.skips.map(i).map(e=>"-"+e)].join(",");return t.enable(""),e},t.enable=function(e){let r;t.save(e),t.names=[],t.skips=[];const n=("string"==typeof e?e:"").split(/[\s,]+/),i=n.length;for(r=0;r<i;r++)n[r]&&("-"===(e=n[r].replace(/\*/g,".*?"))[0]?t.skips.push(new RegExp("^"+e.substr(1)+"$")):t.names.push(new RegExp("^"+e+"$")));},t.enabled=function(e){if("*"===e[e.length-1])return !0;let r,n;for(r=0,n=t.skips.length;r<n;r++)if(t.skips[r].test(e))return !1;for(r=0,n=t.names.length;r<n;r++)if(t.names[r].test(e))return !0;return !1},t.humanize=r(72),t.destroy=function(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");},Object.keys(e).forEach(r=>{t[r]=e[r];}),t.names=[],t.skips=[],t.formatters={},t.selectColor=function(e){let r=0;for(let t=0;t<e.length;t++)r=(r<<5)-r+e.charCodeAt(t),r|=0;return t.colors[Math.abs(r)%t.colors.length]},t.enable(t.load()),t};},function(e,t){var r=1e3,n=6e4,i=60*n,o=24*i;function s(e,t,r,n){var i=t>=1.5*r;return Math.round(e/r)+" "+n+(i?"s":"")}e.exports=function(e,t){t=t||{};var a=typeof e;if("string"===a&&e.length>0)return function(e){if((e=String(e)).length>100)return;var t=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(e);if(!t)return;var s=parseFloat(t[1]);switch((t[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return 315576e5*s;case"weeks":case"week":case"w":return 6048e5*s;case"days":case"day":case"d":return s*o;case"hours":case"hour":case"hrs":case"hr":case"h":return s*i;case"minutes":case"minute":case"mins":case"min":case"m":return s*n;case"seconds":case"second":case"secs":case"sec":case"s":return s*r;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return s;default:return}}(e);if("number"===a&&isFinite(e))return t.long?function(e){var t=Math.abs(e);if(t>=o)return s(e,t,o,"day");if(t>=i)return s(e,t,i,"hour");if(t>=n)return s(e,t,n,"minute");if(t>=r)return s(e,t,r,"second");return e+" ms"}(e):function(e){var t=Math.abs(e);if(t>=o)return Math.round(e/o)+"d";if(t>=i)return Math.round(e/i)+"h";if(t>=n)return Math.round(e/n)+"m";if(t>=r)return Math.round(e/r)+"s";return e+"ms"}(e);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))};},function(e,t,r){(function(t,n,i){var o=r(34),s=r(4),a=r(35),u=r(20),c=r(74),l=a.IncomingMessage,f=a.readyStates;var h=e.exports=function(e){var r,n=this;u.Writable.call(n),n._opts=e,n._body=[],n._headers={},e.auth&&n.setHeader("Authorization","Basic "+new t(e.auth).toString("base64")),Object.keys(e.headers).forEach((function(t){n.setHeader(t,e.headers[t]);}));var i=!0;if("disable-fetch"===e.mode||"requestTimeout"in e&&!o.abortController)i=!1,r=!0;else if("prefer-streaming"===e.mode)r=!1;else if("allow-wrong-content-type"===e.mode)r=!o.overrideMimeType;else {if(e.mode&&"default"!==e.mode&&"prefer-fast"!==e.mode)throw new Error("Invalid value for opts.mode");r=!0;}n._mode=function(e,t){return o.fetch&&t?"fetch":o.mozchunkedarraybuffer?"moz-chunked-arraybuffer":o.msstream?"ms-stream":o.arraybuffer&&e?"arraybuffer":o.vbArray&&e?"text:vbarray":"text"}(r,i),n._fetchTimer=null,n.on("finish",(function(){n._onFinish();}));};s(h,u.Writable),h.prototype.setHeader=function(e,t){var r=e.toLowerCase();-1===d.indexOf(r)&&(this._headers[r]={name:e,value:t});},h.prototype.getHeader=function(e){var t=this._headers[e.toLowerCase()];return t?t.value:null},h.prototype.removeHeader=function(e){delete this._headers[e.toLowerCase()];},h.prototype._onFinish=function(){var e=this;if(!e._destroyed){var r=e._opts,s=e._headers,a=null;"GET"!==r.method&&"HEAD"!==r.method&&(a=o.arraybuffer?c(t.concat(e._body)):o.blobConstructor?new n.Blob(e._body.map((function(e){return c(e)})),{type:(s["content-type"]||{}).value||""}):t.concat(e._body).toString());var u=[];if(Object.keys(s).forEach((function(e){var t=s[e].name,r=s[e].value;Array.isArray(r)?r.forEach((function(e){u.push([t,e]);})):u.push([t,r]);})),"fetch"===e._mode){var l=null;if(o.abortController){var h=new AbortController;l=h.signal,e._fetchAbortController=h,"requestTimeout"in r&&0!==r.requestTimeout&&(e._fetchTimer=n.setTimeout((function(){e.emit("requestTimeout"),e._fetchAbortController&&e._fetchAbortController.abort();}),r.requestTimeout));}n.fetch(e._opts.url,{method:e._opts.method,headers:u,body:a||void 0,mode:"cors",credentials:r.withCredentials?"include":"same-origin",signal:l}).then((function(t){e._fetchResponse=t,e._connect();}),(function(t){n.clearTimeout(e._fetchTimer),e._destroyed||e.emit("error",t);}));}else {var d=e._xhr=new n.XMLHttpRequest;try{d.open(e._opts.method,e._opts.url,!0);}catch(t){return void i.nextTick((function(){e.emit("error",t);}))}"responseType"in d&&(d.responseType=e._mode.split(":")[0]),"withCredentials"in d&&(d.withCredentials=!!r.withCredentials),"text"===e._mode&&"overrideMimeType"in d&&d.overrideMimeType("text/plain; charset=x-user-defined"),"requestTimeout"in r&&(d.timeout=r.requestTimeout,d.ontimeout=function(){e.emit("requestTimeout");}),u.forEach((function(e){d.setRequestHeader(e[0],e[1]);})),e._response=null,d.onreadystatechange=function(){switch(d.readyState){case f.LOADING:case f.DONE:e._onXHRProgress();}},"moz-chunked-arraybuffer"===e._mode&&(d.onprogress=function(){e._onXHRProgress();}),d.onerror=function(){e._destroyed||e.emit("error",new Error("XHR error"));};try{d.send(a);}catch(t){return void i.nextTick((function(){e.emit("error",t);}))}}}},h.prototype._onXHRProgress=function(){(function(e){try{var t=e.status;return null!==t&&0!==t}catch(e){return !1}})(this._xhr)&&!this._destroyed&&(this._response||this._connect(),this._response._onXHRProgress());},h.prototype._connect=function(){var e=this;e._destroyed||(e._response=new l(e._xhr,e._fetchResponse,e._mode,e._fetchTimer),e._response.on("error",(function(t){e.emit("error",t);})),e.emit("response",e._response));},h.prototype._write=function(e,t,r){this._body.push(e),r();},h.prototype.abort=h.prototype.destroy=function(){this._destroyed=!0,n.clearTimeout(this._fetchTimer),this._response&&(this._response._destroyed=!0),this._xhr?this._xhr.abort():this._fetchAbortController&&this._fetchAbortController.abort();},h.prototype.end=function(e,t,r){"function"==typeof e&&(r=e,e=void 0),u.Writable.prototype.end.call(this,e,t,r);},h.prototype.flushHeaders=function(){},h.prototype.setTimeout=function(){},h.prototype.setNoDelay=function(){},h.prototype.setSocketKeepAlive=function(){};var d=["accept-charset","accept-encoding","access-control-request-headers","access-control-request-method","connection","content-length","cookie","cookie2","date","dnt","expect","host","keep-alive","origin","referer","te","trailer","transfer-encoding","upgrade","via"];}).call(this,r(2).Buffer,r(1),r(3));},function(e,t,r){var n=r(2).Buffer;e.exports=function(e){if(e instanceof Uint8Array){if(0===e.byteOffset&&e.byteLength===e.buffer.byteLength)return e.buffer;if("function"==typeof e.buffer.slice)return e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength)}if(n.isBuffer(e)){for(var t=new Uint8Array(e.length),r=e.length,i=0;i<r;i++)t[i]=e[i];return t.buffer}throw new Error("Argument must be a Buffer")};},function(e,t){e.exports=function(){for(var e={},t=0;t<arguments.length;t++){var n=arguments[t];for(var i in n)r.call(n,i)&&(e[i]=n[i]);}return e};var r=Object.prototype.hasOwnProperty;},function(e,t){e.exports={100:"Continue",101:"Switching Protocols",102:"Processing",200:"OK",201:"Created",202:"Accepted",203:"Non-Authoritative Information",204:"No Content",205:"Reset Content",206:"Partial Content",207:"Multi-Status",208:"Already Reported",226:"IM Used",300:"Multiple Choices",301:"Moved Permanently",302:"Found",303:"See Other",304:"Not Modified",305:"Use Proxy",307:"Temporary Redirect",308:"Permanent Redirect",400:"Bad Request",401:"Unauthorized",402:"Payment Required",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",406:"Not Acceptable",407:"Proxy Authentication Required",408:"Request Timeout",409:"Conflict",410:"Gone",411:"Length Required",412:"Precondition Failed",413:"Payload Too Large",414:"URI Too Long",415:"Unsupported Media Type",416:"Range Not Satisfiable",417:"Expectation Failed",418:"I'm a teapot",421:"Misdirected Request",422:"Unprocessable Entity",423:"Locked",424:"Failed Dependency",425:"Unordered Collection",426:"Upgrade Required",428:"Precondition Required",429:"Too Many Requests",431:"Request Header Fields Too Large",451:"Unavailable For Legal Reasons",500:"Internal Server Error",501:"Not Implemented",502:"Bad Gateway",503:"Service Unavailable",504:"Gateway Timeout",505:"HTTP Version Not Supported",506:"Variant Also Negotiates",507:"Insufficient Storage",508:"Loop Detected",509:"Bandwidth Limit Exceeded",510:"Not Extended",511:"Network Authentication Required"};},function(e,t,r){(function(e,n){var i;/*! https://mths.be/punycode v1.4.1 by @mathias */!function(o){t&&t.nodeType,e&&e.nodeType;var s="object"==typeof n&&n;s.global!==s&&s.window!==s&&s.self;var a,u=2147483647,c=/^xn--/,l=/[^\x20-\x7E]/,f=/[\x2E\u3002\uFF0E\uFF61]/g,h={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},d=Math.floor,p=String.fromCharCode;function g(e){throw new RangeError(h[e])}function m(e,t){for(var r=e.length,n=[];r--;)n[r]=t(e[r]);return n}function y(e,t){var r=e.split("@"),n="";return r.length>1&&(n=r[0]+"@",e=r[1]),n+m((e=e.replace(f,".")).split("."),t).join(".")}function b(e){for(var t,r,n=[],i=0,o=e.length;i<o;)(t=e.charCodeAt(i++))>=55296&&t<=56319&&i<o?56320==(64512&(r=e.charCodeAt(i++)))?n.push(((1023&t)<<10)+(1023&r)+65536):(n.push(t),i--):n.push(t);return n}function w(e){return m(e,(function(e){var t="";return e>65535&&(t+=p((e-=65536)>>>10&1023|55296),e=56320|1023&e),t+=p(e)})).join("")}function v(e,t){return e+22+75*(e<26)-((0!=t)<<5)}function _(e,t,r){var n=0;for(e=r?d(e/700):e>>1,e+=d(e/t);e>455;n+=36)e=d(e/35);return d(n+36*e/(e+38))}function k(e){var t,r,n,i,o,s,a,c,l,f,h,p=[],m=e.length,y=0,b=128,v=72;for((r=e.lastIndexOf("-"))<0&&(r=0),n=0;n<r;++n)e.charCodeAt(n)>=128&&g("not-basic"),p.push(e.charCodeAt(n));for(i=r>0?r+1:0;i<m;){for(o=y,s=1,a=36;i>=m&&g("invalid-input"),((c=(h=e.charCodeAt(i++))-48<10?h-22:h-65<26?h-65:h-97<26?h-97:36)>=36||c>d((u-y)/s))&&g("overflow"),y+=c*s,!(c<(l=a<=v?1:a>=v+26?26:a-v));a+=36)s>d(u/(f=36-l))&&g("overflow"),s*=f;v=_(y-o,t=p.length+1,0==o),d(y/t)>u-b&&g("overflow"),b+=d(y/t),y%=t,p.splice(y++,0,b);}return w(p)}function S(e){var t,r,n,i,o,s,a,c,l,f,h,m,y,w,k,S=[];for(m=(e=b(e)).length,t=128,r=0,o=72,s=0;s<m;++s)(h=e[s])<128&&S.push(p(h));for(n=i=S.length,i&&S.push("-");n<m;){for(a=u,s=0;s<m;++s)(h=e[s])>=t&&h<a&&(a=h);for(a-t>d((u-r)/(y=n+1))&&g("overflow"),r+=(a-t)*y,t=a,s=0;s<m;++s)if((h=e[s])<t&&++r>u&&g("overflow"),h==t){for(c=r,l=36;!(c<(f=l<=o?1:l>=o+26?26:l-o));l+=36)k=c-f,w=36-f,S.push(p(v(f+k%w,0))),c=d(k/w);S.push(p(v(c,0))),o=_(r,y,n==i),r=0,++n;}++r,++t;}return S.join("")}a={version:"1.4.1",ucs2:{decode:b,encode:w},decode:k,encode:S,toASCII:function(e){return y(e,(function(e){return l.test(e)?"xn--"+S(e):e}))},toUnicode:function(e){return y(e,(function(e){return c.test(e)?k(e.slice(4).toLowerCase()):e}))}},void 0===(i=function(){return a}.call(t,r,t,e))||(e.exports=i);}();}).call(this,r(78)(e),r(1));},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e};},function(e,t,r){e.exports={isString:function(e){return "string"==typeof e},isObject:function(e){return "object"==typeof e&&null!==e},isNull:function(e){return null===e},isNullOrUndefined:function(e){return null==e}};},function(e,t,r){t.decode=t.parse=r(81),t.encode=t.stringify=r(82);},function(e,t,r){function n(e,t){return Object.prototype.hasOwnProperty.call(e,t)}e.exports=function(e,t,r,o){t=t||"&",r=r||"=";var s={};if("string"!=typeof e||0===e.length)return s;var a=/\+/g;e=e.split(t);var u=1e3;o&&"number"==typeof o.maxKeys&&(u=o.maxKeys);var c=e.length;u>0&&c>u&&(c=u);for(var l=0;l<c;++l){var f,h,d,p,g=e[l].replace(a,"%20"),m=g.indexOf(r);m>=0?(f=g.substr(0,m),h=g.substr(m+1)):(f=g,h=""),d=decodeURIComponent(f),p=decodeURIComponent(h),n(s,d)?i(s[d])?s[d].push(p):s[d]=[s[d],p]:s[d]=p;}return s};var i=Array.isArray||function(e){return "[object Array]"===Object.prototype.toString.call(e)};},function(e,t,r){var n=function(e){switch(typeof e){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return ""}};e.exports=function(e,t,r,a){return t=t||"&",r=r||"=",null===e&&(e=void 0),"object"==typeof e?o(s(e),(function(s){var a=encodeURIComponent(n(s))+r;return i(e[s])?o(e[s],(function(e){return a+encodeURIComponent(n(e))})).join(t):a+encodeURIComponent(n(e[s]))})).join(t):a?encodeURIComponent(n(a))+r+encodeURIComponent(n(e)):""};var i=Array.isArray||function(e){return "[object Array]"===Object.prototype.toString.call(e)};function o(e,t){if(e.map)return e.map(t);for(var r=[],n=0;n<e.length;n++)r.push(t(e[n],n));return r}var s=Object.keys||function(e){var t=[];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.push(r);return t};},function(e,t){e.exports={getPalette:(e,{debug:t=!1}={debug:!1})=>{t&&console.log("starting getPalette with image",e);const{fileDirectory:r}=e,{BitsPerSample:n,ColorMap:i,ImageLength:o,ImageWidth:s,PhotometricInterpretation:a,SampleFormat:u,SamplesPerPixel:c}=r;if(!i)throw new Error("[geotiff-palette]: the image does not contain a color map, so we can't make a palette.");const l=Math.pow(2,n);t&&console.log("[geotiff-palette]: count:",l);const f=i.length/3;if(t&&console.log("[geotiff-palette]: bandSize:",f),f!==l)throw new Error("[geotiff-palette]: can't handle situations where the color map has more or less values than the number of possible values in a raster");const h=f,d=h+f,p=[];for(let e=0;e<l;e++)p.push([Math.floor(i[e]/256),Math.floor(i[h+e]/256),Math.floor(i[d+e]/256),255]);return t&&console.log("[geotiff-palette]: result is ",p),p}};},function(e,t,r){function n(e,t){if("undefined"==typeof ImageData)throw "toCanvas is not supported in your environment";{const r=document.createElement("CANVAS"),n=t&&t.height?Math.min(e.height,t.height):Math.min(e.height,100),i=t&&t.width?Math.min(e.width,t.width):Math.min(e.width,100);r.height=n,r.width=i,r.style.minHeight="200px",r.style.minWidth="400px",r.style.maxWidth="100%";const o=r.getContext("2d"),s=function(e,t,r){if(e.values){const{noDataValue:n,mins:i,ranges:o,values:s}=e,a=s.length,u=e.width/t,c=e.height/r,l=new Uint8ClampedArray(t*r*4);for(let e=0;e<r;e++)for(let r=0;r<t;r++){const f=Math.round(e*c),h=Math.round(r*u),d=s.map(e=>{try{return e[f][h]}catch(e){console.error(e);}});if(d.every(e=>void 0!==e&&e!==n)){const n=e*(4*t)+4*r;if(1===a){const e=Math.round(d[0]),t=Math.round((e-i[0])/o[0]*255);l[n]=t,l[n+1]=t,l[n+2]=t,l[n+3]=255;}else if(3===a)try{const[e,t,r]=d;l[n]=e,l[n+1]=t,l[n+2]=r,l[n+3]=255;}catch(e){console.error(e);}else if(4===a)try{const[e,t,r,i]=d;l[n]=e,l[n+1]=t,l[n+2]=r,l[n+3]=i;}catch(e){console.error(e);}}}return new ImageData(l,t,r)}}(e,i,n);return o.putImageData(s,0,0),r}}r.r(t),r.d(t,"default",(function(){return n}));},function(e,t,r){r.d(t,"a",(function(){return i}));var n=r(8);Object(n.b)().blob;const i=Object(n.b)().default;},,function(e,t,r){var n=r(13),i=r(40);var o=function(e){"function"==typeof e?e():e&&"function"==typeof e.unsubscribe&&e.unsubscribe();};t.a=function(e){const t=new i.a;let r,s=0;return new n.a(n=>{r||(r=e.subscribe(t));const i=t.subscribe(n);return s++,()=>{s--,i.unsubscribe(),0===s&&(o(r),r=void 0);}})};}])}));
    });

    var parseGeoraster = /*@__PURE__*/getDefaultExportFromCjs(georaster_browser_bundle_min);

    L.Control.ValueIndicator = L.Control.extend({
        options: {
            position: 'topleft',
            emptyString: '-',
        },
        onAdd: function (map) {
            this._container = L.DomUtil.create('div', 'leaflet-control-valueindicator');
            L.DomEvent.disableClickPropagation(this._container);
            this._container.innerHTML = this.options.emptyString;
            return this._container;
        },
        onRemove: function (map) {
            // Nothing to do
        },
        update: function (text) {
            this._container.innerHTML = text;
        }
    });

    function valueIndicator (options) {
        return new L.Control.ValueIndicator(options);
    }

    const colorscales = {
        viridis: new Uint8Array([68,1,84,255,68,2,86,255,69,4,87,255,69,5,89,255,70,7,90,255,70,8,92,255,70,10,93,255,70,11,94,255,71,13,96,255,71,14,97,255,71,16,99,255,71,17,100,255,71,19,101,255,72,20,103,255,72,22,104,255,72,23,105,255,72,24,106,255,72,26,108,255,72,27,109,255,72,28,110,255,72,29,111,255,72,31,112,255,72,32,113,255,72,33,115,255,72,35,116,255,72,36,117,255,72,37,118,255,72,38,119,255,72,40,120,255,72,41,121,255,71,42,122,255,71,44,122,255,71,45,123,255,71,46,124,255,71,47,125,255,70,48,126,255,70,50,126,255,70,51,127,255,70,52,128,255,69,53,129,255,69,55,129,255,69,56,130,255,68,57,131,255,68,58,131,255,68,59,132,255,67,61,132,255,67,62,133,255,66,63,133,255,66,64,134,255,66,65,134,255,65,66,135,255,65,68,135,255,64,69,136,255,64,70,136,255,63,71,136,255,63,72,137,255,62,73,137,255,62,74,137,255,62,76,138,255,61,77,138,255,61,78,138,255,60,79,138,255,60,80,139,255,59,81,139,255,59,82,139,255,58,83,139,255,58,84,140,255,57,85,140,255,57,86,140,255,56,88,140,255,56,89,140,255,55,90,140,255,55,91,141,255,54,92,141,255,54,93,141,255,53,94,141,255,53,95,141,255,52,96,141,255,52,97,141,255,51,98,141,255,51,99,141,255,50,100,142,255,50,101,142,255,49,102,142,255,49,103,142,255,49,104,142,255,48,105,142,255,48,106,142,255,47,107,142,255,47,108,142,255,46,109,142,255,46,110,142,255,46,111,142,255,45,112,142,255,45,113,142,255,44,113,142,255,44,114,142,255,44,115,142,255,43,116,142,255,43,117,142,255,42,118,142,255,42,119,142,255,42,120,142,255,41,121,142,255,41,122,142,255,41,123,142,255,40,124,142,255,40,125,142,255,39,126,142,255,39,127,142,255,39,128,142,255,38,129,142,255,38,130,142,255,38,130,142,255,37,131,142,255,37,132,142,255,37,133,142,255,36,134,142,255,36,135,142,255,35,136,142,255,35,137,142,255,35,138,141,255,34,139,141,255,34,140,141,255,34,141,141,255,33,142,141,255,33,143,141,255,33,144,141,255,33,145,140,255,32,146,140,255,32,146,140,255,32,147,140,255,31,148,140,255,31,149,139,255,31,150,139,255,31,151,139,255,31,152,139,255,31,153,138,255,31,154,138,255,30,155,138,255,30,156,137,255,30,157,137,255,31,158,137,255,31,159,136,255,31,160,136,255,31,161,136,255,31,161,135,255,31,162,135,255,32,163,134,255,32,164,134,255,33,165,133,255,33,166,133,255,34,167,133,255,34,168,132,255,35,169,131,255,36,170,131,255,37,171,130,255,37,172,130,255,38,173,129,255,39,173,129,255,40,174,128,255,41,175,127,255,42,176,127,255,44,177,126,255,45,178,125,255,46,179,124,255,47,180,124,255,49,181,123,255,50,182,122,255,52,182,121,255,53,183,121,255,55,184,120,255,56,185,119,255,58,186,118,255,59,187,117,255,61,188,116,255,63,188,115,255,64,189,114,255,66,190,113,255,68,191,112,255,70,192,111,255,72,193,110,255,74,193,109,255,76,194,108,255,78,195,107,255,80,196,106,255,82,197,105,255,84,197,104,255,86,198,103,255,88,199,101,255,90,200,100,255,92,200,99,255,94,201,98,255,96,202,96,255,99,203,95,255,101,203,94,255,103,204,92,255,105,205,91,255,108,205,90,255,110,206,88,255,112,207,87,255,115,208,86,255,117,208,84,255,119,209,83,255,122,209,81,255,124,210,80,255,127,211,78,255,129,211,77,255,132,212,75,255,134,213,73,255,137,213,72,255,139,214,70,255,142,214,69,255,144,215,67,255,147,215,65,255,149,216,64,255,152,216,62,255,155,217,60,255,157,217,59,255,160,218,57,255,162,218,55,255,165,219,54,255,168,219,52,255,170,220,50,255,173,220,48,255,176,221,47,255,178,221,45,255,181,222,43,255,184,222,41,255,186,222,40,255,189,223,38,255,192,223,37,255,194,223,35,255,197,224,33,255,200,224,32,255,202,225,31,255,205,225,29,255,208,225,28,255,210,226,27,255,213,226,26,255,216,226,25,255,218,227,25,255,221,227,24,255,223,227,24,255,226,228,24,255,229,228,25,255,231,228,25,255,234,229,26,255,236,229,27,255,239,229,28,255,241,229,29,255,244,230,30,255,246,230,32,255,248,230,33,255,251,231,35,255,253,231,37,255]),
        inferno: new Uint8Array([0,0,4,255,1,0,5,255,1,1,6,255,1,1,8,255,2,1,10,255,2,2,12,255,2,2,14,255,3,2,16,255,4,3,18,255,4,3,20,255,5,4,23,255,6,4,25,255,7,5,27,255,8,5,29,255,9,6,31,255,10,7,34,255,11,7,36,255,12,8,38,255,13,8,41,255,14,9,43,255,16,9,45,255,17,10,48,255,18,10,50,255,20,11,52,255,21,11,55,255,22,11,57,255,24,12,60,255,25,12,62,255,27,12,65,255,28,12,67,255,30,12,69,255,31,12,72,255,33,12,74,255,35,12,76,255,36,12,79,255,38,12,81,255,40,11,83,255,41,11,85,255,43,11,87,255,45,11,89,255,47,10,91,255,49,10,92,255,50,10,94,255,52,10,95,255,54,9,97,255,56,9,98,255,57,9,99,255,59,9,100,255,61,9,101,255,62,9,102,255,64,10,103,255,66,10,104,255,68,10,104,255,69,10,105,255,71,11,106,255,73,11,106,255,74,12,107,255,76,12,107,255,77,13,108,255,79,13,108,255,81,14,108,255,82,14,109,255,84,15,109,255,85,15,109,255,87,16,110,255,89,16,110,255,90,17,110,255,92,18,110,255,93,18,110,255,95,19,110,255,97,19,110,255,98,20,110,255,100,21,110,255,101,21,110,255,103,22,110,255,105,22,110,255,106,23,110,255,108,24,110,255,109,24,110,255,111,25,110,255,113,25,110,255,114,26,110,255,116,26,110,255,117,27,110,255,119,28,109,255,120,28,109,255,122,29,109,255,124,29,109,255,125,30,109,255,127,30,108,255,128,31,108,255,130,32,108,255,132,32,107,255,133,33,107,255,135,33,107,255,136,34,106,255,138,34,106,255,140,35,105,255,141,35,105,255,143,36,105,255,144,37,104,255,146,37,104,255,147,38,103,255,149,38,103,255,151,39,102,255,152,39,102,255,154,40,101,255,155,41,100,255,157,41,100,255,159,42,99,255,160,42,99,255,162,43,98,255,163,44,97,255,165,44,96,255,166,45,96,255,168,46,95,255,169,46,94,255,171,47,94,255,173,48,93,255,174,48,92,255,176,49,91,255,177,50,90,255,179,50,90,255,180,51,89,255,182,52,88,255,183,53,87,255,185,53,86,255,186,54,85,255,188,55,84,255,189,56,83,255,191,57,82,255,192,58,81,255,193,58,80,255,195,59,79,255,196,60,78,255,198,61,77,255,199,62,76,255,200,63,75,255,202,64,74,255,203,65,73,255,204,66,72,255,206,67,71,255,207,68,70,255,208,69,69,255,210,70,68,255,211,71,67,255,212,72,66,255,213,74,65,255,215,75,63,255,216,76,62,255,217,77,61,255,218,78,60,255,219,80,59,255,221,81,58,255,222,82,56,255,223,83,55,255,224,85,54,255,225,86,53,255,226,87,52,255,227,89,51,255,228,90,49,255,229,92,48,255,230,93,47,255,231,94,46,255,232,96,45,255,233,97,43,255,234,99,42,255,235,100,41,255,235,102,40,255,236,103,38,255,237,105,37,255,238,106,36,255,239,108,35,255,239,110,33,255,240,111,32,255,241,113,31,255,241,115,29,255,242,116,28,255,243,118,27,255,243,120,25,255,244,121,24,255,245,123,23,255,245,125,21,255,246,126,20,255,246,128,19,255,247,130,18,255,247,132,16,255,248,133,15,255,248,135,14,255,248,137,12,255,249,139,11,255,249,140,10,255,249,142,9,255,250,144,8,255,250,146,7,255,250,148,7,255,251,150,6,255,251,151,6,255,251,153,6,255,251,155,6,255,251,157,7,255,252,159,7,255,252,161,8,255,252,163,9,255,252,165,10,255,252,166,12,255,252,168,13,255,252,170,15,255,252,172,17,255,252,174,18,255,252,176,20,255,252,178,22,255,252,180,24,255,251,182,26,255,251,184,29,255,251,186,31,255,251,188,33,255,251,190,35,255,250,192,38,255,250,194,40,255,250,196,42,255,250,198,45,255,249,199,47,255,249,201,50,255,249,203,53,255,248,205,55,255,248,207,58,255,247,209,61,255,247,211,64,255,246,213,67,255,246,215,70,255,245,217,73,255,245,219,76,255,244,221,79,255,244,223,83,255,244,225,86,255,243,227,90,255,243,229,93,255,242,230,97,255,242,232,101,255,242,234,105,255,241,236,109,255,241,237,113,255,241,239,117,255,241,241,121,255,242,242,125,255,242,244,130,255,243,245,134,255,243,246,138,255,244,248,142,255,245,249,146,255,246,250,150,255,248,251,154,255,249,252,157,255,250,253,161,255,252,255,164,255]),
        turbo: new Uint8Array([48,18,59,255,50,21,67,255,51,24,74,255,52,27,81,255,53,30,88,255,54,33,95,255,55,36,102,255,56,39,109,255,57,42,115,255,58,45,121,255,59,47,128,255,60,50,134,255,61,53,139,255,62,56,145,255,63,59,151,255,63,62,156,255,64,64,162,255,65,67,167,255,65,70,172,255,66,73,177,255,66,75,181,255,67,78,186,255,68,81,191,255,68,84,195,255,68,86,199,255,69,89,203,255,69,92,207,255,69,94,211,255,70,97,214,255,70,100,218,255,70,102,221,255,70,105,224,255,70,107,227,255,71,110,230,255,71,113,233,255,71,115,235,255,71,118,238,255,71,120,240,255,71,123,242,255,70,125,244,255,70,128,246,255,70,130,248,255,70,133,250,255,70,135,251,255,69,138,252,255,69,140,253,255,68,143,254,255,67,145,254,255,66,148,255,255,65,150,255,255,64,153,255,255,62,155,254,255,61,158,254,255,59,160,253,255,58,163,252,255,56,165,251,255,55,168,250,255,53,171,248,255,51,173,247,255,49,175,245,255,47,178,244,255,46,180,242,255,44,183,240,255,42,185,238,255,40,188,235,255,39,190,233,255,37,192,231,255,35,195,228,255,34,197,226,255,32,199,223,255,31,201,221,255,30,203,218,255,28,205,216,255,27,208,213,255,26,210,210,255,26,212,208,255,25,213,205,255,24,215,202,255,24,217,200,255,24,219,197,255,24,221,194,255,24,222,192,255,24,224,189,255,25,226,187,255,25,227,185,255,26,228,182,255,28,230,180,255,29,231,178,255,31,233,175,255,32,234,172,255,34,235,170,255,37,236,167,255,39,238,164,255,42,239,161,255,44,240,158,255,47,241,155,255,50,242,152,255,53,243,148,255,56,244,145,255,60,245,142,255,63,246,138,255,67,247,135,255,70,248,132,255,74,248,128,255,78,249,125,255,82,250,122,255,85,250,118,255,89,251,115,255,93,252,111,255,97,252,108,255,101,253,105,255,105,253,102,255,109,254,98,255,113,254,95,255,117,254,92,255,121,254,89,255,125,255,86,255,128,255,83,255,132,255,81,255,136,255,78,255,139,255,75,255,143,255,73,255,146,255,71,255,150,254,68,255,153,254,66,255,156,254,64,255,159,253,63,255,161,253,61,255,164,252,60,255,167,252,58,255,169,251,57,255,172,251,56,255,175,250,55,255,177,249,54,255,180,248,54,255,183,247,53,255,185,246,53,255,188,245,52,255,190,244,52,255,193,243,52,255,195,241,52,255,198,240,52,255,200,239,52,255,203,237,52,255,205,236,52,255,208,234,52,255,210,233,53,255,212,231,53,255,215,229,53,255,217,228,54,255,219,226,54,255,221,224,55,255,223,223,55,255,225,221,55,255,227,219,56,255,229,217,56,255,231,215,57,255,233,213,57,255,235,211,57,255,236,209,58,255,238,207,58,255,239,205,58,255,241,203,58,255,242,201,58,255,244,199,58,255,245,197,58,255,246,195,58,255,247,193,58,255,248,190,57,255,249,188,57,255,250,186,57,255,251,184,56,255,251,182,55,255,252,179,54,255,252,177,54,255,253,174,53,255,253,172,52,255,254,169,51,255,254,167,50,255,254,164,49,255,254,161,48,255,254,158,47,255,254,155,45,255,254,153,44,255,254,150,43,255,254,147,42,255,254,144,41,255,253,141,39,255,253,138,38,255,252,135,37,255,252,132,35,255,251,129,34,255,251,126,33,255,250,123,31,255,249,120,30,255,249,117,29,255,248,114,28,255,247,111,26,255,246,108,25,255,245,105,24,255,244,102,23,255,243,99,21,255,242,96,20,255,241,93,19,255,240,91,18,255,239,88,17,255,237,85,16,255,236,83,15,255,235,80,14,255,234,78,13,255,232,75,12,255,231,73,12,255,229,71,11,255,228,69,10,255,226,67,10,255,225,65,9,255,223,63,8,255,221,61,8,255,220,59,7,255,218,57,7,255,216,55,6,255,214,53,6,255,212,51,5,255,210,49,5,255,208,47,5,255,206,45,4,255,204,43,4,255,202,42,4,255,200,40,3,255,197,38,3,255,195,37,3,255,193,35,2,255,190,33,2,255,188,32,2,255,185,30,2,255,183,29,2,255,180,27,1,255,178,26,1,255,175,24,1,255,172,23,1,255,169,22,1,255,167,20,1,255,164,19,1,255,161,18,1,255,158,16,1,255,155,15,1,255,152,14,1,255,149,13,1,255,146,11,1,255,142,10,1,255,139,9,2,255,136,8,2,255,133,7,2,255,129,6,2,255,126,5,2,255,122,4,3,255]),
      rainbow: {
        colors: ['#96005A','#0000C8','#0019FF','#0098FF','#2CFF96','#97FF00','#FFEA00','#FF6F00','#FF0000'],
        positions: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
      },
      jet: {
        colors: ['#000083','#003CAA','#05FFFF','#FFFF00','#FA0000','#800000'],
        positions: [0, 0.125, 0.375, 0.625, 0.875, 1]
      },
      hsv: {
        colors: ['#ff0000','#fdff02','#f7ff02','#00fc04','#00fc0a','#01f9ff','#0200fd','#0800fd','#ff00fb','#ff00f5','#ff0006'],
        positions: [0,0.169,0.173,0.337,0.341,0.506,0.671,0.675,0.839,0.843,1]
      },
      hot: {
        colors: ['#000000','#e60000','#ffd200','#ffffff'],
        positions: [0,0.3,0.6,1]
      },
      cool: {
        colors: ['#00ffff','#ff00ff'],
        positions: [0,1]
      },
      spring: {
        colors: ['#ff00ff','#ffff00'],
        positions: [0,1]
      },
      summer: {
        colors: ['#008066','#ffff66'],
        positions: [0,1]
      },
      autumn: {
        colors: ['#ff0000','#ffff00'],
        positions: [0,1]
      },
      winter: {
        colors: ['#0000ff','#00ff80'],
        positions: [0,1]
      },
      bone: {
        colors: ['#000000','#545474','#a9c8c8','#ffffff'],
        positions: [0,0.376,0.753,1]
      },
      copper: {
        colors: ['#000000','#ffa066','#ffc77f'],
        positions: [0,0.804,1]
      },
      greys: {
        colors: ['#000000','#ffffff'],
        positions: [0,1]
      },
      yignbu: {
        colors: ['#081d58','#253494','#225ea8','#1d91c0','#41b6c4','#7fcdbb','#c7e9b4','#edf8d9','#ffffd9'],
        positions: [0,0.125,0.25,0.375,0.5,0.625,0.75,0.875,1]
      },
      greens: {
        colors: ['#00441b','#006d2c','#238b45','#41ab5d','#74c476','#a1d99b','#c7e9c0','#e5f5e0','#f7fcf5'],
        positions: [0,0.125,0.25,0.375,0.5,0.625,0.75,0.875,1]
      },
      yiorrd: {
        colors: ['#800026','#bd0026','#e31a1c','#fc4e2a','#fd8d3c','#feb24c','#fed976','#ffeda0','#ffffcc'],
        positions: [0,0.125,0.25,0.375,0.5,0.625,0.75,0.875,1]
      },
      bluered: {
        colors: ['#0000ff','#ff0000'],
        positions: [0,1]
      },
      rdbu: {
        colors: ['#050aac','#6a89f7','#bebebe','#dcaa84','#e6915a','#b20a1c'],
        positions: [0,0.35,0.5,0.6,0.7,1]
      },
      picnic: {
        colors: ['#0000ff','#3399ff','#66ccff','#99ccff','#ccccff','#ffffff','#ffccff','#ff99ff','#ff66cc','#ff6666','#ff0000'],
        positions: [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]
      },
      portland: {
        colors: ['#0c3383','#0a88ba','#f2d338','#f28f38','#d91e1e'],
        positions: [0,0.25,0.5,0.75,1]
      },
      blackbody: {
        colors: ['#000000','#e60000','#e6d200','#ffffff','#a0c8ff'],
        positions: [0,0.2,0.4,0.7,1]
      },
      earth: {
        colors: ['#000082','#00b4b4','#28d228','#e6e632','#784614','#ffffff'],
        positions: [0,0.1,0.2,0.4,0.6,1]
      },
      electric: {
        colors: ['#000000','#1e0064','#780064','#a05a00','#e6c800','#fffadc'],
        positions: [0,0.15,0.4,0.6,0.8,1]
      },
      magma: new Uint8Array([0,0,4,255,1,0,5,255,1,1,6,255,1,1,8,255,2,1,9,255,2,2,11,255,2,2,13,255,3,3,15,255,3,3,18,255,4,4,20,255,5,4,22,255,6,5,24,255,6,5,26,255,7,6,28,255,8,7,30,255,9,7,32,255,10,8,34,255,11,9,36,255,12,9,38,255,13,10,41,255,14,11,43,255,16,11,45,255,17,12,47,255,18,13,49,255,19,13,52,255,20,14,54,255,21,14,56,255,22,15,59,255,24,15,61,255,25,16,63,255,26,16,66,255,28,16,68,255,29,17,71,255,30,17,73,255,32,17,75,255,33,17,78,255,34,17,80,255,36,18,83,255,37,18,85,255,39,18,88,255,41,17,90,255,42,17,92,255,44,17,95,255,45,17,97,255,47,17,99,255,49,17,101,255,51,16,103,255,52,16,105,255,54,16,107,255,56,16,108,255,57,15,110,255,59,15,112,255,61,15,113,255,63,15,114,255,64,15,116,255,66,15,117,255,68,15,118,255,69,16,119,255,71,16,120,255,73,16,120,255,74,16,121,255,76,17,122,255,78,17,123,255,79,18,123,255,81,18,124,255,82,19,124,255,84,19,125,255,86,20,125,255,87,21,126,255,89,21,126,255,90,22,126,255,92,22,127,255,93,23,127,255,95,24,127,255,96,24,128,255,98,25,128,255,100,26,128,255,101,26,128,255,103,27,128,255,104,28,129,255,106,28,129,255,107,29,129,255,109,29,129,255,110,30,129,255,112,31,129,255,114,31,129,255,115,32,129,255,117,33,129,255,118,33,129,255,120,34,129,255,121,34,130,255,123,35,130,255,124,35,130,255,126,36,130,255,128,37,130,255,129,37,129,255,131,38,129,255,132,38,129,255,134,39,129,255,136,39,129,255,137,40,129,255,139,41,129,255,140,41,129,255,142,42,129,255,144,42,129,255,145,43,129,255,147,43,128,255,148,44,128,255,150,44,128,255,152,45,128,255,153,45,128,255,155,46,127,255,156,46,127,255,158,47,127,255,160,47,127,255,161,48,126,255,163,48,126,255,165,49,126,255,166,49,125,255,168,50,125,255,170,51,125,255,171,51,124,255,173,52,124,255,174,52,123,255,176,53,123,255,178,53,123,255,179,54,122,255,181,54,122,255,183,55,121,255,184,55,121,255,186,56,120,255,188,57,120,255,189,57,119,255,191,58,119,255,192,58,118,255,194,59,117,255,196,60,117,255,197,60,116,255,199,61,115,255,200,62,115,255,202,62,114,255,204,63,113,255,205,64,113,255,207,64,112,255,208,65,111,255,210,66,111,255,211,67,110,255,213,68,109,255,214,69,108,255,216,69,108,255,217,70,107,255,219,71,106,255,220,72,105,255,222,73,104,255,223,74,104,255,224,76,103,255,226,77,102,255,227,78,101,255,228,79,100,255,229,80,100,255,231,82,99,255,232,83,98,255,233,84,98,255,234,86,97,255,235,87,96,255,236,88,96,255,237,90,95,255,238,91,94,255,239,93,94,255,240,95,94,255,241,96,93,255,242,98,93,255,242,100,92,255,243,101,92,255,244,103,92,255,244,105,92,255,245,107,92,255,246,108,92,255,246,110,92,255,247,112,92,255,247,114,92,255,248,116,92,255,248,118,92,255,249,120,93,255,249,121,93,255,249,123,93,255,250,125,94,255,250,127,94,255,250,129,95,255,251,131,95,255,251,133,96,255,251,135,97,255,252,137,97,255,252,138,98,255,252,140,99,255,252,142,100,255,252,144,101,255,253,146,102,255,253,148,103,255,253,150,104,255,253,152,105,255,253,154,106,255,253,155,107,255,254,157,108,255,254,159,109,255,254,161,110,255,254,163,111,255,254,165,113,255,254,167,114,255,254,169,115,255,254,170,116,255,254,172,118,255,254,174,119,255,254,176,120,255,254,178,122,255,254,180,123,255,254,182,124,255,254,183,126,255,254,185,127,255,254,187,129,255,254,189,130,255,254,191,132,255,254,193,133,255,254,194,135,255,254,196,136,255,254,198,138,255,254,200,140,255,254,202,141,255,254,204,143,255,254,205,144,255,254,207,146,255,254,209,148,255,254,211,149,255,254,213,151,255,254,215,153,255,254,216,154,255,253,218,156,255,253,220,158,255,253,222,160,255,253,224,161,255,253,226,163,255,253,227,165,255,253,229,167,255,253,231,169,255,253,233,170,255,253,235,172,255,252,236,174,255,252,238,176,255,252,240,178,255,252,242,180,255,252,244,182,255,252,246,184,255,252,247,185,255,252,249,187,255,252,251,189,255,252,253,191,255]),
      plasma: new Uint8Array([13,8,135,255,16,7,136,255,19,7,137,255,22,7,138,255,25,6,140,255,27,6,141,255,29,6,142,255,32,6,143,255,34,6,144,255,36,6,145,255,38,5,145,255,40,5,146,255,42,5,147,255,44,5,148,255,46,5,149,255,47,5,150,255,49,5,151,255,51,5,151,255,53,4,152,255,55,4,153,255,56,4,154,255,58,4,154,255,60,4,155,255,62,4,156,255,63,4,156,255,65,4,157,255,67,3,158,255,68,3,158,255,70,3,159,255,72,3,159,255,73,3,160,255,75,3,161,255,76,2,161,255,78,2,162,255,80,2,162,255,81,2,163,255,83,2,163,255,85,2,164,255,86,1,164,255,88,1,164,255,89,1,165,255,91,1,165,255,92,1,166,255,94,1,166,255,96,1,166,255,97,0,167,255,99,0,167,255,100,0,167,255,102,0,167,255,103,0,168,255,105,0,168,255,106,0,168,255,108,0,168,255,110,0,168,255,111,0,168,255,113,0,168,255,114,1,168,255,116,1,168,255,117,1,168,255,119,1,168,255,120,1,168,255,122,2,168,255,123,2,168,255,125,3,168,255,126,3,168,255,128,4,168,255,129,4,167,255,131,5,167,255,132,5,167,255,134,6,166,255,135,7,166,255,136,8,166,255,138,9,165,255,139,10,165,255,141,11,165,255,142,12,164,255,143,13,164,255,145,14,163,255,146,15,163,255,148,16,162,255,149,17,161,255,150,19,161,255,152,20,160,255,153,21,159,255,154,22,159,255,156,23,158,255,157,24,157,255,158,25,157,255,160,26,156,255,161,27,155,255,162,29,154,255,163,30,154,255,165,31,153,255,166,32,152,255,167,33,151,255,168,34,150,255,170,35,149,255,171,36,148,255,172,38,148,255,173,39,147,255,174,40,146,255,176,41,145,255,177,42,144,255,178,43,143,255,179,44,142,255,180,46,141,255,181,47,140,255,182,48,139,255,183,49,138,255,184,50,137,255,186,51,136,255,187,52,136,255,188,53,135,255,189,55,134,255,190,56,133,255,191,57,132,255,192,58,131,255,193,59,130,255,194,60,129,255,195,61,128,255,196,62,127,255,197,64,126,255,198,65,125,255,199,66,124,255,200,67,123,255,201,68,122,255,202,69,122,255,203,70,121,255,204,71,120,255,204,73,119,255,205,74,118,255,206,75,117,255,207,76,116,255,208,77,115,255,209,78,114,255,210,79,113,255,211,81,113,255,212,82,112,255,213,83,111,255,213,84,110,255,214,85,109,255,215,86,108,255,216,87,107,255,217,88,106,255,218,90,106,255,218,91,105,255,219,92,104,255,220,93,103,255,221,94,102,255,222,95,101,255,222,97,100,255,223,98,99,255,224,99,99,255,225,100,98,255,226,101,97,255,226,102,96,255,227,104,95,255,228,105,94,255,229,106,93,255,229,107,93,255,230,108,92,255,231,110,91,255,231,111,90,255,232,112,89,255,233,113,88,255,233,114,87,255,234,116,87,255,235,117,86,255,235,118,85,255,236,119,84,255,237,121,83,255,237,122,82,255,238,123,81,255,239,124,81,255,239,126,80,255,240,127,79,255,240,128,78,255,241,129,77,255,241,131,76,255,242,132,75,255,243,133,75,255,243,135,74,255,244,136,73,255,244,137,72,255,245,139,71,255,245,140,70,255,246,141,69,255,246,143,68,255,247,144,68,255,247,145,67,255,247,147,66,255,248,148,65,255,248,149,64,255,249,151,63,255,249,152,62,255,249,154,62,255,250,155,61,255,250,156,60,255,250,158,59,255,251,159,58,255,251,161,57,255,251,162,56,255,252,163,56,255,252,165,55,255,252,166,54,255,252,168,53,255,252,169,52,255,253,171,51,255,253,172,51,255,253,174,50,255,253,175,49,255,253,177,48,255,253,178,47,255,253,180,47,255,253,181,46,255,254,183,45,255,254,184,44,255,254,186,44,255,254,187,43,255,254,189,42,255,254,190,42,255,254,192,41,255,253,194,41,255,253,195,40,255,253,197,39,255,253,198,39,255,253,200,39,255,253,202,38,255,253,203,38,255,252,205,37,255,252,206,37,255,252,208,37,255,252,210,37,255,251,211,36,255,251,213,36,255,251,215,36,255,250,216,36,255,250,218,36,255,249,220,36,255,249,221,37,255,248,223,37,255,248,225,37,255,247,226,37,255,247,228,37,255,246,230,38,255,246,232,38,255,245,233,38,255,245,235,39,255,244,237,39,255,243,238,39,255,243,240,39,255,242,242,39,255,241,244,38,255,241,245,37,255,240,247,36,255,240,249,33,255]),
      redblue: {
        colors: ['#ff0000', '#0000ff'],
        positions: [0,1]
      },
      coolwarm: {
        colors: ['#0000ff', '#ffffff', '#ff0000'],
        positions: [0,0.5,1]
      },
      diverging_1: {
        colors: ['#400040','#3b004d','#36005b','#320068','#2d0076','#290084','#240091','#20009f','#1b00ad','#1600ba','#1200c8','#0d00d6','#0900e3','#0400f1','#0000ff','#0217ff','#042eff','#0645ff','#095cff','#0b73ff','#0d8bff','#10a2ff','#12b9ff','#14d0ff','#17e7ff','#19ffff','#3fffff','#66ffff','#8cffff','#b2ffff','#d8ffff','#ffffff','#ffffd4','#ffffaa','#ffff7f','#ffff54','#ffff2a','#ffff00','#ffed00','#ffdd00','#ffcc00','#ffba00','#ffaa00','#ff9900','#ff8700','#ff7700','#ff6600','#ff5400','#ff4400','#ff3300','#ff2100','#ff1100','#ff0000','#ff0017','#ff002e','#ff0045','#ff005c','#ff0073','#ff008b','#ff00a2','#ff00b9','#ff00d0','#ff00e7','#ff00ff'],
        positions: [0.0,0.01587301587,0.03174603174,0.04761904761,0.06349206348,0.07936507935,0.09523809522,0.11111111109,0.12698412696,0.14285714283,0.15873015870,0.17460317457,0.19047619044,0.20634920631,0.22222222218,0.23809523805,0.25396825392,0.26984126979,0.28571428566,0.30158730153,0.31746031740,0.33333333327,0.34920634914,0.36507936501,0.38095238088,0.39682539675,0.41269841262,0.42857142849,0.44444444436,0.46031746023,0.47619047610,0.49206349197,0.50793650784,0.52380952371,0.53968253958,0.55555555545,0.57142857132,0.58730158719,0.60317460306,0.61904761893,0.63492063480,0.65079365067,0.66666666654,0.68253968241,0.69841269828,0.71428571415,0.73015873002,0.74603174589,0.76190476176,0.77777777763,0.79365079350,0.80952380937,0.82539682524,0.84126984111,0.85714285698,0.87301587285,0.88888888872,0.90476190459,0.92063492046,0.93650793633,0.95238095220,0.96825396807,0.98412698394,1]
      },
      diverging_2: {
        colors: ['#000000','#030aff','#204aff','#3c8aff','#77c4ff','#f0ffff','#f0ffff','#f2ff7f','#ffff00','#ff831e','#ff083d','#ff00ff'],
        positions: [0,0.0000000001,0.1,0.2,0.3333,0.4666,0.5333,0.6666,0.8,0.9,0.999999999999,1]
      },
      blackwhite: {
        colors: ['#000000','#ffffff'],
        positions: [0,1]
      },
      ylgnbu: {
        colors: ['#081d58','#253494','#225ea8','#1d91c0','#41b6c4','#7fcdbb','#c7e9b4','#edf8d9','#ffffd9'],
        positions: [1,0.875,0.75,0.625,0.5,0.375,0.25,0.125,0]
      },
      ylorrd: {
        colors: ['#800026','#bd0026','#e31a1c','#fc4e2a','#fd8d3c','#feb24c','#fed976','#ffeda0','#ffffcc'],
        positions: [1,0.875,0.75,0.625,0.5,0.375,0.25,0.125,0]
      },
      twilight: {
        colors: ['#E2D9E2', '#E0D9E2', '#DDD9E0', '#DAD8DF', '#D6D7DD', '#D2D5DB', '#CDD3D8', '#C8D0D6', '#C2CED4', '#BCCBD1', '#B6C8CF', '#B0C5CD', '#AAC2CC', '#A4BECA', '#9EBBC9', '#99B8C8', '#93B4C6', '#8EB1C5', '#89ADC5', '#85A9C4', '#80A5C3', '#7CA2C2', '#789EC2', '#759AC1', '#7196C1', '#6E92C0', '#6C8EBF', '#698ABF', '#6786BE', '#6682BD', '#647DBC', '#6379BB', '#6275BA', '#6170B9', '#606CB8', '#6067B6', '#5F62B4', '#5F5EB3', '#5F59B1', '#5E54AE', '#5E4FAC', '#5E4BA9', '#5E46A6', '#5D41A3', '#5D3CA0', '#5C379C', '#5B3298', '#5A2E93', '#59298E', '#572588', '#562182', '#531E7C', '#511A75', '#4E186F', '#4B1668', '#471461', '#44135A', '#411254', '#3D114E', '#3A1149', '#371144', '#351140', '#33113C', '#311339', '#301437', '#331237', '#351138', '#381139', '#3B113B', '#3F123D', '#43123E', '#481341', '#4D1443', '#521545', '#571647', '#5C1749', '#61184B', '#67194C', '#6C1B4E', '#711D4F', '#761F4F', '#7B2150', '#802350', '#852650', '#8A2950', '#8E2C50', '#922F50', '#963350', '#9A3750', '#9E3B50', '#A13F50', '#A54350', '#A84750', '#AB4B50', '#AE5051', '#B15452', '#B35953', '#B65D54', '#B86255', '#BA6657', '#BC6B59', '#BE705B', '#C0755E', '#C27A61', '#C37F64', '#C58468', '#C6896C', '#C78E71', '#C89275', '#C9977B', '#CA9C80', '#CCA186', '#CDA68C', '#CEAB92', '#CFAF99', '#D1B4A0', '#D2B8A7', '#D4BDAD', '#D6C1B4', '#D8C5BB', '#D9C9C2', '#DBCCC8', '#DDD0CE', '#DED3D3', '#DFD5D8', '#E0D7DB', '#E1D8DF', '#E2D9E1'],
        positions: [0.0000000000, 0.0078740157, 0.0157480315, 0.0236220472, 0.0314960630, 0.0393700787, 0.0472440945, 0.0551181102, 0.0629921260, 0.0708661417, 0.0787401575, 0.0866141732, 0.0944881890, 0.1023622047, 0.1102362205, 0.1181102362, 0.1259842520, 0.1338582677, 0.1417322835, 0.1496062992, 0.1574803150, 0.1653543307, 0.1732283465, 0.1811023622, 0.1889763780, 0.1968503937, 0.2047244094, 0.2125984252, 0.2204724409, 0.2283464567, 0.2362204724, 0.2440944882, 0.2519685039, 0.2598425197, 0.2677165354, 0.2755905512, 0.2834645669, 0.2913385827, 0.2992125984, 0.3070866142, 0.3149606299, 0.3228346457, 0.3307086614, 0.3385826772, 0.3464566929, 0.3543307087, 0.3622047244, 0.3700787402, 0.3779527559, 0.3858267717, 0.3937007874, 0.4015748031, 0.4094488189, 0.4173228346, 0.4251968504, 0.4330708661, 0.4409448819, 0.4488188976, 0.4566929134, 0.4645669291, 0.4724409449, 0.4803149606, 0.4881889764, 0.4960629921, 0.5039370079, 0.5118110236, 0.5196850394, 0.5275590551, 0.5354330709, 0.5433070866, 0.5511811024, 0.5590551181, 0.5669291339, 0.5748031496, 0.5826771654, 0.5905511811, 0.5984251969, 0.6062992126, 0.6141732283, 0.6220472441, 0.6299212598, 0.6377952756, 0.6456692913, 0.6535433071, 0.6614173228, 0.6692913386, 0.6771653543, 0.6850393701, 0.6929133858, 0.7007874016, 0.7086614173, 0.7165354331, 0.7244094488, 0.7322834646, 0.7401574803, 0.7480314961, 0.7559055118, 0.7637795276, 0.7716535433, 0.7795275591, 0.7874015748, 0.7952755906, 0.8031496063, 0.8110236220, 0.8188976378, 0.8267716535, 0.8346456693, 0.8425196850, 0.8503937008, 0.8582677165, 0.8661417323, 0.8740157480, 0.8818897638, 0.8897637795, 0.8976377953, 0.9055118110, 0.9133858268, 0.9212598425, 0.9291338583, 0.9370078740, 0.9448818898, 0.9527559055, 0.9606299213, 0.9685039370, 0.9763779528, 0.9842519685, 0.9921259843, 1.0000000000]
      },
      twilight_shifted: {
        colors: ['#301437', '#32123A', '#34113E', '#361142', '#391146', '#3C114B', '#3F1251', '#421257', '#46145E', '#491564', '#4C176B', '#4F1972', '#521C79', '#551F7F', '#572385', '#58278B', '#5A2B90', '#5B3095', '#5C359A', '#5D3A9E', '#5D3EA1', '#5E43A5', '#5E48A8', '#5E4DAB', '#5E52AD', '#5F57B0', '#5F5BB2', '#5F60B4', '#5F65B5', '#6069B7', '#606EB8', '#6172BA', '#6277BB', '#637BBC', '#657FBD', '#6684BD', '#6888BE', '#6B8CBF', '#6D90C0', '#7094C0', '#7398C1', '#769CC1', '#7AA0C2', '#7EA4C3', '#82A7C3', '#87ABC4', '#8CAFC5', '#91B2C6', '#96B6C7', '#9CB9C8', '#A1BDC9', '#A7C0CB', '#ADC3CD', '#B3C6CE', '#B9C9D0', '#BFCCD3', '#C5CFD5', '#CBD2D7', '#D0D4D9', '#D4D6DC', '#D8D8DE', '#DCD9DF', '#DED9E1', '#E1D9E2', '#E2D9E1', '#E1D8DF', '#E0D7DB', '#DFD5D8', '#DED3D3', '#DDD0CE', '#DBCCC8', '#D9C9C2', '#D8C5BB', '#D6C1B4', '#D4BDAD', '#D2B8A7', '#D1B4A0', '#CFAF99', '#CEAB92', '#CDA68C', '#CCA186', '#CA9C80', '#C9977B', '#C89275', '#C78E71', '#C6896C', '#C58468', '#C37F64', '#C27A61', '#C0755E', '#BE705B', '#BC6B59', '#BA6657', '#B86255', '#B65D54', '#B35953', '#B15452', '#AE5051', '#AB4B50', '#A84750', '#A54350', '#A13F50', '#9E3B50', '#9A3750', '#963350', '#922F50', '#8E2C50', '#8A2950', '#852650', '#802350', '#7B2150', '#761F4F', '#711D4F', '#6C1B4E', '#67194C', '#61184B', '#5C1749', '#571647', '#521545', '#4D1443', '#481341', '#43123E', '#3F123D', '#3B113B', '#381139', '#351138', '#331237', '#301437'],
        positions: [0.0000000000, 0.0078740157, 0.0157480315, 0.0236220472, 0.0314960630, 0.0393700787, 0.0472440945, 0.0551181102, 0.0629921260, 0.0708661417, 0.0787401575, 0.0866141732, 0.0944881890, 0.1023622047, 0.1102362205, 0.1181102362, 0.1259842520, 0.1338582677, 0.1417322835, 0.1496062992, 0.1574803150, 0.1653543307, 0.1732283465, 0.1811023622, 0.1889763780, 0.1968503937, 0.2047244094, 0.2125984252, 0.2204724409, 0.2283464567, 0.2362204724, 0.2440944882, 0.2519685039, 0.2598425197, 0.2677165354, 0.2755905512, 0.2834645669, 0.2913385827, 0.2992125984, 0.3070866142, 0.3149606299, 0.3228346457, 0.3307086614, 0.3385826772, 0.3464566929, 0.3543307087, 0.3622047244, 0.3700787402, 0.3779527559, 0.3858267717, 0.3937007874, 0.4015748031, 0.4094488189, 0.4173228346, 0.4251968504, 0.4330708661, 0.4409448819, 0.4488188976, 0.4566929134, 0.4645669291, 0.4724409449, 0.4803149606, 0.4881889764, 0.4960629921, 0.5039370079, 0.5118110236, 0.5196850394, 0.5275590551, 0.5354330709, 0.5433070866, 0.5511811024, 0.5590551181, 0.5669291339, 0.5748031496, 0.5826771654, 0.5905511811, 0.5984251969, 0.6062992126, 0.6141732283, 0.6220472441, 0.6299212598, 0.6377952756, 0.6456692913, 0.6535433071, 0.6614173228, 0.6692913386, 0.6771653543, 0.6850393701, 0.6929133858, 0.7007874016, 0.7086614173, 0.7165354331, 0.7244094488, 0.7322834646, 0.7401574803, 0.7480314961, 0.7559055118, 0.7637795276, 0.7716535433, 0.7795275591, 0.7874015748, 0.7952755906, 0.8031496063, 0.8110236220, 0.8188976378, 0.8267716535, 0.8346456693, 0.8425196850, 0.8503937008, 0.8582677165, 0.8661417323, 0.8740157480, 0.8818897638, 0.8897637795, 0.8976377953, 0.9055118110, 0.9133858268, 0.9212598425, 0.9291338583, 0.9370078740, 0.9448818898, 0.9527559055, 0.9606299213, 0.9685039370, 0.9763779528, 0.9842519685, 0.9921259843, 1.0000000000]
      },
    };

    // Generated by PEG.js v0.11.0-master.f69239d, https://pegjs.org/

    function peg$subclass(child, parent) {
      function C() { this.constructor = child; }
      C.prototype = parent.prototype;
      child.prototype = new C();
    }

    function peg$SyntaxError(message, expected, found, location) {
      this.message = message;
      this.expected = expected;
      this.found = found;
      this.location = location;
      this.name = "SyntaxError";

      // istanbul ignore next
      if (typeof Error.captureStackTrace === "function") {
        Error.captureStackTrace(this, peg$SyntaxError);
      }
    }

    peg$subclass(peg$SyntaxError, Error);

    peg$SyntaxError.buildMessage = function(expected, found) {
      var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        class: function(expectation) {
          var escapedParts = expectation.parts.map(function(part) {
            return Array.isArray(part)
              ? classEscape(part[0]) + "-" + classEscape(part[1])
              : classEscape(part);
          });

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        },

        any: function() {
          return "any character";
        },

        end: function() {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        },

        not: function(expectation) {
          return "not " + describeExpectation(expectation.expected);
        }
      };

      function hex(ch) {
        return ch.charCodeAt(0).toString(16).toUpperCase();
      }

      function literalEscape(s) {
        return s
          .replace(/\\/g, "\\\\")
          .replace(/"/g,  "\\\"")
          .replace(/\0/g, "\\0")
          .replace(/\t/g, "\\t")
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
          .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
      }

      function classEscape(s) {
        return s
          .replace(/\\/g, "\\\\")
          .replace(/\]/g, "\\]")
          .replace(/\^/g, "\\^")
          .replace(/-/g,  "\\-")
          .replace(/\0/g, "\\0")
          .replace(/\t/g, "\\t")
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
          .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
      }

      function describeExpectation(expectation) {
        return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
      }

      function describeExpected(expected) {
        var descriptions = expected.map(describeExpectation);
        var i, j;

        descriptions.sort();

        if (descriptions.length > 0) {
          for (i = 1, j = 1; i < descriptions.length; i++) {
            if (descriptions[i - 1] !== descriptions[i]) {
              descriptions[j] = descriptions[i];
              j++;
            }
          }
          descriptions.length = j;
        }

        switch (descriptions.length) {
          case 1:
            return descriptions[0];

          case 2:
            return descriptions[0] + " or " + descriptions[1];

          default:
            return descriptions.slice(0, -1).join(", ")
              + ", or "
              + descriptions[descriptions.length - 1];
        }
      }

      function describeFound(found) {
        return found ? "\"" + literalEscape(found) + "\"" : "end of input";
      }

      return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
    };

    function peg$parse(input, options) {
      options = options !== undefined ? options : {};

      var peg$FAILED = {};

      var peg$startRuleFunctions = { Expression: peg$parseExpression };
      var peg$startRuleFunction = peg$parseExpression;

      var peg$c0 = "+";
      var peg$c1 = "-";
      var peg$c2 = "*";
      var peg$c3 = "/";
      var peg$c4 = "**";
      var peg$c5 = "(";
      var peg$c6 = ")";

      var peg$r0 = /^[\-+]/;
      var peg$r1 = /^[0-9]/;
      var peg$r2 = /^[a-zA-Z_$]/;
      var peg$r3 = /^[a-zA-Z_$0-9]/;
      var peg$r4 = /^[ \t\n\r]/;

      var peg$e0 = peg$literalExpectation("+", false);
      var peg$e1 = peg$literalExpectation("-", false);
      var peg$e2 = peg$literalExpectation("*", false);
      var peg$e3 = peg$literalExpectation("/", false);
      var peg$e4 = peg$literalExpectation("**", false);
      var peg$e5 = peg$literalExpectation("(", false);
      var peg$e6 = peg$literalExpectation(")", false);
      var peg$e7 = peg$otherExpectation("float");
      var peg$e8 = peg$otherExpectation("integer");
      var peg$e9 = peg$otherExpectation("identifier");
      var peg$e10 = peg$otherExpectation("whitespace");

      var peg$f0 = function(head, tail) {
            var lhs = head;
            var i, op;

            for (i = 0; i < tail.length; i++) {
              op = tail[i][1];
              lhs = makeNode(lhs, tail[i][3], op);
            }

            return lhs;
          };
      var peg$f1 = function(head, tail) {
            var lhs = head;
            var i, op;

            for (i = 0; i < tail.length; i++) {
              op = tail[i][1];
              lhs = makeNode(lhs, tail[i][3], op);
            }
            return lhs;
          };
      var peg$f2 = function(expr) { return expr; };
      var peg$f3 = function(n, e) { return {fn:n, lhs:e}};
      var peg$f4 = function() { return parseFloat(text(), 10); };
      var peg$f5 = function() { return parseInt(text(), 10); };
      var peg$f6 = function() { return text(); };

      var peg$currPos = 0;
      var peg$savedPos = 0;
      var peg$posDetailsCache = [{ line: 1, column: 1 }];
      var peg$expected = [];
      var peg$silentFails = 0;

      var peg$result;

      if ("startRule" in options) {
        if (!(options.startRule in peg$startRuleFunctions)) {
          throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
        }

        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
      }

      function text() {
        return input.substring(peg$savedPos, peg$currPos);
      }

      function peg$literalExpectation(text, ignoreCase) {
        return { type: "literal", text: text, ignoreCase: ignoreCase };
      }

      function peg$endExpectation() {
        return { type: "end" };
      }

      function peg$otherExpectation(description) {
        return { type: "other", description: description };
      }

      function peg$computePosDetails(pos) {
        var details = peg$posDetailsCache[pos];
        var p;

        if (details) {
          return details;
        } else {
          p = pos - 1;
          while (!peg$posDetailsCache[p]) {
            p--;
          }

          details = peg$posDetailsCache[p];
          details = {
            line: details.line,
            column: details.column
          };

          while (p < pos) {
            if (input.charCodeAt(p) === 10) {
              details.line++;
              details.column = 1;
            } else {
              details.column++;
            }

            p++;
          }

          peg$posDetailsCache[pos] = details;

          return details;
        }
      }

      var peg$VALIDFILENAME = typeof options.filename === "string" && options.filename.length > 0;
      function peg$computeLocation(startPos, endPos) {
        var loc = {};

        if ( peg$VALIDFILENAME ) loc.filename = options.filename;

        var startPosDetails = peg$computePosDetails(startPos);
        loc.start = {
          offset: startPos,
          line: startPosDetails.line,
          column: startPosDetails.column
        };

        var endPosDetails = peg$computePosDetails(endPos);
        loc.end = {
          offset: endPos,
          line: endPosDetails.line,
          column: endPosDetails.column
        };

        return loc;
      }

      function peg$begin() {
        peg$expected.push({ pos: peg$currPos, variants: [] });
      }

      function peg$expect(expected) {
        var top = peg$expected[peg$expected.length - 1];

        if (peg$currPos < top.pos) { return; }

        if (peg$currPos > top.pos) {
          top.pos = peg$currPos;
          top.variants = [];
        }

        top.variants.push(expected);
      }

      function peg$buildStructuredError(expected, found, location) {
        return new peg$SyntaxError(
          peg$SyntaxError.buildMessage(expected, found),
          expected,
          found,
          location
        );
      }

      function peg$buildError() {
        var expected = peg$expected[0];
        var failPos = expected.pos;

        return peg$buildStructuredError(
          expected.variants,
          failPos < input.length ? input.charAt(failPos) : null,
          failPos < input.length
            ? peg$computeLocation(failPos, failPos + 1)
            : peg$computeLocation(failPos, failPos)
        );
      }

      function peg$parseExpression() {
        var s0, s1, s2, s3, s4, s5, s6, s7;

        var rule$expects = function (expected) {
          if (peg$silentFails === 0) peg$expect(expected);
        };

        s0 = peg$currPos;
        s1 = peg$parseTerm();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$parse_();
          rule$expects(peg$e0);
          if (input.charCodeAt(peg$currPos) === 43) {
            s5 = peg$c0;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
          }
          if (s5 === peg$FAILED) {
            rule$expects(peg$e1);
            if (input.charCodeAt(peg$currPos) === 45) {
              s5 = peg$c1;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseTerm();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parse_();
            rule$expects(peg$e0);
            if (input.charCodeAt(peg$currPos) === 43) {
              s5 = peg$c0;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
            }
            if (s5 === peg$FAILED) {
              rule$expects(peg$e1);
              if (input.charCodeAt(peg$currPos) === 45) {
                s5 = peg$c1;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              s7 = peg$parseTerm();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          peg$savedPos = s0;
          s0 = peg$f0(s1, s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseTerm() {
        var s0, s1, s2, s3, s4, s5, s6, s7;

        var rule$expects = function (expected) {
          if (peg$silentFails === 0) peg$expect(expected);
        };

        s0 = peg$currPos;
        s1 = peg$parseExponential();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$parse_();
          rule$expects(peg$e2);
          if (input.charCodeAt(peg$currPos) === 42) {
            s5 = peg$c2;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
          }
          if (s5 === peg$FAILED) {
            rule$expects(peg$e3);
            if (input.charCodeAt(peg$currPos) === 47) {
              s5 = peg$c3;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseExponential();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parse_();
            rule$expects(peg$e2);
            if (input.charCodeAt(peg$currPos) === 42) {
              s5 = peg$c2;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
            }
            if (s5 === peg$FAILED) {
              rule$expects(peg$e3);
              if (input.charCodeAt(peg$currPos) === 47) {
                s5 = peg$c3;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              s7 = peg$parseExponential();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          peg$savedPos = s0;
          s0 = peg$f1(s1, s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseExponential() {
        var s0, s1, s2, s3, s4, s5, s6, s7;

        var rule$expects = function (expected) {
          if (peg$silentFails === 0) peg$expect(expected);
        };

        s0 = peg$currPos;
        s1 = peg$parseFactor();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$parse_();
          rule$expects(peg$e4);
          if (input.substr(peg$currPos, 2) === peg$c4) {
            s5 = peg$c4;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseFactor();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parse_();
            rule$expects(peg$e4);
            if (input.substr(peg$currPos, 2) === peg$c4) {
              s5 = peg$c4;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              s7 = peg$parseFactor();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          peg$savedPos = s0;
          s0 = peg$f1(s1, s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseFactor() {
        var s0, s1, s2, s3, s4, s5;

        var rule$expects = function (expected) {
          if (peg$silentFails === 0) peg$expect(expected);
        };

        s0 = peg$currPos;
        rule$expects(peg$e5);
        if (input.charCodeAt(peg$currPos) === 40) {
          s1 = peg$c5;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          s3 = peg$parseExpression();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            rule$expects(peg$e6);
            if (input.charCodeAt(peg$currPos) === 41) {
              s5 = peg$c6;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f2(s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseFloat();
          if (s0 === peg$FAILED) {
            s0 = peg$parseInteger();
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseIdentifier();
              if (s1 !== peg$FAILED) {
                rule$expects(peg$e5);
                if (input.charCodeAt(peg$currPos) === 40) {
                  s2 = peg$c5;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$parseExpression();
                  if (s3 !== peg$FAILED) {
                    rule$expects(peg$e6);
                    if (input.charCodeAt(peg$currPos) === 41) {
                      s4 = peg$c6;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                    }
                    if (s4 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f3(s1, s3);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseIdentifier();
              }
            }
          }
        }

        return s0;
      }

      function peg$parseFloat() {
        var s0, s1, s2, s3, s4, s5;

        var rule$expects = function (expected) {
          if (peg$silentFails === 0) peg$expect(expected);
        };

        rule$expects(peg$e7);
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        if (peg$r0.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
        }
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$r0.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
          }
        }
        s2 = [];
        if (peg$r1.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$r1.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            if (peg$r1.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                if (peg$r1.test(input.charAt(peg$currPos))) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                }
              }
            } else {
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f4();
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;

        return s0;
      }

      function peg$parseInteger() {
        var s0, s1, s2, s3;

        var rule$expects = function (expected) {
          if (peg$silentFails === 0) peg$expect(expected);
        };

        rule$expects(peg$e8);
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        if (peg$r0.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
        }
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$r0.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
          }
        }
        s2 = [];
        if (peg$r1.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$r1.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f5();
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;

        return s0;
      }

      function peg$parseIdentifier() {
        var s0, s1, s2, s3, s4;

        var rule$expects = function (expected) {
          if (peg$silentFails === 0) peg$expect(expected);
        };

        rule$expects(peg$e9);
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        if (peg$r0.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
        }
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$r0.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
          }
        }
        if (peg$r2.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$r3.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$r3.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
            }
          }
          peg$savedPos = s0;
          s0 = peg$f6();
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;

        return s0;
      }

      function peg$parse_() {
        var s0, s1;

        var rule$expects = function (expected) {
          if (peg$silentFails === 0) peg$expect(expected);
        };

        rule$expects(peg$e10);
        peg$silentFails++;
        s0 = [];
        if (peg$r4.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
        }
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$r4.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
          }
        }
        peg$silentFails--;

        return s0;
      }


          function makeNode(lhs, rhs, op) {
            if (typeof lhs === 'number' && typeof rhs === 'number') {
              switch(op) {
                case '+':
                  return lhs + rhs;
                case '-':
                  return lhs - rhs;
                case '*':
                  return lhs * rhs;
                case '/':
                  return lhs / rhs;
                case '**':
                  return Math.pow(lhs, rhs);
              }
            }

            return {
              lhs: lhs,
              rhs: rhs,
              op: op
            };
          }


      peg$begin();
      peg$result = peg$startRuleFunction();

      if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
      } else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
          peg$expect(peg$endExpectation());
        }

        throw peg$buildError();
      }
    }

    var arithmeticsParser = {
      SyntaxError: peg$SyntaxError,
      parse: peg$parse
    };

    /**
     * The main plotty module.
     * @module plotty
     * @name plotty
     * @author: Daniel Santillan
     */

    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    function defaultFor(arg, val) { return typeof arg !== 'undefined' ? arg : val; }

    function create3DContext(canvas, optAttribs) {
      const names = ['webgl', 'experimental-webgl'];
      let context = null;
      for (let ii = 0; ii < names.length; ++ii) {
        try {
          context = canvas.getContext(names[ii], optAttribs);
        } catch(e) {}  // eslint-disable-line
        if (context) {
          break;
        }
      }
      if (!context || !context.getExtension('OES_texture_float')) {
        return null;
      }
      return context;
    }

    function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
      // create the shader program
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vertexShader));
      }

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(fragmentShader));
      }

      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      return program;
    }

    function setRectangle(gl, x, y, width, height) {
      const x1 = x;
      const x2 = x + width;
      const y1 = y;
      const y2 = y + height;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2]), gl.STATIC_DRAW);
    }

    function createDataset(gl, id, data, width, height) {
      let textureData;
      if (gl) {
        gl.viewport(0, 0, width, height);
        textureData = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureData);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0,
          gl.LUMINANCE,
          width, height, 0,
          gl.LUMINANCE, gl.FLOAT, new Float32Array(data)
        );
      }
      return { textureData, width, height, data, id };
    }

    function destroyDataset(gl, dataset) {
      if (gl) {
        gl.deleteTexture(dataset.textureData);
      }
    }

    /**
     * Add a new colorscale to the list of available colorscales.
     * @memberof module:plotty
     * @param {String} name the name of the newly defined color scale
     * @param {String[]} colors the array containing the colors. Each entry shall
     *                          adhere to the CSS color definitions.
     * @param {Number[]} positions the value position for each of the colors
     */
    function addColorScale(name, colors, positions) {
      if (colors.length !== positions.length) {
        throw new Error('Invalid color scale.');
      }
      colorscales[name] = { colors, positions };
    }

    /**
     * Render the colorscale to the specified canvas.
     * @memberof module:plotty
     * @param {String} name the name of the color scale to render
     * @param {HTMLCanvasElement} canvas the canvas to render to
     */
    function renderColorScaleToCanvas(name, canvas) {
      /* eslint-disable no-param-reassign */
      const csDef = colorscales[name];
      canvas.height = 1;
      const ctx = canvas.getContext('2d');

      if (Object.prototype.toString.call(csDef) === '[object Object]') {
        canvas.width = 256;
        const gradient = ctx.createLinearGradient(0, 0, 256, 1);

        for (let i = 0; i < csDef.colors.length; ++i) {
          gradient.addColorStop(csDef.positions[i], csDef.colors[i]);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 1);
      } else if (Object.prototype.toString.call(csDef) === '[object Uint8Array]') {
        canvas.width = 256;
        const imgData = ctx.createImageData(256, 1);
        imgData.data.set(csDef);
        ctx.putImageData(imgData, 0, 0);
      } else {
        throw new Error('Color scale not defined.');
      }
      /* eslint-enable no-param-reassign */
    }

    const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform mat3 u_matrix;
uniform vec2 u_resolution;
varying vec2 v_texCoord;
void main() {
  // apply transformation matrix
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;
  // convert the rectangle from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;
  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
}`;


    // Definition of fragment shader
    const fragmentShaderSource = `
precision mediump float;
// our texture
uniform sampler2D u_textureData;
uniform sampler2D u_textureScale;
uniform vec2 u_textureSize;
uniform vec2 u_domain;
uniform vec2 u_display_range;
uniform bool u_apply_display_range;
uniform float u_noDataValue;
uniform bool u_clampLow;
uniform bool u_clampHigh;
// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
  float value = texture2D(u_textureData, v_texCoord)[0];
  if(value < -3.402823466e+38) // Check for possible NaN value
    gl_FragColor = vec4(0.0, 0, 0, 0.0);
  else if (value == u_noDataValue)
    gl_FragColor = vec4(0.0, 0, 0, 0.0);
  else if (u_apply_display_range && (value < u_display_range[0] || value >= u_display_range[1]))
        gl_FragColor = vec4(0.0, 0, 0, 0.0);
  else if ((!u_clampLow && value < u_domain[0]) || (!u_clampHigh && value > u_domain[1]))
    gl_FragColor = vec4(0, 0, 0, 0);
  else {
    float normalisedValue = (value - u_domain[0]) / (u_domain[1] - u_domain[0]);
    gl_FragColor = texture2D(u_textureScale, vec2(normalisedValue, 0));
  }
}`;

    /**
     * The raster plot class.
     * @memberof module:plotty
     * @constructor
     * @param {Object} options the options to pass to the plot.
     * @param {HTMLCanvasElement} [options.canvas=document.createElement('canvas')]
     *        the canvas to render to
     * @param {TypedArray} [options.data] the raster data to render
     * @param {Number} [options.width] the width of the input raster
     * @param {Number} [options.height] the height of the input raster
     * @param {Object[]} [options.datasets=undefined] a list of named datasets. each
     *         must have 'id', 'data', 'width' and 'height'.
     * @param {(HTMLCanvasElement|HTMLImageElement)} [options.colorScaleImage=undefined]
     *        the color scale image to use
     * @param {String} [options.colorScale] the name of a named color scale to use
     * @param {Number[]} [options.domain=[0, 1]] the value domain to scale the color
     * @param {Number[]} [options.displayRange=[0, 1]] range of values that will be
     *        rendered, values outside of the range will be transparent
     * @param {Boolean} [options.applyDisplayRange=false] set if displayRange should
     *        be used
     * @param {Boolean} [options.clampLow=true] whether or now values below the domain
     *        shall be clamped
     * @param {Boolean} [options.clampHigh=clampLow] whether or now values above the
     * domain shall be clamped (if not defined defaults to clampLow value)
     * @param {Number} [options.noDataValue = undefined] the no-data value that shall
     *         always be hidden
     * @param {Array} [options.matrix=[1, 0, 0, 0, 1, 0, 0, 0, 1 ]] Transformation matrix
     * @param {Boolean} [options.useWebGL=true] plotty can also function with pure javascript
     *         but it is much slower then using WebGl rendering
     *
     */
    class plot {
      constructor(options) {
        this.datasetCollection = {};
        this.currentDataset = null;

        this.setCanvas(options.canvas);
        // check if a webgl context is requested and available and set up the shaders
        let gl;

        // eslint-disable-next-line no-cond-assign
        if (defaultFor(options.useWebGL, true) && (gl = create3DContext(this.canvas))) {
          this.gl = gl;

          this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
          gl.useProgram(this.program);

          // look up where the vertex data needs to go.
          const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');

          // provide texture coordinates for the rectangle.
          this.texCoordBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0]), gl.STATIC_DRAW);
          gl.enableVertexAttribArray(texCoordLocation);
          gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        } else {
          this.ctx = this.canvas.getContext('2d');
        }

        if (options.colorScaleImage) {
          this.setColorScaleImage(options.colorScaleImage);
        } else {
          this.setColorScale(defaultFor(options.colorScale, 'viridis'));
        }
        this.setDomain(defaultFor(options.domain, [0, 1]));
        this.displayRange = defaultFor(options.displayRange, [0, 1]);
        this.applyDisplayRange = defaultFor(options.applyDisplayRange, false);
        this.setClamp(defaultFor(options.clampLow, true), options.clampHigh);
        this.setNoDataValue(options.noDataValue);

        if (options.data) {
          const l = options.data.length;
          this.setData(
            options.data,
            defaultFor(options.width, options.data[l - 2]),
            defaultFor(options.height, options.data[l - 2])
          );
        }

        if (options.datasets) {
          for (let i = 0; i < options.datasets.length; ++i) {
            const ds = options.datasets[i];
            this.addDataset(ds.id, ds.data, ds.width, ds.height);
          }
        }

        if (options.matrix) {
          this.matrix = options.matrix;
        } else {  // if no matrix is provided, supply identity matrix
          this.matrix = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
          ];
        }
      }

      /**
       * Get the raw data from the currently selected dataset.
       * @returns {TypedArray} the data of the currently selected dataset.
       */
      getData() {
        const dataset = this.currentDataset;
        if (!dataset) {
          throw new Error('No dataset available.');
        }
        return dataset.data;
      }

      /**
       * Query the raw raster data at the specified coordinates.
       * @param {Number} x the x coordinate
       * @param {Number} y the y coordinate
       * @returns {Number} the value at the specified coordinates
       */
      atPoint(x, y) {
        const dataset = this.currentDataset;
        if (!dataset) {
          throw new Error('No dataset available.');
        } else if (x >= dataset.width || y >= dataset.height) {
          throw new Error('Coordinates are outside of image bounds.');
        }
        return dataset.data[(y * dataset.width) + x];
      }

      /**
       * Set the raw raster data to be rendered. This creates a new unnamed dataset.
       * @param {TypedArray} data the raw raster data. This can be a typed array of
       *                          any type, but will be coerced to Float32Array when
       *                          beeing rendered.
       * @param {int} width the width of the raster image
       * @param {int} height the height of the data
       */
      setData(data, width, height) {
        if (this.currentDataset && this.currentDataset.id === null) {
          destroyDataset(this.gl, this.currentDataset);
        }
        this.currentDataset = createDataset(this.gl, null, data, width, height);
      }

      /**
       * Add a new named dataset. The semantics are the same as with @see setData.
       * @param {string} id the identifier for the dataset.
       * @param {TypedArray} data the raw raster data. This can be a typed array of
       *                          any type, but will be coerced to Float32Array when
       *                          beeing rendered.
       * @param {int} width the width of the raster image
       * @param {int} height the height of the data
       */
      addDataset(id, data, width, height) {
        if (this.datasetAvailable(id)) {
          throw new Error(`There is already a dataset registered with id '${id}'`);
        }
        this.datasetCollection[id] = createDataset(this.gl, id, data, width, height);
        if (!this.currentDataset) {
          this.currentDataset = this.datasetCollection[id];
        }
      }

      /**
       * Set the current dataset to be rendered.
       * @param {string} id the identifier of the dataset to be rendered.
       */
      setCurrentDataset(id) {
        if (!this.datasetAvailable(id)) {
          throw new Error(`No such dataset registered: '${id}'`);
        }
        if (this.currentDataset && this.currentDataset.id === null) {
          destroyDataset(this.gl, this.currentDataset);
        }
        this.currentDataset = this.datasetCollection[id];
      }

      /**
       * Remove the dataset.
       * @param {string} id the identifier of the dataset to be removed.
       */
      removeDataset(id) {
        const dataset = this.datasetCollection[id];
        if (!dataset) {
          throw new Error(`No such dataset registered: '${id}'`);
        }
        destroyDataset(this.gl, dataset);
        if (this.currentDataset === dataset) {
          this.currentDataset = null;
        }
        delete this.datasetCollection[id];
      }

      /**
       * Check if the dataset is available.
       * @param {string} id the identifier of the dataset to check.
       * @returns {Boolean} whether or not a dataset with that identifier is defined
       */
      datasetAvailable(id) {
        return hasOwnProperty(this.datasetCollection, id);
      }

      /**
       * Retrieve the rendered color scale image.
       * @returns {(HTMLCanvasElement|HTMLImageElement)} the canvas or image element
       *                                                 for the rendered color scale
       */
      getColorScaleImage() {
        return this.colorScaleImage;
      }

      /**
       * Set the canvas to draw to. When no canvas is supplied, a new canvas element
       * is created.
       * @param {HTMLCanvasElement} [canvas] the canvas element to render to.
       */
      setCanvas(canvas) {
        this.canvas = canvas || document.createElement('canvas');
      }

      /**
       * Set the new value domain for the rendering.
       * @param {float[]} domain the value domain range in the form [low, high]
       */
      setDomain(domain) {
        if (!domain || domain.length !== 2) {
          throw new Error('Invalid domain specified.');
        }
        this.domain = domain;
      }

      /**
       * Set the display range that will be rendered, values outside of the range
       * will not be rendered (transparent)
       * @param {float[]} view range array in the form [min, max]
       */
      setDisplayRange(displayRange) {
        if (!displayRange || displayRange.length !== 2) {
          throw new Error('Invalid view range specified.');
        }
        this.displayRange = displayRange;
        // When setting view range automatically enable the apply flag
        this.applyDisplayRange = true;
      }

      /**
       * Get the canvas that is currently rendered to.
       * @returns {HTMLCanvasElement} the canvas that is currently rendered to.
       */
      getCanvas() {
        return this.canvas;
      }

      /**
       * Set the currently selected color scale.
       * @param {string} name the name of the colorscale. Must be registered.
       */
      setColorScale(name) {
        if (!hasOwnProperty(colorscales, name)) {
          throw new Error(`No such color scale '${name}'`);
        }
        if (!this.colorScaleCanvas) {
          // Create single canvas to render colorscales
          this.colorScaleCanvas = document.createElement('canvas');
          this.colorScaleCanvas.width = 256;
          this.colorScaleCanvas.height = 1;
        }
        renderColorScaleToCanvas(name, this.colorScaleCanvas);
        this.name = name;
        this.setColorScaleImage(this.colorScaleCanvas);
      }

      /**
       * Set the clamping for the lower and the upper border of the values. When
       * clamping is enabled for either side, the values below or above will be
       * clamped to the minimum/maximum color.
       * @param {Boolean} clampLow whether or not the minimum shall be clamped.
       * @param {Boolean} clampHigh whether or not the maxmimum shall be clamped.
       *                            defaults to clampMin.
       */
      setClamp(clampLow, clampHigh) {
        this.clampLow = clampLow;
        this.clampHigh = (typeof clampHigh !== 'undefined') ? clampHigh : clampLow;
      }

      /**
       * Set the currently selected color scale as an image or canvas.
       * @param {(HTMLCanvasElement|HTMLImageElement)} colorScaleImage the new color
       *                                                               scale image
       */
      setColorScaleImage(colorScaleImage) {
        this.colorScaleImage = colorScaleImage;
        const gl = this.gl;
        if (gl) {
          if (this.textureScale) {
            gl.deleteTexture(this.textureScale);
          }
          this.textureScale = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, this.textureScale);

          // Set the parameters so we can render any size image.
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          // Upload the image into the texture.
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, colorScaleImage);
        }
      }

      /**
       * Set the no-data-value: a special value that will be rendered transparent.
       * @param {float} noDataValue the no-data-value. Use null to clear a
       *                            previously set no-data-value.
       */
      setNoDataValue(noDataValue) {
        this.noDataValue = noDataValue;
      }

      /**
       * Render the map to the specified canvas with the given settings.
       */
      render() {
        const canvas = this.canvas;
        const dataset = this.currentDataset;

        canvas.width = dataset.width;
        canvas.height = dataset.height;

        let ids = null;
        if (this.expressionAst) {
          const idsSet = new Set([]);
          const getIds = (node) => {
            if (typeof node === 'string') {
              // ids should not contain unary operators
              idsSet.add(node.replace(new RegExp(/[+-]/, 'g'), ''));
            }
            if (typeof node.lhs === 'string') {
              idsSet.add(node.lhs.replace(new RegExp(/[+-]/, 'g'), ''));
            } else if (typeof node.lhs === 'object') {
              getIds(node.lhs);
            }
            if (typeof node.rhs === 'string') {
              idsSet.add(node.rhs.replace(new RegExp(/[+-]/, 'g'), ''));
            } else if (typeof node.rhs === 'object') {
              getIds(node.rhs);
            }
          };
          getIds(this.expressionAst);
          ids = Array.from(idsSet);
        }

        let program = null;

        if (this.gl) {
          const gl = this.gl;
          gl.viewport(0, 0, dataset.width, dataset.height);

          if (this.expressionAst) {
            const expressionReducer = (node) => {
              if (typeof node === 'object') {
                if (node.op === '**') {
                  // math power operator substitution
                  return `pow(${expressionReducer(node.lhs)}, ${expressionReducer(node.rhs)})`;
                }
                if (node.fn) {
                  return `(${node.fn}(${expressionReducer(node.lhs)}))`;
                }
                return `(${expressionReducer(node.lhs)} ${node.op} ${expressionReducer(node.rhs)})`;
              } else if (typeof node === 'string') {
                return `${node}_value`;
              }
              return `float(${node})`;
            };

            const compiledExpression = expressionReducer(this.expressionAst);

            // Definition of fragment shader
            const fragmentShaderSourceExpressionTemplate = `
        precision mediump float;
        // our texture
        uniform sampler2D u_textureScale;

        // add all required textures
${ids.map(id => `        uniform sampler2D u_texture_${id};`).join('\n')}

        uniform vec2 u_textureSize;
        uniform vec2 u_domain;
        uniform float u_noDataValue;
        uniform bool u_clampLow;
        uniform bool u_clampHigh;
        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;
        void main() {
${ids.map(id => `          float ${id}_value = texture2D(u_texture_${id}, v_texCoord)[0];`).join('\n')}
          float value = ${compiledExpression};

          if (value == u_noDataValue)
            gl_FragColor = vec4(0.0, 0, 0, 0.0);
          else if ((!u_clampLow && value < u_domain[0]) || (!u_clampHigh && value > u_domain[1]))
            gl_FragColor = vec4(0, 0, 0, 0);
          else {
            float normalisedValue = (value - u_domain[0]) / (u_domain[1] - u_domain[0]);
            gl_FragColor = texture2D(u_textureScale, vec2(normalisedValue, 0));
          }
        }`;
            program = createProgram(gl, vertexShaderSource, fragmentShaderSourceExpressionTemplate);
            gl.useProgram(program);

            gl.uniform1i(gl.getUniformLocation(program, 'u_textureScale'), 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.textureScale);
            for (let i = 0; i < ids.length; ++i) {
              const location = i + 1;
              const id = ids[i];
              const ds = this.datasetCollection[id];
              if (!ds) {
                throw new Error(`No such dataset registered: '${id}'`);
              }
              gl.uniform1i(gl.getUniformLocation(program, `u_texture_${id}`), location);
              gl.activeTexture(gl[`TEXTURE${location}`]);
              gl.bindTexture(gl.TEXTURE_2D, ds.textureData);
            }
          } else {
            program = this.program;
            gl.useProgram(program);
            // set the images
            gl.uniform1i(gl.getUniformLocation(program, 'u_textureData'), 0);
            gl.uniform1i(gl.getUniformLocation(program, 'u_textureScale'), 1);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, dataset.textureData);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.textureScale);
          }
          const positionLocation = gl.getAttribLocation(program, 'a_position');
          const domainLocation = gl.getUniformLocation(program, 'u_domain');
          const displayRangeLocation = gl.getUniformLocation(
            program, 'u_display_range'
          );
          const applyDisplayRangeLocation = gl.getUniformLocation(
            program, 'u_apply_display_range'
          );
          const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
          const noDataValueLocation = gl.getUniformLocation(program, 'u_noDataValue');
          const clampLowLocation = gl.getUniformLocation(program, 'u_clampLow');
          const clampHighLocation = gl.getUniformLocation(program, 'u_clampHigh');
          const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

          gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
          gl.uniform2fv(domainLocation, this.domain);
          gl.uniform2fv(displayRangeLocation, this.displayRange);
          gl.uniform1i(applyDisplayRangeLocation, this.applyDisplayRange);
          gl.uniform1i(clampLowLocation, this.clampLow);
          gl.uniform1i(clampHighLocation, this.clampHigh);
          gl.uniform1f(noDataValueLocation, this.noDataValue);
          gl.uniformMatrix3fv(matrixLocation, false, this.matrix);

          const positionBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

          setRectangle(gl, 0, 0, canvas.width, canvas.height);

          // Draw the rectangle.
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        } else if (this.ctx) {
          const ctx = this.ctx;
          const w = canvas.width;
          const h = canvas.height;

          const imageData = ctx.createImageData(w, h);

          const trange = this.domain[1] - this.domain[0];
          const steps = this.colorScaleCanvas.width;
          const csImageData = this.colorScaleCanvas.getContext('2d').getImageData(0, 0, steps, 1).data;
          let alpha;

          const data = dataset.data;

          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const i = (y * w) + x;
              // TODO: Possible increase of performance through use of worker threads?

              let c = Math.floor(((data[i] - this.domain[0]) / trange) * (steps - 1));
              alpha = 255;
              if (c < 0) {
                c = 0;
                if (!this.clampLow) {
                  alpha = 0;
                }
              } else if (c > 255) {
                c = 255;
                if (!this.clampHigh) {
                  alpha = 0;
                }
              }
              // NaN values should be the only values that are not equal to itself
              if (data[i] === this.noDataValue || data[i] !== data[i]) {
                alpha = 0;
              } else if (this.applyDisplayRange
                && (data[i] < this.displayRange[0] || data[i] >= this.displayRange[1])) {
                alpha = 0;
              }

              const index = ((y * w) + x) * 4;
              imageData.data[index + 0] = csImageData[c * 4];
              imageData.data[index + 1] = csImageData[(c * 4) + 1];
              imageData.data[index + 2] = csImageData[(c * 4) + 2];
              imageData.data[index + 3] = alpha;
            }
          }

          ctx.putImageData(imageData, 0, 0); // at coords 0,0
        }
      }

      /**
       * Render the specified dataset with the current settings.
       * @param {string} id the identifier of the dataset to render.
       */
      renderDataset(id) {
        this.setCurrentDataset(id);
        return this.render();
      }

      /**
       * Get the color for the specified value.
       * @param {flaot} val the value to query the color for.
       * @returns {Array} the 4-tuple: red, green, blue, alpha in the range 0-255.
       */
      getColor(val) {
        const steps = this.colorScaleCanvas.width;
        const csImageData = this.colorScaleCanvas.getContext('2d')
                                                 .getImageData(0, 0, steps, 1).data;
        const trange = this.domain[1] - this.domain[0];
        let c = Math.round(((val - this.domain[0]) / trange) * steps);
        let alpha = 255;
        if (c < 0) {
          c = 0;
          if (!this.clampLow) {
            alpha = 0;
          }
        }
        if (c > 255) {
          c = 255;
          if (!this.clampHigh) {
            alpha = 0;
          }
        }

        return [
          csImageData[c * 4],
          csImageData[(c * 4) + 1],
          csImageData[(c * 4) + 2],
          alpha,
        ];
      }
      /**
       * Sets a mathematical expression to be evaluated on the plot. Expression can contain mathematical operations with integer/float values, dataset identifiers or GLSL supported functions with a single parameter.
       * Supported mathematical operations are: add '+', subtract '-', multiply '*', divide '/', power '**', unary plus '+a', unary minus '-a'.
       * Useful GLSL functions are for example: radians, degrees, sin, asin, cos, acos, tan, atan, log2, log, sqrt, exp2, exp, abs, sign, floor, ceil, fract.
       * @param {string} expression Mathematical expression. Example: '-2 * sin(3.1415 - dataset1) ** 2'
       */
      setExpression(expression) {
        if (!expression || !expression.length) {
          this.expressionAst = null;
        } else {
          this.expressionAst = arithmeticsParser.parse(expression);
        }
      }
    }

    L.RaspRendererPlotty = L.Class.extend({
        options: {
            sideScaleContainerId: "sideScaleDiv",
            bottomScaleContainerId: "bottomScaleDiv",
        },
        initialize: function(canvas, options) {
            this.targetCanvas = canvas;
            this.workingCanvas = document.createElement("canvas");

            // Color scales
            var sideScaleContainer = document.getElementById(this.options.sideScaleContainerId);
            this.sideScaleUnit = L.DomUtil.create('div', 'scaleUnit', sideScaleContainer);
            this.sideScaleMax = L.DomUtil.create('div', 'scaleMax', sideScaleContainer);
            var sideScaleCanvasContainer = L.DomUtil.create('div', 'sideScaleCanvasDiv', sideScaleContainer);
            this.sideScaleCanvas = L.DomUtil.create('canvas', '', sideScaleCanvasContainer);
            this.sideScaleCanvas.height = 256;
            this.sideScaleCanvas.width = 1;
            this.sideScaleIndicator = L.DomUtil.create('div', 'sideScaleIndicator', sideScaleCanvasContainer);
            this.sideScaleIndicatorMarker = L.DomUtil.create('div', 'sideScaleIndicatorMarker', this.sideScaleIndicator);
            this.sideScaleIndicatorValue = L.DomUtil.create('div', 'sideScaleIndicatorValue', this.sideScaleIndicator);
            this.sideScaleMin = L.DomUtil.create('div', 'scaleMin', sideScaleContainer);

            var bottomScaleContainer = document.getElementById(this.options.bottomScaleContainerId);
            this.bottomScaleMin = L.DomUtil.create('div', 'scaleMin', bottomScaleContainer);
            var bottomScaleCanvasContainer = L.DomUtil.create('div', 'bottomScaleCanvasDiv', bottomScaleContainer);
            this.bottomScaleCanvas = L.DomUtil.create('canvas', '', bottomScaleCanvasContainer);
            this.bottomScaleCanvas.height = 1;
            this.bottomScaleCanvas.width = 256;
            this.bottomScaleIndicator = L.DomUtil.create('div', 'bottomScaleIndicator', bottomScaleCanvasContainer);
            this.bottomScaleIndicatorMarker = L.DomUtil.create('div', 'bottomScaleIndicatorMarker', this.bottomScaleIndicator);
            this.bottomScaleIndicatorValue = L.DomUtil.create('div', 'bottomScaleIndicatorValue', this.bottomScaleIndicator);
            this.bottomScaleMax = L.DomUtil.create('div', 'scaleMax', bottomScaleContainer);
            this.bottomScaleUnit = L.DomUtil.create('div', 'scaleUnit', bottomScaleContainer);

            addColorScale("rasp", ["#004dff", "#01f8e9", "#34c00c", "#f8fd00", "#ff9b00", "#ff1400"], [0, 0.2, 0.4, 0.6, 0.8, 1]);
            addColorScale("bsratio", ["#00000040", "#00000020", "#00000020", "#00000000"], [0.2999999, 0.3, 0.6999999, 0.7]);
            addColorScale("clouds", ["#ffffff", "#000000"], [0, 1]);
            addColorScale("cloudpotential", ["#004dff", "#ffffbf", "#ff1400"], [0, 0.5, 1]);
            addColorScale("pfd", ["#ffffff", "#fec6fe", "#fc64fc", "#7f93e2", "#2e5de5", "#009900", "#57fc00", "#ffe900", "#f08200", "#ae1700"], [0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1]);
            this.plottyplot = new plot({
                canvas: this.workingCanvas,
                domain: [0, 1],
                clampLow: true,
                clampHigh: true,
                noDataValue: -999999,
                colorScale: 'rasp',
            });
        },
        render: function(georaster, options) {
            this._updateDataset(georaster, options.append);
            this.plottyplot.setDomain(options.domain);
            this.plottyplot.setColorScale(options.colorscale ? options.colorscale : 'rasp'); // Default to rasp
            this.plottyplot.render();
            if (!options.append) {
                this.targetCanvas.width = this.workingCanvas.width;
                this.targetCanvas.height = this.workingCanvas.height;
                this._updateScale(options.domain, options.unit);
            }
            this.targetCanvas.getContext('2d').drawImage(this.workingCanvas, 0, 0);
        },
        _updateDataset: function(georaster, append) {
            if (this.plottyplot.datasetAvailable('dataset')) {
                this.plottyplot.removeDataset('dataset');
            }
            // It seems like the data has to be shifted down by 1 pixel, but I do not know why
            // This is a plotting issue, the data in georaster is definitely correct (checked with QGIS)
            this.data = new Float32Array(georaster.width * georaster.height);
            for (let i = 0; i < georaster.width; i++) {
                this.data[i] = georaster.noDataValue;
            }
            for (let i = 1; i < georaster.height; i++) {
                for (let j = 0; j < georaster.width; j++) {
                    this.data[i * georaster.width + j] = georaster.values[0][i-1][j];
                }
            }
            this.plottyplot.addDataset('dataset', this.data, georaster.width, georaster.height);
        },
        _updateScale: function(domain, unit) {
            this._updateColorscale(domain, unit);
            this._updateScaleAnnotation(domain[0], domain[1], unit);
        },
        _updateColorscale: function(domain, unit) {
            let colorScaleCanvas = this.plottyplot.colorScaleCanvas;
            let colorScaleCtx = colorScaleCanvas.getContext('2d');
            let colorScaleData = colorScaleCtx.getImageData(0, 0, colorScaleCanvas.width, colorScaleCanvas.height);
            let bottomScaleCtx = this.bottomScaleCanvas.getContext('2d');
            bottomScaleCtx.putImageData(colorScaleData, 0, 0);
            // The color scale data has to be flipped for rendering it vertically in the side scale
            let sideScaleCtx = this.sideScaleCanvas.getContext('2d');
            let sideScaleData = sideScaleCtx.createImageData(colorScaleCanvas.height, colorScaleCanvas.width);
            for (let i = 0; i < colorScaleData.data.length; i+=4) {
                let r = colorScaleData.data.length - 4 - i;
                sideScaleData.data[i] = colorScaleData.data[r];
                sideScaleData.data[i+1] = colorScaleData.data[r+1];
                sideScaleData.data[i+2] = colorScaleData.data[r+2];
                sideScaleData.data[i+3] = colorScaleData.data[r+3];
            }
            sideScaleCtx.putImageData(sideScaleData, 0, 0);
        },
        _updateScaleAnnotation: function(min, max, scaleUnit) {
            this.sideScaleUnit.innerHTML = scaleUnit;
            this.sideScaleMax.innerHTML = max;
            this.sideScaleMin.innerHTML = min;
            this.bottomScaleUnit.innerHTML = scaleUnit;
            this.bottomScaleMax.innerHTML = max;
            this.bottomScaleMin.innerHTML = min;
        },
        updateScaleIndicator: function(value) {
            this.sideScaleIndicator.style.visibility = 'visible';
            this.bottomScaleIndicator.style.visibility = 'visible';
            var posPercent = (value - this.sideScaleMin.innerHTML) / (this.sideScaleMax.innerHTML - this.sideScaleMin.innerHTML) * 100;
            posPercent = Math.max(0, Math.min(100, posPercent));
            this.sideScaleIndicator.style.bottom = `${posPercent}%`;
            this.bottomScaleIndicator.style.left = `${posPercent}%`;
            this.sideScaleIndicatorValue.innerHTML = value;
            this.bottomScaleIndicatorValue.innerHTML = value;
        },
        hideScaleIndicator: function() {
            this.sideScaleIndicator.style.visibility = 'hidden';
            this.bottomScaleIndicator.style.visibility = 'hidden';
        },
        quantize: function(value) {
            this.plottyplot.setExpression(`floor(dataset / ${value} + 0.5) * ${value}`);
        },
        unquantize: function() {
            this.plottyplot.setExpression("");
        }
    });

    function raspRendererPlotty(canvas, options) {
        return new L.RaspRendererPlotty(canvas, options);
    }

    L.RaspRendererWindbarbs = L.Class.extend({
        initialize: function(layerGroup) {
            this.layerGroup = layerGroup;
        },
        render: function(georasterSpeed, georasterAngle) {
            this.barbs = [];
            this.minDistDeg = 0.5;
            var strideX = Math.ceil(this.minDistDeg / georasterSpeed.pixelWidth);
            var strideY = Math.ceil(this.minDistDeg / georasterSpeed.pixelHeight);
            for (let i = Math.floor(strideY / 2); i < georasterSpeed.height - Math.floor(strideY / 2); i += strideY) {
                for (let j = Math.floor(strideX / 2); j < georasterSpeed.width - Math.floor(strideX / 2); j += strideX) {
                    var speed = georasterSpeed.values[0][i][j];
                    var angle = georasterAngle.values[0][i][j];
                    if (speed != georasterSpeed.noDataValue && angle != georasterAngle.noDataValue) {
                        var svg = this._getBarb(speed * 1.94384, angle, 80);
                        var divIcon = L.divIcon({
                            className: "leaflet-data-marker",
                            iconSize: [80, 80],
                            iconAnchor: [40, 40],
                            html: L.Util.template(svg)
                        });
                        this.barbs.push({position: this._getPosition(georasterSpeed, i, j), icon: divIcon});
                    }
                }
            }
            this.barbs.forEach(barb => {
                if (barb.position) {
                    this.layerGroup.addLayer(L.marker(barb.position, {
                        icon: barb.icon,
                        interactive: false,
                        keyboard: false
                    }));
                }
            });
        },
        _getPosition(georaster, i, j) {
            var lat = georaster.ymax - (i + 0.5) * georaster.pixelHeight;
            var lng = georaster.xmin + (j + 0.5) * georaster.pixelHeight;
            return [lat, lng];
        },
        _getFlagSvgPath: function(speed) {
            var ten   = 0;
            var five  = 0;
            var fifty = 0;
            var index = 0;
            var i;
            var path = "";
            if (speed > 0) {
                if (speed <= 7) {
                    path += "M0 2 L8 2 ";
                    index = 1;
                } else {
                    path += "M1 2 L8 2 ";
                }
                five = Math.floor(speed / 5);
                if (speed % 5 >= 3) {
                    five += 1;
                }
                fifty = Math.floor(five / 10);
                five -= fifty * 10;
                ten = Math.floor(five / 2);
                five -= ten * 2;
            }
            var j;
            for (i = 0; i < fifty; i++) {
                j = index + 2 * i;
                path += "M" + j + " 0 L" + (j + 1) + " 2 L" + j + " 2 L" + j + " 0 ";
            }
            if (fifty > 0) {
                index += 2 * (fifty - 0.5);
            }
            for (i = 0; i < ten; i++) {
                j = index + i;
                path += "M" + j + " 0 L" + (j + 1) + " 2 ";
            }
            index += ten;
            for (i = 0; i < five; i++) {
                j = index + i;
                path += "M" + (j + 0.5) + " 1 L" + (j + 1) + " 2 ";
            }
            path += "Z";
            return path;
        },
        _getBarb: function(speedKt, angle, size) {
            var flagPath = this._getFlagSvgPath(speedKt);
            var halfsize = Math.floor(size / 2);
            size = halfsize * 2;
            return `<svg width="${size}" height="${size}" viewBox="0 0 20 20"><path transform='translate(10 10) rotate(${angle + 90} 0 0) translate(-8 -2)' stroke='#000' stroke-width='0.5' d='${flagPath}'/></svg>`;
        }
    });

    function raspRendererWindbarbs(canvas, options) {
        return new L.RaspRendererWindbarbs(canvas, options);
    }

    L.RaspLayer = L.Layer.extend({
        initialize: function(options) {
            L.setOptions(this, options);
        },
        onAdd: function(map) {
            this._map = map;

            this.canvas = document.createElement('canvas');
            this.overlay = L.imageOverlay(this.canvas.toDataURL(), [[0,1], [0,1]]).addTo(this._map); // Bounds get updated anyway
            this.layerGroup = L.layerGroup([]).addTo(this._map);

            // Renderers
            this.plottyRenderer = raspRendererPlotty(this.canvas);
            this.windbarbRenderer = raspRendererWindbarbs(this.layerGroup);

            // Value indicator
            this.valueIndicator = valueIndicator();
            this.valueIndicator.addTo(this._map);
            this._map.on('mousemove', this._onMouseMove, this);
            return this.valueIndicator;
        },
        onRemove: function() {
            this._map.off('mousemove', this._onMouseMove);
        },
        update: function(georasters, parameter) {
            this.georasters = georasters;
            if (parameter.composite) {
                this.units = parameter.composite.units;
                this.domains = parameter.composite.domains;
            } else {
                this.units = [parameter.unit];
                this.domains = [parameter.domain];
            }
            this._plot(georasters, parameter);
            this._updateValueIndicator(this._lastLat, this._lastLng);
        },
        _plot: function(georasters, parameter) {
            this.layerGroup.clearLayers();
            this.overlay.setBounds([[georasters[0].ymin, georasters[0].xmin], [georasters[0].ymax, georasters[0].xmax]]);
            // The base parameter is always displayed as a heatmap (currently realized via the plotty renderer)
            if (!parameter.composite) {
                this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0], colorscale: parameter.colorscale});
            } else {
                // For composite parameters, the additional fields must also be rendered according to the composite type
                if (parameter.composite.type == "wstar_bsratio") {
                    this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0]});
                    this.plottyRenderer.render(georasters[1], {domain: this.domains[1], unit: this.units[1], colorscale: 'bsratio', append: true});
                }
                if (parameter.composite.type == "wind") {
                    this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0]});
                    this.windbarbRenderer.render(georasters[0], georasters[1]);
                }
                if (parameter.composite.type == "clouds") ;
                if (parameter.composite.type == "press") {
                    this.plottyRenderer.render(georasters[0], {domain: this.domains[0], unit: this.units[0]});
                    this.windbarbRenderer.render(georasters[1], georasters[2]);
                }
            }
            this.overlay.setUrl(this.canvas.toDataURL());
        },
        _updateValueIndicator(lat, lng) {
            this._lastLat = lat;
            this._lastLng = lng;
            var bounds = this.overlay.getBounds();
            var x = Math.floor((lng - bounds._southWest.lng) / (bounds._northEast.lng - bounds._southWest.lng) * this.georasters[0].width);
            var y = Math.floor((bounds._northEast.lat - lat) / (bounds._northEast.lat - bounds._southWest.lat) * this.georasters[0].height);
            var values = [];
            if (x >= 0 && x < this.georasters[0].width && y >= 0 && y < this.georasters[0].height) { // we are inside the domain
                this.georasters.forEach((georaster, i) => {
                    var value = georaster.values[0][y][x].toFixed(0);
                    if (value != georaster.noDataValue) {
                        values[i] = value;
                    }
                });
            }
            var valueIndicatorText = "-";
            if (values.length != 0) {
                valueIndicatorText = "";
                values.forEach((value, i) => {
                    if (i != 0) {
                        valueIndicatorText += ", ";
                    } else {
                        this.plottyRenderer.updateScaleIndicator(value);
                    }
                    valueIndicatorText += `${value} ${this.units[i]}`;
                });
            } else {
                this.plottyRenderer.hideScaleIndicator();
            }
            this.valueIndicator.update(valueIndicatorText);
        },
        _onMouseMove: function(e) {
            this._updateValueIndicator(e.latlng.lat, e.latlng.lng);
        }
    });

    function raspLayer(options) {
        return new L.RaspLayer(options);
    }

    L.Control.RASPControl = L.Control.extend({
        imageOverlayLoadingAnimation: document.getElementById("loadingDiv"),
        meteogramIcon: L.icon({
            iconUrl: cDefaults.meteogramMarker,
            iconSize: [cDefaults.markerSize, cDefaults.markerSize]
        }),
        soundingIcon: L.icon({
            iconUrl: cDefaults.soundingMarker,
            iconSize: [cDefaults.markerSize, cDefaults.markerSize]
        }),
        onAdd: function(map) {
            this.imageOverlayLoadingAnimation.style.visibility = 'hidden';
            this._map = map;
            this._initTitle();
            this._initPanel();
            this._initRaspLayer();

            this._map.on('popupclose', (e) => {
                this.currentPopup = null;
            });

            this.opacityLevel = 0.7;
            this.opacityDelta = 0.1;
            this.setOpacity();
            this.selectedParameter = cDefaults.parameter; // remember last used parameter
            this.doModelDays();
            this.modelDayChange(); // Do the first setup of hours, parameters, overlay, title, scales
            this.parameterCategoryChange();

            return this._container;
        },
        _initTitle: function() {
            this._raspTitle = document.getElementById("titleDiv");
            this._raspTitle.parameter = L.DomUtil.create('h4', '', this._raspTitle);
            var modelDayTimeDiv = L.DomUtil.create('div', 'form-inline justify-content-center flex-nowrap mb-1', this._raspTitle);
            var modelDayGroup = L.DomUtil.create('div', 'input-group input-group-sm mx-1', modelDayTimeDiv);
            this.modelDaySelect = L.DomUtil.create('select', 'custom-select w-auto', modelDayGroup);
            this.modelDaySelect.onchange = () => { this.modelDayChange(); };
            this.modelDaySelect.title = dict["modelDaySelect_title"];
            var timeGroup = L.DomUtil.create('div', 'input-group input-group-sm mx-1', modelDayTimeDiv);
            var timePrev = L.DomUtil.create('div', 'input-group-prepend', timeGroup);
            this.timePrevButton = L.DomUtil.create('button', 'btn btn-outline-secondary', timePrev);
            this.timePrevButton.innerHTML = '◄';
            this.timePrevButton.onclick = () => { this.timeChangeCyclic(-1); };
            this.timeSelect = L.DomUtil.create('select', 'custom-select w-auto', timeGroup);
            this.timeSelect.onchange = () => { this.timeChange(); };
            this.timeSelect.title = dict["timeSelect_title"];
            var timeNext = L.DomUtil.create('div', 'input-group-append', timeGroup);
            this.timeNextButton = L.DomUtil.create('button', 'btn btn-outline-secondary', timeNext);
            this.timeNextButton.innerHTML = '►';
            this.timeNextButton.onclick = () => { this.timeChangeCyclic(1); };
            this.validWarning = L.DomUtil.create('div', 'text-danger', this._raspTitle);
        },
        _initPanel: function() {
            var className = "leaflet-control-layers";
            this._container = L.DomUtil.create('div', className);
            L.DomUtil.addClass(this._container, 'rasp-control');
            if (!L.Browser.android) {
                L.DomEvent.on(this._container, {
                    mouseenter: this.expand,
                }, this);
            }
            this._link = L.DomUtil.create('a', className + '-toggle', this._container);
    		    this._link.href = '#';
            this._link.title = 'RASP Control';
            if (L.Browser.touch) {
                L.DomEvent.on(this._link, 'click', L.DomEvent.stop);
                L.DomEvent.on(this._link, 'click', this.expand, this);
            } else {
                L.DomEvent.on(this._link, 'focus', this.expand, this);
            }
            this.expand();
            L.DomEvent.disableClickPropagation(this._container);
            L.DomEvent.disableScrollPropagation(this._container);
            this._raspPanel = L.DomUtil.create('div', "leaflet-control-layers-list", this._container);

            var parameterDiv = L.DomUtil.create('div', 'mb-2', this._raspPanel);
            this.parameterCategories = L.DomUtil.create('div', 'btn-group btn-group-toggle mb-1', parameterDiv);
            this.parameterCategories.setAttribute('data-toggle', 'buttons');
            var defaultCategory = cParameters[cDefaults.parameter].category;
            for (const category of cCategories) {
                var catLabel = L.DomUtil.create('label', 'btn btn-outline-primary', this.parameterCategories);
                var catRadio = L.DomUtil.create('input', '', catLabel);
                catRadio.name = "parameterCategory";
                catRadio.type = "radio";
                catRadio.value = category;
                catLabel.style = "cursor: pointer;";
                // catLabel.innerHTML += `<img class='parameterCategoryIcon' src='img/${category}.svg'>`;
                catLabel.innerHTML += `
<svg class="parameterCategoryIcon">
  <use xlink:href="img/sprites.svg#${category}"></use>
</svg>
`;
                catLabel.title = dict["parameterCategory_" + category + "_title"];
                if (category == defaultCategory) { // enable the default category
                    $(catLabel).button('toggle');
                }
            }
            this.parameterCategories.onchange = () => { this.parameterCategoryChange(); };
            this.parameterCategoryDescription = L.DomUtil.create('div', '', parameterDiv);
            var parameterListOpacityDiv = L.DomUtil.create('div', 'form-inline flex-nowrap mb-1', parameterDiv);
            this.parameterSelect = L.DomUtil.create('select', 'form-control form-control-sm w-100 mr-1', parameterListOpacityDiv);
            this.parameterSelect.style = "min-width: 0;";
            this.parameterSelect.onchange = () => { this.parameterChange(); };
            this.parameterSelect.title = dict["parameterSelect_title"];
            var opacityDiv = L.DomUtil.create('div', 'btn-group', parameterListOpacityDiv);
            var opacityDownButton = L.DomUtil.create('button', 'btn btn-sm btn-outline-secondary', opacityDiv);
            opacityDownButton.onclick = () => { this.opacityDn(); };
            opacityDownButton.title = dict["opacityDecreaseButton_title"];
            opacityDownButton.innerHTML = "−";
            var opacityIcon = L.DomUtil.create('span', 'btn btn-sm btn-outline-secondary disabled', opacityDiv);
            opacityIcon.style = "font-size: 21";
            var opacityIconImg = L.DomUtil.create('img', 'icon', opacityIcon);
            opacityIconImg.src = 'img/opacity.svg';
            var opacityUpButton = L.DomUtil.create('button', 'btn btn-sm btn-outline-secondary', opacityDiv);
            opacityUpButton.onclick = () => { this.opacityUp(); };
            opacityUpButton.title = dict["opacityIncreaseButton_title"];
            opacityUpButton.innerHTML = "+";
            var parameterDetails = L.DomUtil.create('details', '', parameterDiv);
            var parameterSummary = L.DomUtil.create('summary', '', parameterDetails);
            parameterSummary.title = dict["parameterDetails_title"];
            parameterSummary.innerHTML = dict["parameterDetails_summary"];
            this.parameterDescription = L.DomUtil.create('span', 'parameterDescription', parameterDetails);

            var markerDiv = L.DomUtil.create('div', 'form-inline', this._raspPanel);
            var soundingLabel = L.DomUtil.create('label', 'mr-2', markerDiv);
            soundingLabel.style = "display: flex; align-items: center; justify-content: center; margin-bottom: 0;";
            soundingLabel.title = dict["soundingCheckbox_label"];
            this.soundingCheckbox = L.DomUtil.create('input', '', soundingLabel);
            this.soundingCheckbox.style = "position: relative; flex-shrink: 0; margin-right: 0.25rem";
            this.soundingCheckbox.type = 'checkbox';
            this.soundingCheckbox.onchange = () => { this.toggleSoundingsOrMeteograms(); };
            var soundingText = L.DomUtil.create('span', '', soundingLabel);
            soundingText.innerHTML = dict["Soundings"];
            var meteogramLabel = L.DomUtil.create('label', '', markerDiv);
            meteogramLabel.style = "display: flex; align-items: center; justify-content: center; margin-bottom: 0";
            meteogramLabel.title = dict["meteogramCheckbox_label"];
            this.meteogramCheckbox = L.DomUtil.create('input', '', meteogramLabel);
            this.meteogramCheckbox.style = "position: relative; flex-shrink: 0; margin-right: 0.25rem";
            this.meteogramCheckbox.type = 'checkbox';
            this.meteogramCheckbox.onchange = () => { this.toggleSoundingsOrMeteograms(); };
            var meteogramText = L.DomUtil.create('span', '', meteogramLabel);
            meteogramText.innerHTML = dict["Meteograms"];

            this._collapseLink = L.DomUtil.create('a', 'leaflet-control-collapse-button', this._raspPanel);
            this._collapseLink.innerHTML = '⇱';
            this._collapseLink.title = 'Panel minimieren';
            this._collapseLink.href = '#';
            L.DomEvent.on(this._collapseLink, 'click', this.collapse, this);
        },
        _initRaspLayer: function() {
            this._raspLayer = raspLayer();
            this._raspLayer.addTo(this._map);
        },
        onRemove: function(map) {
            // Nothing to do here
        },
        expand: function () {
            L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
            return this;
        },
        collapse: function () {
            L.DomUtil.removeClass(this._container, 'leaflet-control-layers-expanded');
            return this;
        },
        getDataUrls: function(modelDir, parameterKey, time) {
            var baseUrls = [cDefaults.forecastServerRoot + "/" + modelDir + "/" + parameterKey + "."]; // Default (no composite parameter)
            if (cParameters[parameterKey].composite) {
                baseUrls = cParameters[parameterKey].composite.of.map(key => cDefaults.forecastServerRoot + "/" + modelDir + "/" + key + ".");
            }
            if (parameterKey != "pfd_tot") { // Almost all parameters are time-dependent, PFD being the exception
                baseUrls = baseUrls.map(base => base + "curr."+time+"lst.d2.");
            }
            var geotiffUrls = baseUrls.map(base => base + "data.tiff");
            var titleUrl = baseUrls[0] + "title.json";
            return {geotiffUrls: geotiffUrls, titleUrl: titleUrl};
        },
        isValid: function(dateText, day) {
            var date = new Date(dateText);
            var today = new Date();
            var dateGoal = new Date(today);
            dateGoal.setDate(dateGoal.getDate() + +day);
            dateGoal.setHours(0,0,0,0);
            return date.valueOf() == dateGoal.valueOf();
        },
        getModelAndDay: function() {
            var resultSplit = this.modelDaySelect.value.split("+");
            if (resultSplit.length == 1) {
                return {model: this.modelDaySelect.value, day: "0"};
            } else {
                return {model: resultSplit[0], day: resultSplit[1]};
            }
        },
        getParameterCategory: function() {
            return this.parameterCategories.querySelector("input:checked").value;
        },
        doModelDays: function() {
            [dict["Sunday"], dict["Monday"], dict["Tuesday"], dict["Wednesday"], dict["Thursday"], dict["Friday"], dict["Saturday"]];
            ["Jan", "Feb", dict["Mar"], "Apr", dict["May"], "Jun", "Jul", "Aug", "Sep", dict["Oct"], "Nov", dict["Dec"]];
            const dayRelative = [dict["Today"], dict["Tomorrow"]];
            new Date().getTime();        // current time in ms
            this.modelDaySelect.options.length = 0; // Empty list
            for (const modelKey of Object.keys(cModels)) {
                var model = cModels[modelKey];
                for (const day of model.days) { // Add all days
                    var modelDescription = dayRelative[day];
                    var modelDir = modelKey;
                    if (day != 0) {
                        modelDir += "+" + day;
                    }
                    this.modelDaySelect.add(new Option(modelDescription, modelDir));
                }
            }
        },
        doModelHours: function(modelKey, day, selectedValue) {
            this.timeSelect.options.length = 0; // Clear all times
            var model = cModels[modelKey];
            for (const hour of model.hours[day]) {
                this.timeSelect.add(new Option(hour, hour));
            }
            this.timeSelect.value = selectedValue ? selectedValue : cDefaults.parameterTime;
        },
        doParameterList: function() {
            var {model, day} = this.getModelAndDay();
            var currentParameter = this.parameterSelect.value;
            this.parameterSelect.options.length = 0; // Clear all parameters
            var category = this.getParameterCategory();
            for (const parameter of cModels[model].parameters) {
                if (cParameters[parameter].category == category) {
                    this.parameterSelect.add(new Option(cParameters[parameter].longname, parameter));
                    if (currentParameter == parameter) { // Try to keep the currently selected parameter (if it is in the list)
                        this.parameterSelect.options[this.parameterSelect.options.length - 1].selected = true;
                    }
                }
            }
        },
        modelDayChange: function() {
            var modelDir = this.modelDaySelect.value;
            var {model, day} = this.getModelAndDay();
            this.doModelHours(model, day, this.timeSelect.value); // could have different hours
            // this._map.setView(cModels[model].center, cModels[model].zoom); // recenter the map
            if (this.soundingOverlay) {
                this.soundingOverlay.remove();
            }
            if (this.meteogramOverlay) {
                this.meteogramOverlay.remove();
            }
            this.soundingOverlay = this.getSoundingMarkers(model);
            this.meteogramOverlay = this.getMeteogramMarkers(model);
            this.toggleSoundingsOrMeteograms();
            this.doParameterList(); // could have different parameters
            this.parameterChange();
            if (this.currentPopup && this.currentPopup.type == "meteogram") {
                this.currentPopup.imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/meteogram_" + this.currentPopup.key + ".png";
                this.currentPopup.image.src = this.currentPopup.imageUrl;
            }
        },
        timeChangeCyclic: function(direction) {
            // direction = +1 -> forward, direction = -1 -> backward
            var index = this.timeSelect.selectedIndex;
            index += direction;
            if (index > this.timeSelect.length - 1) {
                index = 0;
            }
            if (index < 0) {
                index = this.timeSelect.length - 1;
            }
            this.timeSelect.selectedIndex = index;
            this.update();
        },
        timeChange: function() {
            this.update();
        },
        parameterCategoryChange: function() {
            var category = this.getParameterCategory();
            this.parameterCategoryDescription.innerHTML = dict["parameterCategory_" + category + "_title"];
            this.doParameterList();
            this.parameterChange();
        },
        parameterChange: function() {
            this.parameterDescription.innerHTML = cParameters[this.parameterSelect.value].description;
            this.update();
        },
        update: function() {
            var modelDir = this.modelDaySelect.value;
            var {model, day} = this.getModelAndDay();
            var time = this.timeSelect.value;
            var parameterKey = this.parameterSelect.value;
            var parameter = cParameters[parameterKey];
            var urls = this.getDataUrls(modelDir, parameterKey, time);
            this._updateTitle(urls.titleUrl, parameter.longname, day);
            this._updatePlot(urls.geotiffUrls, parameter);
            if (this.currentPopup && this.currentPopup.type == "sounding") {
                this.currentPopup.imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/sounding" + this.currentPopup.key + ".curr." + time + "lst.d2.png";
                this.currentPopup.image.src = this.currentPopup.imageUrl;
            }
        },
        _updateTitle: function(titleUrl, parameterLongname, day) {
            this._raspTitle.parameter.innerHTML = parameterLongname;
            fetch(titleUrl)
                .then(response => {
                    return response.json();
                })
                .then(titleJson => {
                    var valid = this.isValid(titleJson["validDate"], day);
                    if (valid) {
                        this.validWarning.style = "display: none";
                    } else {
                        this.validWarning.style = "display: block";
                        this.validWarning.innerHTML = dict["isNotValid"];
                    }
                })
                .catch(err => {
                    this.validWarning.style = "display: block";
                    this.validWarning.innerHTML = dict["isUnknownValid"];
                });
        },
        _updatePlot: function(geotiffUrls, parameter) {
            Promise.all(geotiffUrls.map(url => fetch(url)))
                .then(responses => {
                    return Promise.all(responses.map(response => response.arrayBuffer()));
                })
                .then(buffers => {
                    return Promise.all(buffers.map(parseGeoraster));
                })
                .then(georasters => this._raspLayer.update(georasters, parameter));
        },
        opacityUp: function() {
            this.opacityLevel = Math.min(this.opacityLevel + this.opacityDelta, 1);
            this.setOpacity();
        },
        opacityDn: function() {
            this.opacityLevel = Math.max(this.opacityLevel - this.opacityDelta, 0);
            this.setOpacity();
        },
        setOpacity: function() {
            this._raspLayer.overlay.setOpacity(this.opacityLevel);
        },
        toggleSoundingsOrMeteograms: function() {
            if (this.soundingCheckbox.checked) {
                this.soundingOverlay.addTo(this._map);
            } else {
                if (this.currentPopup && this.currentPopup.type == "sounding") {
                    this.currentPopup.popup.remove();
                }
                this.soundingOverlay.remove();
            }
            if (this.meteogramCheckbox.checked) {
                this.meteogramOverlay.addTo(this._map);
            } else {
                if (this.currentPopup && this.currentPopup.type == "meteogram") {
                    this.currentPopup.popup.remove();
                }
                this.meteogramOverlay.remove();
            }
        },
        updatePopup: function() {
            var popupContent = document.createElement('div');
            var popupLink = document.createElement("A");
            popupLink.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 48 48'><path d='M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z'/></svg>";
            popupLink.href = this.currentPopup.imageUrl;
            popupLink.title = dict["Show in separate window"];
            popupLink.target = "_blank";
            popupContent.appendChild(popupLink);
            popupContent.appendChild(this.currentPopup.image);
            this.currentPopup.popup.setContent(popupContent);
            this.imageOverlayLoadingAnimation.style.visibility = "hidden";
        },
        getSoundingMarkers: function(modelKey) {
            var markers = [];
            var soundings = cSoundings[modelKey];
            for (const soundingKey of Object.keys(soundings)) {
                var sounding = soundings[soundingKey];
                markers.push(
                    L.marker(sounding.location, {icon: this.soundingIcon})
                        .bindTooltip(sounding.name)
                        .on('click', e => {
                            var modelDir = this.modelDaySelect.value;
                            var time = this.timeSelect.value;
                            this.currentPopup = {type: "sounding", key: soundingKey};
                            this.currentPopup.imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/sounding" + soundingKey + ".curr." + time + "lst.d2.png";
                            this.currentPopup.popup = L.popup({maxWidth: "auto"})
                                .setLatLng(e.target.getLatLng())
                                .openOn(this._map);
                            this.currentPopup.image = new Image();
                            this.currentPopup.image.setAttribute("class", "imagePopup");
                            this.currentPopup.image.onload = () => {
                                this.updatePopup();
                            };
                            this.currentPopup.image.src = this.currentPopup.imageUrl;
                            setTimeout(() => {
                                if (!this.currentPopup.image.complete) {
                                    this.imageOverlayLoadingAnimation.style.visibility = "visible";
                                }
                            }, cDefaults.loadingAnimationDelay);
                        })
                );
            }
            return L.layerGroup(markers);
        },
        getMeteogramMarkers: function(modelKey) {
            var markers = [];
            var meteograms = cMeteograms[modelKey];
            for (const meteogramKey of Object.keys(meteograms)) {
                var meteogram = meteograms[meteogramKey];
                markers.push(
                    L.marker(meteogram.location, {icon: this.meteogramIcon})
                        .bindTooltip(meteogram.name)
                        .on('click', e => {
                            var modelDir = this.modelDaySelect.value;
                            this.currentPopup = {type: "meteogram", key: meteogramKey};
                            this.currentPopup.imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/meteogram_" + meteogramKey + ".png";
                            this.currentPopup.popup = L.popup({maxWidth: "auto"})
                                .setLatLng(e.target.getLatLng())
                                .openOn(this._map);
                            this.currentPopup.image = new Image();
                            this.currentPopup.image.setAttribute("class", "imagePopup");
                            this.currentPopup.image.onload = () => {
                                this.updatePopup();
                            };
                            this.currentPopup.image.src = this.currentPopup.imageUrl;
                            setTimeout(() => {
                                if (!this.currentPopup.image.complete) {
                                    this.imageOverlayLoadingAnimation.style.visibility = "visible";
                                }
                            }, cDefaults.loadingAnimationDelay);
                        })
                );
            }
            return L.layerGroup(markers);
        }
    });

    function raspControl(options) {
        return new L.Control.RASPControl(options);
    }

    // Create the map
    var gMap = L.map('map', {
        center: cModels[cDefaults.model].center,
        zoom: cDefaults.zoom,
        minZoom: cDefaults.minZoom,
        maxZoom: cDefaults.maxZoom,
        zoomControl: false,
        attributionControl: false,
        doubleClickZoom: false
    });
    // Add default controls
    L.control.scale({position: cDefaults.scaleLocation}).addTo(gMap);
    L.control.zoom({position: cDefaults.zoomLocation}).addTo(gMap);
    L.control.layers(cLayers.baseLayers, cLayers.overlays).addTo(gMap);
    compactAttribution().addTo(gMap);

    cLayers.baseLayers[cDefaults.baseLayer].addTo(gMap);
    for (const overlay of cDefaults.overlays) {
        cLayers.overlays[overlay].addTo(gMap);
    }

    // This sets up all RASP related controls and layers
    var gRaspControl = raspControl({position: cDefaults.RASPControlLocation}).addTo(gMap);

    // Leaflet needs this because the flexbox it is in does not evaluate to the right height at the beginning
    // Otherwise, bottom tiles are not loaded (because leaflet thinks they are outside of the viewport)
    window.onload = () => {
        gRaspControl.update();
        gMap.invalidateSize();
    };

}());
//# sourceMappingURL=bundle.js.map
