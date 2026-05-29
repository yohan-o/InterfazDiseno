import cv2
import sys

print("=== DIAGNÓSTICO DE CÁMARAS ===")
print(f"Versión de OpenCV: {cv2.__version__}")

backends = [
    ("DEFAULT", None),
    ("DSHOW (DirectShow)", cv2.CAP_DSHOW),
    ("MSMF (Media Foundation)", cv2.CAP_MSMF)
]

found_any = False

for b_name, b_val in backends:
    print(f"\nProbando Backend: {b_name}...")
    for i in range(8):
        try:
            if b_val is None:
                cap = cv2.VideoCapture(i)
            else:
                cap = cv2.VideoCapture(i, b_val)
            
            if cap.isOpened():
                ret, frame = cap.read()
                if ret:
                    print(f"  [ÉXITO] Índice {i} FUNCIONA (Frame capturado: {frame.shape[1]}x{frame.shape[0]})")
                    found_any = True
                else:
                    print(f"  [PARCIAL] Índice {i} abre pero no entrega frames.")
                cap.release()
        except Exception as e:
            print(f"  [ERROR] Índice {i} lanzó excepción: {e}")

if not found_any:
    print("\n[ALERTA] No se pudo abrir ninguna cámara con ningún backend en los índices 0-7.")
else:
    print("\n=== FIN DEL DIAGNÓSTICO ===")
