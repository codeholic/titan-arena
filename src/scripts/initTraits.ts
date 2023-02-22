import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const env = require('@next/env');

(async () => {
    await env.loadEnvConfig(process.env.PWD);

    const prisma = new PrismaClient();

    type Attribute = { trait_type: string; value: string };

    type NftData = {
        clan: string;
        image_url: string;
        mint: string;
        name: string;
        attributes: Attribute[];
    };

    const nftData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'nfts.json')).toString());

    for (const { attributes, mint } of nftData) {
        await prisma.nft.update({
            where: { mint },
            data: {
                traits: {
                    connect: (await prisma.trait.findMany({
                        select: { id: true },
                        where: {
                            OR: attributes.map(({ trait_type: name, value }: Attribute) => ({ name, value }))
                        }
                    }))
                }
            }
        })
    }
})();
