import { Octokit as octoKitRestApi } from "@octokit/rest";
import { argv } from "./questions";
import { sleep } from "./fileTasks";
import * as dotenv from 'dotenv';
dotenv.config();



let token = process.env.GITHUB_TOKEN || argv.token || null;
let octoKitRest: any = null;

export const updateToken = async (token?: string) => {
  octoKitRest = new octoKitRestApi({
    auth: token || token,
  });
}

export { token, octoKitRest };

export const addParticipantAsCollaborator = async (targetRepoSlug: string, ownerUsername: string, collaboratorUsername: string) => {
  if (targetRepoSlug !== '') {
    await sleep(1000);

    try {
      const response = await octoKitRest.rest.repos.addCollaborator({
        owner: ownerUsername,
        repo: targetRepoSlug,
        username: collaboratorUsername,
        permission: 'push'
      });
      if (response.status === 201) {

        return true;
      }
      else {
        throw new Error(response.status);
      }

    }
    catch (e) {
      throw new Error(e.message);
    }
  }
  return false;
}

export const showUserInfo = async () => {
  const response = await octoKitRest.rest.users.getAuthenticated();
  console.log('Hello ', response.data.name, '! You are logged in as: ', response.data.login);
  return response.data.login;
}

export const extractRepoInfo = async (repoUrl: string) => {

  if (repoUrl.startsWith('git@github.com')) repoUrl = repoUrl.replace('git@github.com:', '');
  if (repoUrl.startsWith('https://github.com')) repoUrl = repoUrl.replace('https://github.com/', '');

  let repoOwner = repoUrl.split('/')[repoUrl.split('/').length - 2];
  let repoPath = repoUrl.split('/')[repoUrl.split('/').length - 1].replace('.git', '');

  return { repoOwner: repoOwner, repoPath: repoPath };
}

export const getRepoIssues = async (repoOwner: string, repoPath: string) => {

  const repositoryIssues: any = await octoKitRest.rest.issues.listForRepo({
    owner: repoOwner,
    repo: repoPath,
  });

  let issuesData: any = [];
  let pullsData: any = [];

  for (const issue of repositoryIssues.data) {
    if (issue.pull_request) {
      const pullDetails = await getRepoPullRequestById(repoOwner, repoPath, issue.number);
      pullsData.push({
        owner: pullDetails.user.login,
        repo: repoPath,
        head: pullDetails.head.ref,
        base: pullDetails.base.ref,
        number: pullDetails.number,
        title: pullDetails.title,
        body: pullDetails.body,
        assignees: pullDetails.assignees,
      })
    }
    else {
      issuesData.push({
        owner: repoOwner,
        repo: repoPath,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels,
        assignees: issue.assignees,
        milestone: issue.milestone,
        locked: issue.locked,
        comments: issue.comments
      }
      )
    }
  }

  return { repoIssues: issuesData, repoPulls: pullsData };
}

export const getRepoDefaultBranch = async (repoOwner: string, repoPath: string) => {

  const repositoryBranches: any = await octoKitRest.repos.get({
    owner: repoOwner,
    repo: repoPath,
  });

  return { defaultBranch: repositoryBranches.data?.default_branch };
}

export const setRepoDefaultBranch = async (repoOwner: string, repoPath: string, branchName: string) => {

  try {
    const res = await octoKitRest.repos.update({
      owner: repoOwner,
      repo: repoPath,
      default_branch: branchName,
    });
  }
  catch (e) {
    return false;
  }
}

export const getRepoPullRequestById = async (repoOwner: string, repoPath: string, PullNumber: Number) => {

  const repositoryPullRequest: any = await octoKitRest.rest.pulls.get({
    owner: repoOwner,
    repo: repoPath,
    pull_number: PullNumber
  });

  return repositoryPullRequest.data;
}

export const createIssues = async (repoOwner: string, repoPath: string, issues: any) => {

  for (const issue of issues) {
    if (issue.pull_request) continue; // skip pull requests.

    try {
      await octoKitRest.rest.issues.create({
        owner: repoOwner,
        repo: repoPath,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels,
      });
    }
    catch (e) {
      throw new Error(e.message);
    }
  }
  return true;
}

export const createPulls = async (repoOwner: string, repoPath: string, pulls: any) => {

  for (const pull of pulls) {
    try {
      await octoKitRest.rest.pulls.create({
        owner: repoOwner,
        repo: repoPath,
        title: pull.title,
        body: pull.body,
        head: pull.head,
        base: pull.base,
      });
    }
    catch (e) {
      throw new Error(e.message);
    }
  }
  return true;
}

export const createRepo = async (org: string, name: string, personal: boolean) => {

  try {
    if(!personal){
    const res = await octoKitRest.repos.createInOrg({ org, name, auto_init: false, private: true });

    }
    else{
      const res = await octoKitRest.repos.createForAuthenticatedUser({ name, auto_init: false, private: true });

    }
    return true;
  }
  catch (e) {
    throw new Error(e.message);
  }
}


