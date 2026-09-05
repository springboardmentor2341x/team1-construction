import main
from fastapi.testclient import TestClient
from app.models.user import User
from app.core.security import create_access_token

client = TestClient(main.app)
db = main.SessionLocal()
users = db.query(User).all()

print("=" * 60)
print("  CHECKING NOTIFICATIONS FOR ALL USERS VIA FASTAPI API")
print("=" * 60)

for u in users:
    role_name = u.role_rel.name if u.role_rel else "No Role"
    token = create_access_token(u.id, role_name)
    headers = {"Authorization": f"Bearer {token}"}
    
    cnt_res = client.get("/api/v1/notifications/unread-count", headers=headers).json()
    items_res = client.get("/api/v1/notifications", headers=headers).json()
    
    print(f"User: {u.email} ({role_name})")
    print(f" -> Unread Count API Response: {cnt_res}")
    print(f" -> Total Notifications List Count: {len(items_res)}")
    for item in items_res:
        print(f"     - Title: {item.get('title')} | Category: {item.get('category')} | isRead: {item.get('isRead')}")
    print("-" * 60)
