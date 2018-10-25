from vidl.app import package_name

def get_package_version():
  import pkg_resources
  my_version = pkg_resources.get_distribution(package_name).version
  return my_version
