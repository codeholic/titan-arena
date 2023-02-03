import { Connection, PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Clan, Game } from '@prisma/client';

export const BASE_POINTS = 100;

export const calculateReward = (game: Game, clan: Clan) => {
    const now = Date.now();
    const durationMultiplier =
        game.startsAt.valueOf() > now
            ? 1
            : (game.endsAt.valueOf() - now) / (game.endsAt.valueOf() - game.startsAt.valueOf());

    return Math.ceil(BASE_POINTS * clan.multiplier * durationMultiplier);
};

export const findAssociatedAddress = ({ mint, owner }: { mint: PublicKey; owner: PublicKey }): PublicKey => {
    const [address] = PublicKey.findProgramAddressSync(
        [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    return address;
};

interface GetOwnedTokenMintsProps {
    connection: Connection;
    owner: PublicKey;
}

export const getOwnedTokenMints = ({ connection, owner }: GetOwnedTokenMintsProps): Promise<string[]> =>
    connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }).then(({ value }) =>
        value.reduce((result: string[], data) => {
            const {
                mint,
                tokenAmount: { amount },
            } = data.account.data.parsed.info;

            return amount === '0' ? result : [mint, ...result];
        }, [])
    );
