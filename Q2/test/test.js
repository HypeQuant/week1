const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // Creates proof with sample inputs
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        console.log('1x2 =',publicSignals[0]); // log equation output

        const editedPublicSignals = unstringifyBigInts(publicSignals); // turns into big ints
        const editedProof = unstringifyBigInts(proof); // turns into big ints
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals); // grab solidity contract data based on proof and signals
        
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // parse args from data, cast into bigint and then string
    
        const a = [argv[0], argv[1]]; // setup a
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // setup b
        const c = [argv[6], argv[7]]; // setup c
        const Input = argv.slice(8); // setup number of inputs

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // verify proof results are true
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

        console.log('1x2x3 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals); // turns into big ints
        const editedProof = unstringifyBigInts(proof); // turns into big ints
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals); // grab solidity contract data based on proof and signals
        
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // parse args from data, cast into bigint and then string
        // console.log(argv)
        const a = [argv[0], argv[1]]; // setup a
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // setup b
        const c = [argv[6], argv[7]]; // setup c
        const Input = argv.slice(8); // setup number of inputs

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // verify proof results are true
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;
    
    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/_plonkMultiplier3/circuit_final.zkey");

        console.log('1x2x3 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals); // turns into big ints
        const editedProof = unstringifyBigInts(proof); // turns into big ints
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals); // grab solidity contract data based on proof and signals
        
        const argv = calldata.replace(/["[\]\s]/g, "").split(',');
        
        const a = argv[0];
        const Input = [BigInt(argv.slice(1)).toString()];

        expect(await verifier.verifyProof(a, Input)).to.be.true; // verify proof results are true
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = 0;
        let b = [0];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});