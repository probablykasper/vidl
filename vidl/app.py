import sys, pprint
from colorboy import green, cyan, red
from pathlib import Path

# import vidl.config
# from vidl.config import get_config, config_path

# if not get_config('download_folder'):
#     log.error('Config download_folder is empty. You can find your config file here: '+config_path)

def main():
    import vidl.config
    vidl.config.verify_config()

    if len(sys.argv) <= 1 or '--help' in sys.argv or '-h' in sys.argv:
        vidl_help()
    elif '--version' in sys.argv or sys.argv[1:] == ['-v']:
        import vidl
        log("Version", vidl.__version__)
    elif '--config-path' in sys.argv:
        log("Config path:", green(vidl.config.config_path))
    else:
        from vidl import dl
        dl.main()
if __name__ == '__main__':
    main()
