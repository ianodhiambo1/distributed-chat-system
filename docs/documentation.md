# Real-Time Chat Backend Setup Documentation

## Goal

Build a basic distributed real-time chat backend using:

* Node.js (WebSocket server)
* Redis Pub/Sub (message broker)
* Python worker service
* PostgreSQL (message persistence)
* WSL2 + Ubuntu (Linux backend environment on Windows)

Architecture:

```text
Client (Postman/WebSocket client)
        ↓
Node.js WebSocket Server
        ↓
Redis Pub/Sub
        ↓
Python Consumer
        ↓
PostgreSQL Database
```

---

# PART 1 — INSTALLING WSL2 + UBUNTU

## What is WSL2?

WSL2 = Windows Subsystem for Linux 2.

It allows you to run a real Linux environment inside Windows.

This is useful because many backend tools are designed for Linux:

* Redis
* PostgreSQL
* Docker
* Nginx
* Kafka

Instead of using heavy virtual machines, WSL2 gives a lightweight Linux environment.

---

## Install WSL2

Open PowerShell as Administrator.

Run:

```powershell
wsl --install
```

Restart the computer.

After restart:

* Search for Ubuntu
* Open it
* Create username/password

---

## Verify WSL2

Inside Ubuntu:

```bash
uname -a
```

If Ubuntu opens successfully, WSL2 is working.

---

# PART 2 — PROJECT SETUP

## Create Project Folder

In Windows:

```text
D:\websockets
```

Open this folder in VS Code.

---

## Install Node.js Packages

Inside terminal:

```bash
npm init -y
npm install ws redis
```

Packages:

* ws → WebSocket library
* redis → Redis client for Node.js

---

# PART 3 — BUILDING THE FIRST WEBSOCKET SERVER

Create:

```text
index.js
```

Code:

```javascript
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});
```

---

## Test WebSocket Server

Run:

```bash
node index.js
```

Open 2 Postman WebSocket tabs:

```text
ws://localhost:8080
```

Send messages.

You should see logs in terminal.

---

# PART 4 — BROADCASTING MESSAGES TO ALL CLIENTS

Update `index.js`:

```javascript
import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    console.log(data.toString());

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });
});
```

Now:

* multiple clients receive messages
* real-time chat behavior works

---

# PART 5 — INSTALLING REDIS IN WSL UBUNTU

## Install Redis

Inside Ubuntu:

```bash
sudo apt update
sudo apt install redis-server -y
```

---

## Start Redis

Run:

```bash
redis-server
```

If Redis is already running:

```text
bind: Address already in use
```

That means Redis is active.

---

## Verify Redis

Run:

```bash
redis-cli ping
```

Expected output:

```text
PONG
```

---

# PART 6 — CONNECTING NODE.JS TO REDIS

Update `index.js`:

```javascript
import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";

const pub = createClient();
const sub = createClient();

await pub.connect();
await sub.connect();

const wss = new WebSocketServer({ port: 8080 });

await sub.subscribe("chat", (message) => {
  console.log("From Redis:", message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (data) => {
    const parsed = JSON.parse(data.toString());

    const message = {
      user: parsed.user,
      text: parsed.text,
      timestamp: new Date().toISOString()
    };

    await pub.publish("chat", JSON.stringify(message));
  });
});
```

---

## Important Redis Concept

Two Redis clients are used:

```javascript
const pub = createClient();
const sub = createClient();
```

Reason:

* one connection publishes
* one connection subscribes

Redis Pub/Sub should not share one connection for both.

---

# PART 7 — USING WSL INSIDE VS CODE

## Problem Encountered

Python packages installed inside WSL were not recognized by VS Code.

Reason:

VS Code was using Windows Python instead of WSL Python.

---

## Fix

Install VS Code WSL extension.

Then:

```text
Ctrl + Shift + P
→ WSL: Reopen Folder in WSL
```

Now VS Code terminal becomes:

```text
user@Zyiar:/mnt/d/websockets$
```

This means VS Code is now running inside Ubuntu.

---

# PART 8 — PYTHON VIRTUAL ENVIRONMENT (venv)

## Why venv?

Modern Ubuntu blocks global pip installs.

Use isolated Python environments instead.

---

## Install venv support

```bash
sudo apt install python3-venv -y
```

---

## Create venv

Inside project folder:

```bash
python3 -m venv venv
```

---

## Activate venv

```bash
source venv/bin/activate
```

Terminal becomes:

```text
(venv) user@Zyiar:/mnt/d/websockets$
```

---

## Install Python Redis Client

```bash
python -m pip install redis
```

---

## Create requirements.txt

```bash
pip freeze > requirements.txt
```

---

# PART 9 — PYTHON REDIS CONSUMER

Create:

```text
consumer.py
```

Code:

```python
import redis
import json

r = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)

pubsub = r.pubsub()
pubsub.subscribe("chat")

print("Listening for messages...")

for message in pubsub.listen():
    if message["type"] == "message":
        data = json.loads(message["data"])

        print("Received:")
        print("User:", data["user"])
        print("Text:", data["text"])
```

