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

// Key is taken from RASP. Longname and description self explanatory. Primary: appears in short parameter list. Domain: default range of scale, Composite if multiparameter
const cParameters = {
    "wstar":         { "longname": dict["wstar.longname"],         "primary": true,     "description": dict["wstar.description"], unit: "cm/s", domain: [0, 500] },
    "bsratio":       { "longname": dict["bsratio.longname"],       "primary": false,    "description": dict["bsratio.description"], unit: " ", domain: [0, 10] },
    "wstar_bsratio": { "longname": dict["wstar_bsratio.longname"], "primary": true,     "description": dict["wstar_bsratio.description"],
                       composite: { of: ["wstar", "bsratio"], units: ["cm/s", " "], domains: [[0, 500], [0, 10]], type: "wstar_bsratio" }
                     },
    "hglider":       { "longname": dict["hglider.longname"],       "primary": true,     "description": dict["hglider.description"], unit: "m", domain: [0, 3000] },
    "hwcrit":        { "longname": dict["hwcrit.longname"],        "primary": true,     "description": dict["hwcrit.description"], unit: "m", domain: [0, 3000] },
    "dwcrit":        { "longname": dict["dwcrit.longname"],        "primary": false,    "description": dict["dwcrit.description"], unit: "m", domain: [0, 3000] },
    "hbl":           { "longname": dict["hbl.longname"],           "primary": true,     "description": dict["hbl.description"], unit: "m", domain: [0, 3000] },
    "dbl":           { "longname": dict["dbl.longname"],           "primary": false,    "description": dict["dbl.description"], unit: "m", domain: [0, 3000] },
    "bltopvariab":   { "longname": dict["bltopvariab.longname"],   "primary": false,    "description": dict["bltopvariab.description"], unit: "m", domain: [0, 2000] },
    "wblmaxmin":     { "longname": dict["wblmaxmin.longname"],     "primary": false,    "description": dict["wblmaxmin.description"], unit: "cm/s", domain: [-250, 250] },
    "zwblmaxmin":    { "longname": dict["zwblmaxmin.longname"],    "primary": false,    "description": dict["zwblmaxmin.description"], unit: "m", domain: [0, 3000] },
    "sfcsunpct":     { "longname": dict["sfcsunpct.longname"],     "primary": true,     "description": dict["sfcsunpct.description"], unit: "%", domain: [0, 100] },
    "sfcshf":        { "longname": dict["sfcshf.longname"],        "primary": false,    "description": dict["sfcshf.description"], unit: "W/m²", domain: [-50, 400] },
    "sfctemp":       { "longname": dict["sfctemp.longname"],       "primary": true,     "description": dict["sfctemp.description"], unit: "°C", domain: [-10, 40] },
    "sfcdewpt":      { "longname": dict["sfcdewpt.longname"],      "primary": true,     "description": dict["sfcdewpt.description"], unit: "°C", domain: [-20, 30] },
    "mslpress":      { "longname": dict["mslpress.longname"],      "primary": false,    "description": dict["mslpress.description"], unit: "hPa" },
    "sfcwind0":      { "longname": dict["sfcwind0.longname"],      "primary": true,     "description": dict["sfcwind0.description"],
                       composite:{ of: ["sfcwind0spd", "sfcwind0dir"], units: ["m/s", "°"], domains: [[0, 30]], type: "wind" }
                     },
    "sfcwind":       { "longname": dict["sfcwind.longname"],       "primary": false,    "description": dict["sfcwind.description"],
                       composite: { of: ["sfcwindspd", "sfcwinddir"], units: ["m/s", "°"], domains: [[0, 30]], type: "wind" }
                     },
    "blwind":        { "longname": dict["blwind.longname"],        "primary": true,     "description": dict["blwind.description"],
                       composite: { of: ["blwindspd", "blwinddir"], units: ["m/s", "°"], domains: [[0, 30]], type: "wind" }
                     },
    "bltopwind":     { "longname": dict["bltopwind.longname"],     "primary": false,    "description": dict["bltopwind.description"],
                       composite: { of: ["bltopwindspd", "bltopwinddir"], units: ["m/s", "°"], domains: [[0, 30]], type: "wind" }
                     },
    "blwindshear":   { "longname": dict["blwindshear.longname"],   "primary": false,    "description": dict["blwindshear.description"], unit: "cm/s", domain: [0, 30] },
    "zsfclcldif":    { "longname": dict["zsfclcldif.longname"],    "primary": false,    "description": dict["zsfclcldif.description"], unit: "m", domain: [-1000, 1000], colorscale: "cloudpotential" },
    "zsfclcl":       { "longname": dict["zsfclcl.longname"],       "primary": false,    "description": dict["zsfclcl.description"], unit: "m", domain: [0, 3000] },
    "zsfclclmask":   { "longname": dict["zsfclclmask.longname"],   "primary": true,     "description": dict["zsfclclmask.description"], unit: "m", domain: [0, 3000] },
    "zblcldif":      { "longname": dict["zblcldif.longname"],      "primary": false,    "description": dict["zblcldif.description"], unit: "m", domain: [-1000, 1000], colorscale: "cloudpotential" },
    "zblcl":         { "longname": dict["zblcl.longname"],         "primary": false,    "description": dict["zblcl.description"], unit: "m", domain: [0, 3000] },
    "zblclmask":     { "longname": dict["zblclmask.longname"],     "primary": true,     "description": dict["zblclmask.description"], unit: "m", domain: [0, 3000] },
    "blicw":         { "longname": dict["blicw.longname"],         "primary": false,    "description": dict["blicw.description"], unit: "g", domain: [0, 100] }, // maybe get rid of this (DrJack does not know if it is useful because the formula used is so simple)
    "blcwbase":      { "longname": dict["blcwbase.longname"],      "primary": false,    "description": dict["blcwbase.description"], unit: "m", domain: [0, 3000] },
    "blcloudpct":    { "longname": dict["blcloudpct.longname"],    "primary": true,     "description": dict["blcloudpct.description"], unit: "%", domain: [0, 100], colorscale: "clouds" },
    "wrf=CFRACL":    { "longname": dict["wrf=CFRACL.longname"],    "primary": false,    "description": dict["wrf=CFRACL.description"], unit: "", domain: [0, 1], colorscale: "clouds" },
    "wrf=CFRACM":    { "longname": dict["wrf=CFRACM.longname"],    "primary": false,    "description": dict["wrf=CFRACM.description"], unit: "", domain: [0, 1], colorscale: "clouds" },
    "wrf=CFRACH":    { "longname": dict["wrf=CFRACH.longname"],    "primary": false,    "description": dict["wrf=CFRACH.description"], unit: "", domain: [0, 1], colorscale: "clouds" },
    "clouds":        { "longname": dict["clouds.longname"],        "primary": false,    "description": dict["clouds.description"],
                       composite: { of: ["wrf=CFRACL", "wrf=CFRACM", "wrf=CFRACH"], units: ["%", "%", "%"], domains: [[0, 100], [0, 100], [0, 100]], type: "clouds" }
                     },
    "rain1":         { "longname": dict["rain1.longname"],         "primary": true,     "description": dict["rain1.description"], unit: "mm/h", domain: [0, 10] },
    "cape":          { "longname": dict["cape.longname"],          "primary": false,    "description": dict["cape.description"], unit: "J/kg", domain: [0, 2000] },
    "press950":      { "longname": dict["press950.longname"],      "primary": false,    "description": dict["press950.description"],
                       composite: { of: ["press950", "press950wspd", "press950wdir"], units: ["cm/s", "m/s", "°"], domains: [[-250, 250], [0, 30]], type: "press" }
                     },
    "press850":      { "longname": dict["press850.longname"],      "primary": true,     "description": dict["press850.description"],
                       composite: { of: ["press850", "press850wspd", "press850wdir"], units: ["cm/s", "m/s", "°"], domains: [[-250, 250], [0, 30]], type: "press" }
                     },
    "press700":      { "longname": dict["press700.longname"],      "primary": false,    "description": dict["press700.description"],
                       composite: { of: ["press700", "press700wspd", "press700wdir"], units: ["cm/s", "m/s", "°"], domains: [[-250, 250], [0, 30]], type: "press" }
                     },
    "press500":      { "longname": dict["press500.longname"],      "primary": false,    "description": dict["press500.description"],
                       composite: { of: ["press500", "press500wspd", "press500wdir"], units: ["cm/s", "m/s", "°"], domains: [[-250, 250], [0, 30]], type: "press" }
                     },
    "pfd_tot":       { "longname": dict["pfd_tot.longname"],       "primary": true,     "description": dict["pfd_tot.description"], unit: "km", domain: [0, 1000], colorscale: "pfd" },
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
    model: "TIR",                   // default model to start on
    parameter: "wstar",             // which paramter to start on
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

export { cModels , cParameters , cSoundings , cMeteograms , cLayers , cDefaults };
