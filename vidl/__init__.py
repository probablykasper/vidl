# this file makes the folder a package
import pkg_resources, sys, pprint
from colorboy import cyan, green, red

package_name = __package__.split('.')[0] # used for getting config location and package version
package_author = 'Kasper Henningsen' # used for getting config location

# automatically set __version__
__version__ = pkg_resources.get_distribution(package_name).version

log_prefix = cyan('['+package_name+'] ')
class Log:
    def __call__(self, *args, **named_args):
        print(log_prefix+' '.join(args), **named_args)
    def pretty(self, *args, **named_args):
        pretty = pprint.PrettyPrinter(indent=4).pprint
        pretty(*args, **named_args)
    def error(self, *args, **named_args):
        print(log_prefix+red('Error: ')+' '.join(args), **named_args)
    def fatal(self, *args, **named_args):
        sys.exit(log_prefix+red('Error: ')+' '.join(args), **named_args)
log = Log()

def show_help():
    print(        '')
    print(green(  'Download Usage:'))
    print(        '    '+cyan(package_name)+' [format] [options] <URL>')
    print(        '')
    print(green(  'Download Options:'))
    print(cyan(   '    format             ')+'mp3, mp4, wav or m4a. Default mp3.')
    print(cyan(   '    --no-md            ')+'Don\'t add metadata to downloaded files.')
    print(cyan(   '    --no-smart-md      ')+'Don\'t extract artist and song name from title.')
    print(cyan(   '    --no-dl            ')+'Don\'t download anything. Usually used with -v')
    print(cyan(   '    -v, --verbose      ')+'Display all logs.')
    print(        '')
    print(green(  'General Options:'))
    print(cyan(   '    --version          ')+'Show version. '+green('vidl -v')+' and '+green('vidl version')+' works too.')
    print(cyan(   '    -h, --help         ')+'Show this help message. '+green('vidl help')+' works too.')
    print(cyan(   '    --config-path      ')+'Show the location of the configuration file.')
    print(cyan(   ''))
    print(green(  'Update:'))
    print(cyan(   '    pip3 install vidl --upgrade --upgrade-strategy eager'))
    print(        '')
