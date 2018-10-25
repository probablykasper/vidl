import vidl

def get_package_version():
  import pkg_resources
  my_version = pkg_resources.get_distribution('vidl').version
  return my_version
