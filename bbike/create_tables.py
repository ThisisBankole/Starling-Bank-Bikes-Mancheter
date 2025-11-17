from app.core.database import engine, Base
from app.models.snapshot import BikeSnapshot, StationSnapshot

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")