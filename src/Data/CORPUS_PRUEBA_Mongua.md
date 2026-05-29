# CORPUS: prueba.py
## Supervisor Principal del AGV — Explicación completa

---

## ¿QUÉ HACE ESTE ARCHIVO EN UNA LÍNEA?

Abre la cámara, usa IA para encontrar el AGV en la imagen, decide qué instrucción darle según dónde está y a dónde va, lo publica por MQTT y lo muestra en una página web que puedes ver desde el celular.

---

## MAPA VISUAL DEL CÓDIGO

```
prueba.py
│
├── 1. IMPORTS & MODELO          → carga YOLOv8 (best.pt)
├── 2. CONFIGURACIÓN MQTT        → se conecta al broker
├── 3. VARIABLES GLOBALES        → estado compartido entre hilos
├── 4. SERVIDOR WEB (Flask)      → página HTML + stream de video
│   ├── /            → página del celular
│   ├── /estado      → JSON con datos del AGV
│   └── /video       → stream MJPEG en vivo
├── 5. ZONAS DEL ALMACÉN         → mapa de rectángulos en píxeles
├── 6. HILO CONSOLA              → input() sin bloquear el video
├── 7. DETECCIÓN DE CÁMARA       → busca automáticamente índice 0-4
└── 8. LOOP PRINCIPAL (while)
    ├── a. Leer frame de cámara
    ├── b. Dibujar líneas y zonas
    ├── c. YOLOv8 detecta el AGV
    ├── d. Calcular ubicación actual
    ├── e. Máquina de estados → instrucción
    ├── f. Publicar por MQTT (cada 2s)
    ├── g. Mostrar texto en ventana
    └── h. Copiar frame al servidor web
```

---

## BLOQUE 1 — IMPORTS Y CARGA DEL MODELO (líneas 1–13)

```python
model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "RED_NEURONAL", "best.pt")
model = YOLO(model_path)
```

**Qué pasa aquí:**
- `os.path.abspath(__file__)` → obtiene la ruta completa del script, sin importar desde dónde lo corras.
- Construye la ruta a `RED_NEURONAL/best.pt` relativa al archivo → **funciona en cualquier PC**.
- `YOLO(model_path)` → carga el modelo entrenado en memoria. Esto puede tardar 2-5 segundos.

**Por qué `best.pt` y no `yolov8n.pt`:**
- `yolov8n.pt` es el modelo genérico que reconoce 80 objetos del mundo real.
- `best.pt` es el modelo **entrenado específicamente para reconocer el AGV** con las fotos del dataset propio.

---

## BLOQUE 2 — CONFIGURACIÓN MQTT (líneas 15–61)

```python
BROKER  = "10.212.148.83"
PUERTO  = 1883
ID_AGV  = "AGV_01"
TOPIC_POSICION = "wms/agv/AGV_01/posicion"
TOPIC_ALERTA   = "wms/sistema/alerta"
```

**Conceptos clave:**

| Término | Significado |
|---|---|
| Broker | Servidor central que recibe y distribuye mensajes |
| Topic | "Canal" al que se publica o suscribe, como una dirección |
| Publish | Enviar un mensaje al broker |
| Subscribe | Escuchar mensajes de un topic |

**Este script solo PUBLICA** (no escucha). Envía el estado del AGV para que otros sistemas lo lean.

```python
MQTT_ACTIVO = False
try:
    mqtt_client.connect(BROKER, PUERTO, 5)   # timeout de 5 segundos
    MQTT_ACTIVO = True
except:
    print("Continuando sin MQTT")
```

**Por qué el `try/except`:**
Si el broker no está disponible (WiFi diferente, servidor apagado), el programa **no se cae** — sigue funcionando solo con la cámara y la web. `MQTT_ACTIVO = False` desactiva la publicación silenciosamente.

