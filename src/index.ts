#!/usr/bin/env node

import { createRepo, addParticipantAsCollaborator, githubPersonalAccessToken, updateGithubPersonalAccessToken, showUserInfo, extractRepoInfo, unzipFile, uploadToRepo } from './git_tasks';
import { removeTempDirectory } from './fileTasks';
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

  await removeTempDirectory();

  if (!githubPersonalAccessToken) {
    let token = await prompts.askForGithubPersonalAccessToken();
    await updateGithubPersonalAccessToken(token);

  }
  else {
    console.log("Using existing Github Personal Access Token");
    await updateGithubPersonalAccessToken();
  }

  own_github_username = await showUserInfo();

  source_repository_url = await prompts.askForSourceUrl();

  if (source_repository_url.includes('github.com')) {
    const { repoOwner, repoPath } = await extractRepoInfo(source_repository_url);
    source_slug = repoPath;
    const {repoWorkingDirectory, repoDefaultBranch} = await unzipFile(repoOwner, repoPath);

    if (repoWorkingDirectory && repoDefaultBranch) {
      if (source_slug) challenge_slug = await prompts.askForChallengeName();

      if (challenge_slug) {
        targetRepoType = await prompts.askForRepositoryType();
        if (targetRepoType == 'Organization') {
          organization_github_slug = await prompts.askForOrganizationGithubSlug();
        }
      }

      if (challenge_slug) participant_username = await prompts.askForParticipantUsername();

      if (participant_username) {
        targetRepoSlug = challenge_slug + '-' + participant_username;
        await createRepo(targetRepoType == 'Organization' ? organization_github_slug : own_github_username, targetRepoSlug);
      }

      await addParticipantAsCollaborator(targetRepoSlug, targetRepoType == 'Organization' ? organization_github_slug : own_github_username, participant_username);
      await uploadToRepo(repoWorkingDirectory, targetRepoType == 'Organization' ? organization_github_slug : own_github_username, targetRepoSlug, repoDefaultBranch, 'Upload new codes to repo',);
      await removeTempDirectory();
    }
  }
}
startGenerator();
