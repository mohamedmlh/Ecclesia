pragma solidity >=0.4.25 <0.6.0;

import {IPFS} from './IPFS.sol';
import {Timed} from './Timed.sol';
import {RSAAccumulator} from './RSAAccumulator.sol';
contract Commitment is Timed {
  address public electionAuthority;
  //RSAAccumulator public accumulatorContract;
  mapping(address => IPFS.Multihash) ballots;
  //mapping(uint256 => bool) used;
  //uint256[8] public initialAccumulator;
  //uint256[8] public finalAccumulator;
  constructor(
    uint256 openingTime_,
    uint256 closingTime_,
    bytes memory accumulatorModulus_
  ) public Timed(openingTime_, closingTime_) {
    electionAuthority = msg.sender;
    
  }

  // Ballot is committed
  // the ZK proof of knowledge is NOT implemented
  // Voter submits time-locked vote to IPFS, hash is stored here

  function vote(
    bytes32 _digest,
    uint8 _hashFunction,
    uint8 _size
    //uint64 credential,
    //bytes memory witnessLimbs
  ) public {
    require(super.isOpen(), "phase not open");
    // vefity proof is Wesolowski scheme.
    //require(!used[credential],"used credential");
    /*require(
      accumulatorContract.checkInclusionProof(
      credential,
      witnessLimbs,
      initialAccumulator,
      finalAccumulator),
      " inclusion not proven");*/
    //used[credential] = true;
    // every address can only submit one vote
    if (ballots[msg.sender].size == 0) {
      ballots[msg.sender] = IPFS.Multihash(_digest, _hashFunction, _size);
    }
  }
}
