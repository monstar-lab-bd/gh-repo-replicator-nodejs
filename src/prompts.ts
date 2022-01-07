import * as inquirer from 'inquirer';
import QUESTIONS from './questions';


export const askForSourceUrl = async () => {
  //Asking for askForSourceUrl >>>

  return await inquirer.prompt(QUESTIONS[0])
    .then(async answers => {
      let answer: any = Object.assign({}, answers);
      return answer.source;
    });
}
export const askForChallengeName = async () => {
  //Asking for askForChallengeName >>>

  return await inquirer.prompt(QUESTIONS[1])
    .then(async answers => {
      let answer: any = Object.assign({}, answers);
      console.log('Got Challenge Name: ', answer.challenge_name);
      /* slugify the challenge name */
      let slug = answer.challenge_name.replace(/\s+/g, '-').toLowerCase();
      return slug;
    });
}

export const askForRepositoryType = async () => {
  //Asking for askForRepositoryType >>>
  return await inquirer.prompt(QUESTIONS[2])
    .then(async answers => {
      let answer: any = Object.assign({}, answers);
      return answer.repo_type;
    });
}

export const askForOwnGithubUsername = async () => {
  //Asking for askForOwnGithubUsername >>>

  return await inquirer.prompt(QUESTIONS[3])
    .then(async answers => {
      let answer: any = Object.assign({}, answers);
      return answer.own_github_username;
    });
}

export const askForOrganizationGithubSlug = async () => {
  //Asking for askForOrganizationGithubSlug >>>

  return await inquirer.prompt(QUESTIONS[4])
    .then(async answers => {
      let answer: any = Object.assign({}, answers);
      return answer.organization_github_slug;
    });
}

export const askForParticipantUsername = async () => {
  //Asking for askForParticipantUsername >>>

  return await inquirer.prompt(QUESTIONS[5])
    .then(async answers => {
      let answer: any = Object.assign({}, answers);
      return answer.participant_username;
    });
}

export const askForGithubPersonalAccessToken = async () => {
  // Asking for GithubPersonalAccessToken >>>
  return await inquirer.prompt(QUESTIONS[6])
    .then(async answers => {
      let answer: any = Object.assign({}, answers);
      return answer.githubPersonalAccessToken;
    });
}
