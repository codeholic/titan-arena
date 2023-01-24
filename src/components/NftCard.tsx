import { CardMedia, Skeleton } from '@mui/material';
import { FC, useEffect, useState } from 'react';

import { Nft } from '../hooks/useNfts';

export type NftCardProps = {
    nft?: Nft;
};

export const NftCard: FC<NftCardProps> = ({ nft }: NftCardProps) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!nft) {
            return;
        }

        const image = new Image();

        image.src = nft.image_url;
        image.onload = () => setIsLoading(false);
    });

    return nft && !isLoading ? (
        <CardMedia component="img" image={nft.image_url} sx={{ borderRadius: '5px' }} />
    ) : (
        <Skeleton variant="rounded" sx={{ paddingTop: '100%' }} />
    );
};
