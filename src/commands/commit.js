import { ContractLibrary, StorageLibrary, PythonLibrary } from '../../index';
import { Acc } from '../../utils/accumulator';
const {Command, flags} = require('@oclif/command');
import cli from 'cli-ux';
import { finished } from 'stream';
import { createNode } from 'ipfs';
var config = require('config');
//const zkSnark = require("snarkjs");
require('dotenv').config();
var fs = require('fs');
class CommitCommand extends Command {
  static flags = {
    // not important TODO: provide descriptions
    isOpen: flags.boolean({char: 's'}),
    vote: flags.boolean({char: 'v'}),
  };

  // procedure for vote boolean flag -v
  async runVote(contract) {
    // records choice
    const choice = await cli.prompt('Who do you want to vote for?');
    let instance;





    const credentialGenContract = await new ContractLibrary(
      process.env.HOST,
      process.env.PORT,
      process.env.FROMADDRESS,
      process.env.PRIVATEKEY
    ).connectToCredentialGeneration();

    const credentials = await credentialGenContract.getCredentials();
    const accBase = await credentialGenContract.getAccumulatorBase();
    const accModulus = await credentialGenContract.getAccumulatorModulus();
    const acc = await credentialGenContract.getAccumulator();
    //const  w = Acc(accBase,credentials,accModulus,process.env.CREDENTIAL)
    //const a = w**process.env.CREDENTIAL % accModulus 
    //this.log(`credentials : ${credentials.join(' ')}`);
    
    this.log(`accumulator base : ${accBase}`);

    this.log(`accumulator Modulus : ${accModulus}`);

    this.log(`accumulator : ${acc}`);

    






    try {
      // Time Lock
      cli.action.start(`🔒  Locking your vote`);
      const pythonLibrary = new PythonLibrary(
        // done HACK: pass in config
       
        process.env.PYTHONPATH,
        process.env.SCRIPTPATH
        
      ).connectToPython();
      // TODO: time + squarings per second should be set by EA
      const res = await pythonLibrary.encrypt(
       
        config.get('encryptArgs.time'),
        config.get('encryptArgs.squeringsPerSeconds'),
        choice);
      if (res.length !== 1) {
        throw `incorrect return value with length ${res.length}`;
      }
      cli.action.stop()
      const [p, q, n, a, t, enc_key, enc_vote, key] = res[0].split(' ');
      const voteinfo = {
                        "p" :p,
                        "q" :q,
                        "n" :n,
                        "a" :a,
                        "t" :t,
                        "enc_key": enc_key,
                        "enc_vote": enc_vote,
                        "key" : key
      };
      // done TODO: Save all values to local storage for phase 4 
      const voteinfoStr = JSON.stringify(voteinfo, null, 2);
      fs.writeFileSync('myVote.json',voteinfoStr,finished);
      // we assume the order of this tuple is given
      const valuesToCommit = [n, a,t, enc_key, enc_vote].join(' ');
      //zk proof in dev
      


      



      //const circuitDef = JSON.parse(fs.readFileSync("myCircuit.cir", "utf8"));
      //const circuit = new zkSnark.Circuit(circuitDef);





      // Store on IPFS
      cli.action.start(`📦  Storing your locked vote on IPFS`);
      instance = await new StorageLibrary().connectToStorage();
      const writtenValues = await instance.write('vote', valuesToCommit);
      const retrievedValues = await instance.read(writtenValues.hash);
      
      if (valuesToCommit !== retrievedValues) {
        throw `vote could not be stored on IPFS`;
      }
      cli.action.stop()
      
      // store IPFS hash on contract
      cli.action.start('📨  Submitting vote to contract');
      
      const submitVote = await contract.vote(writtenValues.hash);
      
      cli.action.stop()
      this.log(`🎉  Success! You have successfully voted.`);
    } catch (e) {
      // TODO: better error handling
      this.log(e);
    }

    // unblock CLI by stopping IPFS instance, no matter what the outcome
    // TODO: better check if .stop() is an available method
    if (instance) await instance.stop();
  }

  async run() {
    const { flags } = this.parse(CommitCommand);

    if (!flags.vote && !flags.isOpen) return;

    
    const commitmentContract = await new ContractLibrary(
      process.env.HOST,
      process.env.PORT,
      process.env.FROMADDRESS,
      process.env.PRIVATEKEY
    ).connectToCommitment();

    if (flags.isOpen) {
      // TODO: wrap with try/catch
      const open = await commitmentContract.isOpen();
      if (!!open) {
        this.log(
          `🎉  The commitment phase is open. Go ahead and vote!`
        );
      } else {
        this.log('😔  The commitment phase is not currently open.');
      }
    }

    if (flags.vote) this.runVote(commitmentContract);
  }
}

CommitCommand.description = '(3) Commitment Phase.';

module.exports = CommitCommand;
