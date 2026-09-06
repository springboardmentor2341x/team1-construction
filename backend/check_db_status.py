from app.database.session import SessionLocal, engine
from sqlalchemy import text, inspect

db = SessionLocal()
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Total tables found: {len(tables)}")
print("-" * 50)
for t in sorted(tables):
    try:
        count = db.execute(text(f'SELECT COUNT(*) FROM "{t}"')).scalar()
        print(f"{t:<35} : {count}")
    except Exception as e:
        print(f"{t:<35} : ERROR ({e})")
db.close()
