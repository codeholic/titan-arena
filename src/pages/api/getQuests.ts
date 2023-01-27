import type { NextApiRequest, NextApiResponse } from 'next';

import { calculateReward, getClans, getCurrentGame, getNfts, getQuests } from '../../lib/queries';
import { Clan, Error, Nft, Quest } from '../../lib/types';

type GetQuestsParams = {
    mints: string[];
};

type GetQuestsResult = {
    quests: Quest[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetQuestsResult | Error>) {
    const { mints }: GetQuestsParams = req.body;

    const { ref: currentGameRef, data: currentGame } = await getCurrentGame();
    const quests = await getQuests(currentGameRef, mints);
    const nfts: Record<string, Nft> = (await getNfts()).reduce((result, nft) => ({ [nft.mint]: nft, ...result }), {});
    const clanMap: Record<string, Clan> = (await getClans()).reduce(
        (result, clan) => ({ [clan.name]: clan, ...result }),
        {}
    );

    res.status(200).json({
        quests: mints.map((mint) => {
            if (quests[mint]) {
                const { points, startedAt } = quests[mint];

                return { mint, points, startedAt };
            }

            return { mint, points: calculateReward(currentGame, clanMap[nfts[mint].clan]) };
        }),
    });
}
