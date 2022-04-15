// import yargs = require("yargs");
import { name } from "ejs";
import { boolean, string } from "yargs";
import yargs = require("yargs");


const QUESTIONS = [
  {
    name: 'source',
    message: 'Source repository github url',
    type: 'input',
    when: () => !yargs.argv['source'],
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
    name: 'destination',
    message: 'Target Repository Name',
    type: 'input',
    when: () => !yargs.argv['destination'],
    validate: (input: string) => {
      if (input.length > 0) {
        console.log('destination input: ', input);
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
    name: 'username',
    message: 'Enter Your Github username',
    type: 'input',
    when: () => !yargs.argv['username'],
    validate: (input: string) => {
      if (input.length > 0) {
        console.log('username input: ', input);
        return true;
      }
      else {
        return 'Username Must not be empty';
      }
    }
  },
  {
    name: 'org_slug',
    message: 'Enter Organization Github slug',
    type: 'input',
    when: () => !yargs.argv['org_slug'],
    validate: (input: string) => {
      if (input.length > 0) {
        console.log('org_slug input: ', input);
        return true;
      }
      else {
        return 'GIthub Slug Must not be empty';
      }
    }
  },
  {
    name: 'collaborator',
    message: 'Enter Collaborator Github username',
    type: 'input',
    when: () => !yargs.argv['collaborator'],
    validate: (input: string) => {
      if (input.length > 0) {
        console.log('collaborator input: ', input);
        return true;
      }
      else {
        return 'Username Must not be empty';
      }
    }
  },
  {
    name: 'token',
    message: 'Enter your github access token:',
    type: 'input',
    when: () => !yargs.argv['token'],
    validate: (input: string) => {
      if (input.startsWith("ghp_") && input.length == 40) return true;
      else return 'Invalid Github Access Token.';
    }
  },
  {
    type: 'confirm',
    name: 'mirror',
    message: 'Import Pull Requests and Issues?',
    default: false,
  },
];

export const argv = yargs
  .options(
    QUESTIONS.reduce(function (acc: any, curr) {
      acc[curr.name] = {
        alias: curr.name.toString().substring(0,1),
        demandOption: false,
        description: curr.message,
        type: curr.type === 'confirm' ? 'boolean'  : 'string',
      }
      return acc;
    }, {})
  )
  .argv

export default QUESTIONS;
