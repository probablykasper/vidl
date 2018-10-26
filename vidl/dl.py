import sys, os
import pprint; pprint = pprint.PrettyPrinter(indent=4).pprint
import youtube_dl
from colorboy import cyan, green
from deep_filter import deep_filter

from vidl import app, config
from vidl.app import log

class Dicty(dict):
    __getattr__ = dict.__getitem__
    __setattr__ = dict.__setitem__
def is_int(number):
    try:
        int(number)
        return True
    except ValueError:
        return False

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
    if options['download_folder'] == None:
        log('download_folder config has not been set. Add a download folder to the vidl config file.', error=True)
        log("Config path:", config.config_path)
        quit()

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
            options['url'] = arg
        else:
            log('Unknown argument:', arg, error=True)
            quit()
    if options['url'] == '':
        log('No URL provided', error=True)
        quit()

    # get info
    log('Fetching URL info')
    ytdl_get_info_options = {
        'outtmpl': ytdl_output_template,
        'quiet': False if options['verbose'] else True,
    }
    with youtube_dl.YoutubeDL(ytdl_get_info_options) as ytdl:
        try:
            info_result = ytdl.extract_info(options['url'], download=False)
        except:
            quit()
        if options['verbose']:
            pprint(info_result)

    # delete None properties/indexes
    def callback(value):
        return value != None
    cleaned_info_result = deep_filter(info_result.copy(), callback)

    # restructure
    if 'entries' in cleaned_info_result:
        videos = cleaned_info_result['entries']
        playlist_info = cleaned_info_result.copy()
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
    # ytdl_args += [options['url']]

    video_index = -1
    for video in videos:
        video_index += 0
        try:
            filename = ytdl.prepare_filename(video)
        except:
            quit()
        filename_split = filename.split('.')
        filename_split[len(filename_split)-1] = options['file_format']
        filename = '.'.join(filename_split)
        if options['verbose']:
            log(green('youtube-dl command:'), 'youtube-dl', ' '.join(ytdl_args+[video['webpage_url']]))
        if options['no_dl']:
            continue
        log('Downloading')
        try:
            youtube_dl.main(ytdl_args+[video['webpage_url']])
        except:
            pass
        log('Saved as', filename)
        if options['file_format'] in id3_metadata_formats and not options['no_md']:
            log('Adding metadata to file')

            # get artist/title from title
            parsed_title = {}
            if not options['no_smart_md']:
                if 'title' in video and video['title'].count(' - ') == 1:
                    split_title = video['title'].split(' - ')
                    parsed_title['artist'] = split_title[0]
                    parsed_title['title'] = split_title[1]

            md = Dicty()
            playlist = True if len(videos) > 1 else False

            # title
            if 'title' in parsed_title:
                smart_title = True
            if 'title' in video:
                md.title = video['title']
            elif 'track' in video:
                md.title = video['track']
            # artist
            if 'artist' in parsed_title:
                smart_artist = True
            if 'uploader' in video:
                md.artist = video['uploader']
            elif 'artist' in video:
                md.artist = video['artist']

            if playlist:
                #album
                if 'title' in playlist_info:
                    md.album = playlist_info['title']
                elif 'playlist_title' in video:
                    md.album = video['playlist_title']
                elif 'playlist' in video and type(video['playlist']) == str:
                    md.album = video['playlist']
                #album_artist
                if 'uploader' in playlist_info:
                    md.album_artist = playlist_info['uploader']
                elif 'playlist_uploader' in video:
                    md.album_artist = video['playlist_uploader']
                # track_number
                if 'playlist_index' in video:
                    md.track_number = video['playlist_index']
                else:
                    md.track_number = video_index+1                   
                # track_count
                if 'n_entries' in video:
                    md.track_count = video['n_entries']
                else:
                    md.track_count = len(videos)
            # year
            if 'release_date' in video and is_int(video['release_date'][:4]):
                md.year = video['release_date'][:4]
            elif 'publish_date' in video and is_int(video['publish_date'][:4]):
                md.year = video['publish_date'][:4]
            elif 'upload_date' in video and is_int(video['upload_date'][:4]):
                md.year = video['upload_date'][:4]
            
            dumb_md = md
            if smart_title: md['title'] = parsed_title['title']
            if smart_artist: md['artist'] = parsed_title['artist']

            md = config.user_md_parser(md, dumb_md, video, playlist_info)
            
            from vidl import md as md_module
            md_module.add_metadata(filename, md)
    log('Done')
