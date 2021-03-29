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
            "wstar",
            "bsratio",
            "wstar_bsratio",
            "hglider",
            "hwcrit",
            "dwcrit",
            "hbl",
            "dbl",
            "bltopvariab",
            "wblmaxmin",
            "zwblmaxmin",
            "sfcsunpct",
            "sfcshf",
            "sfctemp",
            "sfcdewpt",
            // "mslpress",
            "sfcwind0",
            // "sfcwind",
            "blwind",
            "bltopwind",
            "blwindshear",
            "zsfclcldif",
            "zsfclcl",
            "zsfclclmask",
            "zblcldif",
            "zblcl",
            "zblclmask",
            "blicw",
            "blcwbase",
            "blcloudpct",
            "wrf=CFRACL",
            "wrf=CFRACM",
            "wrf=CFRACH",
            "rain1",
            "cape",
            "press950",
            "press850",
            "press700",
            "press500",
            "pfd_tot"
        ],
        "days": [0, 1],
        "hours": { // keys: "0" -> today, "1" -> tomorrow, ...
            "0" : ["0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800", "1900"],
            "1" : ["0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800", "1900"]
        }
    }
};

const cParameters = {
    "wstar":         { "longname": dict["wstar.longname"],            "primary": true,     "description": dict["wstar.description"] },
    "bsratio":       { "longname": dict["bsratio.longname"],          "primary": false,    "description": dict["bsratio.description"] },
    "wstar_bsratio": { "longname": dict["wstar_bsratio.longname"],    "primary": true,     "description": dict["wstar_bsratio.description"] },
    "hglider":       { "longname": dict["hglider.longname"],          "primary": true,     "description": dict["hglider"] },
    "hwcrit":        { "longname": dict["hwcrit.longname"],           "primary": true,     "description": dict["hwcrit.description"] },
    "dwcrit":        { "longname": dict["dwcrit.longname"],           "primary": false,    "description": dict["dwcrit.description"] },
    "hbl":           { "longname": dict["hbl.longname"],              "primary": true,     "description": dict["hbl.description"] },
    "dbl":           { "longname": dict["dbl.longname"],              "primary": false,    "description": dict["dbl.description"] },
    "bltopvariab":   { "longname": dict["bltopvariab.longname"],      "primary": false,    "description": dict["bltopvariab.description"] },
    "wblmaxmin":     { "longname": dict["wblmaxmin.longname"],        "primary": false,    "description": dict["wblmaxmin.description"] },
    "zwblmaxmin":    { "longname": dict["zwblmaxmin.longname"],       "primary": false,    "description": dict["zwblmaxmin.description"] },
    "sfcsunpct":     { "longname": dict["sfcsunpct.longname"],        "primary": true,     "description": dict["sfcsunpct.description"] },
    "sfcshf":        { "longname": dict["sfcshf.longname"],           "primary": false,    "description": dict["sfcshf.description"] },
    "sfctemp":       { "longname": dict["sfctemp.longname"],          "primary": true,     "description": dict["sfctemp.description"] },
    "sfcdewpt":      { "longname": dict["sfcdewpt.longname"],         "primary": true,     "description": dict["sfcdewpt.description"] },
    "mslpress":      { "longname": dict["mslpress.longname"],         "primary": false,    "description": dict["mslpress.description"] },
    "sfcwind0":      { "longname": dict["sfcwind0.longname"],         "primary": true,     "description": dict["sfcwind0.description"] },
    "sfcwind":       { "longname": dict["sfcwind.longname"],          "primary": false,    "description": dict["sfcwind.description"] },
    "blwind":        { "longname": dict["blwind.longname"],           "primary": true,     "description": dict["blwind.description"] },
    "bltopwind":     { "longname": dict["bltopwind.longname"],        "primary": false,    "description": dict["bltopwind.description"] },
    "blwindshear":   { "longname": dict["blwindshear.longname"],      "primary": false,    "description": dict["blwindshear.description"] },
    "zsfclcldif":    { "longname": dict["zsfclcldif.longname"],       "primary": false,    "description": dict["zsfclcldif.description"] },
    "zsfclcl":       { "longname": dict["zsfclcl.longname"],          "primary": false,    "description": dict["zsfclcl.description"] },
    "zsfclclmask":   { "longname": dict["zsfclclmask.longname"],      "primary": true,     "description": dict["zsfclclmask.description"] },
    "zblcldif":      { "longname": dict["zblcldif.longname"],         "primary": false,    "description": dict["zblcldif.description"] },
    "zblcl":         { "longname": dict["zblcl.longname"],            "primary": false,    "description": dict["zblcl.description"] },
    "zblclmask":     { "longname": dict["zblclmask.longname"],        "primary": true,     "description": dict["zblclmask.description"] },
    "blicw":         { "longname": dict["blicw.longname"],            "primary": false,    "description": dict["blicw.description"] }, // maybe get rid of this (DrJack does not know if it is useful because the formula used is so simple)
    "blcwbase":      { "longname": dict["blcwbase.longname"],         "primary": false,    "description": dict["blcwbase.description"] },
    "blcloudpct":    { "longname": dict["blcloudpct.longname"],       "primary": true,     "description": dict["blcloudpct.description"] },
    "wrf=CFRACL":    { "longname": dict["wrf=CFRACL.longname"],       "primary": false,    "description": dict["wrf=CFRACL.description"] },
    "wrf=CFRACM":    { "longname": dict["wrf=CFRACM.longname"],       "primary": false,    "description": dict["wrf=CFRACM.description"] },
    "wrf=CFRACH":    { "longname": dict["wrf=CFRACH.longname"],       "primary": false,    "description": dict["wrf=CFRACH.description"] },
    "rain1":         { "longname": dict["rain1.longname"],            "primary": true,     "description": dict["rain1.description"] },
    "cape":          { "longname": dict["cape.longname"],             "primary": false,    "description": dict["cape.description"] },
    "press1000":     { "longname": dict["press1000.longname"],        "primary": false,    "description": dict["press1000.description"] },
    "press950":      { "longname": dict["press950.longname"],         "primary": false,    "description": dict["press950.description"] },
    "press850":      { "longname": dict["press850.longname"],         "primary": true,     "description": dict["press850.description"] },
    "press700":      { "longname": dict["press700.longname"],         "primary": false,    "description": dict["press700.description"] },
    "press500":      { "longname": dict["press500.longname"],         "primary": false,    "description": dict["press500.description"] },
    "pfd_tot":       { "longname": dict["pfd_tot.longname"],          "primary": true,     "description": dict["pfd_tot.description"] },
};

