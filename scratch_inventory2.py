from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine("sqlite:///d:/Desktop/g4-wms-backend/wms_local.db")
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Inventory(Base):
    __tablename__ = "inventory"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True)
    sku = Column(String)
    pos_x = Column(Integer)
    pos_y = Column(Integer)
    status = Column(String)

db = SessionLocal()

# Delete existing to prevent duplicates if any
db.query(Inventory).delete()

inv1 = Inventory(sku="CAJA-A100", pos_x=2, pos_y=3, status="stored")
inv2 = Inventory(sku="CAJA-B250", pos_x=4, pos_y=1, status="stored")

db.add(inv1)
db.add(inv2)
db.commit()

print("Data inserted correctly in g4-wms-backend DB!")
db.close()
