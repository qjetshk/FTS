-- refresh-токены хранятся как sha256-хэш (hex); уже выданные хэшируем, чтобы активные сессии не разлогинились
UPDATE "refresh_tokens" SET "token" = encode(sha256(convert_to("token", 'UTF8')), 'hex')
WHERE length("token") <> 64 OR "token" !~ '^[0-9a-f]{64}$';
