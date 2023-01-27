import type { NextApiRequest, NextApiResponse } from 'next';

import { getCurrentGame } from '../../lib/queries';
import { Game } from '../../lib/types';

export type GetCurrentGameResult = {
    currentGame: Game;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetCurrentGameResult | Error>) {
    const { data: currentGame } = await getCurrentGame();

    res.status(200).json({ currentGame });
}
