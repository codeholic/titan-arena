import { NextApiRequest, NextApiResponse } from 'next';
import superjson from 'superjson';

export type HandlerResult = Promise<[status: number, body: any]>;

const handleJsonResponse =
    (handler: (req: NextApiRequest) => HandlerResult) => async (req: NextApiRequest, res: NextApiResponse) => {
        res.setHeader('Content-Type', 'application/json');

        try {
            const [status, body] = await handler(req);

            return res.status(status).send(superjson.stringify(body));
        } catch (err) {
            console.log(err);
            res.status(500).send(superjson.stringify({ message: 'Internal server error.' }));
        }
    };

export default handleJsonResponse;
