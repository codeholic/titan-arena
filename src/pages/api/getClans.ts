import type { NextApiRequest, NextApiResponse } from 'next';

import { getClans } from '../../lib/queries';
import { Clan, Error } from '../../lib/types';

type GetClansResult = {
    clans: Clan[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetClansResult | Error>) {
    const clans: Clan[] = await getClans();

    res.status(200).json({ clans });
}
