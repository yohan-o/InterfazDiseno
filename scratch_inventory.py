import sys
sys.path.append('d:/Desktop/g4-wms-backend')
from app.database import database, models
from app.database.models import Inventory

# Aseguramos que las tablas existan antes de hacer query
models.Base.metadata.create_all(bind=database.engine)

db = database.SessionLocal()

# Verificamos si ya hay datos para no duplicarlos
if db.query(Inventory).count() == 0:
    inv1 = Inventory(sku="CAJA-A100", pos_x=2, pos_y=3, status="stored")
    inv2 = Inventory(sku="CAJA-B250", pos_x=4, pos_y=1, status="stored")
    
    db.add(inv1)
    db.add(inv2)
    db.commit()
    print("¡Agregamos 2 cajas de prueba al inventario exitosamente!")
else:
    print("Ya habían cajas en el inventario, no hicimos nada para no duplicar.")

db.close()
