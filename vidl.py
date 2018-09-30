"""Python script to download video/audio, built with youtube-dl"""

import youtube_dl
import pprint; pprint = pprint.PrettyPrinter(indent=4).pprint

output_template = '~/Downloads/%(author)s - %(title)s.%(ext)s'

with youtube_dl.YoutubeDL({'outtmpl': output_template}) as ytdl:
    result = ytdl.extract_info(
        # 'http://www.youtube.com/watch?v=BaW_jenozKc',
        'https://soundcloud.com/unlikepluto/ladida',
        # 'https://soundcloud.com/unlikepluto/sets/bitter-paradise',
        download=False
    )
    # filename = ytdl.prepare_filename(result)

if 'entries' in result:
    videos = result['entries']
else:
    videos = [result]

file_format = 'mp3'
audio_quality = '0'
embed_thumbnail = ''
if file_format in ['mp3', 'm4a', 'mp4']:
    embed_thumbnail = '--embed-thumbnail'
url = 'https://soundcloud.com/unlikepluto/ladida'
ytdl_args = [
    '-f', 'best',
    '-x',
    '--audio-format', file_format,
    '--audio-quality', audio_quality,
    '-o', output_template,
    embed_thumbnail,
    url,
]

for video in videos:
    pprint('andanotherone')
    filename = ytdl.prepare_filename(video)
    print(filename)
    video['formats'] = None
    video['requested_formats'] = None
    pprint(video)

    youtube_dl.main(ytdl_args)

# pprint(result)
# pprint(filename)
# if 'entries' in result:
#     # Can be a playlist or a list of videos
#     videos = result['entries']
# else:
#     # Just one video
#     videos = {
#         'entries': [result]
#     }

# for video in videos['entries']:
#     video['formats'] = None
#     video['requested_formats'] = None
# # video_url = video['url']
# pprint(videos)