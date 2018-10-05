if __name__ == '__main__':

    # make the package be able to import itself (vidl)
    import os,sys,inspect
    currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
    parentdir = os.path.dirname(currentdir)
    sys.path.insert(0,parentdir)

    from vidl import app
    app.main()