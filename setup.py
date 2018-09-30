from distutils.core import setup

# from pipenv.project import Project
# from pipenv.utils import convert_deps_to_pip

# pfile = Project(chdir=False).parsed_pipfile
# requirements = convert_deps_to_pip(pfile['packages'], r=False)
# test_requirements = convert_deps_to_pip(pfile['dev-packages'], r=False)

setup(
    name='vidl',
    version='3.0dev',
    url='https://github.com/SpectralKH/vidl',
    author='KH',
    author_email='kasperkh.kh@gmail.com',
    packages=['vidl'],
    description='Python script to download video/audio, built with youtube-dl',
    long_description=open('README.md', "r").read(),
    long_description_content_type='text/markdown',
)