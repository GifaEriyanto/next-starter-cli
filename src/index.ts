import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
import { mkdirSync } from 'fs';
import * as inquirer from 'inquirer';
import { downloadTemplate } from './api/download-template';
import { getTemplateList } from './api/get-template-list';
import { runCommand } from './utils/runCommand';
import Listr from 'listr';

class Reactism extends Command {
  static description = 'describe the command here';
  static projectInfo = {
    name: '',
    desc: '',
    template: '',
    packageManager: 'npm',
  };

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  };

  static async download() {
    const { name, template } = Reactism.projectInfo;

    const destFolder = process.cwd() + '/' + name;
    mkdirSync(destFolder);
    await downloadTemplate(destFolder, template);
  }

  static async install() {
    const { name, packageManager } = Reactism.projectInfo;

    await runCommand(
      `cd "${process.cwd()}/${name}" && ${packageManager} install`,
    );
  }

  static async create() {
    const name = await cli.prompt('What is your project name?');
    const desc = await cli.prompt('What is your project description?');

    const templateList = await getTemplateList();
    const { template } = await inquirer.prompt([
      {
        name: 'template',
        message: 'Which one template you want to use?',
        type: 'list',
        choices: templateList,
      },
    ]);

    const { packageManager } = await inquirer.prompt([
      {
        name: 'packageManager',
        message: 'Which package manager you want to use?',
        type: 'list',
        choices: [
          {
            name: 'Yarn',
            value: 'yarn',
          },
          {
            name: 'NPM',
            value: 'npm',
          },
        ],
      },
    ]);

    Reactism.projectInfo = {
      name,
      desc,
      template,
      packageManager,
    };
  }

  async run() {
    await Reactism.create();

    const tasks = new Listr([
      {
        title: 'Cloning template',
        task: Reactism.download,
      },
      {
        title: 'Install npm dependencies',
        task: Reactism.install,
      },
    ]);

    tasks
      .run()
      .then(() => {
        this.log(
          'Thanks for using Reactism as your React Boilerplate. Happy Code !!!',
        );
      })
      .catch((err) => {
        this.error(err);
      });
  }
}

export = Reactism;
