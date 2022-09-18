import sys, json, os, appdirs
from colorboy import green
from vidl import log, package_name, package_author

if sys.platform == 'darwin':
    # TODO:
    # https://github.com/ActiveState/appdirs/issues/185
    # or
    # https://github.com/platformdirs/platformdirs/issues/98
    user_config_dir = "~/Library/Application Support/" + package_name
else:
    user_config_dir = appdirs.user_config_dir(package_name, package_author, roaming=True)

config_path = os.path.join(user_config_dir, 'config.json')
user_md_parser_path = os.path.join(user_config_dir, 'user_md_parser.py')
default_user_md_parser_path = os.path.join(os.path.dirname(__file__), 'default_user_md_parser.py')

def save_file(path, content, json=False):
    try:
        file = open(path, 'w+')
    except FileNotFoundError:
        os.makedirs(user_config_dir)
        file = open(path, 'w+')
    file.write(content)
    file.close()

def get_default_download_folder():
    if sys.platform == 'darwin' or sys.platform.startswith('linux'):
        return '~/Downloads'
    elif sys.platform == 'win32':
        import os
        path = os.path.join(os.getenv('USERPROFILE'), 'Downloads')
        return path
    else:
        return None

default_config = {
    'download_folder': get_default_download_folder(),
    'output_template': '%(uploader)s - %(title)s.%(ext)s',
}

if not os.path.isfile(config_path):
    save_file(config_path, json.dumps(default_config, indent=2))
if not os.path.isfile(user_md_parser_path):
    default_user_md_parser = open(default_user_md_parser_path).read()
    save_file(user_md_parser_path, default_user_md_parser)

configs = json.loads(open(config_path).read())
from importlib.machinery import SourceFileLoader
user_md_parser = SourceFileLoader('user_md_parser', user_md_parser_path).load_module().user_md_parser

def get_config(key):
    if key not in configs:
        log.error('Config does not exist:', green(key))
        quit()
    return configs[key]

def verify_config():
    for config in default_config:
        if config not in configs or configs[config] == '':
            log.fatal('Config '+green(config)+' is not set. You can set it in your config file, which is here: '+green(config_path)+'. You could alternatively delete the config file, so vidl recreates the default.')
