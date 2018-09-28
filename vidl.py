import youtube_dl
import pprint; pprint = pprint.PrettyPrinter(indent=4).pprint

ytdl_options_audio = {
    'outtmpl': '/Users/kasper/Downloads/%(id)s.%(ext)s',
}

with youtube_dl.YoutubeDL(ytdl_options_audio) as ytdl:
    result = ytdl.extract_info(
        # 'http://www.youtube.com/watch?v=BaW_jenozKc',
        # 'https://soundcloud.com/unlikepluto/ladida',
        'https://soundcloud.com/unlikepluto/sets/bitter-paradise',
        download=False
    )
    # filename = ytdl.prepare_filename(result)

if 'entries' in result:
    videos = result['entries']
else:
    videos = {
        'entries': [result]
    }

for video in videos:
    pprint('andanotherone')
    filename = ytdl.prepare_filename(video)
    print(filename)
    pprint(video)

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