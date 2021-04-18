import { cModels , cParameters , cSoundings , cMeteograms , cLayers , cDefaults } from '../config.js';
import './rasp-layer.js';

// Divs for title and scales
var gImageOverlayLoadingAnimation = document.getElementById("loadingDiv");
gImageOverlayLoadingAnimation.style.visibility = 'hidden';

var gSoundingIcon = L.icon({
    iconUrl: cDefaults.soundingMarker,
    iconSize: [cDefaults.markerSize, cDefaults.markerSize]
});
var gMeteogramIcon = L.icon({
    iconUrl: cDefaults.meteogramMarker,
    iconSize: [cDefaults.markerSize, cDefaults.markerSize]
});

function getDataUrls(modelDir, parameterKey, time) {
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
}

function isValid(dateText, day) {
    var date = new Date(dateText);
    var today = new Date();
    var dateGoal = new Date(today);
    dateGoal.setDate(dateGoal.getDate() + +day);
    dateGoal.setHours(0,0,0,0);
    return date.valueOf() == dateGoal.valueOf();
}

function getCyclicNextIndex(select) {
    var index = select.selectedIndex;
    index++;
    if (index > select.length - 1) {
        index = 0;
    }
    return index;
}

L.Control.RASPControl = L.Control.extend({
    onAdd: function(map) {
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
        this.addModelDays();
        this.modelDayChange(); // Do the first setup of hours, parameters, overlay, title, scales

        return this._container;
    },
    _initTitle: function() {
        this._raspTitle = document.getElementById("titleDiv");
        this._raspTitle.parameter = L.DomUtil.create('h2', '', this._raspTitle);
        this._raspTitle.validInfo = L.DomUtil.create('h3', '', this._raspTitle);
        this._raspTitle.validSymbol1 = L.DomUtil.create('span', '', this._raspTitle.validInfo);
        this._raspTitle.validText = L.DomUtil.create('span', '', this._raspTitle.validInfo);
        this._raspTitle.validSymbol2 = L.DomUtil.create('span', '', this._raspTitle.validInfo);
        this._raspTitle.drjack = L.DomUtil.create('h6', '', this._raspTitle);
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

        var modelDayTimeParameterDiv = L.DomUtil.create('div', 'modelDayTimeParameterDiv', this._raspPanel);
        var modelDayTimeDiv = L.DomUtil.create('div', '', modelDayTimeParameterDiv);
        this.modelDaySelect = L.DomUtil.create('select', '', modelDayTimeDiv);
        this.modelDaySelect.onchange = () => { this.modelDayChange(); };
        this.modelDaySelect.title = dict["modelDaySelect_title"];
        this.timeSelect = L.DomUtil.create('select', '', modelDayTimeDiv);
        this.timeSelect.onchange = () => { this.timeChange(); };
        this.timeSelect.title = dict["timeSelect_title"];
        var parameterDiv = L.DomUtil.create('div', 'parameterDiv', modelDayTimeParameterDiv);
        var parameterListDiv = L.DomUtil.create('div', 'parameterListDiv', parameterDiv);
        this.parameterButton = L.DomUtil.create('button', 'parameterButton', parameterListDiv);
        this.parameterButton.onclick = () => { this.parameterListToggle(); };
        this.parameterButton.value = "short";
        this.parameterButton.title = dict["parameterButton_title"];
        this.parameterButton.innerHTML = "+";
        this.parameterSelect = L.DomUtil.create('select', 'parameterSelect', parameterListDiv);
        this.parameterSelect.onchange = () => { this.parameterChange(); };
        this.parameterSelect.title = dict["parameterSelect_title"];
        var parameterDetails = L.DomUtil.create('details', '', parameterDiv);
        var parameterSummary = L.DomUtil.create('summary', '', parameterDetails);
        parameterSummary.title = dict["parameterDetails_title"];
        parameterSummary.innerHTML = dict["parameterDetails_summary"];
        this.parameterDescription = L.DomUtil.create('span', 'parameterDescription', parameterDetails);

        var opacityDiv = L.DomUtil.create('div', '', this._raspPanel);
        var opacityDownButton = L.DomUtil.create('button', '', opacityDiv);
        opacityDownButton.onclick = () => { this.opacityDn(); };
        opacityDownButton.title = dict["opacityDecreaseButton_title"];
        opacityDownButton.innerHTML = "−";
        var opacityIcon = L.DomUtil.create('span', '', opacityDiv);
        opacityIcon.style = "font-size: 24";
        var opacityIconImg = L.DomUtil.create('img', 'icon', opacityIcon);
        opacityIconImg.src = 'img/opacity.svg';
        var opacityUpButton = L.DomUtil.create('button', '', opacityDiv);
        opacityUpButton.onclick = () => { this.opacityUp(); };
        opacityUpButton.title = dict["opacityIncreaseButton_title"];
        opacityUpButton.innerHTML = "+";

        var markerDiv = L.DomUtil.create('div', 'markerDiv', this._raspPanel);
        var soundingLabel = L.DomUtil.create('label', '', markerDiv);
        soundingLabel.title = dict["soundingCheckbox_label"];
        this.soundingCheckbox = L.DomUtil.create('input', '', soundingLabel);
        this.soundingCheckbox.type = 'checkbox';
        this.soundingCheckbox.onchange = () => { this.toggleSoundingsOrMeteograms(); };
        var soundingText = L.DomUtil.create('span', '', soundingLabel);
        soundingText.innerHTML = dict["Soundings"];
        var meteogramLabel = L.DomUtil.create('label', '', markerDiv);
        meteogramLabel.title = dict["meteogramCheckbox_label"];
        this.meteogramCheckbox = L.DomUtil.create('input', '', meteogramLabel);
        this.meteogramCheckbox.type = 'checkbox';
        this.meteogramCheckbox.onchange = () => { this.toggleSoundingsOrMeteograms(); };
        var meteogramText = L.DomUtil.create('span', '', meteogramLabel);
        meteogramText.innerHTML = dict["Meteograms"];

        this._collapseLink = L.DomUtil.create('a', 'leaflet-control-collapse-button', this._raspPanel);
        this._collapseLink.innerHTML = '⇱';
        this._collapseLink.title = 'Panel minimieren';
        this._collapseLink.href = '#collapse';
        L.DomEvent.on(this._collapseLink, 'click', this.collapse, this);
    },
    _initRaspLayer: function() {
        this._raspLayer = L.raspLayer();
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
    addModelDays: function() {
        const dayNames = [dict["Sunday"], dict["Monday"], dict["Tuesday"], dict["Wednesday"], dict["Thursday"], dict["Friday"], dict["Saturday"]];
        const monthNames = ["Jan", "Feb", dict["Mar"], "Apr", dict["May"], "Jun", "Jul", "Aug", "Sep", dict["Oct"], "Nov", dict["Dec"]];
        const dayRelative = [dict["Today"], dict["Tomorrow"]];

        var Now = new Date().getTime();        // current time in ms
        var millisInDay = 24 * 60 * 60 * 1000; // ms in a day
        var T = new Date();

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
    addModelHours: function(modelKey, day, selectedValue) {
        this.timeSelect.options.length = 0; // Clear all times
        var model = cModels[modelKey];
        for (const hour of model.hours[day]) {
            this.timeSelect.add(new Option(hour, hour));
        }
        this.timeSelect.value = selectedValue ? selectedValue : cDefaults.parameterTime;
    },
    addModelParameters: function(modelKey) {
        this.parameterSelect.options.length = 0; // Clear all parameters
        var onlyPrimary = this.parameterButton.value == "short"; // look at state of parameters button to decide if full or reduced set is shown
        var model = cModels[modelKey];
        for (const parameter of model.parameters) {
            if (onlyPrimary) {
                if (cParameters[parameter].primary) {
                    this.parameterSelect.add(new Option(cParameters[parameter].longname, parameter));
                }
            } else {
                this.parameterSelect.add(new Option(cParameters[parameter].longname, parameter));
            }
            if (parameter == this.selectedParameter) {
                this.parameterSelect.options[this.parameterSelect.options.length - 1].selected = true;
            }
        }
    },
    modelDayChange: function() {
        var {model, day} = this.getModelAndDay();
        this.addModelHours(model, day, this.timeSelect.value); // could have different hours
        this.addModelParameters(model); // could have different parameters
        this._raspTitle.drjack.innerHTML = "DrJack BLIPMAP " + dict["from"] + " RASP " + dict["GFSA-initiated"] + " " + cModels[model].resolution + "km " + dict["WRF-ARW model"];
        this._map.setView(cModels[model].center, cModels[model].zoom); // recenter the map
        this.soundingOverlay = this.getSoundingMarkers(model);
        this.meteogramOverlay = this.getMeteogramMarkers(model);
        this.parameterChange();
    },
    timeChange: function() {
        this.update();
    },
    parameterChange: function() {
        this.selectedParameter = this.parameterSelect.value; // keep a copy of what was last set
        this.parameterDescription.innerHTML = cParameters[this.parameterSelect.value].description;
        this.update();
    },
    parameterListToggle: function() {
        // Toggle button
        if (this.parameterButton.value == "short") {
            this.parameterButton.value = "long";
            this.parameterButton.innerHTML = "−";
        } else {
            this.parameterButton.value = "short";
            this.parameterButton.innerHTML = "+";
        }

        this.parameterSelect.options.length = 0; // Clear the parameters
        var {model, day} = this.getModelAndDay();
        this.addModelParameters(model); // Add the new ones
        this.parameterChange(); // Update overlays (parameter might not be there anymore)
    },
    update: function() {
        var modelDir = this.modelDaySelect.value;
        var {model, day} = this.getModelAndDay();
        var time = this.timeSelect.value;
        var parameterKey = this.parameterSelect.value;
        if (parameterKey == "pfd_tot") {
            this.timeSelect.disabled = true;
            this.disableOnMapClick();
        } else {
            this.timeSelect.disabled = false;
            this.enableOnMapClick();
        }
        var parameter = cParameters[parameterKey];
        var urls = getDataUrls(modelDir, parameterKey, time);
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
                this._raspTitle.validText.innerHTML = titleJson["validLocal"] + " (" + titleJson["validZulu"] + ") " + titleJson["validDate"] + " [" + titleJson["fcstTime"] + "]";
                var valid = isValid(titleJson["validDate"], day);
                this._raspTitle.validSymbol1.innerHTML = valid ? "✅" : "❌";
                this._raspTitle.validSymbol2.innerHTML = valid ? "✅" : "❌";
                this._raspTitle.validInfo.title = valid ? dict["isValid"] : dict["isNotValid"];
            })
            .catch(err => {
                this._raspTitle.validText.innerHTML = dict["validityUnknown"];
                this._raspTitle.validSymbol1.innerHTML = "⚠";
                this._raspTitle.validSymbol2.innerHTML = "⚠";
                this._raspTitle.validInfo.title = dict["isUnknownValid"];
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
    getModelAndDay: function() {
        var resultSplit = this.modelDaySelect.value.split("+");
        if (resultSplit.length == 1) {
            return {model: this.modelDaySelect.value, day: "0"};
        } else {
            return {model: resultSplit[0], day: resultSplit[1]};
        }
    },
    onMapClick: function() {
        this.timeSelect.selectedIndex = getCyclicNextIndex(this.timeSelect);
        this.update();
    },
    enableOnMapClick: function() {
        this._map.off('click');
        this._map.on('click', () => { this.onMapClick(); });
    },
    disableOnMapClick: function() {
        this._map.off('click');
    },
    toggleSoundingsOrMeteograms: function() {
        if (this.soundingCheckbox.checked) {
            this.soundingOverlay.addTo(this._map);
        } else {
            this.soundingOverlay.remove();
        }
        if (this.meteogramCheckbox.checked) {
            this.meteogramOverlay.addTo(this._map);
        } else {
            this.meteogramOverlay.remove();
        }
    },
    getPopupContent: function(imageUrl, imageBlob) {
        var popupContent = document.createElement('div');
        var popupLink = document.createElement("A");
        popupLink.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 48 48'><path d='M38 38H10V10h14V6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V24h-4v14zM28 6v4h7.17L15.51 29.66l2.83 2.83L38 12.83V20h4V6H28z'/></svg>";
        popupLink.href = imageUrl;
        popupLink.title = dict["Show in separate window"];
        popupLink.target = "_blank";
        popupContent.appendChild(popupLink);
        var popupImage = document.createElement('img');
        popupImage.setAttribute("class", "imagePopup");
        popupImage.src = URL.createObjectURL(imageBlob);
        popupContent.appendChild(popupImage);
        return popupContent;
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
        gImageOverlayLoadingAnimation.style.visibility = "hidden";
    },
    getSoundingMarkers: function(modelKey) {
        var markers = [];
        var soundings = cSoundings[modelKey];
        for (const soundingKey of Object.keys(soundings)) {
            var sounding = soundings[soundingKey];
            markers.push(
                L.marker(sounding.location, {icon: gSoundingIcon})
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
                                gImageOverlayLoadingAnimation.style.visibility = "visible";
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
                L.marker(meteogram.location, {icon: gMeteogramIcon})
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
                                gImageOverlayLoadingAnimation.style.visibility = "visible";
                            }
                        }, cDefaults.loadingAnimationDelay);
                    })
            );
        }
        return L.layerGroup(markers);
    }
});

L.control.raspControl = function(options) {
    var raspControl = new L.Control.RASPControl(options);
    return raspControl;
};
