import sys
from colorboy import green, cyan, red, magenta, yellow, bright

def log(*args, error=False, quiet=False):
    vidl_text = cyan('[vidl]')
    if error:
        print(vidl_text, red('error:'), *args)
        quit()
    elif quiet == False:
        print(vidl_text, *args)

script_filename = sys.argv[0]
def vidl_help():
    print(          '')
    print(green(    'Usage:'))
    print(          '    '+cyan(script_filename)+' [format] [options] <URL>')
    print(          '')
    print(green(    'Options:'))
    print(cyan(     '    format             ')+'mp3, mp4, wav or m4a. Default mp3.')
    print(cyan(     '    --no-md            ')+'Don\'t add metadata to downloaded files.')
    print(cyan(     '    -q, --quiet        ')+'Only log errors.')
    print(cyan(     '    -v, --verbose      ')+'Display all logs.')
    print(cyan(     '    -h, --help         ')+'Display this help message.')
    print(          '')
    print(green(    'Configuration:'))
    print(          '  '+cyan(script_filename)+' config <key> [new_value]')
    print(          '  ')
    print(green(    'Available Configs:'))
    print(cyan(     '    download_folder    ')+'The folder that vidl downloads to.')
    print(cyan(     '    output_template    ')+'youtube-dl output template.')
    print(          '')
    quit()

def main():
    if len(sys.argv) <= 1:
        vidl_help()
    elif sys.argv[1] == 'config':
        from vidl import config
        config.main()
    else:
        from vidl import dl
        dl.main()
if __name__ == '__main__':
    main()