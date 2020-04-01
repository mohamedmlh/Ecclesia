import { ContractLibrary, StorageLibrary} from '../../index';
import { finished } from 'stream';
import cli from 'cli-ux';
const {Command, flags} = require('@oclif/command');
var fs = require('fs');
require('dotenv').config();
class RevealCommand extends Command {
  static flags = {
    
    isOpen: flags.boolean({char: 's'}),
   
  };

  async run() {
    const { flags } = this.parse(RevealCommand);
   
    const OpeningContract = await new ContractLibrary(
      process.env.HOST,
      process.env.PORT,
      process.env.FROMADDRESS,
      process.env.PRIVATEKEY
    ).connectToOpening();

    if (flags.isOpen) {
      try
      {
        const open = await OpeningContract.isOpen();
        if (!!open) {
            this.log(
              `🎉  The revealing phase is open. Proceed to the EA to submit your
              vote parameters.`
            );
          } else {
            this.log('😔  The revealing phase is not currently open.');
          }
      }
      catch(error) 
      {
          this.log(error);
      }
      
    }

   
    let instance;
    try 
    {
        const digestP = fs.readFileSync("myVote.json");
        const voteP = JSON.parse(digestP);
        const vP = [voteP["p"],voteP["q"],voteP["key"]].join(' ');

        cli.action.start(`📦  Storing your vote parameters on IPFS`);
        instance = await new StorageLibrary().connectToStorage();
        const writtenValues = await instance.write('voteP', vP);
        const retrievedValues = await instance.read(writtenValues.hash);
        this.log(retrievedValues);
        if (vP !== retrievedValues) {
            throw `vote parameters could not be stored on IPFS`;
        }
        cli.action.stop()
        // store IPFS hash on contract
        cli.action.start('📨  Submitting vote parameters hash to contract');
      
        const submitVote = await OpeningContract.reveal(writtenValues.hash);
      
        cli.action.stop()
        this.log(`🎉  Success! You have successfully revealed your prims.`);

    }
    catch(error)
    {
        this.log(error);
    }
    if (instance) await instance.stop();
    
  }
}

RevealCommand.description = '(4) Opening Phase';

module.exports = RevealCommand;
