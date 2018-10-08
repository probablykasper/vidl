import vidl
import toml
from pathlib import Path

def get_package_version():
    path = Path(vidl.__file__).resolve().parents[1] / 'pyproject.toml'
    pyproject = toml.loads(open(str(path)).read())
    return pyproject['tool']['poetry']['version']