//import cli from 'cli-ux';
const { Command, flags } = require('@oclif/command');

//require('dotenv').config();
class HelloCommand extends Command {
  
  async run() {
    // CLI interaction example
    const { flags } = this.parse(HelloCommand);
    const name = flags.name || 'world';
    this.log(`hello ${name} from ./src/commands/hello.js`);
    this.log('the protocol is set by default on local network.');
    //this.log(process.env.USERNAME)
  }
}

HelloCommand.description = 'Welcome to Ecclesia\'s Voter CLI 📝`';

HelloCommand.flags = {
  name: flags.string({ char: 'n', description: 'name to print' }),
};

module.exports = HelloCommand;
   