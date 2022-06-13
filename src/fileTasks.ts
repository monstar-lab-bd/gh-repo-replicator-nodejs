import * as shell from "shelljs";

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

export const removeTempDirectory = async () => {
  if (shell.test('-d', './gh-temp')) {
    shell.rm('-rf', './gh-temp');
  }
  shell.exec('mkdir ./gh-temp', { async: true });
}
export const cloneRepository = async (gitRepositoryUrl: string) => {
  try {
    const output = shell.exec('git clone --mirror ' + gitRepositoryUrl + ' ./gh-temp', { silent: true }).code
    if (output === 0) {
      return true;
    }
  }
  catch (e) {
    console.log('Error Cloning Repository', e);
    throw new Error(e);
  }
  return false;
}

export const pushRepository = async (sourceSlug: string, targetOrigin: string, targetRepoOwner: string) => {
  try {
    shell.cd('./gh-temp/');

    if (shell.exec('git remote remove origin && git remote add origin ' + 'git@github.com:' + targetRepoOwner + '/' + targetOrigin + '.git' + ' && git push --all', { silent: true }).code !== 0) {
      shell.echo('Error: Git set-url failed');
      shell.exit(1);
    }
    if (shell.exec("git push -u origin --all", { silent: true }).code !== 0) {
      shell.echo('Error: Git push failed');
      shell.exit(1);
    }
    return true;
  }
  catch (e) {
    console.log('Push to Repository Error', e);
    throw new Error(e);
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
