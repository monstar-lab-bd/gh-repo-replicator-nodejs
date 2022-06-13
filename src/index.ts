#!/usr/bin/env node

import * as GitTasks from './git_tasks';
import * as FileTasks from './fileTasks';
import * as prompts from './prompts';
import chalk = require("chalk");
import { argv } from './questions';

let source_repository_url: any = false;
let source_slug: any = false;
let challenge_slug: any = false;
let username: any = false;
let org_slug: any = false;
let targetRepoType: any = 'Organization';
let collaborator: any = false;
let targetRepoSlug: any = false;
let targetRepoDefaultBranch: string = 'main';



const startReplicator = async () => {

  console.info(chalk.blue.cyan('Welcome To Github Repo Replicator'));
  await FileTasks.removeTempDirectory();


  if (!GitTasks.token) {
    let token = await prompts.askForToken();
    await GitTasks.updateToken(token);
  }
  else {
    console.info(chalk.blue.cyan('Using existing Github Personal Access Token'));
    await GitTasks.updateToken(GitTasks.token);
  }

  try {
    username = await GitTasks.showUserInfo();
  }
  catch (error) {
    console.info(chalk.red.redBright('Please Check Your Github Personal Access Token and Try Again !!'));
    return;
  }

  source_repository_url = argv.source || await prompts.askForSourceUrl();



  if (source_repository_url.includes('github.com')) {
    const { repoOwner, repoPath } = await GitTasks.extractRepoInfo(source_repository_url);
    source_slug = repoPath;
    const { repoIssues, repoPulls } = await GitTasks.getRepoIssues(repoOwner, repoPath);
    const { defaultBranch} = await GitTasks.getRepoDefaultBranch(repoOwner, repoPath);
    targetRepoDefaultBranch = defaultBranch;


    if (source_slug) challenge_slug = argv.destination || await prompts.askForChallengeName();



    if (challenge_slug) {
      targetRepoType = argv.type || await prompts.askForRepositoryType();
      if (targetRepoType == 'Organization') {
        org_slug = argv.org_slug || await prompts.askForOrganizationGithubSlug();
      }
    }

    if (challenge_slug) collaborator = argv.collaborator || await prompts.askForParticipantUsername();

    let targetRepoOwner = targetRepoType == 'Organization' ? org_slug : username;

    if (collaborator) {
      targetRepoSlug = challenge_slug + '-' + collaborator;

      await GitTasks.createRepo(targetRepoOwner, targetRepoSlug);
    }


     console.log(chalk.blue('Adding Participant as Collaborator: ', collaborator, 'to Repository: ', targetRepoOwner + '/' + targetRepoSlug));
    await GitTasks.addParticipantAsCollaborator(targetRepoSlug, targetRepoOwner, collaborator);
    console.log(chalk.green('Collaborator : user *', collaborator, '* has been added as collaborator'));


    await FileTasks.cloneRepository(source_repository_url);
    console.log(chalk.green.greenBright('Repository Cloned Successfully.'));

    await FileTasks.pushRepository(source_slug, targetRepoSlug, targetRepoOwner);
    console.log(chalk.green.greenBright('Repository Pushed Successfully.'));

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

    await GitTasks.setRepoDefaultBranch(targetRepoOwner, targetRepoSlug, targetRepoDefaultBranch);

    await FileTasks.removeTempDirectory();
    console.log(chalk.green.bold('Repository Replicated Successfully'));
    console.log(chalk.green.bold('Here is the Repository URL: https://github.com/' + targetRepoOwner + '/' + targetRepoSlug));

  }
}
startReplicator();
