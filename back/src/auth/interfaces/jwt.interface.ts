export interface JwtPayload{
    id: string
}

export type StringValue = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w'}` 