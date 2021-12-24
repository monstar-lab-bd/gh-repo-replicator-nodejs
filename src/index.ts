#!/usr/bin/env node

import { removeTempDirectory, cloneRepository } from './fileTasks';
import * as prompts from './prompts';

let source_repository_url: any = false;
let source_slug: any = false;

const startGenerator = async () => {

    await removeTempDirectory();
    source_repository_url = await prompts.askForSourceUrl();

    if (source_repository_url) source_slug = await cloneRepository(source_repository_url);
    
}
startGenerator();
