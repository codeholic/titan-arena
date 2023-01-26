import type { NextApiRequest, NextApiResponse } from 'next';

import { getNfts } from '../../lib/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const nfts = await getNfts();

    res.status(200).json(nfts.map(({ mint, image_url, race }: any) => ({ mint, image_url, race })));
}
