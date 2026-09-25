# El Gremio de los Dragones — V0.1.2a visual (reconstrucción)

Juego web con Vue 3, TypeScript, Pinia y Phaser. Ethan explora la Aldea de Arthen con los PNG separados de casas, caminos, árboles y decoración. Los personajes aún son provisionales.

## Arranque

`npm install` y `npm run dev`. Abre la dirección que indique Vite. WASD o flechas para moverte; E cerca de Aldric para hablar y aceptar «Sangre en el camino». En móvil, toca un punto para desplazarte. `npm run build` comprueba tipos y compila.

Al pulsar «Nueva partida» aparece una introducción ilustrada de tres escenas sobre Ethan y sus padres en las Tierras Antiguas. Avanza cada siete segundos, permite pasar manualmente y ofrece «Saltar introducción» desde el inicio.

La introducción y la aldea tienen melodías instrumentales suaves distintas, generadas con Web Audio (cuerda pulsada, flauta y bordón). La música arranca al pulsar «Nueva partida» y se puede silenciar o reactivar durante la introducción y desde el panel de la aldea. No se descargan pistas de terceros.

## Alcance

Reconstrucción desde el chat de la V0.1.2a y los recursos originales. El código local anterior no está disponible y puede diferir. El diálogo inicia la misión; todavía no tiene objetivos jugables, guardado, combate ni personajes definitivos.

La progresión prevista para la siguiente versión está en [`docs/misiones-iniciales.md`](docs/misiones-iniciales.md): cinco encargos breves, el orco del pergamino y la misión larga de la cueva.
