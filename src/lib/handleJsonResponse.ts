import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import superjson from 'superjson';

export type HandlerResult = Promise<[status: number, body: any]>;

const handleJsonResponse =
    (handler: (req: NextApiRequest, prisma: PrismaClient) => HandlerResult) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
        res.setHeader('Content-Type', 'application/json');

        const prisma = new PrismaClient();

        try {
            const [status, body] = await handler(req, prisma);

            return res.status(status).send(superjson.stringify(body));
        } catch (err) {
            if (err instanceof ApiError) {
                const { statusCode, message } = err as ApiError;

                res.status(statusCode).send(superjson.stringify({ message }));
            } else {
                console.log(err);
                res.status(500).send(superjson.stringify({ message: 'Internal server error.' }));
            }
        } finally {
            prisma.$disconnect();
        }
    };

export default handleJsonResponse;
