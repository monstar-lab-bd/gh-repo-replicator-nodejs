import * as shell from "shelljs";

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

export const removeTempDirectory = async () => {
  if (shell.test('-d', '../temp')) {
    shell.rm('-rf', '../temp');
  }
  shell.exec('mkdir ../temp', { async: true });
}
export const cloneRepository = async (gitRepositoryUrl: string) => {
  try {
    //let repoName = gitRepositoryUrl.split('/')

    // if (shell.test('-d', 'temp')) {
    //   shell.cd('temp');
    // }
    // else {
    //   shell.exec('mkdir temp', { async: true });
    // }
    const output = shell.exec('git clone --mirror ' + gitRepositoryUrl + ' ../temp').code
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
    shell.cd('../temp/');

    if (shell.exec('git remote remove origin && git remote add origin ' + 'git@github.com:' + targetRepoOwner + '/' + targetOrigin + '.git' + ' && git push --all').code !== 0) {
      shell.echo('Error: Git set-url failed');
      shell.exit(1);
    }
    if (shell.exec("git push -u origin --all").code !== 0) {
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
