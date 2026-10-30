"""
BiblioBox Database Quick Inspector
Run with: python check_db.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "library.db")

def check_database():
    if not os.path.exists(DB_PATH):
        print(f"[-] Database file not found at: {DB_PATH}")
        return

    print("=" * 60)
    print(f"   BIBLIOBOX DATABASE INSPECTOR")
    print(f"   Location: {os.path.abspath(DB_PATH)}")
    print("=" * 60)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Tables overview
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [t[0] for t in cursor.fetchall()]
    
    print("\n--- TABLES & RECORD COUNTS ---")
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table};")
        count = cursor.fetchone()[0]
        print(f"  * {table:<18} : {count} rows")

    # Users
    print("\n--- REGISTERED USERS (users table) ---")
    cursor.execute("SELECT id, name, email, phone_number, created_at FROM users ORDER BY created_at DESC;")
    users = cursor.fetchall()
    if users:
        print(f"  {'Name':<15} | {'Email':<28} | {'Phone Number':<15} | {'Created At'}")
        print("  " + "-" * 75)
        for u in users:
            uid, name, email, phone, created_at = u
            phone_str = phone if phone else "None"
            created_str = str(created_at)[:19] if created_at else "N/A"
            print(f"  {name:<15} | {email:<28} | {phone_str:<15} | {created_str}")
    else:
        print("  (No users found)")

    # Sample Library Items
    print("\n--- SAMPLE LIBRARY ITEMS (library_items table) ---")
    cursor.execute("SELECT title, item_type, genre, rating FROM library_items LIMIT 8;")
    items = cursor.fetchall()
    for item in items:
        title, itype, genre, rating = item
        icon = "[Book]" if itype == "book" else "[Movie]"
        print(f"  {icon:<8} {title:<25} ({genre}, Rating: {rating}/5)")

    conn.close()
    print("\n" + "=" * 60)

if __name__ == "__main__":
    check_database()
