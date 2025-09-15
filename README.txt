# ND:YAG 1064 – PWA gratuita (sin backend)

## Qué incluye
- Calculadora láser (ADSS) con entradas: Tipo, Diámetro, Profundidad, Spot Auto/Manual, Fototipo, Bronceado.
- Calculadora de escleroterapia (C1·V1 = C2·V2).
- Funciona **offline** (PWA), instalable en iOS/Android/desktop.
- Sin costos de hosting (GitHub Pages / Netlify).

## Cómo publicar GRATIS (PWA)
1) Crea un repo en GitHub.
2) Sube estos archivos a la raíz.
3) Activa **GitHub Pages** (Settings → Pages → Deploy from Branch → main / root).
4) En tu iPhone/Android, abre la URL y “Añadir a pantalla de inicio”.

## Cómo monetizar sin pagar plan de plataforma
- Vende el acceso a la **URL** (Gumroad/Stripe Checkout) y protege con un **código** o contraseña simple (puedes añadir un campo en `app.js`).
- Alternativa: publica **Android** en Play Store (requiere cuenta dev de **25 USD** una sola vez) y **iOS** en App Store (cuenta dev **99 USD/año**). No hay forma oficial 100% gratis para ambas tiendas.
- Si decides subir a tiendas, puedes **envolver** esta PWA con **Capacitor** o **TWA** (Android).

## Personalización
- Edita las funciones en `app.js` para ajustar lógicas o rangos.
- Los estilos están en `styles.css`.
- El manifiesto PWA está en `manifest.json`.

## Descargo
- La lógica es conservadora y basada en tu hoja Excel v5.5. Ajusta a tu dispositivo y criterio clínico.
