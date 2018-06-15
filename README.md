# vidl
Video/audio download site

# Website
The website source code is located in the website folder.
## Get started
- Install [NPM](https://www.npmjs.com/get-npm)
- `npm install`: install the dependencies.
- `npm run build-prod`: build the website. The output is located inside the `docs` folder, so it can be hosted on GitHub Pages for free.
- `npm run build-dev`: Just like `build-prod`, but for development (it watches for changes).
- In `config.js`, you'll find the websocket URLs that the website connects to. One URL for local development and one for production.

# Server
# Browser extension
Only supports Chrome at the moment.
The browser extension source code is located in the browser-extension folder.
## Get started
- Install [NPM](https://www.npmjs.com/get-npm)
- `npm install`: install the dependencies.
- `npm run build-prod`: build the website. It outputs a chrome folder that can be added as an unpackaged extension, and a chrome.zip file that can be added as a real extension.
- `npm run build-dev`: Just like `build-prod`, but for development (it watches for changes).
- In `config.js`, you'll find the websocket URLs that the website connects to. One URL for local development and one for production.
