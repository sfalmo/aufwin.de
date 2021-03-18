// Naming conventions:
// cXxx: constant global from config
// gXxx: global variable

// Divs for title and scales
// var gTitleImg = document.getElementById("titleImg");
var gTitleParameter = document.getElementById("titleParameter");
var gTitleValid = document.getElementById("titleValid");
var gTitleDrJack = document.getElementById("titleDrJack");
var gSideScaleImg = document.getElementById("sideScaleImg");
var gBottomScaleImg = document.getElementById("bottomScaleImg");
var gImageOverlayLoadingAnimation = document.getElementById("loadingDiv");

var gSoundingIcon = L.icon({
    iconUrl: cSoundingMarker,
    iconSize: [cMarkerSize, cMarkerSize]
});
var gMeteogramIcon = L.icon({
    iconUrl: cMeteogramMarker,
    iconSize: [cMarkerSize, cMarkerSize]
});

var gSelectedParameter = cDefaultParameter; // remember last used parameter

// Create the map
var gMap = L.map('map', {
    center: cModels[cDefaultModel].center,
    zoom: cDefaultZoom,
    zoomControl: false,
    doubleClickZoom: false
});
// Add default controls
L.control.scale({position: cScaleLocation}).addTo(gMap);
L.control.zoom({position: cZoomLocation}).addTo(gMap);

