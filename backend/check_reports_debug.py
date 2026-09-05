import main
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.project import Project
from app.core.security import create_access_token

client = TestClient(main.app)
db = main.SessionLocal()
u = db.query(User).filter(User.email == 'admin@buildtrack.com').first()
projects = db.query(Project).all()

print(f"Total projects in DB: {len(projects)}")
for p in projects:
    print(f"Project ID: {p.id} | Name: {p.project_name} ({p.project_code})")
    token = create_access_token(u.id, u.role_rel.name if u.role_rel else "Administrator")
    headers = {"Authorization": f"Bearer {token}"}
    
    for endpoint in ['progress', 'resources', 'workforce', 'procurement', 'budget']:
        res = client.get(f"/api/v1/reports/projects/{p.id}/{endpoint}", headers=headers)
        print(f"   -> Endpoint '{endpoint}': Status {res.status_code}")
        if res.status_code != 200:
            print(f"      Error detail: {res.text}")
