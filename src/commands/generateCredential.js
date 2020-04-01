import { ContractLibrary } from '../../index';

const {Command, flags} = require('@oclif/command');

require('dotenv').config();
class GenerateCredentialCommand extends Command {
  static flags = {
    // TODO: provide descriptions
    accumulator: flags.boolean({char: 'a'}),
    modulus: flags.boolean({char: 'm'}),
    generate: flags.boolean({char: 'g'}),
  };

  async run() {
    const { flags } = this.parse(GenerateCredentialCommand);

    if (!flags.accumulator && !flags.modulus && !flags.generate) return;
    this.log(process.env.PRIVATEKEY)
    // TODO HACK: hardcoded, pass parameters as user config
    // cf: https://oclif.io/docs/base_class
    const credGenContract = await new ContractLibrary(
    
      process.env.HOST,
      process.env.PORT,
      process.env.FROMADDRESS,
      process.env.PRIVATEKEY
      // done TODO: private key is a very unsafe HACK, remove this
      
     
    ).connectToCredentialGeneration();

    if (flags.accumulator) {
      const accumulator = await credGenContract.getAccumulator();
      this.log(`📦  The accumulator base is: ${accumulator}`);
    }

    if (flags.modulus) {
      const modulus = await credGenContract.getAccumulatorModulus();
      this.log(`🍴  The modulus for the accumulator is: ${modulus}`);
    }

    if (flags.generate) {
      // TODO: HACK, should be generated safely. For now, an arbitray prime.
      const votingCredential = 7151;
      process.env.CREDENTIAL = votingCredential
      // WARNING: this does not work on local `truffle develop`, known issue
      // run on testnet
      const accumulator = await credGenContract.addToAccumulator(votingCredential);
      this.log(`🎩  After adding your voting credential, the accumulator is:
        ${accumulator}`);
      

    }
  }
}

GenerateCredentialCommand.description = '(2) Credential Generation Phase.';

module.exports = GenerateCredentialCommand;
