import { Box, CardMedia, CardMediaProps, Skeleton, styled, useTheme } from '@mui/material';
import { Nft, Quest } from '@prisma/client';
import { forwardRef, useEffect, useMemo, useState } from 'react';

export type NftCardProps = {
    name: string;
    setValue: Function;
    nft: Nft & { quests: Quest[] };
    defaultChecked: boolean;
    isSubmitting: boolean;
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

interface NftCardContentProps {
    quest?: Quest;
}

const NftCardContent = ({ quest }: NftCardContentProps) => (
    <>
        {quest?.startedAt && (
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '20px',
                }}
            >
                Questing
            </Box>
        )}

        {
        /*quest?.points && (
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    margin: 1,
                    px: 1,
                    borderRadius: 1,
                    backgroundColor: quest?.startedAt ? 'rgba(56, 161, 105, 0.7)' : 'rgba(49, 130, 206, 0.7)',
                }}
            >
                {!quest?.startedAt && '+'}
                {quest.points}
            </Box>
            )*/
        }
    </>
);

const NftCard = forwardRef<HTMLInputElement, NftCardProps>(
    ({ name, setValue, nft, defaultChecked, isSubmitting }, ref) => {
        const [isLoading, setIsLoading] = useState(true);
        const [checked, setChecked] = useState(false);
        const theme = useTheme();

        useEffect(() => {
            const image = new Image();

            image.src = nft.imageUrl;
            image.onload = () => setIsLoading(false);
        });

        const isQuesting = useMemo(() => !!nft.quests[0].startedAt, [nft]);

        useEffect(() => setValue(name, checked && !isQuesting), [name, checked, setValue, isQuesting]);

        useEffect(() => setChecked(defaultChecked), [defaultChecked]);

        const isDisabled = useMemo(() => isSubmitting || isQuesting, [isSubmitting, isQuesting]);

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
                    image={nft.imageUrl}
                    checked={checked}
                    isDisabled={isDisabled}
                    onClick={() => {
                        if (!isDisabled) {
                            setChecked(!checked);
                        }
                    }}
                >
                    <NftCardContent quest={nft.quests[0]} />
                </NftCardMedia>
            </>
        ) : (
            <Box position="relative" sx={{ fontFamily: theme.typography.button.fontFamily }}>
                <NftCardContent quest={nft.quests[0]} />

                <Skeleton
                    variant="rounded"
                    sx={{
                        paddingTop: '100%',
                        ...(checked ? { border: '5px solid #F7FAFC', margin: '-5px' } : {}),
                        ...(!!nft.quests[0] && !isQuesting ? { cursor: 'pointer' } : { cursor: 'not-allowed' }),
                    }}
                    onClick={() => {
                        if (!isDisabled) {
                            setChecked(!checked);
                        }
                    }}
                />
            </Box>
        );
    }
);

NftCard.displayName = 'NftCard';

export default NftCard;
