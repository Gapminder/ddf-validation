import { exec } from 'child_process';
import { isEmpty } from 'lodash';
import { valid, lt } from 'semver';
import { red, green } from 'chalk';

export const checkLatestVersion = (currentVersion: string) => {
  exec('npm show ddf-validation version', (err: any, _latestVersion: string) => {
    const latestVersion = (_latestVersion || '').trim();

    if (!err && !isEmpty(latestVersion)) {
      if (valid(latestVersion) && lt(currentVersion, latestVersion)) {
        console.log(`Current version ${red(currentVersion)} is too old. New version is ${green(latestVersion)}. To update run "npm i -g ddf-validation"`);
      }
    }
  });
};
