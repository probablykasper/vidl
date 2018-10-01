import sys
print(sys.argv)

from vidl import vidl_help

def log(*args, error=False):
    vidl_text = CYAN+'[vidl]'+RESET
    if error:
        print(vidl_text, 'error:', *args)
        quit()
    elif not quiet:
        print(vidl_text, *args)