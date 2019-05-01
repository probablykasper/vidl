import sys, pprint
from colorboy import green
from vidl import config, __version__, dl, show_help, log

def main():
    config.verify_config()

    if len(sys.argv) <= 1 or '--help' in sys.argv or '-h' in sys.argv or sys.argv[1:] == ['help']:
        show_help()
    elif '--version' in sys.argv or sys.argv[1:] == ['-v'] or sys.argv[1:] == ['version']:
        log("Version", __version__)
    elif '--config-path' in sys.argv:
        log("Config path:", green(config.config_path))
    else:
        dl.main()

if __name__ == '__main__':
    main()
