# vidl
Bash script that downloads video/audio

# Installation
This assumes you're using macOS.

### How to make the script global:  
Drag the `vidl` file into the `usr-local-bin` folder, which points to `/usr/local/bin`.  
You can now use vidl by typing `vidl` in the terminal from any directory.

### How to use vidl through shortcuts
1. Create a macOS Service.
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
            /usr/local/bin/vidl "$f"
        done
        ```
    8. Choose File > Save. Type in `vidl`.
2. Next, you need to tie a shortcut to the Service.
    1. Open the System preferences app.
    2. Go to Keyboard, and select the Shortcuts tab.
    3. Select Services from the left column, and locate vidl (should be under Internet). Add your preferred shortcut.

# Usage
To use the script, run `vidl [mp3|mp4|wav|m4a] <url>`.
To use it by shortcut, select some text that contains one or more URLs and press your shortcut.