import * as inquirer from 'inquirer';
import QUESTIONS from './questions';


export const askForSourceUrl = async () => {
    console.log('Asking for askForSourceUrl >>>');

    return await inquirer.prompt(QUESTIONS[0])
        .then(async answers => {
            let answer: any = Object.assign({}, answers);
            return answer.source;
        });
}