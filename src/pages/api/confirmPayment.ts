import type { NextApiRequest, NextApiResponse } from 'next';

type ConfirmPaymentParams = {
    mints: string[];
    transactionMessage: string;
    checksum: string;
    signature: string;
};

export type ConfirmPaymentResult = {};

export type ConfirmPaymentError = {
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ConfirmPaymentResult | ConfirmPaymentError>
) {
    const params: ConfirmPaymentParams = req.body;

    console.log(params);

    res.status(200).json({});
}
