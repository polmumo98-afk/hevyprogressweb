# Hevy Progress

Dashboard moderno (Next.js + PWA) que muestra tu progreso de entrenamiento
tirando de la **API pública de Hevy en vivo** — sin exportar ni importar nada
a mano. Todos los pesos y volúmenes en **kg**.

## Qué incluye

**Dashboard**
- Saludo personalizado según la hora del día y días desde el último entreno.
- KPIs: volumen total, volumen de esta semana (con % vs. la semana anterior),
  entrenamientos, series, repeticiones, racha de semanas seguidas.
- Tiempo total entrenado, media por sesión, días activos, variedad de
  ejercicios, minutos de cardio y tu mejor semana.
- Mapa de calor de actividad de los últimos 4 meses (estilo GitHub).
- Gráfica combinada de sesiones + volumen de las últimas 12 semanas.
- Series por grupo muscular (traducido al español).
- Récords personales por ejercicio con la fecha en que los hiciste.
- Volumen por mes y reparto por día de la semana.
- Ejercicios con más volumen acumulado y entrenamientos recientes.

**Ejercicios**
- Buscador por nombre de ejercicio o grupo muscular.
- Evolución del 1RM estimado (Epley) y del peso de tu mejor serie.
- Mejor peso, mejor 1RM, sesiones, volumen acumulado y % de progreso.
- Historial de sesiones con marca **PR** en las que batiste récord.

**PWA**
- Instalable en móvil y escritorio, icono propio y modo standalone.
- Service worker con estrategia network-first para las páginas (para que un
  deploy nuevo nunca deje la web con estilos rotos) y cache-first para assets.

Tu API key de Hevy **nunca** se expone al navegador: solo la usa el servidor
(las rutas API de Next.js) a través de la variable `HEVY_API_KEY`.

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
   Vercel detecta Next.js automáticamente, no hay que tocar el build.
3. En **Settings → Environment Variables** añade:
   - `HEVY_API_KEY` = tu API key de Hevy Pro (Settings → Developer en hevy.com)
   - `NEXT_PUBLIC_USER_NAME` = el nombre del saludo (opcional)
4. Deploy.
5. Desde el móvil, abre la URL y usa "Añadir a pantalla de inicio" para
   instalarla como app.

## Notas

- Los datos se cachean 5 minutos en el servidor para no saturar la API de Hevy.
- Requiere cuenta Hevy Pro (la API pública solo está disponible para Pro).
- No hay base de datos: cada carga pide los datos frescos a la API de Hevy.
- El icono de la app es original de este proyecto; no usa la marca ni el logo
  de Hevy, que pertenecen a Hevy Studios. Este proyecto no está afiliado a Hevy.
