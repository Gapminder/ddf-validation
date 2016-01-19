const level = {
  error: 'error',

};
module.exports = {
  // ddf folder validation
  err_folder_not_found: {
    level: level.error,
    message: path => `Given folder doesn't exist: '${path}'`,
    when: path => `when ${path} doesn't exists or not a folder`
  },
  err_folder_has_no_subfolders: {
    level: level.error,
    message: path => `Given folder doesn't contain any sub folders: '${path}'`,
    when: path => `when ${path} not a ddf folder and there are no subfolders`
  },
  err_folder_is_not_ddf_folder: {
    level: level.error,
    message: path => `Given folder'${path}' is not a ddf-folder`,
    when: path => `when ${path} not a ddf folder`
  },
  err_folder_has_no_ddf_subfolders: {
    level: level.error,
    message: path => `Given folder '${path}' doesn't contain any ddf subdolders`,
    when: path => `when ${path} not a ddf folder and doesn't have ddf subfolders`
  }


};
