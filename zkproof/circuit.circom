template Accum() {
    signal private input prev_accumulator;
    signal private input credential;
    signal input modulus;
    signal output accumulator;
    
    accumulator <== prev_accumulator**credential % modulus;
}

component main = Accum();