def user_md_parser(smart_md, md, video_info, url_info):
  # smart_md:
  #   Metadata object created by vidl. Metadata objects can have these properties:
  #     - title
  #     - artist
  #     - album
  #     - album_artist
  #     - track_number
  #     - track_count
  #     - year
  #     - comment
  #     - lyrics
  #     - composer
  # md:
  #   Same as "md", except this will never include smart metadata (artist/title
  #   parsed from title).
  # video_info:
  #   Object containing metadata from youtube-dl about the current video.
  # playlist_info:
  #   An object containing playlist metadata from youtube-dl.
  #   If the URL isn't a playlist, playlist_info is the same as video_info.
  #   If the URL is a playlist, it has an "entries" property with video_info objects.
  # callback: Callback function. Takes a metadata object as argument.

  # example:
  #   This example cheks if vidl has detected title and artist metadata. If the
  #   title includes "[NCS Release]", it will set the comment metadata to "NCS".
  # if 'title' in md and 'artist' in md:
  #   if '[NCS Release]' in md['title']:
  #     md['comment'] = 'NCS'

  return md
