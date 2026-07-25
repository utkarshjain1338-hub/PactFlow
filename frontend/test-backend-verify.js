const { Keypair } = require('@stellar/stellar-sdk');

async function test() {
  const kp = Keypair.random();
  const email = `test-${Date.now()}@test.com`;
  
  await fetch('http://localhost:8080/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: "TestPassword123!", displayName: "Test", accountType: "FREELANCER" })
  });

  const logRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: "TestPassword123!" })
  });
  const { accessToken } = await logRes.json();

  const addRes = await fetch('http://localhost:8080/api/v1/users/me/wallets', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ stellarPublicKey: kp.publicKey(), provider: "FREIGHTER" })
  });
  const wallet = await addRes.json();

  const chalRes = await fetch('http://localhost:8080/api/v1/users/me/wallets/challenge', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletId: wallet.id })
  });
  const { nonce } = await chalRes.json();

  const signatureBytes = kp.sign(Buffer.from(nonce));
  const signatureBase64 = signatureBytes.toString("base64");

  const verRes = await fetch('http://localhost:8080/api/v1/users/me/wallets/verify', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletId: wallet.id, signature: signatureBase64 })
  });

  console.log("Verify Status:", verRes.status);
  console.log("Verify Body:", await verRes.text());
}
test().catch(console.error);
