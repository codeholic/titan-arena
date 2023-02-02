import fs from 'fs';
import path from 'path';
import { Clan, Nft, PrismaClient } from '@prisma/client';

const env = require('@next/env');

(async () => {
    await env.loadEnvConfig(process.env.PWD);

    const prisma = new PrismaClient();

    type NftData = {
        clan: string;
        image_url: string;
        mint: string;
        name: string;
        attributes: { trait_type: string; value: string }[];
    };

    const nftData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'nfts.json')).toString()).reduce(
        (result: Record<string, NftData[]>, data: NftData) => {
            const clanNfts = result[data.clan] || [];

            return { ...result, [data.clan]: [data, ...clanNfts] };
        },
        {}
    );

    await Promise.all(
        ['Medusa', 'Seamonster', 'Zeus', 'Hades'].map((name, position) =>
            prisma.clan.create({
                data: {
                    name,
                    position,
                    nfts: {
                        create: nftData[name].map(({ image_url: imageUrl, mint, name, attributes }: NftData) => ({
                            imageUrl,
                            mint,
                            name,
                            traits: { create: attributes.map(({ trait_type: name, value }) => ({ name, value })) },
                        })),
                    },
                },
            })
        )
    );
})();
