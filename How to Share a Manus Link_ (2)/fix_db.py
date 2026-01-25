import mysql.connector
import os

db_url = "mysql://hzCbMda76tmFdt4.root:layaS4xN7UNF3e9u87Zt@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/KD8igV5APKrQwmz3rzYZ6D?ssl=true"

# Parse the URL
# mysql://user:password@host:port/database?ssl=true
url_parts = db_url.replace("mysql://", "").split("@")
user_pass = url_parts[0].split(":")
host_port_db = url_parts[1].split("/")
host_port = host_port_db[0].split(":")
database = host_port_db[1].split("?")[0]

config = {
    'user': user_pass[0],
    'password': user_pass[1],
    'host': host_port[0],
    'port': int(host_port[1]),
    'database': database,
    'ssl_disabled': False,
    'ssl_ca': None, # mysql-connector-python handles this if ssl_disabled is False
}

try:
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    
    print("Connected to TiDB successfully!")
    
    # Check users table structure
    cursor.execute("DESCRIBE users")
    columns = cursor.fetchall()
    print("\nCurrent users table structure:")
    for col in columns:
        print(col)
        
    # The error was: insert into `users` (...) values (...) on duplicate key update 
    # with an empty update list or syntax error.
    # Let's verify if we can run a manual upsert with a dummy field.
    
    test_open_id = "google_test_123"
    upsert_query = """
    INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn)
    VALUES (%s, %s, %s, %s, %s, NOW())
    ON DUPLICATE KEY UPDATE 
    lastSignedIn = VALUES(lastSignedIn),
    name = VALUES(name)
    """
    cursor.execute(upsert_query, (test_open_id, "Test User", "test@example.com", "google", "user"))
    conn.commit()
    print(f"\nSuccessfully upserted test user: {test_open_id}")
    
    # Clean up test user
    cursor.execute("DELETE FROM users WHERE openId = %s", (test_open_id,))
    conn.commit()
    print("Cleaned up test user.")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
