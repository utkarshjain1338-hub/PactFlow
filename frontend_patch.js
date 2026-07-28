const fs = require('fs');
const file = 'frontend/src/app/projects/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace createEscrowMutation with initializeEscrowMutation
content = content.replace(
  /const createEscrowMutation = useMutation\(\{\n    mutationFn: async \(milestoneId: string\) => \{\n      \/\/ Step 1: Create the escrow record in the DB\n      const escrow = await apiClient\.post\(`\/escrows\?projectId=\$\{id\}&milestoneId=\$\{milestoneId\}`\) as any;\n\n      \/\/ Step 2: Build the initialize\(\) Soroban transaction XDR\n      const unsignedTx = await apiClient\.post\(`\/escrows\/\$\{escrow\.id\}\/initialization-transaction`\) as any;/g,
  `const initializeEscrowMutation = useMutation({
    mutationFn: async ({ milestoneId, existingEscrowId }: { milestoneId: string, existingEscrowId?: string }) => {
      let escrowId = existingEscrowId;
      if (!escrowId) {
        // Step 1: Create the escrow record in the DB
        const escrow = await apiClient.post(\`/escrows?projectId=\${id}&milestoneId=\${milestoneId}\`) as any;
        escrowId = escrow.id;
      }

      // Step 2: Build the initialize() Soroban transaction XDR
      const unsignedTx = await apiClient.post(\`/escrows/\${escrowId}/initialization-transaction\`) as any;`
);

content = content.replace(
  /escrowId: escrow\.id/g,
  'escrowId: typeof escrowId !== "undefined" ? escrowId : escrow.id'
);

// We need to specifically replace the broadcast part because `escrow.id` is not defined in the new function body
content = content.replace(
  /escrowId: typeof escrowId !== "undefined" \? escrowId : escrow.id,\n        signedXdr,\n        operation: "INITIALIZE"\n      \}\);/g,
  `escrowId: escrowId,
        signedXdr,
        operation: "INITIALIZE"
      });`
);

// Update UI logic
content = content.replace(
  /!\isEscrowCreated \? \(\n                          isClientUser && project.isEscrowReady \? \(\n                            <Button \n                              size="sm" \n                              onClick=\{\(\) => createEscrowMutation\.mutate\(milestone\.id\)\}\n                              disabled=\{createEscrowMutation\.isPending\}\n                            >\n                              Initialize Escrow\n                            <\/Button>\n                          \) : \(\n                            <Badge variant="secondary">Pending Escrow<\/Badge>\n                          \)\n                        \) : isFunded \? \(/g,
  `!isEscrowCreated || escrow?.status === "CREATED" ? (
                          isClientUser && project.isEscrowReady ? (
                            <Button 
                              size="sm" 
                              onClick={() => initializeEscrowMutation.mutate({ milestoneId: milestone.id, existingEscrowId: escrow?.id })}
                              disabled={initializeEscrowMutation.isPending}
                            >
                              {escrow?.status === "CREATED" ? "Retry Initialize" : "Initialize Escrow"}
                            </Button>
                          ) : (
                            <Badge variant="secondary">Pending Escrow</Badge>
                          )
                        ) : isFunded ? (`
);

fs.writeFileSync(file, content);
