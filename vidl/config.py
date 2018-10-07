import sys, json, os
from colorboy import green
from vidl.app import vidl_help, log
from pprint import pformat

def path(*args, **options):
    DIR = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(DIR, *args, **options)
configs = json.loads(open(path('config.json')).read())
def save():
    file = open(path('config.json'), "w+")
    file.write(json.dumps(configs, indent=2))
    file.close()

def set_default_download_folder():
    if sys.platform == 'darwin':
        set('download_folder', '~/Downloads')
    elif sys.platform == 'win32':
        import os
        path = os.path.join(os.getenv('USERPROFILE'), 'Downloads')
        set('download_folder', path)

def load(value):
    if value == 'download_folder' and configs[value] == None:
        set_default_download_folder()
    return configs[value]
def set(key, value):
    if not key in configs:
        log('Config does not exist:', green(key), error=True)
    configs[key] = value
    save()

def main():
    if len(sys.argv) not in [3, 4]:
        vidl_help()
    if len(sys.argv) == 3:
        key = sys.argv[2]
        value = load(key)
        log('Config', key+':', green(pformat(value)))
    if len(sys.argv) == 4:
        key = sys.argv[2]
        value = sys.argv[3]
        set(key, value)
        save()
        log(key, 'was set to:', green(pformat(value)))