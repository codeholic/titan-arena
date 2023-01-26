export type Trait = {
    trait_name: string;
    value: string;
};

export type Nft = {
    mint: string;
    name: string;
    image_url: string;
    attributes?: Trait[];
    race: string;
    rank?: number;
};
