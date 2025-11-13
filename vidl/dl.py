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

class MetadataPostProcessor(yt_dlp.postprocessor.PostProcessor):
    def __init__(self, md):
        yt_dlp.postprocessor.PostProcessor.__init__(self)
        self.vidl_md = md
    def run(self, info):
        file_format = info['filepath'].split('.')[-1]
        metadata_formats = ['mp3', 'wav', 'opus', 'm4a']
        if file_format in metadata_formats:
            log('Adding metadata to file')
            md_module.add_metadata(info['filepath'], self.vidl_md, file_format)
        return [], info

class LogFilepathPostProcessor(yt_dlp.postprocessor.PostProcessor):
    def run(self, info):
        log('Saved as', info['filepath'])
        return [], info

def is_int(number):
    try:
        int(number)
        return True
    except ValueError:
        return False

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

    if len(parsed_options.urls) == 0:
        log.fatal('No URL provided')

    log('Fetching URL info')
    try:
        info_result = ydl.extract_info(parsed_options.urls[0], download=False)
    except Exception as err:
        if options['verbose']: logging.exception(err)
        log.fatal('yt-dlp failed to get URL info')
    if options['verbose']:
        log.pretty(info_result)

    video_index = -1
    first_video_artist = ''
    errors = []

    if 'entries' in info_result:
        videos = info_result['entries']
        playlist_info = info_result
    else:
        videos = [info_result]
        playlist_info = {}
    
    for video in videos:
        video_index += 1

        if options['verbose']:
            # print yt-dlp command:
            command = green('yt-dlp command: ')+'yt-dlp '
            for arg in ydl_args+[video['webpage_url']]:
                command += quote(arg)+' '
            log(command)
        if options['no_dl']:
            continue
        log('Downloading')

        # download
        try:
            # tags
            if not options['no_md']:
                # get artist/title from title
                parsed_title = {}
                if not options['no_smart_md']:
                    if 'title' in video and video['title'].count(' - ') == 1:
                        split_title = video['title'].split(' - ')
                        parsed_title['artist'] = split_title[0]
                        parsed_title['title'] = split_title[1]

                md = {}
                playlist = True if len(videos) > 1 else False

                # smart title
                if 'title' in parsed_title:
                    smart_title = True
                else:
                    smart_title = False
                # title
                if 'title' in video:
                    md['title'] = video['title']
                elif 'track' in video:
                    md['title'] = video['track']

                # smart artist
                if 'artist' in parsed_title:
                    smart_artist = True
                else:
                    smart_artist = False
                # artist
                if 'uploader' in video:
                    md['artist'] = video['uploader']
                elif 'artist' in video:
                    md['artist'] = video['artist']
                # youtube music artist
                if  video['extractor'] == 'youtube' \
                and 'uploader' in video \
                and video['uploader'].endswith(' - Topic') \
                and 'artist' in video:
                    if 'categories' not in video:
                        md['artist'] = video['artist']
                    elif video['categories'] == ['Music']:
                        md['artist'] = video['artist']

                use_first_video_artist = False
                if playlist:
                    #album
                    if 'title' in playlist_info:
                        md['album'] = playlist_info['title']
                    elif 'playlist_title' in video:
                        md['album'] = video['playlist_title']
                    elif 'playlist' in video and type(video['playlist']) == str:
                        md['album'] = video['playlist']
                    #album_artist
                    if 'uploader' in playlist_info:
                        md['album_artist'] = playlist_info['uploader']
                    elif 'playlist_uploader' in video:
                        md['album_artist'] = video['playlist_uploader']
                    else:
                        use_first_video_artist = True
                    # track_number
                    if 'playlist_index' in video:
                        md['track_number'] = video['playlist_index']
                    else:
                        md['track_number'] = video_index+1
                    # track_count
                    if 'n_entries' in video:
                        md['track_count'] = video['n_entries']
                    else:
                        md['track_count'] = len(videos)
                # year
                if 'release_date' in video and is_int(video['release_date'][:4]):
                    md['year'] = video['release_date'][:4]
                elif 'publish_date' in video and is_int(video['publish_date'][:4]):
                    md['year'] = video['publish_date'][:4]
                elif 'upload_date' in video and is_int(video['upload_date'][:4]):
                    md['year'] = video['upload_date'][:4]

                dumb_md = copy.deepcopy(md)
                if smart_title: md['title'] = parsed_title['title']
                if smart_artist: md['artist'] = parsed_title['artist']

                if playlist:
                    # save artist of first video

                    if video_index == 0 and 'artist' in md:
                        first_video_artist = md['artist']

                    # use first video's artist as album artist if no other is found
                    if use_first_video_artist:
                        md['album_artist'] = first_video_artist

                md = config.user_md_parser(md, dumb_md, video, info_result)
                ydl.add_post_processor(MetadataPostProcessor(md), when='after_move')
            
            ydl.add_post_processor(LogFilepathPostProcessor(), when='after_move')

            # download
            ydl.process_info(video)

        except (Exception, SystemExit) as err:
            if type(err) == SystemExit and err.code == 0:
                # don't treat sys.exit(0) as error
                pass
            else:
                if options['verbose']: logging.exception(err)
                error_msg = 'Failed to download URL: '+green(video['webpage_url'])
                if len(videos) == 1: log.fatal(error_msg)
                log.error(error_msg)
                errors.append(video)
                continue

    if len(errors) >= 1:
        msg = 'There were errors when downloading the following URLs:'
        for video in errors:
            msg += f'\n- {green(video["webpage_url"])}: {video["uploader"]} - {video["title"]}'
        log.fatal(msg)
    log('Done')
