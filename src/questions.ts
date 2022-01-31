import yargs = require("yargs");

const QUESTIONS = [
  {
    name: 'source',
    message: 'Enter the source repository github url :',
    type: 'input',
    when: () => !yargs.argv['source_url'],
    validate: (input: string) => {
      if (/(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/.test(input)) {
        //@todo: download the repo and save as a zip file.
        return true;
      }
      else {
        return 'Not a valid git repository url.';

      }
    }
  },
  {
    name: 'challenge_name',
    message: 'Enter the Coding Challenge Name : e.g. "Coding Challenge 1"',
    type: 'input',
    when: () => !yargs.argv['challenge_name'],
    validate: (input: string) => {
      if (input.length > 0) {
        console.log('challenge_name input: ', input);
        return true;
      }
      else {
        return 'Name Must not be empty';
      }
    }
  },
  {
    type: 'list',
    name: 'repo_type',
    message: 'Select the repository type',
    choices: ['Organization', 'Personal'],
  },
  {
    name: 'own_github_username',
    message: 'Enter Your Github username : e.g. "my_username"',
    type: 'input',
    when: () => !yargs.argv['own_github_username'],
    validate: (input: string) => {
      if (input.length > 0) {
        console.log('own_github_username input: ', input);
        return true;
      }
      else {
        return 'Username Must not be empty';
      }
    }
  },
  {
    name: 'organization_github_slug',
    message: 'Enter Organization Github slug : e.g. "my_organization"',
    type: 'input',
    when: () => !yargs.argv['organization_github_slug'],
    validate: (input: string) => {
      if (input.length > 0) {
        console.log('organization_github_slug input: ', input);
        return true;
      }
      else {
        return 'GIthub Slug Must not be empty';
      }
    }
  },
  {
    name: 'participant_username',
    message: 'Enter the participants Github username : e.g. "participant_username"',
    type: 'input',
    when: () => !yargs.argv['participant_username'],
    validate: (input: string) => {
      if (input.length > 0) {
        console.log('participant_username input: ', input);
        return true;
      }
      else {
        return 'Username Must not be empty';
      }
    }
  },
  {
    name: 'githubPersonalAccessToken',
    message: 'Enter your github access token ( Create a personal access token at https://github.com/settings/tokens/new?scopes=repo ) :',
    type: 'input',
    when: () => !yargs.argv['githubPersonalAccessToken'],
    validate: (input: string) => {
      if (input.startsWith("ghp_") && input.length == 40) return true;
      else return 'Invalid Github Access Token.';
    }
  },
  {
    type: 'confirm',
    name: 'duplicate_repo',
    message: 'Do you want to preserve Existing Pull Requests and Issues?',
    default: false,
  },
];

export default QUESTIONS;
