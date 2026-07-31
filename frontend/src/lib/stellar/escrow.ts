import { Contract, nativeToScVal } from '@stellar/stellar-sdk';
import { requestAccess } from '@stellar/freighter-api';

const CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || '';

/**
 * Escrow Contract Integration
 * This module matches the Soroban Smart Contract's 6 core functions:
 * 1. initialize
 * 2. deposit
 * 3. approveMilestone
 * 4. getEscrow
 * 5. refund
 * 6. cancel
 */

export class EscrowService {
  private contract: Contract;

  constructor(contractId: string = CONTRACT_ID) {
    if (!contractId) {
      console.warn("EscrowService initialized without a contract ID.");
    }
    this.contract = new Contract(contractId);
  }

  private async invokeContract(
    method: string,
    args: any[],
    userAddress: string
  ) {
    console.log(`Invoking ${method} on contract ${this.contract.contractId()} with args`, args);
    await requestAccess();
    return true;
  }

  /**
   * 1. initialize
   */
  public async initialize(
    escrowId: string,
    clientAddress: string,
    freelancerAddress: string,
    tokenAddress: string,
    amount: number,
    milestonesTotal: number
  ) {
    const args = [
      nativeToScVal(escrowId, { type: 'string' }),
      nativeToScVal(clientAddress, { type: 'address' }),
      nativeToScVal(freelancerAddress, { type: 'address' }),
      nativeToScVal(tokenAddress, { type: 'address' }),
      nativeToScVal(amount, { type: 'i128' }),
      nativeToScVal(milestonesTotal, { type: 'u32' }),
    ];
    return this.invokeContract('initialize', args, clientAddress);
  }

  /**
   * 2. deposit
   */
  public async deposit(escrowId: string, clientAddress: string) {
    const args = [nativeToScVal(escrowId, { type: 'string' })];
    return this.invokeContract('deposit', args, clientAddress);
  }

  /**
   * 3. approveMilestone
   */
  public async approveMilestone(escrowId: string, milestoneIndex: number, clientAddress: string) {
    const args = [
      nativeToScVal(escrowId, { type: 'string' }),
      nativeToScVal(milestoneIndex, { type: 'u32' }),
    ];
    return this.invokeContract('approveMilestone', args, clientAddress);
  }

  /**
   * 4. getEscrow
   */
  public async getEscrow(escrowId: string) {
    const args = [nativeToScVal(escrowId, { type: 'string' })];
    console.log(`Simulating getEscrow for ${escrowId} with args`, args);
    return null;
  }

  /**
   * 5. refund
   */
  public async refund(escrowId: string, clientAddress: string) {
    const args = [nativeToScVal(escrowId, { type: 'string' })];
    return this.invokeContract('refund', args, clientAddress);
  }

  /**
   * 6. cancel
   */
  public async cancel(escrowId: string, clientAddress: string) {
    const args = [nativeToScVal(escrowId, { type: 'string' })];
    return this.invokeContract('cancel', args, clientAddress);
  }
}

export const escrowService = new EscrowService();