**Función `publicar_posicion()`:**
```python
payload = {
    "ubicacion":   "A3",
    "coordenadas": [390, 215],
    "destino":     "B1",
    "instruccion": "AVANZAR A LA IZQUIERDA",
    "visto":       True,
    "timestamp":   "2026-05-22 10:30:00"
}
mqtt_client.publish("wms/agv/AGV_01/posicion", json.dumps(payload))
```
Empaqueta todo el estado en un JSON y lo manda al broker. Si `visto=False` (el AGV desapareció de la cámara), además publica una alerta en `wms/sistema/alerta`.

---

## BLOQUE 3 — VARIABLES GLOBALES (líneas 63–76)

```python
destino_agv       = "Ninguno"      # destino que escribió el operador
ubicacion_actual  = "Desconocida"  # zona donde está el AGV ahora
coordenadas_actuales = (0, 0)      # píxel X,Y del centro del AGV
visto_ahora       = False          # ¿está el AGV en el frame actual?
instruccion_actual = "ESPERANDO DESTINO..."

frame_web  = None           # frame más reciente para el stream web
lock_frame = threading.Lock()  # mutex para acceso seguro entre hilos
```

**Por qué `threading.Lock()`:**
El loop principal escribe `frame_web` y el servidor Flask lo lee al mismo tiempo (son hilos distintos). Sin el lock, podrían leer un frame a medio escribir y el video se rompería. El lock dice: *"espera tu turno antes de tocar esta variable"*.

---

## BLOQUE 4 — SERVIDOR WEB FLASK (líneas 78–277)

El servidor corre en un **hilo separado** para no bloquear el loop de video.

```python
threading.Thread(target=iniciar_servidor_web, daemon=True).start()
```

`daemon=True` significa que cuando el programa principal termine, el servidor web también muere automáticamente.

### Rutas disponibles

#### `GET /` → Página HTML del celular
Sirve la interfaz visual completa. La página tiene:
- Una etiqueta `<img src="/video">` que carga el stream continuo.
- Un panel con tarjetas (ubicación, destino, coordenadas, instrucción).
- JavaScript que llama `/estado` cada 1 segundo y actualiza las tarjetas sin recargar la página.

#### `GET /estado` → JSON con datos actuales
```json
{
  "ubicacion":   "A3",
  "coordenadas": [390, 215],
  "destino":     "B1",
  "instruccion": "AVANZAR A LA IZQUIERDA",
  "visto":       true,
  "timestamp":   "10:30:45"
}
```
El JavaScript del celular lee esto cada segundo y actualiza la pantalla.

#### `GET /video` → Stream MJPEG
```python
def generar_frames():
    while True:
        with lock_frame:
            ret, buffer = cv2.imencode('.jpg', frame_web, [cv2.IMWRITE_JPEG_QUALITY, 70])
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.04)   # 25 fps
```

**¿Qué es MJPEG?**
En lugar de un video con compresión temporal (como MP4), MJPEG envía JPEGs uno tras otro separados por `--frame`. El navegador los muestra como si fuera video. Es simple y funciona en cualquier navegador sin plugins.

**`IMWRITE_JPEG_QUALITY, 70`** → comprime cada frame al 70% de calidad. Reduce el tamaño ~3x para que el stream vaya más rápido por WiFi sin perder demasiada claridad.

---

## BLOQUE 5 — ZONAS DEL ALMACÉN (líneas 284–295)

```python
zonas = {
    "Zona Pits":   (150, 20,  400, 100),   # (x_izq, y_top, x_der, y_bot)
    "Despacho":    (450, 20,  600, 100),
    "Bifurcacion": (130, 240, 200, 320),
    "A1": (220, 180, 280, 250),
    ...
}
```

Cada zona es un **rectángulo en píxeles** sobre la imagen de 640×480.

```
(0,0)────────────────────────(640,0)
  │  [Zona Pits]  [Despacho]   │
  │                             │
  │[Rec]  [A1][A2][A3][A4][A5]  │
  │       [Bifurcacion]         │
  │[Ban]  [B1][B2][B3][B4][B5]  │
(0,480)──────────────────(640,480)
```

