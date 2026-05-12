import sys
sys.path.append('d:/Desktop/g4-wms-backend')
from app.database import database, models
from app.database.models import User, Role
from app.core.security import get_password_hash

db = database.SessionLocal()
models.Base.metadata.create_all(bind=database.engine)

rol = db.query(Role).filter(Role.name=='superadmin').first()
if not rol:
    rol = Role(name='superadmin')
    db.add(rol)
    db.commit()
    db.refresh(rol)

usr = db.query(User).filter(User.username=='superadmin').first()
if not usr:
    hashed = get_password_hash('SA@2025!')
    usr = User(username='superadmin', hashed_password=hashed, role_id=rol.id)
    db.add(usr)
    db.commit()
    print('Usuario superadmin insertado con hash!')
else:
    print('El usuario ya existia')

db.close()
