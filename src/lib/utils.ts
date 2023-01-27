import { Connection, PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const findAssociatedAddress = ({ mint, owner }: { mint: PublicKey; owner: PublicKey }): PublicKey => {
    const [address] = PublicKey.findProgramAddressSync(
        [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    return address;
};

export function chunks(array: any, size: number) {
    return Array.apply(0, new Array(Math.ceil(array.length / size))).map((_, index) =>
        array.slice(index * size, (index + 1) * size)
    );
}

interface GetOwnedTokenMintsProps {
    connection: Connection;
    owner: PublicKey;
}

export const getOwnedTokenMints = ({ connection, owner }: GetOwnedTokenMintsProps): Promise<Record<string, boolean>> =>
    connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }).then(({ value }) =>
        value.reduce((result, data) => {
            const {
                mint,
                tokenAmount: { amount },
            } = data.account.data.parsed.info;

            return amount !== '0' ? { [mint]: true, ...result } : result;
        }, {})
    );