**Cómo se usa:** cuando YOLOv8 detecta el AGV, calcula su centro `(cx, cy)` y pregunta: *¿en qué rectángulo cae este punto?* Eso determina `ubicacion_actual`.

---

## BLOQUE 6 — HILO DE CONSOLA (líneas 298–310)

```python
def leer_consola():
    global destino_agv
    while True:
        nuevo_destino = input(">>> Ingrese destino: ").strip()
        if nuevo_destino in zonas:
            destino_agv = nuevo_destino
```

**Por qué un hilo separado:**
`input()` es una función **bloqueante** — el programa se detiene hasta que el usuario escribe algo. Si lo pusiéramos en el loop principal, el video se congelaría esperando que escribas. Al ponerlo en un hilo, el loop sigue corriendo y el operador puede escribir el destino en cualquier momento.

---

## BLOQUE 7 — DETECCIÓN AUTOMÁTICA DE CÁMARA (líneas 312–335)

```python
def encontrar_camara():
    for indice in range(5):
        c = cv2.VideoCapture(indice, cv2.CAP_DSHOW)
        if c.isOpened():
            ok, _ = c.read()
            if ok:
                return c, indice
    return None, -1
```

Prueba los índices 0, 1, 2, 3, 4 hasta encontrar una cámara que **realmente lea frames**.

**Por qué `CAP_DSHOW`:**
En Windows, el backend por defecto (MSMF) puede fallar con ciertos drivers de cámara. DirectShow (`CAP_DSHOW`) es más compatible con cámaras USB y webcams en Windows 10/11.

---

## BLOQUE 8 — LOOP PRINCIPAL (líneas 349–447)

Este es el corazón del programa. Se repite ~25 veces por segundo.

### Paso A — Leer frame
```python
success, frame = cap.read()
if not success:
    break
```
Lee el siguiente frame de la cámara. Si falla (cámara desconectada), cierra el programa.

### Paso B — Dibujar guías visuales
```python
cv2.line(frame, (580, 280), (165, 280), (128, 128, 128), 3)  # línea horizontal
cv2.line(frame, (165, 280), (165,  60), (128, 128, 128), 3)  # línea vertical norte
cv2.line(frame, (165, 280), ( 50, 280), (128, 128, 128), 3)  # línea hacia recepción

for nombre, (zx1, zy1, zx2, zy2) in zonas.items():
    cv2.rectangle(frame, (zx1, zy1), (zx2, zy2), (255, 0, 0), 1)  # recuadros azules
```
Dibuja directamente sobre el frame los carriles y las zonas, para que el operador pueda ver visualmente el mapa.

### Paso C — Detección con YOLOv8
```python
results = model(frame, verbose=False)

for r in results:
    for caja in r.boxes:
        visto_ahora = True
        x1, y1, x2, y2 = map(int, caja.xyxy[0])  # coordenadas del bounding box
        centro_x = (x1 + x2) // 2
        centro_y = (y1 + y2) // 2
```

YOLOv8 analiza el frame completo y devuelve una lista de detecciones. Cada detección tiene:
- `xyxy[0]` → coordenadas de las esquinas del rectángulo que rodea el objeto detectado.
- El **centro** se calcula como el promedio de las esquinas.

```
frame 640×480
┌────────────────────────┐
│                        │
│   x1,y1 ┌──────┐      │
│          │  AGV │      │  centro_x = (x1+x2)/2
│          └──────┘ x2,y2│  centro_y = (y1+y2)/2
│                        │
└────────────────────────┘
```

### Paso D — Determinar ubicación actual
```python
en_cuadro = False
for nombre_zona, (zx1, zy1, zx2, zy2) in zonas.items():
    if zx1 < centro_x < zx2 and zy1 < centro_y < zy2:
        ubicacion_actual = nombre_zona
        en_cuadro = True
        break

if not en_cuadro:
    ubicacion_actual = "En Ruta"
```
Recorre todas las zonas y pregunta si el centro del AGV cae dentro del rectángulo de esa zona. Si no cae en ninguna, está en la línea entre zonas → `"En Ruta"`.

