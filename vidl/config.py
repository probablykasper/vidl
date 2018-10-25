import sys, json, os
from colorboy import green
from vidl.app import vidl_help, log
from pprint import pformat

def path(*args, **options):
    DIR = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(DIR, *args, **options)

config_path = path('config.json')
def save_config(content):
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

default_configs = {
    'download_folder': get_default_download_folder(),
    'output_template': '%(uploader)s - %(title)s.%(ext)s',
}
if not os.path.isfile(config_path):
    save_config(default_configs)

configs = json.loads(open(config_path).read())

def get_config(key):
    if key not in configs:
        log('Config does not exist:', green(key), error=True)
    return configs[key]
def set_config(key, value):
    if key not in configs:
        log('Config does not exist:', green(key), error=True)
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
