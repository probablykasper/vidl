import sys
from colorboy import green
from vidl import config, package_name, dl, show_help, log

def get_version():
    try:
        from importlib.metadata import version
        return version(package_name)
    except ImportError:
        import pkg_resources
        return pkg_resources.get_distribution(package_name).version

def main():
    config.verify_config()

    if len(sys.argv) <= 1 or '--help' in sys.argv or '-h' in sys.argv or sys.argv[1:] == ['help']:
        show_help()
    elif '--version' in sys.argv or sys.argv[1:] == ['-v'] or sys.argv[1:] == ['version']:
        log("Version", get_version())
    elif '--config-path' in sys.argv:
        log("Config path:", green(config.config_path))
    else:
        options = dl.parse_cli_options()
        dl.download(options)

if __name__ == '__main__':
    main()
