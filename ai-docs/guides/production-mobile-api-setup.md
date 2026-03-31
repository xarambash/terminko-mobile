# Production setup: mobile app -> backend API

Ovaj vodič objašnjava kako da `terminko-mobile` radi u produkciji (Play Store / App Store), bez lokalne IP adrese.

## 1) Osnovni princip

U development-u mobilna aplikacija često koristi lokalni IP računara (npr. `http://192.168.x.x:5000`).
U produkciji aplikacija mora da koristi javno dostupan API URL:

- `https://api.terminko.com` (primer)

To se postavlja preko:

- `EXPO_PUBLIC_API_URL=https://api.terminko.com`

## 2) Šta mora da postoji na backend-u

- Deploy-ovan `terminko-server` (cloud/VPS/container).
- DNS domen (npr. `api.terminko.com`) koji pokazuje na server.
- HTTPS sertifikat (Let's Encrypt ili managed cert).
- Otvoren port `443` (i pravilna reverse proxy konfiguracija).
- Stabilna produkcijska baza i migracije.

## 3) Environment varijable u mobilnoj aplikaciji

Za mobilni build koristi:

- `EXPO_PUBLIC_API_URL=https://api.terminko.com`
- `EXPO_PUBLIC_TENANT_SLUG=<tenant-slug>`

Napomena:

- `EXPO_PUBLIC_*` varijable su javne u app bundle-u (to je očekivano).
- Ne stavljati tajne (API ključeve, lozinke, private tokene) u `EXPO_PUBLIC_*`.

## 4) Expo/EAS build preporuka

Za produkciju koristi EAS profile (`development`, `preview`, `production`) i različite env vrednosti po profilu.

Primer logike:

- `development`: lokalni/LAN server
- `preview`: staging API (npr. `https://staging-api.terminko.com`)
- `production`: produkcijski API (`https://api.terminko.com`)

## 5) Multi-tenant odluka

Za trenutni flow (tenant slug iz env-a) praktično su dve opcije:

- **Single-tenant build:** svaka aplikacija ima fiksan `EXPO_PUBLIC_TENANT_SLUG`.
- **Shared app build:** tenant se bira kroz onboarding/deep link i čuva lokalno.

Trenutna implementacija je bliža prvoj opciji.

## 6) Pre-release checklist

- [ ] `https://api.terminko.com/health` vraća `200`.
- [ ] `GET /tenants/:slug` radi za ciljani tenant.
- [ ] `GET /tenants/:tenantId/resources` vraća aktivne resurse.
- [ ] `EXPO_PUBLIC_API_URL` u production buildu nije lokalni IP niti `localhost`.
- [ ] App radi i na mobilnom internetu (ne samo na internom Wi-Fi).
- [ ] Uključeni logovi/monitoring za backend greške.

## 7) Najčešće greške

- `localhost` u production buildu (telefon tada gađa sam sebe).
- Istekla ili pogrešna LAN IP adresa ostavljena iz development-a.
- HTTP umesto HTTPS u store buildu.
- Promenjen `.env`, ali nije urađen čist restart bundlera (`expo start -c`) pre testiranja development build-a.
