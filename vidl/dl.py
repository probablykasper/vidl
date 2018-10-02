import sys, os, youtube_dl, mutagen
from mutagen.easyid3 import EasyID3
from colorboy import cyan, green
from deep_filter import deep_filter
import pprint; pprint = pprint.PrettyPrinter(indent=4).pprint

from vidl import vidl_help, log as vidl_log
import config

class Dicty(dict):
    __getattr__ = dict.__getitem__
    __setattr__ = dict.__setitem__

def is_int(number):
    try:
        int(number)
        return True
    except ValueError:
        return False
def list_to_dict(array):
    dictionary = {}
    i = 0
    for value in array:
        dictionary[str(i)] = value
        i += 1

def del_if(value):
    if value == None: del value

def main():

    options = {
        'url': '',
        'file_format': 'mp3',
        'audio_only': True,
        'no_md': False,
        'quiet': False,
        'verbose': False,
        'download_folder': config.load('download_folder'),
        'output_template': config.load('output_template'),
        'add_metadata': config.load('add_metadata'),
    }
    def log(*args, **named_args):
        vidl_log(*args, **named_args, quiet=options['quiet'])
    if options['download_folder'] == None:
        script_filename = sys.argv[0]
        log('download_folder config has not been set. To set it, run '+green(script_filename+' config download_folder <path>'), error=True)

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
        elif arg in ['-q', '--quiet']:
            options['quiet'] = True
        elif arg in ['-v', '--verbose']:
            options['verbose'] = True
        elif arg in ['-h', '--help']:
            vidl_help()
        elif '.' in arg:
            options['url'] = arg
        else:
            log('Unknown argument:', arg, error=True)
    if len(sys.argv) <= 1: # no arguments provided
        vidl_help()
    if options['url'] == '':
        log('No URL provided', error=True)

    # get info
    log('Fetching URL info')
    with youtube_dl.YoutubeDL({'outtmpl': ytdl_output_template, 'quiet': True}) as ytdl:
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
    if options['file_format'] in ['mp3', 'm4a', 'mp4']:
        ytdl_args += ['--embed-thumbnail']
    if not options['verbose']:
        ytdl_args += ['--quiet']
    ytdl_args += ['--audio-quality', '0']
    ytdl_args += ['-o', ytdl_output_template]
    # ytdl_args += [options['url']]

    video_index = -1
    for video in videos:
        video_index += 0
        try:
            filename = ytdl.prepare_filename(video)
        except:
            quit()
        log('Downloading')
        try:
            youtube_dl.main(ytdl_args+[video['webpage_url']])
        except:
            pass
        log('Saved as', filename)
        if options['file_format'] in id3_metadata_formats and not options['no_md']:
            log('Adding metadata to file')

            # Create ID3 tag
            tags = ID3()
            md = Dicty()

            # title / artist
            if 'track' in video:
                md.title = video['track']
            elif 'title' in video:
                md.title = video['title']
            if 'artist' in video:
                md.artist = video['artist']
            # get artist/title from title
            elif 'title' in md and 'track' not in video:
                if md.title.count(' - ') == 1:
                    split_title = md.title.split(' - ')
                    md.artist = split_title[0]
                    md.title = split_title[1]
            elif 'uploader' in video:
                md.artist = video['artist']
            if len(videos) > 1: # playlist
                #album
                if 'title' in playlist_info:
                    md.album = playlist_info['title']
                elif 'playlist_title' in video:
                    md.album = video['playlist_title']
                elif 'playlist' in video and type(video['playlist']) == str:
                    md.album = video['playlist_title']
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
            
            # album
            # albumartist
            # tracknumber #/#
            # genre
            # date
            
            pprint(md)
            if 'title'  in md: tags["TIT2"] = TIT2(encoding=3, text=md.title)
            if 'artist' in md: tags["TPE1"] = TPE1(encoding=3, text=md.artist)
            # album
                # tags["TALB"] = TALB(encoding=3, text=u'mutagen Album Name')
            # albumartist
            # tracknumber
                # tags["TRCK"] = TRCK(encoding=3, text=u'track_number')
            # genre
                # tags["TCON"] = TCON(encoding=3, text=u'mutagen Genre')
            if 'year'   in md: tags["TDRC"] = TDRC(encoding=3, text=md.year)

            # if len(videos) > 1:
            #     print('gotta add album stuff')


            tags.save(filename)


from mutagen.mp3 import MP3
from mutagen.id3 import ID3NoHeaderError
from mutagen.id3 import ID3, TIT2, TALB, TPE1, TPE2, COMM, USLT, TCOM, TCON, TDRC
