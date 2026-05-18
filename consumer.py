import redis
import json
import psycopg2

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
    dbname="chatapp",
    user="chatuser",
    password="mypassword",
    host="localhost",
    port="5432"
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