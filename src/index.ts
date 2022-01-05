#!/usr/bin/env node

import { createOrganizationRepository, createPersonalRepository, addParticipantAsCollaborator, githubPersonalAccessToken, updateGithubPersonalAccessToken, showUserInfo } from './git_tasks';
import { removeTempDirectory, cloneRepository, pushRepository } from './fileTasks';
import * as prompts from './prompts';


let source_repository_url: any = false;
let source_slug: any = false;
let challenge_slug: any = false;
let own_github_username: any = false;
let organization_github_slug: any = false;
let targetRepoType: any = 'Organization';
let participant_username: any = false;
let targetRepoSlug: any = false;
let repoCreatedSshUrl: any = false;


const startGenerator = async () => {

  await removeTempDirectory();

  if(!githubPersonalAccessToken){
    let token = await prompts.askForGithubPersonalAccessToken();
    await updateGithubPersonalAccessToken(token);

  }
  else{
    console.log("Using existing Github Personal Access Token");
    await updateGithubPersonalAccessToken();
  }
  own_github_username = await showUserInfo();
  source_repository_url = await prompts.askForSourceUrl();

  if (source_repository_url) source_slug = await cloneRepository(source_repository_url);
  if (source_slug) challenge_slug = await prompts.askForChallengeName();

  if (challenge_slug) {
    targetRepoType = await prompts.askForRepositoryType();
    if (targetRepoType == 'Organization') {
      organization_github_slug = await prompts.askForOrganizationGithubSlug();
    }
  }

  // if (challenge_slug) own_github_username = await prompts.askForOwnGithubUsername();
  // if (own_github_username) participant_username = await prompts.askForParticipantUsername();

  if (challenge_slug) participant_username = await prompts.askForParticipantUsername();

  if (participant_username) {
    targetRepoSlug = challenge_slug + '-' + participant_username;
    if (targetRepoType == 'Organization' && organization_github_slug) {
      repoCreatedSshUrl = await createOrganizationRepository(targetRepoSlug, organization_github_slug);
    }
    else if (targetRepoType == 'Personal' && own_github_username) {
      repoCreatedSshUrl = await createPersonalRepository(targetRepoSlug);
    }
  }

  if (repoCreatedSshUrl) {
    await addParticipantAsCollaborator(targetRepoSlug, targetRepoType == 'Organization' ? organization_github_slug : own_github_username, participant_username);
    await pushRepository(source_slug, repoCreatedSshUrl);
    await removeTempDirectory();
  }
}
startGenerator();
