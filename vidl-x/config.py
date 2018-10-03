import sys, json, os
from colorboy import green
from .vidl import vidl_help, log

def path(*args, **options):
    DIR = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(DIR, *args, **options)
configs = json.loads(open(path('config.json')).read())
def save():
    file = open(path('config.json'), "w+")
    file.write(json.dumps(configs, indent=2))
    file.close()

def set_default_downloads_path():
    if sys.platform == 'darwin':
        set('downloads_path', '~/Downloads')
    elif sys.platform == 'win32':
        import os
        os.path.join(os.getenv('USERPROFILE'), 'Downloads')

def load(value):
    if value == 'downloads_path' and configs[value] == None:
        set_default_downloads_path()
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
        log('Config', sys.argv[2]+':', green(load(key)))
    if len(sys.argv) == 4:
        key = sys.argv[2]
        value = sys.argv[3]
        set(key, value)
        save()
        log(sys.argv[2], 'was set to:', green(value))