# Pulso · Rutina de ejercicio

Aplicación personal y local en HTML, CSS y JavaScript para organizar ejercicios por día de la semana. No requiere instalación, cuentas, servidor ni conexión a Internet.

## Cómo abrirla

Descargá el repositorio completo y descomprimilo. Hacé doble clic en **index.html**, en la carpeta principal. Conservá la carpeta `pulso` junto a ese archivo: contiene la aplicación.

## Funciones

- Selección de días de entrenamiento y descanso.
- Rutinas por día con ejercicios, series, repeticiones o duración, carga y notas.
- Vista del día actual y progreso registrado por fecha.
- Edición, eliminación y cambio de orden de ejercicios.
- Temporizador de descanso.
- Importación y exportación JSON con validación antes de reemplazar una rutina.
- Interfaz oscura adaptable, con tarjetas y datos diferenciados por color.

Los datos se guardan en el navegador y no se suben a GitHub ni se sincronizan entre dispositivos. Exportá un JSON como respaldo antes de borrar datos del navegador o cambiar de equipo. El temporizador requiere tener la página abierta.

## Archivos

- `index.html`: acceso directo a la aplicación local.
- `pulso/dist/index.html`: interfaz.
- `pulso/dist/styles.css`: estilos.
- `pulso/dist/app.js`: lógica y almacenamiento local.
- `pulso/README.md`: detalles del formato JSON.
- `pulso/verify.cjs`: comprobaciones de validación JSON, ejecutables con `node pulso/verify.cjs` desde su carpeta (ver abajo).

## Verificación opcional

Con Node.js instalado:

```sh
cd pulso
node --check dist/app.js
node verify.cjs
```
