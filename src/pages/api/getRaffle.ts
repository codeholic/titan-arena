import { PrismaClient } from '@prisma/client';

import { NextApiRequest } from 'next';
import handleJsonResponse, { HandlerResult } from '../../lib/handleJsonResponse';

const handler = async (req: NextApiRequest, prisma: PrismaClient): HandlerResult => {
    const { buyer }: { buyer?: string } = req.query;

    const raffle = await prisma.raffle.findFirst({ orderBy: { id: 'desc' } });

    const batch =
        !buyer || !raffle
            ? null
            : await prisma.batch.findUnique({
                  select: { ticketCount: true },
                  where: { raffleId_buyer: { raffleId: raffle.id, buyer } },
              });

    return [200, { raffle, batch }];
};

export default handleJsonResponse(handler);
