const { Keypair } = require('@stellar/stellar-sdk');

const kp = Keypair.random();
const message = "challenge123";
const signature = kp.sign(Buffer.from(message));

console.log("Raw Signature type:", typeof signature);
console.log("Is Buffer:", Buffer.isBuffer(signature));
console.log("Is Uint8Array:", signature instanceof Uint8Array);

const b64 = signature.toString("base64");
console.log("Base64 directly:", b64);

const bytes = new Uint8Array(Object.values(signature));
const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
const b64Manual = btoa(binString);

console.log("Base64 manually:", b64Manual);
console.log("Match?", b64 === b64Manual);
