import { StringValue } from "src/auth/interfaces/jwt.interface";

export const convertExpireTime = (expire: StringValue): number => {
  const match = expire.match(/^(\d+)(ms|s|m|h|d|w)$/);

  if (!match) {
    throw new Error(`Invalid expire format: ${expire}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2] as 'ms' | 's' | 'm' | 'h' | 'd' | 'w';

  const multipliers: Record<typeof unit, number> = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
  };

  return value * multipliers[unit];
};

