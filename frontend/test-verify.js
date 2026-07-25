const { Keypair } = require('@stellar/stellar-sdk');

const kp = Keypair.random();
try {
  kp.verify(Buffer.from("test"), Buffer.alloc(96));
  console.log("Returned boolean");
} catch (e) {
  console.log("Threw:", e.message);
}
