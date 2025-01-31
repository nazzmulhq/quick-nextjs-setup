#!/usr/bin/env node

import chalk from 'chalk';
import cp from 'child_process';
import fs from 'fs';
import ora from 'ora';
import shell from 'shelljs';

import { getEslintConfigJsFile, getPrettierrc } from './const.js';

const spinner = ora();

const withSpinner = async ({ message, args, fn }) => {
  spinner.start('Processing...');
  try {
    const returnValue = await fn(args);
    spinner.succeed(message);
    return returnValue;
  } catch (error) {
    spinner.fail('Failed');
    console.error(error);
  }
};

const checkPackageJson = async args => {
  if (!fs.existsSync('./package.json')) {
    spinner.fail('package.json does not exist');
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  return pkg.name;
};

const checkNodeVersion = async args => {
  const nodeVersion = cp.execSync('node -v').toString();
  return nodeVersion;
};

async function shellCommand(command) {
  try {
    const isError = shell.exec(command).code !== 0;
    if (isError) {
      shell.echo(`Error: ${command} failed`);
      shell.exit(1);
    }
    return null; // Add a return statement here
  } catch (error) {
    return null;
  }
}

// create file and write data to file
async function createAndWrite(filename, data) {
  try {
    // Write the data to the file
    await fs.writeFile(filename, data, err => {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log('ERROR: ' + err);
  }
}

async function replaceInFile(filename, searchValue, replaceValue) {
  try {
    fs.readFile(filename, 'utf8', async (err, data) => {
      if (err) {
        console.log(err);
      }
      const updatedData = data.replace(searchValue, replaceValue);
      await fs.writeFile(filename, updatedData, 'utf8', err => {
        if (err) {
          console.log(err);
        }
      });
    });
  } catch (err) {
    console.log('ERROR: ' + err);
  }
}

const setup = async ({ projectName, nodeVersion }) => {
  // .eslintrc.json check if file exists or not delete file
  if (fs.existsSync('./eslint.config.mjs')) {
    fs.unlinkSync('./eslint.config.mjs');
  }

  // shellCommand('npx husky-init');
  // await replaceInFile('./.husky/pre-commit', 'npm test', 'npx lint-staged');
  // shellCommand(`npm pkg delete scripts.prepare`);

  shellCommand(`npm pkg set devDependencies.eslint=^9`);
  shellCommand(
    `npm pkg set devDependencies.@typescript-eslint/eslint-plugin=^8.21.0`
  );
  shellCommand(`npm pkg set devDependencies.@eslint/eslintrc=^3`);
  shellCommand(`npm pkg set devDependencies.eslint-config-next=^15.1.6`);
  shellCommand(`npm pkg set devDependencies.eslint-plugin-prettier=^5.2.3`);
  shellCommand(`npm pkg set devDependencies.prettier=^3.4.2`);

  await createAndWrite('eslint.config.mjs', getEslintConfigJsFile());
  await createAndWrite('.prettierrc.js', getPrettierrc());

  // npm install
  shellCommand('npm install --legacy-peer-deps');

  // await createAndWrite(
  //   'Dockerfile',
  //   getDockerFile(String(nodeVersion).replace('v', ''))
  // );

  // await createAndWrite('docker-compose.yml', getDockerComposeFile(projectName));
};

const main = async () => {
  try {
    console.log(
      chalk.red(
        `
=========================================================================
Take few minutes to setup your project. Please do not close the terminal.
=========================================================================
       \n
      `
      )
    );
    // Check if the current directory is a git repository
    // if (!fs.existsSync('.git')) {
    //   console.log(
    //     chalk.red('Please initialize git repository first: Type "git init"')
    //   );
    //   process.exit(1);
    // }

    // Step 1: Check package.json file exists or not
    const projectName = await withSpinner({
      message: 'Checking package.json file...',
      fn: checkPackageJson,
    });

    // Step 2: Get current node version
    const nodeVersion = await withSpinner({
      message: 'Checking current Node version...',
      fn: checkNodeVersion,
    });

    console.log(chalk.green(`Project name: ${projectName}`));
    console.log(chalk.green(`Node version: ${nodeVersion}`));

    // setup husky, docker, docker-compose, pm2, ecosystem.config.js file
    await withSpinner({
      message: 'Setting up project...',
      fn: setup,
      args: { projectName, nodeVersion },
    });

    spinner.succeed(`Project setup successfully`);

    console.log(
      chalk.green(` 
      \n
=========================================================================
      EsLint and Prettier setup successfully.
      Enjoy coding with linting and formatting.
=========================================================================

===========================Author: Info==================================
      Name: Nazmul Haque
      Email: nazmul2018s@gmail.com
      Github: https://github.com/nazzmulhq
      My Site: https://nazmulhaque.netlify.app/
=========================================================================
      \n\n
      `)
    );
  } catch (error) {
    spinner.fail('Failed');
    console.error(error);
  }
};

main();
