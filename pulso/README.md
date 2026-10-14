# Pulso

Organizador personal de ejercicios en HTML, CSS y JavaScript, sin compilación ni dependencias de JavaScript.

Abrí `dist/index.html` en un navegador, o serví `dist` con un servidor estático. Elegí los días en **Personalizar días** y cargá tus ejercicios. Podés editar, eliminar, subir ejercicios de posición, marcar el progreso de cada fecha y usar el temporizador de descanso.

Los datos se guardan en localStorage en el navegador y origen actuales. No se sincronizan entre dispositivos. Usá **Exportar JSON** para obtener una copia y **Importar** para restaurarla. La importación valida todo el contenido y pide confirmar antes de reemplazar los datos. El modo privado o borrar datos del navegador puede eliminar la información. El temporizador funciona mientras la página está abierta; no envía notificaciones con la app cerrada.

## JSON versión 1

El objeto raíz contiene `version: 1`, `days` (exactamente siete días de lunes a domingo) y `completed` (fechas locales `AAAA-MM-DD` asociadas con listas de identificadores completados). Cada día contiene `name`, `enabled` y `exercises`. Cada ejercicio contiene `id` único, `name`, `sets` entero (1–100), `reps`, `weight`, `rest` entero en segundos (0–3600) y `notes`. Exportar desde la app es la forma más sencilla de obtener una plantilla compatible.

La fecha se obtiene del dispositivo. El progreso se registra por fecha, por lo que cada nueva semana empieza con los ejercicios pendientes. Desactivar un día conserva sus ejercicios.
