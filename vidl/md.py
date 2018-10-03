from mutagen.id3 import ID3, TIT2, TALB, TPE1, TPE2, COMM, USLT, TCOM, TCON, TDRC
import pprint; pprint = pprint.PrettyPrinter(indent=4).pprint

def add_metadata(filename, md):
    tags = ID3(filename)
    print(filename)

    if 'title' in md:           tags["TIT2"] = TIT2(encoding=3, text=md.title)
    if 'artist' in md:          tags["TPE1"] = TPE1(encoding=3, text=md.artist)
    if 'album' in md:           tags["TALB"] = TALB(encoding=3, text=md.album)
    if 'album_artist' in md:    tags["TPE2"] = TPE2(encoding=3, text=md.album_artist)
    if 'track_number' in md:
        track_number = str(md.track_number)
        if 'track_count' in md:
            track_number += '/'+str(md.track_count)
        tags["TRCK"] = TRCK(encoding=3, text=track_number)
    if 'genre' in md:           tags["TCON"] = TCON(encoding=3, text=md.genre)
    if 'year'   in md:          tags["TDRC"] = TDRC(encoding=3, text=md.year)
    
    pprint(md)
    
    tags.save(filename)