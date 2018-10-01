"""Python script to download video/audio, built with youtube-dl"""

import youtube_dl, sys
import pprint; pprint = pprint.PrettyPrinter(indent=4).pprint
def log(*args, error=False):
    if error:
        print('[vidl] error:', *args)
        quit()
    elif not quiet:
        print('[vidl]', *args)

def get_help():
    script_filename = sys.argv[0]
    print('')
    print('Usage:')
    print('  '+script_filename+' [format] [options] URL')
    print('')
    print('Options:')
    print('  format         mp3, mp4, wav or m4a. Default mp3.')
    print('  -h, --help     Display this help message.')
    print('  -q, --quiet    Don\'t log anything.')
    print('  -v, --verbose  Display all logs.')
    print('')
    quit()

url = ''
file_format = 'mp3'
audio_only = True
quiet = False
video_formats = ['mp4', 'wav', 'm4a', 'mp4']
audio_formats = ['mp4', 'wav', 'm4a', 'mp4']
output_template = '~/Downloads/%(uploader)s - %(title)s.%(ext)s'

# parse arguments
for arg in sys.argv[1:]:
    if arg in audio_formats:
        audio_only = True
        file_format = arg
    elif arg in video_formats:
        audio_only = False
        file_format = arg
    elif arg in ['-q', '--quiet']:
        quiet = True
    elif arg in ['-h', '--help']:
        get_help()
    else:
        url = arg
if len(sys.argv) <= 1: # no arguments provided
    get_help()
if url == '':
    log('No URL provided', error=True)

# get info
log('Fetching URL info')
with youtube_dl.YoutubeDL({'outtmpl': output_template, 'quiet': True}) as ytdl:
    try:
        result = ytdl.extract_info(url, download=False)
    except:
        quit()
if 'entries' in result:
    videos = result['entries']
else:
    videos = [result]

# generate ytdl arguments
if audio_only:
    ytdl_args = [
        '-x',
        '-f', 'best',
        '--audio-format', file_format
    ]
else:
    ytdl_args = [
        '-f', 'bestvideo+bestaudio',
        '--recode-video', file_format
    ]
ytdl_args += ['--audio-quality', '0']
ytdl_args += ['-o', output_template]
if file_format in ['mp3', 'm4a', 'mp4']:
    ytdl_args += ['--embed-thumbnail']
ytdl_args += ['--quiet']
ytdl_args += [url]

for video in videos:
    try:
        filename = ytdl.prepare_filename(video)
    except:
        quit()
    # video['formats'] = None
    # video['requested_formats'] = None
    # pprint(video) # print all metadata about the video
    log('Downloading')
    try:
        youtube_dl.main(ytdl_args)
    except:
        quit()
    log('Saving as', filename)