---

## Run Services

Terminal 1:

```bash
node index.js
```

Terminal 2:

```bash
source venv/bin/activate
python consumer.py
```

---

## Result

Flow now works:

```text
Postman
  ↓
Node.js
  ↓
Redis
  ↓
Python
```

---

# PART 10 — INSTALLING POSTGRESQL

## Install PostgreSQL

Inside Ubuntu:

```bash
sudo apt install postgresql postgresql-contrib -y
```

---

## Start PostgreSQL

```bash
sudo service postgresql start
```

---

## Enter PostgreSQL Shell

```bash
sudo -u postgres psql
```

Prompt becomes:

```text
postgres=#
```

---

# PART 11 — DATABASE SETUP

## Create Database

```sql
CREATE DATABASE chatapp;
```

---

## Create User

```sql
CREATE USER chatuser WITH PASSWORD 'mypassword';
```

---

## Grant Database Access

```sql
GRANT ALL PRIVILEGES ON DATABASE chatapp TO chatuser;
```

Exit:

```sql
\q
```

---

# PART 12 — CREATE MESSAGES TABLE

Reconnect:

```bash
sudo -u postgres psql -d chatapp
```

Create table:

```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);
```

---

## Important Timestamp Concept

Two timestamps exist:

### created_at

When PostgreSQL stored the row.

### sent_at

When client originally sent message.

They may differ because distributed systems can have delays.

---

# PART 13 — INSTALL POSTGRESQL PYTHON DRIVER

Inside activated venv:

```bash
python -m pip install psycopg2-binary
```

Update requirements:

```bash
pip freeze > requirements.txt
```

---

# PART 14 — PYTHON CONSUMER + POSTGRESQL

Update `consumer.py`:

```python
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
```

---

# PART 15 — FIXING POSTGRESQL PERMISSIONS

Problem encountered:

```text
permission denied for table messages
```

Reason:

Table was created by `postgres`, not `chatuser`.

---

## Fix Permissions

Open PostgreSQL:

```bash
sudo -u postgres psql -d chatapp
```

Grant table permissions:

```sql
GRANT ALL PRIVILEGES ON TABLE messages TO chatuser;
```

Grant sequence permissions:

```sql
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO chatuser;
```

Exit:

```sql
\q
```

---

# PART 16 — VERIFY DATA STORAGE

Open PostgreSQL:

```bash
sudo -u postgres psql -d chatapp
```

Run:

```sql
SELECT * FROM messages;
```

Expected output:

```text
 id | username |    message     |         created_at         |       sent_at
----+----------+----------------+----------------------------+----------------------------
  1 | Alice    | Hello everyone | 2026-05-14 17:14:47.067969 | 2026-05-14 17:14:47.067
```

---

# FINAL ARCHITECTURE

```text
Postman / Client
        ↓
Node.js WebSocket Server
        ↓
Redis Pub/Sub
        ↓
Python Consumer Service
        ↓
PostgreSQL Database
```

---

# WHAT EACH COMPONENT DOES

## Node.js

Responsibilities:

* Handle WebSocket connections
* Real-time communication
* Publish messages to Redis
* Broadcast messages to clients

---

## Redis

Responsibilities:

* Message broker
* Pub/Sub event system
* Decouples services

---

## Python

Responsibilities:

* Consume Redis events
* Process messages
* Save data to database
* Later:

  * moderation
  * analytics
  * notifications

---

## PostgreSQL

Responsibilities:

* Persistent storage
* Chat history
* Offline message retrieval

---

# IMPORTANT CONCEPTS LEARNED

## 1. WebSockets

Persistent real-time connections.

Server pushes data instantly.

---

## 2. Redis Pub/Sub

Services communicate through events instead of direct calls.

---

## 3. Distributed Systems

Different services:

* Node.js
* Redis
* Python
* PostgreSQL

work independently.

---

## 4. Virtual Environments

Python dependencies should be isolated with `venv`.

---

## 5. WSL2

Provides Linux backend environment on Windows.

---

## 6. Data Persistence

Messages survive server restarts because PostgreSQL stores them.

---

# COMMON COMMANDS

## Activate Python venv

```bash
source venv/bin/activate
```

---

## Run Node.js Server

```bash
node index.js
```

---

## Run Python Consumer

```bash
python consumer.py
```

---

## Start PostgreSQL

```bash
sudo service postgresql start
```

---

## Open PostgreSQL

```bash
sudo -u postgres psql -d chatapp
```

---

## Check Redis

```bash
redis-cli ping
```

---

# CURRENT PROJECT STRUCTURE

```text
websockets/
│
├── index.js
├── consumer.py
├── package.json
├── requirements.txt
├── venv/
└── node_modules/
```

---

# CURRENT STATUS

The system now supports:

* WebSocket real-time communication
* Multiple clients
* Redis Pub/Sub
* Python worker service
* PostgreSQL persistence
* Structured JSON messages
* Timestamp tracking

This is now a real distributed backend architecture foundation.
