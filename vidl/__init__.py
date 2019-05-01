# this file makes the folder a package
import pkg_resources
from colorboy import cyan, green

package_name = __package__.split('.')[0] # used for getting config location and package version
package_author = 'Kasper Henningsen' # used for getting config location

# automatically set __version__
__version__ = pkg_resources.get_distribution(package_name).version

class Log:
    def __call__(self, *args, **named_args):
        print(cyan('[vidl] ')+' '.join(args), **named_args)
    def pretty(self, *args, **named_args):
        pretty = pprint.PrettyPrinter(indent=4).pprint
        pretty(*args, **named_args)
    def error(self, *args, **named_args):
        print(cyan('[vidl] ')+red('Error: ')+' '.join(args), **named_args)
    def fatal(self, *args, **named_args):
        sys.exit(cyan('[vidl] ')+red('Error: ')+' '.join(args), **named_args)
log = Log()

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
    print(cyan(     ''))
    print(green(    'Update vidl:'))
    print(cyan(     '    pip install vidl --upgrade --upgrade-strategy eager'))
    print(          '')
    quit()
