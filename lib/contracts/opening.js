import Contract from './contract';
import { getMultihashFromHash } from '../../utils/multihash';

export default class Opening extends Contract {
  // submits IPFS hash for commitment
  reveal(hash) {
    
    const { digest, hashFunction, size } 
    = getMultihashFromHash(hash);
    return this.contract.methods.reveal(
      digest, hashFunction, size,
    ).send({ from: this.fromAddress })
      .catch(err => console.log(err));
  }
}