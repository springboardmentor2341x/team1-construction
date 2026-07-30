import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to default postgres database
conn = psycopg2.connect(
    host="localhost",
    dbname="postgres",
    user="postgres",
    password="postgres123",
    port=5432
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

# Check if database exists
cur.execute("SELECT 1 FROM pg_database WHERE datname = 'buildtrack'")
exists = cur.fetchone()

if not exists:
    cur.execute("CREATE DATABASE buildtrack")
    print("Created database 'buildtrack'")
else:
    print("Database 'buildtrack' already exists")

cur.close()
conn.close()
print("Database setup complete!")
