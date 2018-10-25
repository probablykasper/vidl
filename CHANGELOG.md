## 3.2.1 - 2018 Oct 25
- Fixed --version

## 3.2.0 - 2018 Oct 25
- Added --no-dl option. Useful if debugging with --verbose.
- --verbose now logs the youtube-dl command it uses.
- Improved detection of --help and --version.

## 3.1.0 - 2018 Oct 8
- Added --version / -v option.
- config.json is now generated instead of coming pre-filled with vidl. Ensures the default config isn't accidentally changed.

## 3.0.5 - 2018 Oct 8
- Fixed download_folder being already set when installing

## 3.0.4 - 2018 Oct 7
- Fixed an issue where the download_folder isn't automatically set when you first run vidl
- Help menu now only shows "vidl" instead of full paths.

## 3.0.3 - 2018 Oct 6
- Fixed vidl crashing when called as a package.
- Fixed and updated README dev instructions
- Fixed terminal colors, by updating colorboy dependency.

## 3.0.2 - 2018 Oct 4
- Fixed extracting artist/title metadata from title
- Fixed md module not loading
- some logging changes

## 3.0.1 - 2018 Oct 4
- Fixed crashes due to some metadata fields being mixed up.
- Fixed README.md showing incorrect instructions for setting up macOS vidl shortcuts.
- Added CHANGELOG.md file

## 3.0.0 - 2018 Oct 4
Basically recreated vidl 2.0.0 in Python, with some added functionality.

## 2.0.0 - 2018 Sep 25
vidl 2.0 was a short-lived bash script. Very rough around the edges.

## 1.x.x: 2017 Oct 15
vidl 1.0 was a server, website and browser extension. You used the website or browser extension to submit a URL and format to the server, and eventually you got the final thing downloaded to yourself. By far the easiest-to-use solution, but I stopped it due to not wanting the server costs.
