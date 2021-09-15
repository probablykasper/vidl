## 3.6.4 2021 Sep 15
- Fix old references to youtube-dl

## 3.6.3 2021 Sep 15
- Move to yt-dlp
- Improved audio quality

## 3.6.2 2021 Apr 5
- Finish move back to youtube-dl. Turns out I didn't really do it in 3.6.1.

## 3.6.1 2021 Mar 12
- Move back to youtube-dl

## 3.6.0 2020 Oct 30
- Moved from youtube-dl to youtube-dlc

## 3.5.1 2020 Sep 5
- Updated project metadata

## 3.5.0 - 2020 Aug 2
- Added `--no-embed` argument to avoid embedding thumbnails
- Added ability to programmatically call `dl.download()` with custom options (@araa47)
- Improved quoting of logged youtube-dl command in verbose mode

## 3.4.11 - 2020 Jun 7
- Fixed error occuring when downloading tracks from YouTube Music

## 3.4.10 - 2020 May 10
- Fixed error when adding ID3 metadata tags to mp3 files that don't already have ID3 metadata

## 3.4.9 - 2020 Apr 29
- Disabled youtube-dl cache as a band-aid solution for 403 errors

## 3.4.8 - 2019 Sep 18
- Fixed URLs without https:// or http:// not working.

## 3.4.7 - 2019 May 2
- Better logging and error messages
- Improved metadata detection for YouTube Music
- For albums, the first track's artist will be the album artist if there's no other option

## 3.4.6 - 2019 Jan 19
- Fixes vidl crash due to syntax error

## 3.4.5 - 2019 Jan 19
- Fixed vidl not accepting youtube-dl 2019 versions
- Added update command to vidl help menu

## 3.4.4 - 2018 Oct 28
- Made comments metadata compatible with iTunes (by setting the comment language to "eng" instead of the default "XXX")

## 3.4.3 - 2018 Oct 27
- Fixed error occuring when downloading playlists (specifically, URLs with track_number and track_count).

## 3.4.2 - 2018 Oct 27
- Fixed that party-pooper error that said no to all downloads.

## 3.4.1 - 2018 Oct 27
- Fixed md objects not being correct.

## 3.4.0 - 2018 Oct 27
- user_md_parser.py now takes a url_info argument instead of playlist_info. This means you'll still get info if the URL isn't a playlist. To check if a url is a playlist, you now need to check if url_info has the "entries" property.

## 3.3.2 - 2018 Oct 26
- Fixed error when generating the default vidl config file again

## 3.3.1 - 2018 Oct 26
- Fixed error when generating the default vidl config file

## 3.3.0 - 2018 Oct 26
- Fixed config file not deleting itself when you update vidl, by storing the config file somewhere else in the OS.
- Added --config-path. Shows where the vidl config file is.
- Removed the "vidl config" command. Config file will need to be updated manually.
- Added "user_md_parser.py". This lets users parse metadata in their personally preferred way. Unfortunately, the user has to code python to take advantage of this feature.
- Deprioritized the artist and title info from youtube-dl, as I've noticed it being incorrect sometimes on YouTube, for instance for remixes.

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
