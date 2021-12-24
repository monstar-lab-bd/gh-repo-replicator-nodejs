#!/usr/bin/env node

import { removeTempDirectory, cloneRepository } from './fileTasks';
import * as prompts from './prompts';

let source_repository_url: any = false;
let source_slug: any = false;
let challenge_slug: any = false;
let own_github_username: any = false;
let organization_github_slug: any = false;
let targetRepoType: any = 'Organization';
let participant_username: any = false;


const startGenerator = async () => {

    await removeTempDirectory();
    source_repository_url = await prompts.askForSourceUrl();

    if (source_repository_url) source_slug = await cloneRepository(source_repository_url);
    if (source_slug) challenge_slug = await prompts.askForChallengeName();
    
    if (challenge_slug) {
        targetRepoType = await prompts.askForRepositoryType();
        if (targetRepoType == 'Organization') {
            organization_github_slug = await prompts.askForOrganizationGithubSlug();
        }
    }

    if (challenge_slug) own_github_username = await prompts.askForOwnGithubUsername();
    if (own_github_username) participant_username = await prompts.askForParticipantUsername();
    
}
startGenerator();
