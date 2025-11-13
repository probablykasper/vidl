import sys, os, copy, logging
import yt_dlp
import json
from colorboy import green
from shlex import quote
from typing import TypedDict

from vidl import log, config, md as md_module

class Options(TypedDict):
    format: str
    audio_only: bool
    no_md: bool
    no_thumbnail_embed: bool
    no_smart_md: bool
    no_dl: bool
    verbose: bool
    download_folder: str
    output_template: str
    ydl_args: list[str]

def parse_cli_options():
    options = Options(
        format='bestaudio',
        audio_only=True,
        no_md=False,
        no_thumbnail_embed=False,
        no_smart_md=False,
        no_dl=False,
        verbose=False,
        download_folder=config.get_config('download_folder'),    
        output_template=config.get_config('output_template'),
        ydl_args=[],
    )
    video_formats = ['mp4']
    audio_formats = ['mp3', 'wav', 'm4a', 'opus']

    # First pass: extract vidl-specific arguments and URL
    for arg in sys.argv[1:]:
        if arg in audio_formats or arg == 'bestaudio':
            options['audio_only'] = True
            options['format'] = arg
        elif arg in video_formats or arg == 'bestvideo':
            options['audio_only'] = False
            options['format'] = arg
        elif arg == '--no-md':
            options['no_md'] = True
        elif arg == '--no-smart-md':
            options['no_smart_md'] = True
        elif arg == '--no-dl':
            options['no_dl'] = True
        elif arg == '--no-embed':
            options['no_thumbnail_embed'] = True
        elif arg in ['-v', '--verbose']:
            options['verbose'] = True
        else:
            # Everything else goes to yt-dlp
            options['ydl_args'].append(arg)

    return options

def first_not_none(*values):
    for v in values:
        if v is not None:
            return v

class MetadataPostProcessor(yt_dlp.postprocessor.PostProcessor):
    def __init__(self, vidl_options: Options, ydl):
        yt_dlp.postprocessor.PostProcessor.__init__(self)
        self.vidl_options = vidl_options
        self.ydl = ydl
    def run(self, info):
        options = self.vidl_options
        if options['verbose']:
            log('Info JSON:')
            print(json.dumps(self.ydl.sanitize_info(info), indent=4))

        if options['no_md']:
            return [], info

        # get artist/title from title
        parsed_title = {}
        if not options['no_smart_md']:
            if 'title' in info and info['title'].count(' - ') == 1:
                split_title = info['title'].split(' - ')
                parsed_title['artist'] = split_title[0]
                parsed_title['title'] = split_title[1]

        md = {}
        playlist = info.get('playlist_count', 1) > 1

        # smart title
        if 'title' in parsed_title:
            smart_title = True
        else:
            smart_title = False
        # title
        if 'title' in info:
            md['title'] = info['title']
        elif 'track' in info:
            md['title'] = info['track']

        # smart artist
        if 'artist' in parsed_title:
            smart_artist = True
        else:
            smart_artist = False
        # artist
        if 'uploader' in info:
            md['artist'] = info['uploader']
        elif 'artist' in info:
            md['artist'] = info['artist']
        # youtube music artist
        if  info['extractor'] == 'youtube' \
        and 'uploader' in info \
        and info['uploader'].endswith(' - Topic') \
        and 'artist' in info:
            if 'categories' not in info:
                md['artist'] = info['artist']
            elif info['categories'] == ['Music']:
                md['artist'] = info['artist']

        if playlist:
            # album
            md['album'] = first_not_none(
                info.get('album'),
                info.get('playlist_title'),
                info.get('playlist'),
            )
            # album_artist
            md['album_artist'] = first_not_none(
                info.get('album_artist'),
                info.get('playlist_uploader'),
            )
            # todo: fallback to first video's artist
            # track_number
            md['track_number'] = first_not_none(
                info.get('playlist_index'),
                info.get('playlist_autonumber'),
            )
            # track_count
            md['track_count'] = first_not_none(
                info.get('n_entries'),
                info.get('playlist_count'),
            )
        # year
        year = first_not_none(
            info.get('release_year'),
            info.get('release_date'),
            info.get('publish_date'),
            info.get('upload_date'),
        )
        if year is not None:
            md['year'] = str(year)[:4]

        dumb_md = copy.deepcopy(md)
        if smart_title: md['title'] = parsed_title['title']
        if smart_artist: md['artist'] = parsed_title['artist']

        md = config.user_md_parser(md, dumb_md, info, info)

        # filter out None values
        md = {k: v for k, v in md.items() if v is not None}

        file_format = info['filepath'].split('.')[-1]
        metadata_formats = ['mp3', 'wav', 'opus', 'm4a']
        if file_format in metadata_formats:
            log('Adding metadata to file')
            try:
                md_module.add_metadata(info['filepath'], md, file_format)
            except Exception as e:
                log.error(f"Failed to add metadata for {info['filepath']}")
                raise e

        return [], info

