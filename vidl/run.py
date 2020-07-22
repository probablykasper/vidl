import sys, pprint
from colorboy import green
from vidl import config, __version__, dl, show_help, log
from urllib.parse import urlparse

def parse_arguments_build_options():
    options = {
        'url': '',
        'file_format': 'mp3',
        'audio_only': True,
        'no_md': False,
        'no_smart_md': False,
        'no_dl': False,
        'verbose': False,
        'download_folder': config.get_config('download_folder'),
        'output_template': config.get_config('output_template'),
    }
    video_formats = ['mp4']
    audio_formats = ['mp3', 'wav', 'm4a']
    # parse arguments
    for arg in sys.argv[1:]:
        if arg in audio_formats:
            options['audio_only'] = True
            options['file_format'] = arg
        elif arg in video_formats:
            options['audio_only'] = False
            options['file_format'] = arg
        elif arg in ['--no-md']:
            options['no_md'] = True
        elif arg in ['--no-smart-md']:
            options['no_smart_md'] = True
        elif arg in ['--no-dl']:
            options['no_dl'] = True
        elif arg in ['-v', '--verbose']:
            options['verbose'] = True
        elif '.' in arg:
            parsed_url = urlparse(arg)
            url = arg
            if (parsed_url.scheme == ''): url = 'https://'+url
            print(url)
            options['url'] = url
        else:
            log.fatal('Unknown argument:', arg)
    if options['url'] == '':
        log.fatal('No URL provided')
    return options


def main():
    config.verify_config()

    if len(sys.argv) <= 1 or '--help' in sys.argv or '-h' in sys.argv or sys.argv[1:] == ['help']:
        show_help()
    elif '--version' in sys.argv or sys.argv[1:] == ['-v'] or sys.argv[1:] == ['version']:
        log("Version", __version__)
    elif '--config-path' in sys.argv:
        log("Config path:", green(config.config_path))
    else:
        options = parse_arguments_build_options()
        dl.main(options)

if __name__ == '__main__':
    main()
