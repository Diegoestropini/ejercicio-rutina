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

## Desarrollo, privacidad y comprobaciones

Rutinas y progreso se guardan en localStorage. La exportación pulso-rutina-*.json contiene datos personales.

Los datos del navegador no se suben automáticamente a GitHub. Pueden perderse al borrar el almacenamiento o cambiar de navegador, perfil o dirección. localStorage e IndexedDB no son una bóveda cifrada ni un sistema de cuentas; no ofrecen aislamiento entre aplicaciones del mismo origen. Usá datos ficticios al preparar demos y pruebas. Conservá tus respaldos reales fuera de la carpeta del repositorio o dentro de `private-data/`, `backups/` o `exports/`, que están excluidas de Git. Las capturas privadas van en `private-screenshots/`; las capturas públicas deben revisarse manualmente.

`.gitignore` evita agregados accidentales, pero no elimina archivos ya versionados y se puede omitir con `git add -f`. El control local/CI también rechaza rutas privadas, formatos de respaldo y JSON no previstos. Solo se permiten los JSON de configuración, ejemplos explícitos (`*.example.json`) y fixtures ficticios revisados (`tests/fixtures/*.example.json` o `*.example.csv`). No conviertas datos reales en ejemplos cambiándoles el nombre. Si necesitás otro archivo público legítimo, revisá su contenido y ajustá la lista permitida en `scripts/check-repository.cjs`. El detector usa patrones conocidos: no garantiza detectar todos los secretos ni datos personales en texto o imágenes.

### Comprobar antes de subir

Con **Node.js 24** y **Git**, desde la raíz del repositorio, sin instalar dependencias:

```sh
node scripts/check-repository.cjs --self-test
node scripts/check-repository.cjs
cd pulso
node verify.cjs
cd ..
```

El chequeo básico valida archivos privados, patrones de credenciales, reglas de exclusión, JSON y sintaxis JavaScript, incluidos los scripts dentro de HTML. No abre la interfaz ni demuestra que todas las funciones de la aplicación sean correctas. Las pruebas adicionales usan datos sintéticos y almacenamiento aislado.

### Activar la protección local

Cada clon nuevo debe habilitar el hook explícitamente:

```sh
git config --local core.hooksPath .githooks
```

El hook ejecuta el control antes de crear un commit. Necesita Node.js en PATH; no accede al navegador ni envía datos por red. Podés correr el mismo control manualmente. Antes de cada subida revisá además `git diff --cached` y `git status`. Un detector de CI se ejecuta después de subir: complementa la prevención local, pero no evita una primera exposición. Si se filtra una credencial, revocala/rotala; borrar el archivo o hacer privado el repositorio no invalida las copias previas.

GitHub Actions ejecuta estos controles en cada push y pull request, con permisos de lectura y sin secretos. Las acciones se fijan a commits concretos. No se instala ninguna dependencia de la aplicación durante estas verificaciones.
