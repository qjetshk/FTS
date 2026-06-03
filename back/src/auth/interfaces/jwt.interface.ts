export interface JwtPayload {
  id: string
  jti?: string
}

export type StringValue = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w'}` 