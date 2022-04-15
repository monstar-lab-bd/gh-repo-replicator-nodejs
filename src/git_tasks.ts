import { Octokit as octoKitRestApi } from "@octokit/rest";
import { argv } from "./questions";
import { sleep } from "./fileTasks";
import chalk = require("chalk");
import * as dotenv from 'dotenv';
import { exit } from "process";
dotenv.config();



let token = process.env.GITHUB_TOKEN || argv.token || null;
let octoKitRest: any = null;

export const updatetoken = async (token?: string) => {
  octoKitRest = new octoKitRestApi({
    auth: token || token,
  });
}

export { token, octoKitRest };

export const addParticipantAsCollaborator = async (targetRepoSlug: string, ownerUsername: string, collaboratorUsername: string) => {
  if (targetRepoSlug !== '') {
    await sleep(1000);
    console.log(ownerUsername, collaboratorUsername, targetRepoSlug);

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
        console.log('Error: ', response.status);
      }

    }
    catch (e) {
      console.log('Github Collaborator Add Request Failed: ', e.message);
      throw new Error(e);
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

    try{
      await octoKitRest.rest.issues.create({
        owner: repoOwner,
        repo: repoPath,
        title: issue.title,
        body: issue.body,
      });
    }
    catch(e){
      console.log('Error Creating Pull Request: ', e.message);
    }
  }
  return true;
}

export const createPulls = async (repoOwner: string, repoPath: string, pulls: any) => {

  for (const pull of pulls) {
    try{
      await octoKitRest.rest.pulls.create({
        owner: repoOwner,
        repo: repoPath,
        title: pull.title,
        body: pull.body,
        head: pull.head,
        base: pull.base,
      });
    }
    catch(e){
      console.log(chalk.red.redBright('Pull Request Creation Failed: ', e.message));
    }
  }
  return true;
}

export const createRepo = async (org: string, name: string) => {

  try{
    await octoKitRest.repos.createInOrg({ org, name, auto_init: false, private: true });
    return true;
  }
  catch(e){
    console.log(chalk.red.redBright(e.message));
    exit()
  }
}


