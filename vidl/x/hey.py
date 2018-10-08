import toml, vidl
from pathlib import Path
def get_package_version():
    path = Path(vidl.__file__).resolve().parents[1] / 'pyproject.toml'
    print(path)
    pyproject = toml.loads(open(str(path)).read())
    return pyproject['tool']['poetry']['version']
print("vidl", get_package_version())