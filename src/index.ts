#!/usr/bin/env node

import * as GitTasks from './git_tasks';
import * as FileTasks from './fileTasks';
import * as prompts from './prompts';
import * as chalk from 'chalk';


let source_repository_url: any = false;
let source_slug: any = false;
let challenge_slug: any = false;
let own_github_username: any = false;
let organization_github_slug: any = false;
let targetRepoType: any = 'Organization';
let participant_username: any = false;
let targetRepoSlug: any = false;

const startReplicator = async () => {
  console.info(chalk.blue.cyan('Welcome To Github Repo Replicator'));
  await FileTasks.removeTempDirectory();

  if (!GitTasks.githubPersonalAccessToken) {
    let token = await prompts.askForGithubPersonalAccessToken();
    await GitTasks.updateGithubPersonalAccessToken(token);
  }
  else {
    console.info(chalk.blue.cyan('Using existing Github Personal Access Token from ENV'));
    await GitTasks.updateGithubPersonalAccessToken();
  }

  try {
    own_github_username = await GitTasks.showUserInfo();
  }
  catch (error) {
    console.info(chalk.red.redBright('Please Check Your Github Personal Access Token and Try Again !!'));
    return;
  }

  source_repository_url = await prompts.askForSourceUrl();

  if (source_repository_url.includes('github.com')) {
    const { repoOwner, repoPath } = await GitTasks.extractRepoInfo(source_repository_url);
    source_slug = repoPath;
    //const { repoWorkingDirectory, repoDefaultBranch } = await GitTasks.unzipFile(repoOwner, repoPath);
    const { repoIssues, repoPulls } = await GitTasks.getRepoIssues(repoOwner, repoPath);

   // if (repoWorkingDirectory && repoDefaultBranch) {
      if (source_slug) challenge_slug = await prompts.askForChallengeName();

      if (challenge_slug) {
        targetRepoType = await prompts.askForRepositoryType();
        if (targetRepoType == 'Organization') {
          organization_github_slug = await prompts.askForOrganizationGithubSlug();
        }
      }

      if (challenge_slug) participant_username = await prompts.askForParticipantUsername();

      let targetRepoOwner = targetRepoType == 'Organization' ? organization_github_slug : own_github_username;

      if (participant_username) {
        targetRepoSlug = challenge_slug + '-' + participant_username;
        await GitTasks.createRepo(targetRepoOwner, targetRepoSlug);
      }

      console.log(chalk.blue('Adding Participant as Collaborator: ', participant_username, 'to Repository: ', targetRepoOwner + '/' + targetRepoSlug));
      await GitTasks.addParticipantAsCollaborator(targetRepoSlug, targetRepoOwner, participant_username);
      console.log(chalk.green('Collaborator Added: ', participant_username, 'to Repository: ', targetRepoOwner + '/' + targetRepoSlug));

      // Duplicate the Repository ?
      let duplicateRepo = await prompts.askForRepoDuplicate();

      if (duplicateRepo) {

        let clonedRepo = await FileTasks.cloneRepository(source_repository_url);
        console.log(chalk.green.greenBright('Repository Cloned Successfully !!', clonedRepo));

        let repoPushed = await FileTasks.pushRepository(source_slug, targetRepoSlug, targetRepoOwner);
        console.log(chalk.green.greenBright('Repository Pushed Successfully !!', repoPushed));
      }

      if (repoIssues) {
        console.log(chalk.blue('Adding Issues to Repository: ', targetRepoOwner + '/' + targetRepoSlug));
        await GitTasks.createIssues(targetRepoOwner, targetRepoSlug, repoIssues);
        console.log(chalk.green('Issues Added'));
      }

      if (repoPulls) {
        console.log(chalk.blue('Adding Pulls to Repository: ', targetRepoOwner + '/' + targetRepoSlug));
        await GitTasks.createPulls(targetRepoOwner, targetRepoSlug, repoPulls);
        console.log(chalk.green('Pulls Added'));
      }

      await FileTasks.removeTempDirectory();
      console.log(chalk.green.bold('Repository Replicated Successfully'));
    //}
  }
}
startReplicator();
