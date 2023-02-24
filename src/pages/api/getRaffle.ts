import { PrismaClient } from '@prisma/client';

import { NextApiRequest } from 'next';
import handleJsonResponse, { HandlerResult } from '../../lib/handleJsonResponse';

const handler = async (req: NextApiRequest, prisma: PrismaClient): HandlerResult => {
    const { buyer }: { buyer?: string } = req.body;

    const raffle = await prisma.raffle.findFirst({ orderBy: { id: 'desc' } });
    const ticketsSold = !raffle
        ? null
        : (await prisma.batch.aggregate({ _sum: { ticketCount: true }, where: { raffle } }))._sum?.ticketCount;

    const batch =
        !buyer || !raffle
            ? null
            : await prisma.batch.findUnique({
                  select: { ticketCount: true },
                  where: { raffleId_buyer: { raffleId: raffle.id, buyer } },
              });

    return [200, { raffle: raffle && { ...raffle, ticketsSold }, batch }];
};

export default handleJsonResponse(handler);
