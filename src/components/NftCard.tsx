import { Box, CardMedia, CardMediaProps, Skeleton, styled } from '@mui/material';
import { forwardRef, useEffect, useMemo, useState } from 'react';

import { Nft, Quest } from '../lib/types';

export type NftCardProps = {
    name: string;
    setValue: Function;
    nft: Nft;
    defaultChecked: boolean;
    isSubmitting: boolean;
    quest?: Quest;
};

interface NftCardMediaProps extends CardMediaProps {
    checked: boolean;
    isDisabled: boolean;
}

const NftCardMedia = styled(CardMedia, {
    shouldForwardProp: (prop) => !['checked', 'isDisabled'].includes(prop.toString()),
})<NftCardMediaProps>(({ checked, isDisabled, theme }) => ({
    borderRadius: '5px',
    aspectRatio: '1/1',
    position: 'relative',
    color: '#F7FAFC',
    fontFamily: theme.typography.button.fontFamily,
    fontSize: '20px',
    textTransform: 'uppercase',
    ...(checked ? { border: '5px solid #F7FAFC', margin: '-5px' } : {}),
    ...(isDisabled
        ? {
              cursor: 'not-allowed',
              '&:before': {
                  content: '""',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
              },
          }
        : { cursor: 'pointer' }),
}));

const NftCard = forwardRef<HTMLInputElement, NftCardProps>(
    ({ name, setValue, nft, defaultChecked, isSubmitting, quest }, ref) => {
        const [isLoading, setIsLoading] = useState(true);
        const [checked, setChecked] = useState(false);

        useEffect(() => {
            const image = new Image();

            image.src = nft.image_url;
            image.onload = () => setIsLoading(false);
        });

        useEffect(() => setValue(name, checked), [name, checked, setValue]);

        useEffect(() => setChecked(defaultChecked), [defaultChecked]);

        const isDisabled = useMemo(() => isSubmitting || !quest || !!quest.startedAt, [isSubmitting, quest]);

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
                <NftCardMedia
                    image={nft.image_url}
                    checked={checked}
                    isDisabled={isDisabled}
                    onClick={() => {
                        if (!isDisabled) {
                            setChecked(!checked);
                        }
                    }}
                >
                    {quest?.startedAt && (
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            Questing
                        </Box>
                    )}
                </NftCardMedia>
            </>
        ) : (
            <Skeleton variant="rounded" sx={{ paddingTop: '100%' }} />
        );
    }
);

NftCard.displayName = 'NftCard';

export default NftCard;
