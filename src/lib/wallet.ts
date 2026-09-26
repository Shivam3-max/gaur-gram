import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = Prisma.TransactionClient | PrismaClient;

/** Moves money in or out of a customer's wallet and records the ledger line. */
export async function walletEntry(tx: Tx, userId: string, amount: number, kind: string, note: string) {
  const user = await tx.user.update({ where: { id: userId }, data: { wallet: { increment: amount } } });
  await tx.walletTxn.create({ data: { userId, amount, kind, note, balance: user.wallet } });
  return user.wallet;
}
