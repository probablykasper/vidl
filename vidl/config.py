import sys, json, os, pkg_resources, appdirs
from colorboy import green
from vidl.app import vidl_help, log, package_name, package_author
from pprint import pformat

user_data_dir = appdirs.user_data_dir(package_name, package_author)
config_path = os.path.join(user_data_dir, 'config.json')

def save_config(content):
    try:
        file = open(config_path, 'w+')
    except FileNotFoundError:
        os.makedirs(user_data_dir)
        file = open(config_path, 'w+')
    file.write(json.dumps(content, indent=2))
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

# default config
if not os.path.isfile(config_path):
    save_config({
        'download_folder': get_default_download_folder(),
        'output_template': '%(uploader)s - %(title)s.%(ext)s',
    })

configs = json.loads(open(config_path).read())

def get_config(key):
    if key not in configs:
        log('Config does not exist:', green(key), error=True)
        quit()
    return configs[key]
def set_config(key, value):
    if key not in configs:
        log('Config does not exist:', green(key), error=True)
        quit()
    configs[key] = value
    save_config(configs)

def main():
    if len(sys.argv) not in [3, 4]:
        vidl_help()
    if len(sys.argv) == 3:
        key = sys.argv[2]
        value = get_config(key)
        log('Config', key+':', green(pformat(value)))
    if len(sys.argv) == 4:
        key = sys.argv[2]
        value = sys.argv[3]
        set_config(key, value)
        log('Config', key, 'was set to:', green(pformat(value)))
