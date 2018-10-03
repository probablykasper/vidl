# vidl
vidl is a script designed to easily download video/audio from anywere, using youtube-dl. It automatically embeds thumbnails to mp3/mp4/m4a files and adds metadata like artist/title to mp3s.

# Installation
Installation using PyPI isn't possible yet.
1. Install Python (Python 3.7 works, probably other versions too)
2. Install [ffmpeg and ffprobe](https://www.ffmpeg.org/)
3. Run `pip install vidl`
4. Run `vidl `

# Usage
Hmmmmmmmmm

# Dev Instructions
### Installation
1. Install Python (Python 3.7 works, probably other versions too)
2. Install [ffmpeg and ffprobe](https://www.ffmpeg.org/)
3. Install [Poetry](https://poetry.eustace.io)
4. Run `poetry install` to install Python package dependencies.

For VSCode to detect the Python virtual environment that Poetry creates, I ran `poetry config settings.virtualenvs.in-project true`. This command makes Poetry create your Python virtual environment inside the project folder. Now, you can set the `python.pythonPath` setting to `${workspaceFolder}/.venv/bin/python` in your workspace settings (or global if you want this to be the default).

### Running vidl.py
Run `poetry run python vidl`. Alternatively you can run `poetry shell` to enter into the virtual environment's own CLI, then run `python vidl` as you normally would.







<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>


# Outdated stuff below

# vidl
Bash script that downloads video/audio

# Installation
This assumes you're using macOS.

You need to install [youtube-dl](https://rg3.github.io/youtube-dl/download.html)

### How to make the script global:  
Move the `vidl` file into `/usr/local/bin`.  
You can now use vidl by typing `vidl` in the terminal from any directory.

### How to use vidl through shortcuts
First, create a macOS Service:
1. Open the Automator app.
2. Choose File > New, and select Service.
3. Select "Service receives selected `URLs` in `any application`". If you want the shortcut to only work in one app, select that app instead of `any application`.
4. Select "Input is `only URLs`".
5. Double click the action "Run Shell Script". You can find it by using the search field.
6. In the "Run Shell Script" section, select `as arguments` in the "Pass input" dropdown.
7. In the "Run Shell Script" section, paste in the script that you can find below.
    ```
    for f in "$@"
    do
        # AppleScript doesn't look for scripts like the terminal does, so
        # we need to make it look in the folder where vidl is. If you have
        # youtube-dl installed elsewhere, you need to add that as well.
        export PATH=/usr/local/bin:$PATH
        vidl --quiet "$f"
    done
    ```
8. Choose File > Save. Type in `vidl`.

Now, you need to tie a shortcut to the Service:
1. Open the System preferences app.
2. Go to Keyboard, and select the Shortcuts tab.
3. Select Services from the left column, and locate vidl (should be under Internet). Add your preferred shortcut.

# Usage
To use the script, run `vidl [mp3|mp4|wav|m4a] <url>`.
To use it by shortcut, select some text that contains one or more URLs and press your shortcut.
