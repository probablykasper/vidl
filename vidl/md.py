import mutagen
from mutagen.id3 import ID3, Encoding, TIT2, TPE1, TALB, TPE2, TRCK, TCON, TDRC, COMM, USLT, TCOM
from pprint import pformat
from vidl import log

def add_metadata(filename, md):
    try:
      tags = ID3(filename)
    except mutagen.id3.ID3NoHeaderError:
      file = mutagen.File(filename)
      file.add_tags()
      tags = file

    if 'title' in md:           tags["TIT2"] = TIT2(text=md['title'])
    if 'artist' in md:          tags["TPE1"] = TPE1(text=md['artist'])
    if 'album' in md:           tags["TALB"] = TALB(text=md['album'])
    if 'album_artist' in md:    tags["TPE2"] = TPE2(text=md['album_artist'])
    if 'track_number' in md:
        track_number = str(md['track_number'])
        if 'track_count' in md:
            track_number += '/'+str(md['track_count'])
        tags["TRCK"] = TRCK(encoding=3, text=track_number)
    if 'genre' in md:           tags["TCON"] = TCON(text=md['genre'])
    if 'year'   in md:          tags["TDRC"] = TDRC(text=md['year'])

    if 'comment'   in md:       tags["COMM"] = COMM(text=md['comment'], lang='eng')
    if 'lyrics'   in md:        tags["USLT"] = USLT(text=md['lyrics'])
    if 'composer'   in md:      tags["TCOM"] = TCOM(text=md['composer'])
    
    for key, value in md.items():
        whitespace = ' ' * (10 - len(key))
        log('  '+key+':'+whitespace+pformat(value))
        
    tags.save(filename)
