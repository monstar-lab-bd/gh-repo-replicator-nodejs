#!/usr/bin/env node

import * as GitTasks from './git_tasks';
import * as FileTasks from './fileTasks';
import * as prompts from './prompts';

let source_repository_url: any = false;
let source_slug: any = false;
let challenge_slug: any = false;
let own_github_username: any = false;
let organization_github_slug: any = false;
let targetRepoType: any = 'Organization';
let participant_username: any = false;
let targetRepoSlug: any = false;

const startGenerator = async () => {

  await FileTasks.removeTempDirectory();

  if (!GitTasks.githubPersonalAccessToken) {
    let token = await prompts.askForGithubPersonalAccessToken();
    await GitTasks.updateGithubPersonalAccessToken(token);

  }
  else {
    console.log("Using existing Github Personal Access Token");
    await GitTasks.updateGithubPersonalAccessToken();
  }

  own_github_username = await GitTasks.showUserInfo();

  source_repository_url = await prompts.askForSourceUrl();

  if (source_repository_url.includes('github.com')) {
    const { repoOwner, repoPath } = await GitTasks.extractRepoInfo(source_repository_url);
    source_slug = repoPath;
    const {repoWorkingDirectory, repoDefaultBranch} = await GitTasks.unzipFile(repoOwner, repoPath);
    const repoIssues = await GitTasks.getRepoIssues(repoOwner, repoPath);
    console.log(repoIssues);

    if (repoWorkingDirectory && repoDefaultBranch) {
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

      await GitTasks.addParticipantAsCollaborator(targetRepoSlug, targetRepoOwner, participant_username);
      await GitTasks.uploadToRepo(repoWorkingDirectory, targetRepoOwner, targetRepoSlug, repoDefaultBranch, 'Upload new codes to repo',);
      await GitTasks.createIssues(targetRepoOwner, targetRepoSlug, repoIssues);
      await FileTasks.removeTempDirectory();
    }
  }
}
startGenerator();