### Paso E — Máquina de estados de navegación

Este es el cerebro de decisión. Tiene **4 casos** en cascada:

```
¿Hay destino? ¿AGV visible?
       │
       ├─ NO → "ESPERANDO DESTINO..."
       │
       └─ SÍ ─┬─ ¿ubicacion == destino?     → "LLEGADA EXITOSA!"
               │
               ├─ ¿ubicacion == Bifurcacion? → decide dirección según destino
               │     Pits/Despacho           → "GIRAR DERECHA (NORTE)"
               │     Recepcion/Banda         → "SEGUIR DERECHO (OESTE)"
               │     Almacenes               → "GIRAR HACIA ALMACENES (ESTE)"
               │
               ├─ ¿ubicacion == En Ruta?     → alinea con la columna del destino
               │     centro_x dentro del rango X del destino → "ALINEADO: GIRAR"
               │     centro_x muy a la derecha               → "AVANZAR IZQUIERDA"
               │     centro_x muy a la izquierda             → "AVANZAR DERECHA"
               │
               └─ otra zona equivocada       → "SALIR A LINEA PRINCIPAL"
```

**Ejemplo de alineación:**
Si el destino es `A3` cuya zona tiene `x1=360, x2=420` y el AGV está en X=350 (a la izquierda de A3), la instrucción es `"AVANZAR A LA DERECHA"` hasta que `360 <= centro_x <= 420`.

### Paso F — Publicar y mostrar en consola (cada 2 segundos)
```python
if time.time() - ultima_impresion > 2:
    publicar_posicion(...)
    ultima_impresion = time.time()
```
No publica en cada frame (eso saturaria el broker y la consola). Usa un contador de tiempo para publicar solo cada 2 segundos.

### Paso G — Overlay en ventana local
```python
cv2.putText(frame, f"DESTINO: {destino_agv}", (20, 40), ...)
cv2.putText(frame, f"ORDEN: {instruccion_actual}", (20, 80), ...)
cv2.imshow("Supervisor AGV - MecaPsi", frame)
```
Escribe el texto sobre el frame y muestra la ventana en la PC.

### Paso H — Compartir frame con el servidor web
```python
with lock_frame:
    frame_web = frame.copy()
```
Copia el frame procesado (con zonas, detecciones y texto dibujados) a la variable global `frame_web`. El servidor Flask la leerá en el próximo ciclo para enviársela al celular.

---

## FLUJO COMPLETO EN UN DIAGRAMA

```
Cámara
  │ frame crudo
  ▼
[Dibujar líneas y zonas]
  │ frame con guías
  ▼
[YOLOv8 best.pt]
  │ bounding box del AGV
  ▼
[Calcular centro X,Y]
  │ (centro_x, centro_y)
  ▼
[¿En qué zona?] ──── zonas{} ────► ubicacion_actual
  │
  ▼
[Máquina de estados] ──── destino_agv ────► instruccion_actual
  │
  ├──► [MQTT publish]  ──► broker ──► mqtt.py / WMS / ESP32
  │
  ├──► [frame_web]  ──► Flask /video ──► celular (MJPEG)
  │
  └──► [cv2.imshow] ──► ventana local PC
```

---

## RESUMEN DE HILOS

El programa corre **3 hilos en paralelo:**

| Hilo | Qué hace | Por qué separado |
|---|---|---|
| **Principal** | Loop de cámara + IA + lógica | Es el hilo "dueño" de OpenCV |
| **Flask** | Sirve la web al celular | `app.run()` bloquea, no puede estar en el principal |
| **Consola** | Lee `input()` del operador | `input()` bloquea, congela el video si está en el principal |

Los 3 se comunican a través de las **variables globales** (`frame_web`, `destino_agv`, `instruccion_actual`, etc.) protegidas con `lock_frame` donde hay riesgo de colisión.
