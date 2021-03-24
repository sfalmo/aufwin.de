![alt text](logo.svg)

# aufwin.de
A web app for viewing RASP weather forecasts targeted at glider pilots

## raspViewer

The main implementations are in `app.js`. If you want to use this viewer for your own site, change the variables in `config.js` to your needs.
Most importantly, adapt the server root to the location of the base directory of your RASP output files. This can be a mere subfolder (e.g. `raspViewer/results`) or the url of a separate server producing the RASP output files.
