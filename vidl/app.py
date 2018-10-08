from colorboy import green, cyan, red
from pathlib import Path
import toml

def log(*args, error=False, quiet=False, **named_args):
    vidl_text = cyan('[vidl]')
    if error:
        print(vidl_text, red('error:'), *args, **named_args)
        quit()
    elif quiet == False:
        print(vidl_text, *args, **named_args)

script_filename = "vidl"
# used to be sys.argv[0], but Poetry changes sys.argv[0] to the full path
def vidl_help():
    print(          '')
    print(green(    'Usage:'))
    print(          '    '+cyan(script_filename)+' [format] [options] <URL>')
    print(          '')
    print(green(    'Options:'))
    print(cyan(     '    format             ')+'mp3, mp4, wav or m4a. Default mp3.')
    print(cyan(     '    --no-md            ')+'Don\'t add metadata to downloaded files.')
    print(cyan(     '    --no-smart-md      ')+'Don\'t extract artist and song name from title.')
    print(cyan(     '    -v, --verbose      ')+'Display all logs.')
    print(cyan(     '    -h, --help         ')+'Display this help message.')
    print(          '')
    print(green(    'Configuration:'))
    print(          '    '+cyan(script_filename)+' config <key> [new_value]')
    print(          '  ')
    print(green(    'Available Configs:'))
    print(cyan(     '    download_folder    ')+'The folder that vidl downloads to.')
    print(cyan(     '    output_template    ')+'youtube-dl output template.')
    print(          '')
    quit()

def main():
    import sys
    if len(sys.argv) <= 1:
        vidl_help()
    elif sys.argv[1] == 'config':
        from vidl import config
        config.main()
    elif sys.argv[1] in ['--version', '-v']:
        import vidl.version
        print(vidl.version.get_package_version())
    else:
        from vidl import dl
        dl.main()
if __name__ == '__main__':
    main()