// Add custom RASP controls
L.Control.RASPControl = L.Control.extend({
    onAdd: function(map) {
        var div = L.DomUtil.create('div', 'RASPControlDiv');
        L.DomEvent.addListener(div, 'click', L.DomEvent.stopPropagation);
        div.innerHTML = `
<div id='modelDayTimeParameterDiv'>
    <div id='modelDayTimeDiv'>
        <select onchange='modelDayChange()' id='modelDaySelect' title='${dict["modelDaySelect_title"]}' size='1'></select>
        <select onchange='timeChange()' id='timeSelect' title='${dict["timeSelect_title"]}' size='1'></select>
    </div>
    <div id='parameterDiv'>
        <select onchange='parameterChange()' id='parameterSelect' title='${dict["parameterSelect_title"]}' size='1'></select>
        <details title='${dict["parameterDetails_title"]}'>
            <summary>${dict["parameterDetails_summary"]}</summary>
            <span id='parameterDescription'></span>
        </details>
    </div>
</div>
<button onclick='parameterListToggle()' id='parameterButton' title='${dict["parameterButton_title"]}' value='short'>${dict["parameterButton_SwitchToFull"]}</button>
<br>
<button onclick='opacityDn()' title='${dict["opacityDecreaseButton_title"]}'><img src='img/opacity_minus.svg'></button>
<button onclick='opacityUp()' title='${dict["opacityIncreaseButton_title"]}'><img src='img/opacity_plus.svg'></button>
`;
        return div;
    },
    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.raspControl = function(options) {
    return new L.Control.RASPControl(options);
};

L.control.raspControl({position: cRASPControlLocation}).addTo(gMap);

// Selectors
var gModelDaySelect = document.getElementById("modelDaySelect");
var gTimeSelect = document.getElementById("timeSelect");
var gParameterSelect = document.getElementById("parameterSelect");
var gParameterButton = document.getElementById("parameterButton");
var gParameterDescription = document.getElementById("parameterDescription");

// Leaflet needs this because the flexbox it is in does not evaluate to the right height at the beginning
// Otherwise, bottom tiles are not loaded (because leaflet thinks they are out of scope)
window.onload = () => {
    updateOverlay();
    gMap.invalidateSize();
};

var gOpacityLevel = cDefaultOpacityLevel; // Init the opacity
var gOpacityDelta = cDefaultOpacityDelta;

var gBaseLayers = cBaseLayers;
var gOverlays = cOverlays;
gOverlays[dict["Soundings"]] = getSoundingMarkers(cDefaultModel); // Add soundings for default model to overlays
gOverlays[dict["Meteograms"]] = getMeteogramMarkers(cDefaultModel); // Add meteograms for default model to overlays

gBaseLayers[cDefaultBaseLayer].addTo(gMap);
for (const overlay of cDefaultOverlays) {
    gOverlays[overlay].addTo(gMap);
}

// Add layer control
var gMapControl = L.control.layers(gBaseLayers, gOverlays).addTo(gMap);

// Add the image layer to the map
var gImageOverlay = L.imageOverlay(cForecastServerRoot + "/" + cDefaultModel + "/" + cDefaultParameter + ".curr." + cDefaultParameterTime + "lst.d2.body.png",
                                   [cModels[cDefaultModel].swcorner, cModels[cDefaultModel].necorner],
                                   {opacity: gOpacityLevel}).addTo(gMap);
var gImageOverlayPreload = new Image();
gImageOverlayPreload.onload = () => {
    gImageOverlay.setUrl(gImageOverlayPreload.src);
    gImageOverlayLoadingAnimation.style.visibility = "hidden";
};
gImageOverlayPreload.onerror = () => {
    gImageOverlay.setUrl(cImageOverlayErrorImage);
    gImageOverlayLoadingAnimation.style.visibility = "hidden";
};

gMap.on('click', onMapClick); // left single click
gMap.on('contextmenu', onMapRightClick); // right single click

gMapControl.expand(); // expand the layer control at first load to make the user aware of all options

addModelDays(); // Initialize all models and days

modelDayChange(); // Do the first setup of hours, parameters, overlay, title, scales

//--------------------------------------------------------------------------------

// --- Utility functions ---

function getModelAndDay() {
    var resultSplit = gModelDaySelect.value.split("+");
    if (resultSplit.length == 1) {
        return {model: gModelDaySelect.value, day: "0"};
    } else {
        return {model: resultSplit[0], day: resultSplit[1]};
    }
}

function getCyclicNextTimeIndex() {
    var index = gTimeSelect.selectedIndex;
    index++;
    if (index > gTimeSelect.length - 1) {
        index = 0;
    }
    return index;
}

// --- Callbacks of controls ---

function modelDayChange() {
    var {model, day} = getModelAndDay();
    addModelHours(model, day, gTimeSelect.value); // could have different hours
    addModelParameters(model); // could have different parameters
    gTitleDrJack.innerHTML = "DrJack BLIPMAP " + dict["from"] + " RASP " + dict["GFSA-initiated"] + " " + cModels[model].resolution + "km " + dict["WRF-ARW model"];
    gImageOverlay.setBounds([cModels[model].swcorner, cModels[model].necorner]); // set bounds
    gMap.setView(cModels[model].center, cModels[model].zoom); // recenter the map
    parameterChange();
}

function timeChange() {
    updateOverlay();
}

function parameterChange() {
    gSelectedParameter = gParameterSelect.value; // keep a copy of what was last set
    gParameterDescription.innerHTML = cParameters[gParameterSelect.value].description;
    updateOverlay();
}

function parameterListToggle() {
    // Toggle button
    if (gParameterButton.value == "short") {
        gParameterButton.value = "long";
        gParameterButton.innerHTML = dict["parameterButton_SwitchToShort"];
    } else {
        gParameterButton.value = "short";
        gParameterButton.innerHTML = dict["parameterButton_SwitchToFull"];
    }

    gParameterSelect.options.length = 0; // Clear the parameters
    var {model, day} = getModelAndDay();
    addModelParameters(model); // Add the new ones
    parameterChange(); // Update overlays (parameter might not be there anymore)
}

function opacityUp() {
    gOpacityLevel = Math.min(gOpacityLevel + gOpacityDelta, 1);
    gImageOverlay.setOpacity(gOpacityLevel);
}

function opacityDn() {
    gOpacityLevel = Math.max(gOpacityLevel - gOpacityDelta, 0);
    gImageOverlay.setOpacity(gOpacityLevel);
}

// --- Map click handlers ---

function onMapClick() {
    gTimeSelect.selectedIndex = getCyclicNextTimeIndex();
    updateOverlay();
}

// currently not used
function onMapRightClick(e) {
    var latLng = L.latLng(e.latlng);
    var {model, day} = getModelAndDay();
    var parameter = gParameterSelect.value;
    var time = gTimeSelect.value;

    var finalParameter = parameter;
    if (parameter in cMultiParameters) {
        finalParameter = cMultiParameters[parameter].join(' ');
    }

    var content = "<p><img src='app.php?region="+model+"&period="+day+"&lat="+latLng.lat+"&lon="+latLng.lng+"&time="+time+"&output=img&type="+finalParameter+"'>";

    var popup = L.popup({minWidth: 200})
        .setLatLng(latLng)
        .setContent(content)
        .openOn(gMap);
}

// --- Contol logic ---

function addModelDays() {
    const dayNames   = [dict["Sunday"], dict["Monday"], dict["Tuesday"], dict["Wednesday"], dict["Thursday"], dict["Friday"], dict["Saturday"]];
    const monthNames = ["Jan", "Feb", dict["Mar"], "Apr", dict["May"], "Jun", "Jul", "Aug", "Sep", dict["Oct"], "Nov", dict["Dec"]];
    const dayRelative = [dict["Today"], dict["Tomorrow"]];

    var Now = new Date().getTime();        // current time in ms
    var millisInDay = 24 * 60 * 60 * 1000; // ms in a day
    var T = new Date();

    // empty the list
    gModelDaySelect.options.length = 0;

    for (const modelKey of Object.keys(cModels)) {
        var model = cModels[modelKey];
        for (const day of model.days) { // Add all days
            // T.setTime(Now + (millisInDay * day));
            // var modelDescription = dayNames[T.getDay()] + ' ' + T.getDate() + ' ' + monthNames[T.getMonth()];
            var modelDescription = dayRelative[day];
            var modelDir = modelKey;
            if (day != 0) {
                modelDir += "+" + day;
            }
            gModelDaySelect.add(new Option(modelDescription, modelDir));
        }
    }
}

function addModelHours(modelKey, day, selectedValue) {
    gTimeSelect.options.length = 0; // Clear all times
    var model = cModels[modelKey];
    for (const hour of model.hours[day]) {
        gTimeSelect.add(new Option(hour, hour));
    }
    gTimeSelect.value = selectedValue ? selectedValue : cDefaultParameterTime;
}

function addModelParameters(modelKey) {
    gParameterSelect.options.length = 0; // Clear all parameters
    var onlyPrimary = gParameterButton.value == "short"; // look at state of parameters button to decide if full or reduced set is shown
    var model = cModels[modelKey];
    for (const parameter of model.parameters) {
        if (onlyPrimary) {
            if (cParameters[parameter].primary) {
                gParameterSelect.add(new Option(cParameters[parameter].longname, parameter));
            }
        } else {
            gParameterSelect.add(new Option(cParameters[parameter].longname, parameter));
        }
        if (parameter == gSelectedParameter) {
            gParameterSelect.options[gParameterSelect.options.length - 1].selected = true;
        }
    }
}

function getImageUrls(modelDir, parameter, time) {
    var baseUrl = cForecastServerRoot + "/" + modelDir + "/" + parameter + ".";
    var titleParameter = cMultiParameters[parameter] ? cMultiParameters[parameter][0] : parameter;
    var titleBaseUrl = cForecastServerRoot + "/" + modelDir + "/" + titleParameter + ".";
    if (parameter != "pfd_tot") { // Almost all parameters are time-dependent, PFD being the exception
        baseUrl += "curr."+time+"lst.d2.";
        titleBaseUrl += "curr."+time+"lst.d2.";
    }
    // return {overlayUrl: baseURL + "body.png", sideScaleUrl: baseURL + "side.png", bottomScaleUrl: baseURL + "foot.png", titleUrl: baseURL + "head.png"};
    return {overlayUrl: baseUrl + "body.png", sideScaleUrl: baseUrl + "side.png", bottomScaleUrl: baseUrl + "foot.png", titleUrl: titleBaseUrl + "title.json"};
}

function updateOverlay() {
    var modelDir = gModelDaySelect.value;
    var {model, day} = getModelAndDay();
    var parameter = gParameterSelect.value;
    var time = gTimeSelect.value;
    if (parameter == "pfd_tot") {
        gTimeSelect.disabled = true;
        gMap.off('click');
    } else {
        gTimeSelect.disabled = false;
        gMap.on('click', onMapClick);
    }
    var urls = getImageUrls(modelDir, parameter, time);
    // gTitleImg.src = urls.titleUrl;
    gTitleParameter.innerHTML = cParameters[parameter].longname;
    fetch(urls.titleUrl)
        .then(response => {
            return response.json();
        })
        .then(titleJson => {
            gTitleValid.innerHTML = titleJson["validLocal"] + " (" + titleJson["validZulu"] + ") " + titleJson["validDate"] + " [" + titleJson["fcstTime"] + "]";
        })
        .catch(err => {
            gTitleValid.innerHTML = "Validity info not found";
        });
    gSideScaleImg.src = urls.sideScaleUrl;
    gBottomScaleImg.src = urls.bottomScaleUrl;

    gImageOverlayPreload.src = urls.overlayUrl;  // Preload the image. Callback will hand the image over to real overlay when it has finished loading.
    // Wait a bit before showing the loading animation.
    // This prevents rapid flickering of the loading icon when switching overlays with a fast internet connection but still gives a loading feedback for people with slower internet.
    // Tweak loading icon delay in config.
    setTimeout(() => {
        if (!gImageOverlayPreload.complete) {
            gImageOverlayLoadingAnimation.style.visibility = "visible";
        }
    }, cLoadingAnimationDelay);

    // Maybe we should preload the next timepoint
    // var nextTime = gTimeSelect[getCyclicNextTimeIndex()].value;
    // var nextUrls = getImageUrls(modelDir, parameter, nextTime);
}

// --- Soundings and meteograms ---

function getSoundingMarkers(modelKey) {
    var frontURL = "<img class='imagePopup' src='"+cForecastServerRoot;
    var backURL = "lst.d2.png'></div>";
    var markers = [];
    var soundings = cSoundings[modelKey];
    for (const soundingKey of Object.keys(soundings)) {
        var sounding = soundings[soundingKey];
        markers.push(
            L.marker(sounding.location, {icon: gSoundingIcon})
                .bindTooltip(sounding.name)
                .bindPopup(L.popup({maxWidth: "auto"}))
                .on('popupopen', function(e) {
                    var modelDir = gModelDaySelect.value;
                    var time = gTimeSelect.value;
                    var popup = e.target.getPopup();
                    var totalURL = frontURL + "/" + modelDir + "/sounding" + soundingKey + ".curr." + time + backURL;
                    popup.setContent(totalURL);
                })
        );
    }
    return L.layerGroup(markers);
}

function getMeteogramMarkers(modelKey) {
    var frontURL = "<img class='imagePopup' src='"+cForecastServerRoot;
    var backURL = ".png'></div>";
    var markers = [];
    var meteograms = cMeteograms[modelKey];
    for (const meteogramKey of Object.keys(meteograms)) {
        var location = meteograms[meteogramKey];
        markers.push(
            L.marker(location, {icon: gMeteogramIcon})
                .bindTooltip(meteogramKey)
                .bindPopup(L.popup({maxWidth: "auto"}))
                .on('popupopen', function(e) {
                    var modelDir = gModelDaySelect.value;
                    var popup = e.target.getPopup();
                    var totalURL = frontURL + "/" + modelDir + "/meteogram_" + meteogramKey + backURL;
                    popup.setContent(totalURL);
                })
        );
    }
    return L.layerGroup(markers);
}
