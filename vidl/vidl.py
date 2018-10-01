import sys
from colorboy import green, cyan, red

def log(*args, error=False, quiet=False):
    vidl_text = cyan('[vidl]')
    if error:
        print(vidl_text, red('error:'), *args)
        quit()
    elif quiet == False:
        print(vidl_text, *args)

def vidl_help():
    script_filename = sys.argv[0]
    print('')
    print(green('Usage:'))
    print('  '+cyan(script_filename)+' [format] [options] <URL>')
    print('  '+cyan(script_filename)+' config <key> [value]')
    print('')
    print(green('Options:'))
    print(cyan('  format           ')+'mp3, mp4, wav or m4a. Default mp3.')
    print(cyan('  -h, --help       ')+'Display this help message.')
    print(cyan('  -q, --quiet      ')+'Only log errors.')
    print(cyan('  -v, --verbose    ')+'Display all logs.')
    print('')
    print(green('Available Configs:'))
    print(cyan('  download_folder  ')+'The folder that vidl downloads to.')
    quit()

if len(sys.argv) <= 1:
    vidl_help()
elif sys.argv[1] == 'config':
    import config
else:
    import dl