// In the source code, these are found as §VIDL_URL_DEV§ etc.
// When Webpack builds the site, it replaces the occurencies with these values.
module.exports = {
    VIDL_URL_DEV: "ws://localhost:80/website-dl",
    VIDL_URL_PROD: "wss://apividl.kasp.io/website-dl",
    VIDL_DL_URL_DEV: "http://localhost:80/website-dl",
    VIDL_DL_URL_PROD: "https://apividl.kasp.io/dl",
}
