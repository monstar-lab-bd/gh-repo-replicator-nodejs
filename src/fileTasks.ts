import * as shell from "shelljs";

if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

export const removeTempDirectory = async () => {
    if (shell.test('-d', 'temp')) {
        shell.rm('-rf', 'temp');
        console.log('Temp Directory Removed...');
    }

}
export const cloneRepository = async (gitRepositoryUrl: string) => {
    try {
        let repoName = gitRepositoryUrl.split('/')

        if (shell.test('-d', 'temp')) {
            shell.cd('temp');
        }
        else {
            shell.exec('mkdir temp', { async: true });
        }
        const output = shell.exec('cd temp && git clone ' + gitRepositoryUrl).code
        if (output === 0) {
            shell.cd(repoName[repoName.length - 1]);
            let repoSlug = repoName[repoName.length - 1].replace('.git', '');
            return repoSlug;
            // askForChallengeName();
        }
    }
    catch (e) {
        console.log('Error Cloning Repository', e);
        throw new Error(e);
    }
    return false;
}

export const pushRepository = async (sourceSlug: string, targetOrigin: string) => {
    try {
        shell.cd('temp/' + sourceSlug);
        if (shell.exec('git remote set-url origin ' + targetOrigin).code !== 0) {
            shell.echo('Error: Git set-url failed');
            shell.exit(1);
        }
        if (shell.exec("git push").code !== 0) {
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
