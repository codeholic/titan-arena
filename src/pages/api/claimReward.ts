import { sha512 } from '@noble/hashes/sha512';
import { PrismaClient } from '@prisma/client';
import { Connection, Keypair, Message, PublicKey, Transaction } from '@solana/web3.js';
import { NextApiRequest } from 'next';
import handleJsonResponse, { HandlerResult } from '../../lib/handleJsonResponse';
import { getOwnedTokenMints, sign } from '../../lib/utils';

interface ClaimRewardParams {
    checksum: string;
    claimedAt: Date;
    mints: string[];
    signature: string;
    transactionMessage: string;
}

const handler = async (req: NextApiRequest): HandlerResult => {
    const params: ClaimRewardParams = req.body;
    const { claimedAt, mints, transactionMessage } = params;

    const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;

    const checksum = Buffer.from(
        sha512(
            JSON.stringify({
                transactionMessage,
                claimedAt,
                mints,
                salt,
            })
        )
    ).toString('base64');

    if (checksum !== params.checksum) {
        return [400, { message: 'Wrong checksum.' }];
    }

    const solanaTx = Transaction.populate(Message.from(Buffer.from(transactionMessage, 'base64')), []);

    if (!solanaTx.feePayer) {
        return [400, { message: 'Invalid transaction.' }];
    }

    const owner: PublicKey = solanaTx.feePayer!;

    const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);

    const ownedTokenMints = new Set(await getOwnedTokenMints({ connection, owner }));

    if (mints.some((mint) => !ownedTokenMints.has(mint))) {
        return [400, { message: 'Unauthorized user.' }];
    }

    const prisma = new PrismaClient();

    const lockedMints: Set<string> = new Set();

    const games = await prisma.game.findMany({ where: { endsAt: { lte: claimedAt } } });

    const result: HandlerResult = prisma
        .$transaction(async (tx) => {
            const nfts = await tx.nft.findMany({
                where: { mint: { in: mints } },
                include: { quests: { where: { gameId: { in: games.map(({ id }) => id) } } } },
            });

            if (nfts.length != mints.length) {
                return Promise.reject([400, { message: 'Unknown mints.' }]);
            }

            nfts.forEach(({ mint, quests }) => {
                if (quests.some(({ rewardClaimedAt }) => !rewardClaimedAt)) {
                    lockedMints.add(mint);
                }
            });

            if (nfts.some(({ lockedAt, mint }) => lockedMints.has(mint) && lockedAt)) {
                return Promise.reject([400, { message: 'Another transaction is running.' }]);
            }

            tx.nft.updateMany({
                where: {
                    mint: {
                        in: [...lockedMints],
                    },
                },
                data: { lockedAt: new Date() },
            });
        })
        .then(async () => {
            const authority = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!)));

            solanaTx.addSignature(owner, Buffer.from(params.signature, 'base64'));
            solanaTx.addSignature(
                authority.publicKey,
                Buffer.from(sign(Buffer.from(transactionMessage, 'base64'), authority.secretKey))
            );

            const signature = await connection.sendRawTransaction(solanaTx.serialize());
            const latestBlockhash = await connection.getLatestBlockhash();

            return connection.confirmTransaction({ signature, ...latestBlockhash }).then(({ value: { err } }) =>
                err
                    ? Promise.reject([500, { message: 'Transaction error.' }])
                    : prisma
                          .$transaction(
                              [...lockedMints].map((mint) =>
                                  prisma.nft.update({
                                      where: { mint },
                                      data: {
                                          quests: {
                                              updateMany: {
                                                  where: { gameId: { in: games.map(({ id }) => id) } },
                                                  data: { rewardClaimedAt: claimedAt },
                                              },
                                          },
                                      },
                                  })
                              )
                          )
                          .then(() => [200, {}])
            );
        });

    return result.finally(() => prisma.nft.updateMany({ where: { mint: { in: mints } }, data: { lockedAt: null } }));
};

export default handleJsonResponse(handler);
