import redis
import json
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

db_name = os.getenv("PGDATABASE")
db_user= os.getenv("PGUSER")
db_password = os.getenv("PGPASSWORD")
db_host = os.getenv("PGHOST")
db_port = os.getenv("PGHOSTPORT")

# Redis connection
r = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)


pubsub = r.pubsub()
pubsub.subscribe("chat")

# PostgreSQL connection
conn = psycopg2.connect(
    dbname=db_name,
    user=db_user,
    password=db_password,
    host=db_host,
    port=db_port
)

cursor = conn.cursor()

print("Listening for messages...")

for message in pubsub.listen():
    if message["type"] == "message":

        data = json.loads(message["data"])

        username = data["user"]
        text = data["text"]
        timestamp = data["timestamp"]

        print(f"{username}: {text}")

        cursor.execute(
            """
            INSERT INTO messages (username, message, sent_at)
            VALUES (%s, %s, %s)
            """,
            (username, text, timestamp)
        )

        conn.commit()

        print("Saved to database")