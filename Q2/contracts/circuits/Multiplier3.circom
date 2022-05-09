pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier2 () {  
   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output c;  

   // Constraints.  
   c <== a * b;  
}

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output d;  

   component gate1 = Multiplier2();
   component gate2 = Multiplier2();

   // Constraints.
   gate1.a <== a;
   gate1.b <== b;
   gate2.a <== gate1.c;
   gate2.b <== c;
   d <== gate2.c;
}

component main = Multiplier3();