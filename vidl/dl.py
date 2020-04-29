import sys, os, copy, logging
from urllib.parse import urlparse
import youtube_dl
from colorboy import cyan, green, red
from deep_filter import deep_filter

from vidl import log, config, md as md_module

def main():

    options = {
        'url': '',
        'file_format': 'mp3',
        'audio_only': True,
        'no_md': False,
        'no_smart_md': False,
        'no_dl': False,
        'verbose': False,
        'download_folder': config.get_config('download_folder'),
        'output_template': config.get_config('output_template'),
    }

    video_formats = ['mp4']
    audio_formats = ['mp3', 'wav', 'm4a']
    id3_metadata_formats = ['mp3']
    ytdl_output_template = os.path.join(options['download_folder'], options['output_template'])

    # parse arguments
    for arg in sys.argv[1:]:
        if arg in audio_formats:
            options['audio_only'] = True
            options['file_format'] = arg
        elif arg in video_formats:
            options['audio_only'] = False
            options['file_format'] = arg
        elif arg in ['--no-md']:
            options['no_md'] = True
        elif arg in ['--no-smart-md']:
            options['no_smart_md'] = True
        elif arg in ['--no-dl']:
            options['no_dl'] = True
        elif arg in ['-v', '--verbose']:
            options['verbose'] = True
        elif '.' in arg:
            parsed_url = urlparse(arg)
            url = arg
            if (parsed_url.scheme == ''): url = 'https://'+url
            print(url)
            options['url'] = url
        else:
            log.fatal('Unknown argument:', arg)
    if options['url'] == '':
        log.fatal('No URL provided')

    # get info
    log('Fetching URL info')
    ytdl_get_info_options = {
        'outtmpl': ytdl_output_template,
        'quiet': False if options['verbose'] else True,
    }
    with youtube_dl.YoutubeDL(ytdl_get_info_options) as ytdl:
        try:
            info_result = ytdl.extract_info(options['url'], download=False)
        except Exception as err:
            if options['verbose']: logging.exception(err)
            log.fatal('youtube-dl failed to get URL info')
        if options['verbose']: log.pretty(info_result)

    # delete None properties/indexes
    def callback(value):
        return value != None
    cleaned_info_result = deep_filter(copy.deepcopy(info_result), callback)

    # restructure
    url_info = copy.deepcopy(cleaned_info_result)
    if 'entries' in cleaned_info_result:
        videos = cleaned_info_result['entries']
        playlist_info = copy.deepcopy(cleaned_info_result)
        del playlist_info['entries']
    else:
        videos = [cleaned_info_result]
        playlist_info = {}

    # generate ytdl arguments
    ytdl_args = []
    if options['audio_only']:
        ytdl_args += ['-x']
        ytdl_args += ['-f', 'best']
        ytdl_args += ['--audio-format', options['file_format']]
    else:
        ytdl_args += ['-f', 'bestvideo+bestaudio']
        ytdl_args += ['--recode-video', options['file_format']]
    ytdl_args += ['--audio-quality', '0']
    ytdl_args += ['-o', ytdl_output_template]
    if options['file_format'] in ['mp3', 'm4a', 'mp4']:
        ytdl_args += ['--embed-thumbnail']
    if not options['verbose']:
        ytdl_args += ['--quiet']
    # band-aid solution for 403 error caused by cache
    ytdl_args += ['--rm-cache-dir']

    video_index = -1
    first_video_artist = ''
    errors = []
    for video in videos:
        video_index += 1
        try:
            filename = ytdl.prepare_filename(video)
        except (Exception, SystemExit) as err:
            if options['verbose']: logging.exception(err)
            error_msg = 'Failed to generate a filename for URL: '+green(video['webpage_url'])
            if len(videos) == 1: log.fatal(error_msg)
            log.error(error_msg)
            errors.append(video)
            continue
        filename_split = filename.split('.')
        filename_split[len(filename_split)-1] = options['file_format']
        filename = '.'.join(filename_split)
        if options['verbose']:
            # print youtube-dl command:
            command = green('youtube-dl command: ')+'youtube-dl '
            for arg in ytdl_args+[video['webpage_url']]:
                if ' ' in arg or '&' in arg: command += "'"+arg+"' "
                else: command += arg+' '
            log(command)
        if options['no_dl']:
            continue
        log('Downloading')

        # download
        try:
            youtube_dl.main(ytdl_args+[video['webpage_url']])
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
        log('Saved as', filename)

        # id3 tags
        if options['file_format'] in id3_metadata_formats and not options['no_md']:
            log('Adding metadata to file')

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
            and video['uploader'].endswith(' - Topic') \
            and 'artist' in video \
            and video['categories'] == ['Music']:
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
            def is_int(number):
                try:
                    int(number)
                    return True
                except ValueError:
                    return False
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

            md = config.user_md_parser(md, dumb_md, video, url_info)
            
            md_module.add_metadata(filename, md)
    
    if len(errors) >= 1:
        msg = 'There were errors when downloading the following URLs:'
        for video in errors:
            msg += f'\n- {green(video["webpage_url"])}: {video["uploader"]} - {video["title"]}'
        log.fatal(msg)
    log('Done')
