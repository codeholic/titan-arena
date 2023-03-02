import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { addSeconds } from 'date-fns';
import { ExecuteTransactionHandler } from '../lib/types';

const env = require('@next/env');

const CONFIRMATION_TIMEOUT = 300; // seconds

type Handler = 'claimQuest';

const handlers: Record<Handler, { execute: ExecuteTransactionHandler<any>; unlock: ExecuteTransactionHandler<any> }> = {
    claimQuest: require('../jobs/claimQuest'),
};

(async () => {
    await env.loadEnvConfig(process.env.PWD!, undefined, { info: () => {}, error: () => {} });

    const prisma = new PrismaClient();
    const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);

    const jobs = await prisma.job.findMany({ where: { isProcessed: false } });

    for (const job of jobs) {
        const payload = JSON.parse(job.payload);
        const signer = new PublicKey(job.signer);
        const timestamp = job.timestamp.valueOf();

        const { execute, unlock } = handlers[job.handler as Handler];

        const solanaTx = await connection.getTransaction(job.signature, {
            commitment: 'finalized',
            maxSupportedTransactionVersion: 1,
        });

        if (!solanaTx && new Date() < addSeconds(job.timestamp, CONFIRMATION_TIMEOUT)) {
            continue;
        }

        await prisma.$transaction(async (tx) => {
            if (!!solanaTx) {
                await execute({ connection, payload, prisma: tx, signer, timestamp });
            }

            await unlock({ connection, payload, prisma: tx, signer, timestamp });

            await tx.job.update({ where: { signature: job.signature }, data: { isProcessed: true } });
        });
    }
})();