class LogFilepathPostProcessor(yt_dlp.postprocessor.PostProcessor):
    def run(self, info):
        log('Saved as', info['filepath'])
        return [], info

def download(options: Options):
    """Accepts an `options` dict, but there's no validation and all options must be present. Look inside `parse_cli_options()` for an example options object."""

    ydl_args = options['ydl_args']

    # apply vidl arguments
    if options['audio_only']:
        ydl_args += ['-x']
        # yt-dlp specific: best audio, even if it has video
        ydl_args += ['-f', 'ba/ba*']
        ydl_args += ['--format-sort-force', '--format-sort', 'abr,acodec']
        # in yt-dlp, "--audio-format mp3 --audio-quality 0" seems to not work
        if options['format'] != 'bestaudio':
            ydl_args += ['--audio-format', options['format']]
        ydl_args += ['--audio-quality', '0']
    else:
        # yt-dlp specific: best video, and add audio if it's not there
        ydl_args += ['-f', 'bv*+ba/b']
        if options['format'] != 'bestvideo':
            ydl_args += ['--recode-video', options['format']]

    if options['download_folder'] == None:
        log.error("No download_folder is set in the vidl config file")
        return
    ydl_output_template = os.path.join(options['download_folder'], options['output_template'])
    ydl_args += ['-o', ydl_output_template]

    if options['format'] in ['bestvideo', 'bestaudio', 'mp3', 'm4a', 'mp4', 'opus'] and options['no_thumbnail_embed'] == False:
        ydl_args += ['--embed-thumbnail']

    # band-aid solution for 403 error caused by cache
    ydl_args += ['--rm-cache-dir']

    # Always parse with yt-dlp's parser (even if empty, to get defaults)
    try:
        parsed_options = yt_dlp.parse_options(ydl_args)
    except SystemExit as err:
        log.fatal('Failed to parse yt-dlp arguments')

    ydl = yt_dlp.YoutubeDL(parsed_options.ydl_opts)

    if options['no_dl']:
        ydl.add_post_processor(MetadataPostProcessor(options, ydl), when='pre_process')
    else:
        ydl.add_post_processor(MetadataPostProcessor(options, ydl), when='after_move')

    ydl.add_post_processor(LogFilepathPostProcessor(), when='after_move')

    if len(parsed_options.urls) == 0:
        log.fatal('No URL provided')
    if len(parsed_options.urls) > 1:
        log.fatal('Multiple URLs provided')

    if options['verbose']:
        # print yt-dlp command:
        command = green('yt-dlp command: ')+'yt-dlp '
        for arg in ydl_args+[parsed_options.urls[0]]:
            command += quote(arg)+' '
        log(command)

    try:
        ydl.download(parsed_options.urls)
    except Exception as e:
        logging.exception(f"Failed to download")
        raise

    log('Done')
