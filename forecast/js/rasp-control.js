import parseGeoraster from 'georaster';

import { cModels , cCategories , cParameters , cSoundings , cMeteograms , cLayers , cDefaults } from '../config.js';
import validIndicator from './valid-indicator.js';
import raspLayer from './rasp-layer.js';

L.Control.RASPControl = L.Control.extend({
    loadingAnimation: document.getElementById("loadingDiv"),
    meteogramIcon: L.icon({
        iconUrl: cDefaults.meteogramMarker,
        iconSize: [cDefaults.markerSize, cDefaults.markerSize]
    }),
    soundingIcon: L.icon({
        iconUrl: cDefaults.soundingMarker,
        iconSize: [cDefaults.markerSize, cDefaults.markerSize]
    }),
    onAdd: function(map) {
        this.loadingAnimation.style.visibility = 'hidden';
        this._map = map;
        this._initTitle();
        this._initPanel();
        this._initRaspLayer();

        this.loadingTitle = false;
        this.loadingPlot = false;

        this.validIndicator = validIndicator().addTo(map);

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
        var timeGroup = L.DomUtil.create('div', 'input-group input-group-sm mx-1 flex-nowrap', modelDayTimeDiv);
        var timePrev = L.DomUtil.create('div', 'input-group-prepend', timeGroup);
        this.timePrevButton = L.DomUtil.create('button', 'btn btn-outline-secondary', timePrev);
        this.timePrevButton.innerHTML = '???';
        this.timePrevButton.onclick = () => { this.timeChangeCyclic(-1); };
        this.timeSelect = L.DomUtil.create('select', 'custom-select w-auto', timeGroup);
        this.timeSelect.onchange = () => { this.timeChange(); };
        this.timeSelect.title = dict["timeSelect_title"];
        var timeNext = L.DomUtil.create('div', 'input-group-append', timeGroup);
        this.timeNextButton = L.DomUtil.create('button', 'btn btn-outline-secondary', timeNext);
        this.timeNextButton.innerHTML = '???';
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
        opacityDownButton.innerHTML = "???";
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
        this._collapseLink.innerHTML = '???';
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
    _loading: function() {
        return this.loadingTitle || this.loadingPlot || (this.currentPopup && !this.currentPopup.image.complete);
    },
    _hideLoadingAnimationMaybe: function() {
        if (!this._loading()) {
            this.loadingAnimation.style.visibility = "hidden";
        }
    },
    update: function() {
        var modelDir = this.modelDaySelect.value;
        var {model, day} = this.getModelAndDay();
        var time = this.timeSelect.value;
        var parameterKey = this.parameterSelect.value;
        var parameter = cParameters[parameterKey];
        var urls = this.getDataUrls(modelDir, parameterKey, time);
        this._updatePlot(urls.geotiffUrls, parameter);
        if (this.currentPopup && this.currentPopup.type == "sounding") {
            this.currentPopup.imageUrl = cDefaults.forecastServerRoot + "/" + modelDir + "/sounding" + this.currentPopup.key + ".curr." + time + "lst.d2.png";
            this.currentPopup.image.src = this.currentPopup.imageUrl;
        }
        this._updateTitle(urls.titleUrl, parameter.longname, day);
        setTimeout(() => {
            if (this._loading()) {
                this.loadingAnimation.style.visibility = "visible";
            }
        }, cDefaults.loadingAnimationDelay);
    },
    _updateTitle: function(titleUrl, parameterLongname, day) {
        this.loadingTitle = true;
        fetch(titleUrl)
            .then(response => {
                return response.json();
            })
            .then(validJson => {
                this._raspTitle.parameter.innerHTML = parameterLongname;
                this.validIndicator.update(`${validJson["validDate"]} ${validJson["validLocal"]} (${validJson["validZulu"]})`);
                var valid = this.isValid(validJson["validDate"], day);
                if (valid) {
                    this.validWarning.style = "display: none";
                } else {
                    this.validWarning.style = "display: block";
                    this.validWarning.innerHTML = dict["isNotValid"];
                }
                this.loadingTitle = false;
                this._hideLoadingAnimationMaybe();
            })
            .catch(err => {
                this._raspTitle.parameter.innerHTML = parameterLongname;
                this.validIndicator.update("???");
                this.validWarning.style = "display: block";
                this.validWarning.innerHTML = dict["isUnknownValid"];
                this.loadingTitle = false;
                this._hideLoadingAnimationMaybe();
            });
    },
    _updatePlot: function(geotiffUrls, parameter) {
        this.loadingPlot = true;
        Promise.all(geotiffUrls.map(url => fetch(url)))
            .then(responses => {
                return Promise.all(responses.map(response => response.arrayBuffer()));
            })
            .then(buffers => {
                return Promise.all(buffers.map(parseGeoraster));
            })
            .then(georasters => {
                this._raspLayer.update(georasters, parameter);
                this.loadingPlot = false;
                this._hideLoadingAnimationMaybe();
            })
            .catch(err => {
                // TODO: handle missing plot
                this.loadingPlot = false;
                this._hideLoadingAnimationMaybe();
            });
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
        this.loadingAnimation.style.visibility = "hidden";
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
                                this.loadingAnimation.style.visibility = "visible";
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
                                this.loadingAnimation.style.visibility = "visible";
                            }
                        }, cDefaults.loadingAnimationDelay);
                    })
            );
        }
        return L.layerGroup(markers);
    }
});

export default function(options) {
    return new L.Control.RASPControl(options);
};
