import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const filename = path.join(process.cwd(), 'data', 'nfts.json');

    await fs.readFile(filename, 'utf8').then((data) => {
        const nfts = JSON.parse(data);

        res.status(200).json(nfts.map(({ mint, image_url, race }: any) => ({ mint, image_url, race })));
    });
}
