import { CardMedia, Skeleton } from '@mui/material';
import { FC, forwardRef, useEffect, useState } from 'react';

import { Nft } from '../hooks/useNfts';

export type NftCardProps = {
    name: string;
    setValue: Function;
    nft: Nft;
    defaultChecked: boolean;
};

const NftCard = forwardRef<HTMLInputElement, NftCardProps>(({ name, setValue, nft, defaultChecked }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const image = new Image();

        image.src = nft.image_url;
        image.onload = () => setIsLoading(false);
    });

    useEffect(() => setValue(name, checked), [name, checked, setValue]);

    useEffect(() => setChecked(defaultChecked), [defaultChecked]);

    return !isLoading ? (
        <>
            <input
                ref={ref}
                style={{ display: 'none' }}
                type="checkbox"
                name={name}
                value="true"
                checked={checked}
                readOnly={true}
            />
            <CardMedia
                image={nft.image_url}
                sx={{
                    borderRadius: '5px',
                    aspectRatio: '1/1',
                    cursor: 'pointer',
                    ...(checked ? { border: '5px solid #F7FAFC', margin: '-5px' } : {}),
                }}
                onClick={() => setChecked(!checked)}
            />
        </>
    ) : (
        <Skeleton variant="rounded" sx={{ paddingTop: '100%' }} />
    );
});

NftCard.displayName = 'NftCard';

export default NftCard;
