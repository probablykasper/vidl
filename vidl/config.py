import sys, json, os, appdirs
from colorboy import green
from vidl.app import log, package_name, package_author

user_data_dir = appdirs.user_data_dir(package_name, package_author)
config_path = os.path.join(user_data_dir, 'config.json')
user_md_parser_path = os.path.join(user_data_dir, 'user_md_parser.py')
default_user_md_parser_path = os.path.join(os.path.dirname(__file__), 'default_user_md_parser.py')

def save_file(path, content, json=False):
    try:
        file = open(path, 'w+')
    except FileNotFoundError:
        os.makedirs(user_data_dir)
        file = open(path, 'w+')
    file.write(content)
    file.close()

def get_default_download_folder():
    if sys.platform == 'darwin':
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
        log('Config does not exist:', green(key), error=True)
        quit()
    return configs[key]
