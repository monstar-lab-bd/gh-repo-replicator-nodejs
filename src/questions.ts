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
    }
  ];

  export default QUESTIONS;