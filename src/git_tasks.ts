import { Octokit as octoKitRestApi } from "@octokit/rest";
import * as dotenv from 'dotenv';
import globby = require("../node_modules/globby");
import * as path from 'path';
import { readFile } from 'fs-extra';
dotenv.config();
import { writeFileSync, readdirSync } from 'fs';
const admZip = require('adm-zip');

let githubPersonalAccessToken = process.env.GITHUB_TOKEN || null;
let octoKitRest: any = null;

export const updateGithubPersonalAccessToken = async (token?: string) => {
  octoKitRest = new octoKitRestApi({
    auth: githubPersonalAccessToken || token,
  });
}

export { githubPersonalAccessToken, octoKitRest };

export const addParticipantAsCollaborator = async (targetRepoSlug: string, ownerUsername: string, collaboratorUsername: string) => {
  if (targetRepoSlug !== '') {

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
      console.log('Github Collaborator Add Request Failed: ', e);
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

export const unzipFile = async (repoOwner: string, repoPath: string) => {

  const repository: any = await octoKitRest.rest.repos.get({
    owner: repoOwner,
    repo: repoPath,
  });
  //console.log('Repository: ', repository.data);


  const { data } = await octoKitRest.rest.repos.downloadZipballArchive({
    owner: repoOwner,
    repo: repoPath,
    ref: repository.data.default_branch
  });

  const backupDir = "./temp";
  const dir = `${backupDir}/${repository.data.default_branch}.zip`;
  writeFileSync(dir, Buffer.from(data as ArrayBuffer));

  let zip = new admZip(dir);
  zip.extractAllTo(backupDir, true);

  const repoWorkingDIrectory = readdirSync(backupDir, { withFileTypes: true })
    .filter((item: any) => item.isDirectory())
    .map((item: any) => item.name);

  return { repoWorkingDirectory: backupDir+'/'+repoWorkingDIrectory[0], repoDefaultBranch: repository.data.default_branch };
}

export const getRepoIssues = async (repoOwner: string, repoPath: string) => {

  const repositoryIssues: any = await octoKitRest.rest.issues.listForRepo({
    owner: repoOwner,
    repo: repoPath,
  });
  return repositoryIssues.data;
}

export const createIssues = async (repoOwner: string, repoPath: string, issues: any) => {

  for (const issue of issues) {
    if(issue.pull_request) continue; // skip pull requests.

    await octoKitRest.rest.issues.create({
      owner: repoOwner,
      repo: repoPath,
      title: issue.title,
      body: issue.body,
    });
  }
  return true;
}

export const createRepo = async (org: string, name: string) => {
  await octoKitRest.repos.createInOrg({ org, name, auto_init: true })
}

export const uploadToRepo = async (
  coursePath: string,
  org: string,
  repo: string,
  branch: string = `main`,
  commitMessages: string = `Upload Codes`,
) => {
  // gets commit's AND its tree's SHA
  try {
    const currentCommit = await getCurrentCommit(org, repo, branch)
    const filesPaths = await globby(coursePath)
    const filesBlobs = await Promise.all(filesPaths.map(createBlobForFile(org, repo)))
    const pathsForBlobs = filesPaths.map((fullPath: string) => path.relative(coursePath, fullPath))
    const newTree = await createNewTree(org, repo, filesBlobs, pathsForBlobs, currentCommit.treeSha)
    const commitMessage = commitMessages;
    const newCommit = await createNewCommit(org, repo, commitMessage, newTree.sha, currentCommit.commitSha)
    await setBranchToCommit(org, repo, branch, newCommit.sha)
  } catch (error) {
    console.log(error);
  }
}

const getCurrentCommit = async (org: string, repo: string, branch: string = 'main') => {
  const { data: refData } = await octoKitRest.git.getRef({ owner: org, repo, ref: `heads/${branch}`, })
  const commitSha = refData.object.sha
  const { data: commitData } = await octoKitRest.git.getCommit({ owner: org, repo, commit_sha: commitSha, })
  return { commitSha, treeSha: commitData.tree.sha, }
}

// readFile's utf8 is different from Github's utf-8
const getFileAsUTF8 = (filePath: string) => readFile(filePath, 'utf8')

const createBlobForFile = (org: string, repo: string) => async (filePath: string) => {
  const content = await getFileAsUTF8(filePath)
  const blobData = await octoKitRest.git.createBlob({ owner: org, repo, content, encoding: 'utf-8', })
  return blobData.data
}

const createNewTree = async (owner: string, repo: string, blobs: any, paths: string[], parentTreeSha: string) => {
  const tree = blobs.map(({ sha }: any, index: any) => ({ path: paths[index], mode: `100644`, type: `blob`, sha, }));
  const { data } = await octoKitRest.git.createTree({ owner, repo, tree, base_tree: parentTreeSha, })
  return data
}

const createNewCommit = async (org: string, repo: string, message: string, currentTreeSha: string, currentCommitSha: string) =>
  (await octoKitRest.git.createCommit({ owner: org, repo, message, tree: currentTreeSha, parents: [currentCommitSha], })).data

const setBranchToCommit = (org: string, repo: string, branch: string = `master`, commitSha: string) =>
  octoKitRest.git.updateRef({ owner: org, repo, ref: `heads/${branch}`, sha: commitSha, })