const cMultiParameters = {
    "wstar_bsratio": ["wstar", "bsratio"],
    "sfcwind0":      ["sfcwind0spd", "sfcwind0dir"],
    "sfcwind":       ["sfcwindspd", "sfcwinddir"],
    "blwind":        ["blwindspd", "blwinddir"],
    "bltopwind":     ["bltopwindspd", "bltopwinddir"],
    "press1000":     ["press1000", "press1000wspd", "press1000wdir"],
    "press950":      ["press950", "press950wspd", "press950wdir"],
    "press850":      ["press850", "press850wspd", "press850wdir"],
    "press700":      ["press700", "press700wspd", "press700wdir"],
    "press500":      ["press500", "press500wspd", "press500wdir"],
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
        "Tirschenreuth":     ["49.8741", "12.3272"],
        "Oberhinkofen":      ["48.9523", "12.1462"],
        "Bamberg":           ["49.9179", "10.9121"],
        "Jena":              ["50.9164", "11.7171"],
        "Nördlingen":        ["48.8703", "10.5034"],
        "Großrückerswalde":  ["50.6431", "13.1274"],
        "Klatovy":           ["49.4172", "13.3215"],
        "Wasserkuppe":       ["50.4989", "9.9541"],
        "Sonnen":            ["48.6823", "13.6949"]
    }
};

// The data is expected at <server>/<region> for day 0 and <server>/<region>+<day> for day > 0
const cForecastServerRoot = "results/OUT";     // this points to the base location of all data

// Define all static layers to be used in the map. Differentiate between mutually exclusive base layers ...
const cBaseLayers = {
    [dict["Topography"]]: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
	      attribution: 'Powered by <a href="https://www.esri.com" target="_blank">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    }),
    [dict["Grayscale"]]: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	      attribution: 'Powered by <a href="https://www.esri.com" target="_blank">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
    })
};
// ... and overlays
const cOverlays = {
    [dict["Airspace"]]: L.tileLayer('https://{s}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{y}.png', {
        attribution: 'Airspace tiles by <a href="https://www.openaip.net" target="_blank">OpenAip</a>',
        tms: true,
        subdomains: '12',
        transparent: true,
        opacity: 0.5
    })
};
// Now define which of those layers are chosen by default
const cDefaultBaseLayer = dict["Topography"];
const cDefaultOverlays = [];

const cDefaultZoom = 7;
const cDefaultOpacityLevel = 0.6;
const cDefaultOpacityDelta = 0.1;
const cLoadingAnimationDelay = 300; // ms. Wait this long before showing a loading animation for the to-be-shown overlay
const cImageOverlayErrorImage = '';

const cDefaultModel = "TIR";                   // default model to start on
const cDefaultParameter = "wstar_bsratio";     // which paramter to start on
const cDefaultParameterTime = "1300";          // which hour to start on
const cZoomLocation = 'bottomleft';            // Zoom control position
const cScaleLocation = 'bottomleft';           // Scale position
const cRASPControlLocation = 'topleft';        // Position of custom RASP data control

const cSoundingMarker = 'img/sounding.svg';
const cMeteogramMarker = 'img/meteogram.svg';
const cMarkerSize = 15;
