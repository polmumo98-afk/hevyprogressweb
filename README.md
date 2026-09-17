# Hevy Progress

Dashboard moderno (Next.js + PWA) que muestra tu progreso de entrenamiento
tirando de la **API pública de Hevy en vivo** — no hace falta exportar ni
importar nada a mano.

## Qué incluye

- Resumen global: entrenamientos, series, volumen total, racha semanal.
- Gráfica de sesiones/volumen de las últimas 12 semanas.
- Reparto de series por grupo muscular.
- Progreso por ejercicio (peso de tu mejor serie y 1RM estimado a lo largo del tiempo).
- Instalable como app (PWA) en móvil y escritorio.

Tu API key de Hevy **nunca** se expone al navegador: solo la usa el servidor
(las rutas API de Next.js), a través de la variable de entorno `HEVY_API_KEY`.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y pon ahí tu API key real
npm run dev
```

Abre http://localhost:3000

## Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
   Vercel detecta Next.js automáticamente, no hay que tocar nada de build.
3. En **Settings → Environment Variables**, añade:
   - `HEVY_API_KEY` = tu API key de Hevy Pro (Settings → Developer en hevy.com)
4. Deploy.
5. Abre la web desplegada desde el móvil y usa "Añadir a pantalla de inicio"
   (Android/Chrome) o "Compartir → Añadir a pantalla de inicio" (iOS/Safari)
   para instalarla como app.

## Notas

- Los datos se cachean 5 minutos en el servidor para no saturar la API de Hevy.
- Requiere una cuenta Hevy Pro (la API pública de Hevy solo está disponible para Pro).
- Este proyecto no guarda tus datos en ninguna base de datos: cada carga
  pide los datos frescos a la API de Hevy.
