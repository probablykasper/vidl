import mutagen
from mutagen.id3 import ID3, TIT2, TPE1, TALB, TPE2, TRCK, TCON, TDRC, COMM, USLT, TCOM
from mutagen.oggopus import OggOpus
from mutagen.mp4 import MP4
from pprint import pformat
from vidl import log

id3_formats = ["mp3", "wav"]


def add_metadata(filename, md, file_format):
    if file_format in id3_formats:
        id3(filename, md)
    elif file_format == "opus":
        opus(filename, md)
    elif file_format == "m4a":
        m4a(filename, md)

    for key, value in md.items():
        whitespace = ' ' * (13 - len(key))
        log('  ' + key + ':' + whitespace + pformat(value))


def id3(filename, md):
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
            track_number += '/' + str(md['track_count'])
        tags["TRCK"] = TRCK(encoding=3, text=track_number)
    if 'genre' in md:           tags["TCON"] = TCON(text=md['genre'])
    if 'year' in md:          tags["TDRC"] = TDRC(text=md['year'])

    if 'comment' in md:       tags["COMM"] = COMM(text=md['comment'], lang='eng')
    if 'lyrics' in md:        tags["USLT"] = USLT(text=md['lyrics'])
    if 'composer' in md:      tags["TCOM"] = TCOM(text=md['composer'])

    tags.save(filename)


def opus(filename, md):
    try:
        file = OggOpus(filename)
        tags = file.tags
    except mutagen.MutagenError:
        return None

    if 'title' in md:           tags["TITLE"] = md['title']
    if 'artist' in md:          tags["ARTIST"] = md['artist']
    if 'album' in md:           tags["ALBUM"] = md['album']
    if 'album_artist' in md:    tags["ALBUMARTIST"] = md['album_artist']
    if 'track_number' in md:
        tags["TRACKNUMBER"] = str(md['track_number'])
        if 'track_count' in md:
            tags["TRACKTOTAL"] = str(md['track_count'])
    if 'genre' in md:           tags["GENRE"] = md['genre']
    if 'year' in md:          tags["DATE"] = md['year']

    if 'comment' in md:       tags["COMMENT"] = md['comment']
    if 'lyrics' in md:        tags["LYRICS"] = md['lyrics']
    if 'composer' in md:      tags["COMPOSER"] = md['composer']

    file.save(filename)

def m4a(filename, md):
    try:
        file = MP4(filename)
        tags = file.tags
    except mutagen.MutagenError:
        return None

    if 'title' in md:           tags["\xa9nam"] = md['title']
    if 'artist' in md:          tags["\xa9ART"] = md['artist']
    if 'album' in md:           tags["\xa9alb"] = md['album']
    if 'album_artist' in md:    tags["aART"] = md['album_artist']
    if 'track_number' in md:
        tags["trkn"] = [(int(md['track_number']),0)]
        if 'track_count' in md:
            tags["trkn"] = [(int(md['track_number']), int(md['track_count']))]
    if 'genre' in md:           tags["\xa9gen"] = md['genre']
    if 'year' in md:          tags["\xa9day"] = md['year']

    if 'comment' in md:       tags["\xa9cmt"] = md['comment']
    if 'lyrics' in md:        tags["\xa9lyr"] = md['lyrics']
    if 'composer' in md:      tags["\xa9wrt"] = md['composer']

    file.save(filename)
