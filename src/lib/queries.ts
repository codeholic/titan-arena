import { promises as fs } from 'fs';
import { getFirestore, Transaction, DocumentReference } from 'firebase-admin/firestore';
import path from 'path';

import { Nft } from './types';
import { chunks } from './utils';

export const getCurrentGame = async (transaction: Transaction | undefined = undefined) => {
    const db = getFirestore();

    const now = new Date();
    const query = db.collection('games').where('endsAt', '>', now);
    const querySnapshot = await (transaction ? transaction.get(query) : query.get());

    let doc, data;

    if (!querySnapshot.empty) {
        [doc] = querySnapshot.docs;
        data = doc.data();
    }

    if (!doc || !data || data.opensAt > now) {
        return Promise.reject({ message: 'No current game.' });
    }

    return { ref: doc.ref, data };
};

export const getNfts = async (): Promise<Nft[]> => {
    const filename = path.join(process.cwd(), 'data', 'nfts.json');

    const data = await fs.readFile(filename, 'utf8');

    return JSON.parse(data);
};

export const getQuests = async (
    gameRef: DocumentReference,
    mints: string[],
    transaction: Transaction | undefined = undefined
) => {
    const db = getFirestore();

    return (
        await Promise.all(
            chunks(mints, 10).map(async (chunk) => {
                const query = db.collection('quests').where('game', '==', gameRef).where('mint', 'in', chunk);
                const querySnapshot = await (transaction ? transaction.get(query) : query.get());

                return querySnapshot.docs.map((doc) => doc.data());
            })
        )
    ).reduce(
        (result, chunk) => ({ ...chunk.reduce((result, data) => ({ [data.mint]: data, ...result }), {}), ...result }),
        {}
    );
};
