import { PrismaClient } from "@prisma/client";
import handleJsonResponse, { HandlerArgs, HandlerResult } from "../../lib/handleJsonResponse";

export interface GetNftsParams {
    mints: string[];
}

const handler = async ({ req }: HandlerArgs): HandlerResult => {
    const { mints }: GetNftsParams = req.body;

    if (!mints) {
        return [400, { message: 'No mints.' }];
    }

    const prisma = new PrismaClient();

    const now = new Date();

    const currentGame = await prisma.game.findFirst({ where: { opensAt: { lte: now }, endsAt: { gt: now } } });
    if (!currentGame) {
        return [404, { message: 'No current game.' }];
    }

    const nfts = await prisma.nft.findMany({ where: { mint: { in: mints } }, include: { quests: { where: { gameId: currentGame.id } } } });

    return [200, nfts];
};

export default handleJsonResponse(handler);
