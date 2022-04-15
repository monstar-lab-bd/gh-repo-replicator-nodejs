# GitHub Coding Challenge Generator

This is an automated coding challenge generator from GitHub repository templates.

It makes a copy of the template repository and names it after the candidate's GitHub handle.

It will also copy all Issues and Pull requests (work in progress). 

## Usage

You will need an GIthub Personal Access Token to use this. Create a personal access token at https://github.com/settings/tokens/new.

** For Personal repository you need to create access token with `repo` scope only.
** For Organization repository you would need `admin:org` `admin:repo_hook` along with `repo` scope.

You can use the token in your ENV file as `GITHUB_TOKEN` or you can paste it at the prompt.

Follow the prompts and you will get you replicated repository. 
```js
 npm start -- --token=<token> --source=git@github.com:charuvision/Sample-main.git --destination=my-new-repo-3 --repo_type=Organization --org_slug=charuvision --target_user=charuvisionapps --user=<your-github-username> --org_slug=<github-org-slug-if-org_slug=Organization>

```

## Development

TBD
