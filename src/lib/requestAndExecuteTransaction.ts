import { WalletContextState } from '@solana/wallet-adapter-react';
import { Message, Transaction } from '@solana/web3.js';
import superjson from 'superjson';
import { ExecuteTransactionParams, RequestTransactionParams, RequestTransactionResult } from './types';

interface RequestAndExecuteTransactionArgs<TPayload> {
    requestEndpoint: string;
    executeEndpoint: string;
    wallet: WalletContextState;
    payload: TPayload;
}

const requestAndExecuteTransaction = async <TPayload>({
    wallet,
    requestEndpoint,
    executeEndpoint,
    payload,
}: RequestAndExecuteTransactionArgs<TPayload>): Promise<void> => {
    if (!wallet.publicKey) {
        return Promise.resolve();
    }

    const data = await fetch(requestEndpoint, {
        method: 'POST',
        body: JSON.stringify({
            signer: wallet.publicKey.toBase58(),
            payload,
        } as RequestTransactionParams<TPayload>),
        headers: { 'Content-Type': 'application/json' },
    });

    return await data
        .text()
        .then(superjson.parse)
        .catch(() => Promise.reject({ message: 'Internal server error.' }))
        .then(async (result) => {
            if (!data.ok) {
                return Promise.reject(result);
            }

            const { transactionMessage, checksum, timestamp } = result as RequestTransactionResult;

            const transaction = Transaction.populate(Message.from(Buffer.from(transactionMessage, 'base64')), []);

            const { signature } = await wallet.signTransaction!(transaction);

            return await (!signature
                ? Promise.reject('No signature.')
                : fetch(executeEndpoint, {
                      method: 'POST',
                      body: JSON.stringify({
                          payload,
                          transactionMessage,
                          checksum,
                          signature: signature.toString('base64'),
                          timestamp,
                      } as ExecuteTransactionParams<TPayload>),
                      headers: { 'Content-Type': 'application/json' },
                  }).then((data) =>
                      data
                          .text()
                          .then(superjson.parse)
                          .catch(() => Promise.reject({ message: 'Internal server error.' }))
                          .then((result) => {
                              if (!data.ok) {
                                  return Promise.reject(result);
                              }
                          })
                  ));
        });
};

export default requestAndExecuteTransaction;
