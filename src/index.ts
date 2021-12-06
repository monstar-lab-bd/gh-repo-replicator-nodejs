#!/usr/bin/env node

import * as inquirer from 'inquirer';
import * as yargs from 'yargs';


const QUESTIONS = [
    {
        name: 'Source Url',
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
    }
];

//@todo Ask for the target github user name.
//@todo upload to new repository.
//@todo check if user already logged in. if not promt for login. (uploader/admin)
//@todo add target user as collaborator.


inquirer.prompt(QUESTIONS)
    .then(answers => {

        let answer: any = Object.assign({}, answers, yargs.argv);

        const gitSourceUrl = answer['source_url'];

        console.log(gitSourceUrl)
    });
