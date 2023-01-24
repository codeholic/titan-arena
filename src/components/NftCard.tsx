import { CardMedia, Skeleton } from '@mui/material';
import { FC, useEffect, useState } from 'react';

import { Nft } from '../hooks/useNfts';

export type NftCardProps = {
    nft: Nft;
};

export const NftCard: FC<NftCardProps> = ({ nft }: NftCardProps) => {
    if (!nft) {
        return null;
    }

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const image = new Image();

        image.src = nft.image_url;
        image.onload = () => setIsLoading(false);
    });

    return !isLoading ? (
        <CardMedia component="img" image={nft.image_url} sx={{ borderRadius: '5px' }} />
    ) : (
        <Skeleton variant="rounded" sx={{ paddingTop: '100%' }} />
    );
};
