from colorboy import green, cyan, red
from pathlib import Path
import toml

def log(*args, error=False, quiet=False, **named_args):
    vidl_text = cyan('[vidl]')
    if error:
        print(vidl_text, red('Error:'), *args, **named_args)
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
    print(cyan(     '    --no-dl            ')+'Don\'t download anything. Usually used with -v')
    print(cyan(     '    -v, --verbose      ')+'Display all logs.')
    print(cyan(     '    --version          ')+'Display vidl version. "vidl -v" also works.')
    print(cyan(     '    -h, --help         ')+'Display this help message.')
    print(          '')
    print(green(    'Configuration:'))
    print(          '    '+cyan(script_filename+' config')+' <key> [new_value]')
    print(          '  ')
    print(green(    'Available Configs:'))
    print(cyan(     '    download_folder    ')+'The folder that vidl downloads to.')
    print(cyan(     '    output_template    ')+'youtube-dl output template.')
    print(          '')
    quit()

def main():
    import sys
    if len(sys.argv) <= 1 or '--help' in sys.argv or '-h' in sys.argv:
        vidl_help()
    elif '--version' in sys.argv or sys.argv[1:] == ['-v']:
        import vidl.version
        log("Version", vidl.version.get_package_version())
    elif sys.argv[1] == 'config':
        from vidl import config
        config.main()
    else:
        from vidl import dl
        dl.main()
if __name__ == '__main__':
    main()
