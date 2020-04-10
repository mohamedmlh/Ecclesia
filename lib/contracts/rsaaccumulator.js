import Contract from './contract';

export default class RSAAcc extends Contract {
  // submits IPFS hash for commitment
  getProofWet(credential, x) {
    
    
    return this.contract.methods.getProofWet(
      credential, x
    ).send({ from: this.fromAddress })
      .catch(err => console.log(err));
  }
}