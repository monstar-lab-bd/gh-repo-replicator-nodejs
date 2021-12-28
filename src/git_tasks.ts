
import { Octokit } from "@octokit/core";
import * as dotenv from 'dotenv';
dotenv.config();

const githubAccessToken = process.env.GITHUB_TOKEN;
const octokit = new Octokit({
    auth: githubAccessToken,
});



export const createPersonalRepository = async (repositoryName: string) => {
    if (repositoryName !== '') {
        console.log('Creating Repository: ', repositoryName);
        try {
            const createRepo = await octokit.request('POST /user/repos', {
                name: repositoryName
            })
            if (createRepo.status === 201) {
                return createRepo.data.ssh_url;
            }
        }
        catch (e) {
            console.log('Github Repository Create Request Failed: ', e);
            throw new Error(e);
        }
    }
    return false;
}

export const createOrganizationRepository = async (repositoryName: string, organizationSlug: string) => {
    if (repositoryName !== '') {
        console.log('Creating Repository: ', repositoryName);
        try {
            const createRepo = await octokit.request('POST /orgs/' + organizationSlug + '/repos', {
                org: organizationSlug,
                name: repositoryName
            })
            if (createRepo.status === 201) {
                return createRepo.data.ssh_url;
            }
        }
        catch (e) {
            console.log('Github Repository Create Request Failed: ', e);
            throw new Error(e);
        }
    }
    return false;
}

export const addParticipantAsCollaborator = async (targetRepoSlug: string, ownerUsername: string, collaboratorUsername: string) => {
    if (targetRepoSlug !== '') {
        console.log('Adding Collaborator: ', collaboratorUsername, 'to Repository: ', ownerUsername + '/' + targetRepoSlug);
        try {
            const response = await octokit.request('PUT /repos/' + ownerUsername + '/' + targetRepoSlug + '/collaborators/' + collaboratorUsername + '', {
                owner: ownerUsername,
                repo: targetRepoSlug,
                username: collaboratorUsername,
                permission: 'push'
            })
            if (response.status === 201) {
                console.log('Collaborator Added: ', collaboratorUsername, 'to Repository: ', ownerUsername + '/' + targetRepoSlug);
                return true;
                //pushRepository(targetRepoSlug);
            }
            else {
                console.log('Error: ', response.status);
            }

        }
        catch (e) {
            console.log('Github Collaborator Add Request Failed: ', e);
            throw new Error(e);
        }
    }
    return false;
}
