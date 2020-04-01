import { ContractLibrary } from '../../index';

const {Command, flags} = require('@oclif/command');
//const { Vault } = require('ansible-vault')
require('dotenv').config();
class RegisterCommand extends Command {
  static flags = {
    // TODO: provide descriptions
    isOpen: flags.boolean({char: 's'}),
    hashFunction: flags.boolean({char: 'h'}),
    ellipticCurve: flags.boolean({char: 'c'}),
  };

  async run() {
    const { flags } = this.parse(RegisterCommand);
    console.log('now I am in register')
    if (!flags.isOpen && !flags.hashFunction && !flags.ellipticCurve) return;

    // TODO HACK: hardcoded, pass parameters as user config
    const registrationContract = await new ContractLibrary(
      process.env.HOST,
      process.env.PORT,
      process.env.FROMADDRESS,
      process.env.PRIVATEKEY
    ).connectToRegistration();

    if (flags.isOpen) {
      // TODO: wrap with try/catch
      const open = await registrationContract.isOpen();
      if (!!open) {
        this.log(
          `🎉  The registration phase is open. Proceed to the EA to submit your
          credentials.`
        );
      } else {
        this.log('😔  The registration is not currently open.');
      }
    }

    if (flags.hashFunction) {
      // TODO: wrap with try/catch
      const hashF = await registrationContract.getHashFunction();
      this.log(`The Hash Function for signing messages is ${hashF}.`);
    }

    if (flags.ellipticCurve) {
      // TODO: wrap with try/catch
      const curve = await registrationContract.getEllipticCurve();
      this.log(`The Elliptic Curve for signing messages is ${curve}.`);
    }
  }
}

RegisterCommand.description = '(1) Registration Phase';

module.exports = RegisterCommand;
