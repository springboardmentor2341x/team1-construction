import sys
import json
from fastapi.testclient import TestClient

sys.path.insert(0, '.')
from main import app, seed_database
from app.core.security import create_access_token
from app.database.session import SessionLocal
from app.models.user import User

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("         MODULE 3 BACKEND VERIFICATION TEST       ")
    print("==================================================")

    # Seed fresh database
    seed_database()
    db = SessionLocal()

    admin_user = db.query(User).filter(User.email == "admin@buildtrack.com").first()
    engineer_user = db.query(User).filter(User.email == "engineer@buildtrack.com").first()
    client_user = db.query(User).filter(User.email == "client@buildtrack.com").first()

    assert admin_user and engineer_user and client_user, "Seeded users not found!"

    # 1. Auth Tokens
    admin_token = create_access_token(admin_user.id, "Administrator")
    se_token = create_access_token(engineer_user.id, "Site Engineer")
    client_token = create_access_token(client_user.id, "Client")
    db.close()

    headers_se = {"Authorization": f"Bearer {se_token}"}
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    headers_client = {"Authorization": f"Bearer {client_token}"}

    # Fetch projects
    r = client.get("/api/v1/projects", headers=headers_se)
    assert r.status_code == 200, f"Get projects failed: {r.status_code} {r.text}"
    projects = r.json()
    assert len(projects) > 0, "No projects found"
    project_id = projects[0]["id"]
    print(f"[PASS] Projects endpoint OK: Found {len(projects)} projects. Testing with ID: {project_id}")

    # 2. Daily Progress Report Creation (with workerCount & workerAbsent)
    daily_payload = {
        "projectId": project_id,
        "reportDate": "2026-08-10",
        "progressCategory": "Structural Work",
        "workCompleted": "Level 6 column concrete pour completed and cured.",
        "progressPercentage": 60,
        "contractor": "Marcus Brody",
        "workerAttendance": "Day Shift",
        "workerCount": 45,
        "workerAbsent": 3,
        "workerHours": 360.0,
        "costIncurred": 2500.0,
        "machineryUsed": "Concrete Pump Truck CP-8",
        "materialsConsumed": "Ready-mix concrete (50 m3)",
        "weatherConditions": "Sunny",
        "safetyObservations": "Full PPE observed.",
        "qualityInspectionRemarks": "Slump test passed.",
        "delays": False,
        "comments": "Automated verification test daily report.",
        "photographUrls": ["https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500"]
    }
    r = client.post("/api/v1/site-progress/daily-reports", json=daily_payload, headers=headers_se)
    assert r.status_code == 201, f"Create daily report failed: {r.status_code} {r.text}"
    daily_report = r.json()
    report_id = daily_report["id"]
    assert daily_report["workerCount"] == 45
    assert daily_report["workerAbsent"] == 3
    assert len(daily_report["photographs"]) == 1
    print(f"[PASS] 1. Daily Progress Report Create OK: Report ID = {report_id}")

    # 3. Daily Progress Report Update
    update_payload = {
        "workCompleted": "Level 6 column concrete pour completed and cured. Rebar inspected.",
        "progressPercentage": 65
    }
    r = client.put(f"/api/v1/site-progress/daily-reports/{report_id}", json=update_payload, headers=headers_se)
    assert r.status_code == 200, f"Update daily report failed: {r.status_code} {r.text}"
    updated_daily = r.json()
    assert updated_daily["progressPercentage"] == 65
    print("[PASS] 1. Daily Progress Report Update OK")

    # 4. Retrieve Daily Reports History
    r = client.get(f"/api/v1/site-progress/daily-reports?projectId={project_id}", headers=headers_se)
    assert r.status_code == 200
    reports = r.json()
    assert any(rep["id"] == report_id for rep in reports)
    print(f"[PASS] 1. Daily Reports Retrieve History OK: Found {len(reports)} reports")

    # 5. Weekly Progress Report Creation & Retrieval
    weekly_payload = {
        "projectId": project_id,
        "weekStartDate": "2026-08-10",
        "weekEndDate": "2026-08-16",
        "weeklyProgressPercentage": 65,
        "safetyIncidents": "No safety incidents reported.",
        "overallStatus": "On Track"
    }
    r = client.post("/api/v1/site-progress/weekly-reports", json=weekly_payload, headers=headers_admin)
    assert r.status_code == 201, f"Create weekly report failed: {r.status_code} {r.text}"
    weekly_report = r.json()
    assert weekly_report["workerHours"] >= 360.0
    print(f"[PASS] 2. Weekly Progress Report Create OK: ID = {weekly_report['id']}, Auto Worker Hours = {weekly_report['workerHours']}")

    r = client.get(f"/api/v1/site-progress/weekly-reports?projectId={project_id}", headers=headers_client)
    assert r.status_code == 200
    print("[PASS] 2. Weekly Progress Report Retrieve OK")

    # 6. Milestone Tracking & Manual Verification Update
    r = client.get(f"/api/v1/site-progress/milestone-tracking?projectId={project_id}", headers=headers_se)
    assert r.status_code == 200
    milestones = r.json()
    print(f"[PASS] 3. Milestone Tracking Retrieve OK: Found {len(milestones)} milestones")

    if milestones:
        ms_id = milestones[0]["id"]
        ms_update = {
            "completionPercentage": 100,
            "status": "Completed",
            "actualCompletionDate": "2026-08-10"
        }
        r = client.put(f"/api/v1/site-progress/milestone-tracking/{ms_id}", json=ms_update, headers=headers_se)
        assert r.status_code == 200, f"Update milestone failed: {r.status_code} {r.text}"
        updated_ms = r.json()
        assert updated_ms["status"] == "Completed"
        assert updated_ms["actualCompletionDate"] == "2026-08-10"
        print(f"[PASS] 3. Milestone Verification & Update PUT API OK: Milestone {ms_id} set to Completed with date")

    # 7. Automatic Completion Percentage
    r = client.get(f"/api/v1/site-progress/completion-status?projectId={project_id}", headers=headers_se)
    assert r.status_code == 200
    comp = r.json()
    assert len(comp) > 0
    print(f"[PASS] 4. Automatic Completion Percentage OK: Overall = {comp[0]['overallCompletionPercentage']}%")

    # 8. Delay Tracking Creation & Update (with remarks)
    delay_payload = {
        "projectId": project_id,
        "reason": "Heavy rainfall delayed concrete curing",
        "durationDays": 2,
        "affectedWorkCategory": "Structural Work",
        "impactOnTimeline": "2-day slip on Level 6 slab pour",
        "reportedDate": "2026-08-10",
        "remarks": "Additional tarp covering deployed; pump postponed.",
        "status": "Open"
    }
    r = client.post("/api/v1/site-progress/delays", json=delay_payload, headers=headers_se)
    assert r.status_code == 201, f"Create delay failed: {r.status_code} {r.text}"
    delay_rec = r.json()
    delay_id = delay_rec["id"]
    assert delay_rec["remarks"] == "Additional tarp covering deployed; pump postponed."
    print(f"[PASS] 5. Delay Tracking Create OK (with remarks): Delay ID = {delay_id}")

    delay_update = {
        "remarks": "Mitigated with night shift overtime. Resolved.",
        "status": "Resolved"
    }
    r = client.put(f"/api/v1/site-progress/delays/{delay_id}", json=delay_update, headers=headers_se)
    assert r.status_code == 200
    assert r.json()["status"] == "Resolved"
    assert r.json()["remarks"] == "Mitigated with night shift overtime. Resolved."
    print("[PASS] 5. Delay Tracking Update & Resolve OK")

    # 9. Site Activity Log Creation & Update (all 14 event types supported)
    act_payload = {
        "projectId": project_id,
        "activityDate": "2026-08-10",
        "activityTime": "09:30",
        "description": "Government structural safety audit inspection conducted.",
        "eventType": "Government Inspection",
        "responsiblePerson": "Inspector Alex Vance"
    }
    r = client.post("/api/v1/site-progress/activity-logs", json=act_payload, headers=headers_se)
    assert r.status_code == 201, f"Create site activity log failed: {r.status_code} {r.text}"
    log_rec = r.json()
    log_id = log_rec["id"]
    assert log_rec["eventType"] == "Government Inspection"
    print(f"[PASS] 6. Site Activity Log Create OK: Log ID = {log_id}")

    act_update = {
        "description": "Government structural safety audit inspection conducted. Certificate issued."
    }
    r = client.put(f"/api/v1/site-progress/activity-logs/{log_id}", json=act_update, headers=headers_se)
    assert r.status_code == 200
    print("[PASS] 6. Site Activity Log Update OK")

    # 10. Progress Photographs Retrieval
    r = client.get(f"/api/v1/site-progress/photographs?reportId={report_id}", headers=headers_se)
    assert r.status_code == 200
    photos = r.json()
    assert len(photos) >= 1
    print(f"[PASS] 7. Progress Photographs Retrieval OK: Found {len(photos)} photo(s)")

    # 11. Work Completion Dashboard
    r = client.get(f"/api/v1/site-progress/dashboard?projectId={project_id}", headers=headers_client)
    assert r.status_code == 200
    dash = r.json()
    assert dash["projectId"] == project_id
    print(f"[PASS] Work Completion Dashboard API OK")

    print("==================================================")
    print("     ALL MODULE 3 BACKEND TESTS PASSED (100%)    ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
