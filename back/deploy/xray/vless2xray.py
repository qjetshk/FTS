#!/usr/bin/env python3
# Подписка (https://...) или vless:// ссылка → конфиг xray-клиента с HTTP-прокси на :10809
# Нужен на прод-сервере в РФ: api.telegram.org оттуда недоступен, бот ходит через TELEGRAM_PROXY=http://xray:10809
# python3 vless2xray.py 'https://sub...'                — список серверов, берёт первый
# python3 vless2xray.py 'https://sub...' 'Нидерланды'   — сервер, в названии которого есть это слово
import base64, json, sys, urllib.request
from urllib.parse import urlparse, parse_qs, unquote


# панели подписок отдают настоящие серверы только «своим» клиентам, остальным — заглушку → перебираем
USER_AGENTS = ["Happ/3.4.0", "INCY/1.0", "v2rayN/7.0"]
STUB = ("не поддерж", "not supported")
# Happ шлёт ID устройства — без него панель с лимитом устройств может отдать заглушку; постоянный, чтобы не плодить устройства
HWID = {"x-hwid": "fts-prod-server-xray", "x-device-os": "Linux", "x-device-model": "server"}


def fetch_once(src, ua, extra):
    req = urllib.request.Request(src, headers={"User-Agent": ua, **extra})
    body = urllib.request.urlopen(req, timeout=15).read().decode(errors="ignore").strip()
    if "vless://" not in body:
        try:
            body = base64.urlsafe_b64decode(body.replace("+", "-").replace("/", "_") + "===").decode(errors="ignore")
        except Exception:
            return []
    return [l.strip() for l in body.splitlines() if l.strip().startswith("vless://")]


def fetch_links(src):
    if src.startswith("vless://"):
        return [src]
    for extra in ({}, HWID):
        for ua in USER_AGENTS:
            label = ua + (" + HWID" if extra else "")
            try:
                links = fetch_once(src, ua, extra)
            except Exception as e:
                print(f"  {label}: ошибка {e}", file=sys.stderr)
                continue
            names = [unquote(urlparse(l).fragment).lower() for l in links]
            if links and not all(any(s in n for s in STUB) for n in names):
                print(f"Подписка отдана как {label}", file=sys.stderr)
                return links
            print(f"  {label}: заглушка или пусто", file=sys.stderr)
    sys.exit("Ни одному клиенту подписка не отдала серверы — скопируй сервер в Happ или нужен свой VPS")


def build(link):
    u = urlparse(link)
    q = {k: v[0] for k, v in parse_qs(u.query).items()}
    net, sec = q.get("type", "tcp"), q.get("security", "none")
    user = {"id": unquote(u.username), "encryption": "none"}
    if q.get("flow"):
        user["flow"] = q["flow"]
    stream = {"network": net, "security": sec}
    if sec == "reality":
        stream["realitySettings"] = {"serverName": q.get("sni", ""), "publicKey": q["pbk"], "shortId": q.get("sid", ""),
                                     "fingerprint": q.get("fp", "chrome"), "spiderX": unquote(q.get("spx", ""))}
    elif sec == "tls":
        stream["tlsSettings"] = {"serverName": q.get("sni", u.hostname), "fingerprint": q.get("fp", "chrome")}
        if q.get("alpn"):
            stream["tlsSettings"]["alpn"] = unquote(q["alpn"]).split(",")
    if net == "ws":
        stream["wsSettings"] = {"path": unquote(q.get("path", "/")), "host": q.get("host", "")}
    elif net == "grpc":
        stream["grpcSettings"] = {"serviceName": unquote(q.get("serviceName", ""))}
    elif net == "xhttp":
        stream["xhttpSettings"] = {"path": unquote(q.get("path", "/")), "host": q.get("host", ""), "mode": q.get("mode", "auto")}
    return {
        "log": {"loglevel": "warning"},
        "inbounds": [{"listen": "0.0.0.0", "port": 10809, "protocol": "http"}],
        "outbounds": [{"protocol": "vless",
                       "settings": {"vnext": [{"address": u.hostname, "port": u.port or 443, "users": [user]}]},
                       "streamSettings": stream}],
    }


links = fetch_links(sys.argv[1].strip())
names = [unquote(urlparse(l).fragment) for l in links]
if len(sys.argv) > 2:
    picked = [i for i, n in enumerate(names) if sys.argv[2].lower() in n.lower()]
    if not picked:
        sys.exit("Нет сервера с таким названием. Есть:\n  " + "\n  ".join(names))
    idx = picked[0]
else:
    print("Серверы в подписке:\n  " + "\n  ".join(names), file=sys.stderr)
    idx = 0
print(f"Выбран: {names[idx]}", file=sys.stderr)
print(json.dumps(build(links[idx]), indent=2))
