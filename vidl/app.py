from colorboy import green, cyan, red
from pathlib import Path

package_name = 'vidl' # used for getting config location and package version
package_author = 'Kasper Henningsen' # used for getting config location

def log(*args, error=False, quiet=False, callback=None, quit=True, **named_args):
    vidl_text = cyan('[vidl]')
    if error:
        print(vidl_text, red('Error:'), *args, **named_args)
    elif quiet == False:
        print(vidl_text, *args, **named_args)

script_filename = "vidl"
# used to be sys.argv[0], but Poetry changes sys.argv[0] to the full path
def vidl_help():
    print(          '')
    print(green(    'Download Usage:'))
    print(          '    '+cyan(script_filename)+' [format] [options] <URL>')
    print(          '')
    print(green(    'Download Options:'))
    print(cyan(     '    format             ')+'mp3, mp4, wav or m4a. Default mp3.')
    print(cyan(     '    --no-md            ')+'Don\'t add metadata to downloaded files.')
    print(cyan(     '    --no-smart-md      ')+'Don\'t extract artist and song name from title.')
    print(cyan(     '    --no-dl            ')+'Don\'t download anything. Usually used with -v')
    print(cyan(     '    -v, --verbose      ')+'Display all logs.')
    print(          '')
    print(green(    'Global Options:'))
    print(cyan(     '    --version          ')+'Display vidl version. "vidl -v" also works.')
    print(cyan(     '    -h, --help         ')+'Display this help message.')
    print(cyan(     '    --config-path      ')+'Display the location of vidl\'s configuration file.')
    print(          '')
    quit()

def main():
    import sys
    if len(sys.argv) <= 1 or '--help' in sys.argv or '-h' in sys.argv:
        vidl_help()
    elif '--version' in sys.argv or sys.argv[1:] == ['-v']:
        import vidl.version
        log("Version", vidl.version.get_package_version())
    elif '--config-path' in sys.argv:
        import vidl.config
        log("Config path:", vidl.config.config_path)
    else:
        from vidl import dl
        dl.main()
if __name__ == '__main__':
    main()
