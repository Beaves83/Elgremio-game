# Primer arco jugable de Ethan

Estado: propuesta de diseño basada en la idea del autor. Los animales, cantidades, nombre de la cueva y recompensa visual son provisionales. No fija acontecimientos nuevos del canon de la novela.

## Principio

La Aldea de Arthen funciona como base. Ethan acepta encargos breves para aprender movimiento, rastreo, combate, recogida y entrega. Cada misión introduce una regla nueva y termina con una recompensa visible. Después aparece un orco que lleva un pergamino: la pista conduce a una cueva con un tesoro. La cueva es la primera misión larga y culmina en un combate difícil que entrega una armadura y una espada.

| Orden | Misión provisional | Objetivo jugable | Sistema que prueba |
| --- | --- | --- | --- |
| 1 | Huellas junto al arroyo | Seguir tres rastros y encontrar una presa pequeña | Exploración, indicadores y rastreo |
| 2 | La despensa de Arthen | Cazar dos conejos y entregar la carne | Ataque básico, botín y entrega |
| 3 | Lobos cerca del sendero | Ahuyentar o derrotar dos lobos antes de que alcancen el corral | Enemigos que atacan, salud y curación |
| 4 | La bestia marcada | Derrotar un jabalí resistente | Esquiva, lectura del ataque y enemigo fuerte |
| 5 | Guardia del camino | Recorrer el límite de la aldea y neutralizar una amenaza animal | Recorrido, varios encuentros y preparación |
| 6 | El orco del pergamino | Vencer al orco, registrar el cuerpo y leer el pergamino | Humanoide, botín de misión, diario |
| 7 | El tesoro de la cueva | Seguir la pista, superar orcos del camino, entrar en la cueva y vencer al guardián | Viaje entre pantallas, combate largo y jefe |

## Misión larga: estructura

1. **Hallazgo.** Al derrotar al primer orco aparece un pergamino interactivo. Ethan lo lee; el diario registra la pista de un tesoro en una cueva. La localización exacta aún no se ha decidido.
2. **Investigación.** Aldric puede aportar una indicación para orientar la ruta. El jugador puede volver a la aldea para curarse y prepararse.
3. **Camino.** Dos o tres grupos de orcos aumentan gradualmente la dificultad. Un punto de descanso evita repetir toda la ruta tras un fallo.
4. **Entrada.** Se presenta una nueva pantalla de cueva; un enfrentamiento de entrada confirma que la amenaza continúa dentro.
5. **Guardián.** Un orco especialmente fuerte custodia el tesoro. Su ataque potente debe anticiparse y esquivarse. El jugador conserva control para retirarse, curarse y volver a intentar.
6. **Recompensa.** Se abre el cofre tras derrotarlo. Ethan obtiene **una armadura y una espada**; ambas pasan al inventario y su equipamiento cambia las estadísticas y el aspecto cuando existan sprites definitivos.

## Estados y condiciones de finalización

- Cada misión tiene `disponible → activa → objetivo cumplido → entregada`; el progreso se guarda para que no se dupliquen recompensas.
- El pergamino se obtiene una sola vez y desbloquea la cueva al leerlo. Derrotar al orco por sí solo no revela la localización.
- La espada y la armadura se conceden juntas al abrir el cofre después del jefe, no por entrar en la cueva.
- Si Ethan cae, vuelve al último punto de descanso. La misión sigue activa y el jefe vuelve a su estado inicial.

## Pendiente de decidir con el autor

- Animales definitivos de las cinco misiones, y si cazar con arco, espada o ambas opciones.
- Quién entrega cada encargo y cuáles son sus diálogos.
- Nombre, localización y diseño de las pantallas del camino y la cueva.
- Tipo de orco jefe, propiedades y apariencia de la espada y la armadura.
- Relación exacta del tesoro con la historia de *El Origen*, para evitar contradicciones.
