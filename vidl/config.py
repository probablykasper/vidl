import sys, json, os
from vidl import vidl_help, log

configs = json.loads(open('config.json').read())
def save_config():
    file = open('config.json', "w+")
    file.write(json.dumps(configs, indent=2))
    file.close()

def load(value):
    return configs[value]
def set(key, value):
    if not key in configs:
        log('Config does not exist:', green(key), error=True)
    configs[key] = value
    save_config()


if len(sys.argv) not in [3, 4]:
    vidl_help()
if len(sys.argv) == 3:
    key = sys.argv[2]
    log('Config', sys.argv[2]+':', green(configs[key]))
if len(sys.argv) == 4:
    key = sys.argv[2]
    value = sys.argv[3]
    set(key, value)
    save_config()
    log(sys.argv[2], 'was set to:', green(value))