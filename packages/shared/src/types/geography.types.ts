export type AreaType = 'WORLD' | 'CONTINENT' | 'REGION' | 'COUNTRY';

export interface IArea {
    _id: string; // M49 Code or ISO
    type: AreaType;
    name: string;
    parent: string | null;
    hierarchy: {
        parent: string | null;
        ancestors: string[];
    };
    data?: {
        languages?: string[];
        [key: string]: any;
    };
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateAreaDto {
    _id: string;
    type: AreaType;
    name: string;
    parent?: string;
    // We can add other fields as needed
}

export interface UpdateAreaDto {
    name?: string;
    parent?: string;
    active?: boolean;
}
