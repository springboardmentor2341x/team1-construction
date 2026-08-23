import sys
import os
from fastapi.testclient import TestClient


sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from app.core.config import settings
from app.database.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.project import Project
from app.models.shift import ShiftModel
from app.models.workforce import WorkforceCategory, Worker, WorkerProjectAssignment, AttendanceModel, WorkforcePayroll
from app.core.security import create_access_token

client = TestClient(app)


def get_auth_headers(email: str = "admin@buildtrack.com") -> dict:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            token = create_access_token(subject="test-admin-id", role="Administrator")
        else:
            role_name = user.role_rel.name if user.role_rel else "Administrator"
            token = create_access_token(subject=user.id, role=role_name)
        return {"Authorization": f"Bearer {token}"}
    finally:
        db.close()



def test_workforce_categories():
    headers = get_auth_headers("admin@buildtrack.com")
    res = client.get("/api/v1/workforce/categories", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    categories = res.json()
    assert isinstance(categories, list)
    assert len(categories) >= 6
    names = [c["name"] for c in categories]
    assert "Engineers" in names
    assert "Skilled Workers" in names
    assert "Supervisors" in names


def test_worker_crud_and_validation():
    headers = get_auth_headers("admin@buildtrack.com")
    db = SessionLocal()
    try:
        cat = db.query(WorkforceCategory).filter(WorkforceCategory.name == "Skilled Workers").first()
        assert cat is not None
        cat_id = cat.id
    finally:
        db.close()

    # 1. Create worker
    w_data = {
        "workerId": "WRK-TEST-999",
        "workerName": "Test Mason Worker",
        "contactInformation": "+1 555-9999",
        "workforceCategoryId": cat_id,
        "contractorId": "",  # Empty string testing foreign key sanitization
        "skillOrWorkType": "Structural Masonry",
        "joiningDate": "2026-08-01",
        "workerStatus": "Active",
        "payRate": 700.0
    }
    res = client.post("/api/v1/workforce/workers", json=w_data, headers=headers)
    assert res.status_code == 201, f"Create worker failed: {res.text}"
    worker = res.json()
    assert worker["workerId"] == "WRK-TEST-999"
    assert worker["contractorId"] is None
    w_db_id = worker["id"]


    # 2. Duplicate worker ID test
    res_dup = client.post("/api/v1/workforce/workers", json=w_data, headers=headers)
    assert res_dup.status_code == 400
    assert "already registered" in res_dup.json()["detail"]

    # 3. Get worker by ID
    res_get = client.get(f"/api/v1/workforce/workers/{w_db_id}", headers=headers)
    assert res_get.status_code == 200
    assert res_get.json()["workerId"] == "WRK-TEST-999"

    # 4. Search and filter workers
    res_search = client.get("/api/v1/workforce/workers?search=Test%20Mason&page=1&pageSize=10", headers=headers)
    assert res_search.status_code == 200
    paged = res_search.json()
    assert paged["total"] >= 1
    assert paged["items"][0]["workerId"] == "WRK-TEST-999"

    # 5. Update worker status
    res_status = client.put(f"/api/v1/workforce/workers/{w_db_id}/status", json={"workerStatus": "On Leave"}, headers=headers)
    assert res_status.status_code == 200
    assert res_status.json()["workerStatus"] == "On Leave"


def test_bulk_worker_import():
    headers = get_auth_headers("admin@buildtrack.com")
    bulk_payload = {
        "workers": [
            {
                "workerId": "WRK-BULK-001",
                "workerName": "Bulk Carpenter",
                "categoryName": "Skilled Workers",
                "skillOrWorkType": "Carpentry",
                "joiningDate": "2026-08-01",
                "payRate": 650.0
            },
            {
                "workerId": "WRK-BULK-002",
                "workerName": "Bulk Plumber",
                "categoryName": "Skilled Workers",
                "skillOrWorkType": "Plumbing",
                "joiningDate": "2026-08-01",
                "payRate": 600.0
            }
        ]
    }
    res = client.post("/api/v1/workforce/workers/bulk-import", json=bulk_payload, headers=headers)
    assert res.status_code == 200, f"Bulk import failed: {res.text}"
    import_result = res.json()
    assert import_result["successCount"] == 2
    assert import_result["failureCount"] == 0
    assert len(import_result["createdWorkers"]) == 2


def test_workforce_allocation_and_transfer_history():
    headers = get_auth_headers("admin@buildtrack.com")
    db = SessionLocal()
    try:
        w = db.query(Worker).first()
        projs = db.query(Project).all()
        if len(projs) < 2:
            p1 = db.query(Project).first()
            p2 = p1
        else:
            p1, p2 = projs[0], projs[1]
        assert w is not None and p1 is not None
        w_id = w.id
        p1_id = p1.id
        p2_id = p2.id
    finally:
        db.close()


    # 1. Create Initial Assignment
    assign_req = {
        "workerId": w_id,
        "projectId": p1_id,
        "workActivity": "Foundation Masonry",
        "assignmentStartDate": "2026-01-01",
        "assignmentStatus": "Active"
    }
    res = client.post("/api/v1/workforce/assignments", json=assign_req, headers=headers)
    assert res.status_code == 201, f"Assignment failed: {res.text}"
    assign_1 = res.json()
    assign_1_id = assign_1["id"]

    # 2. Transfer Worker to Project 2
    transfer_req = {
        "newProjectId": p2_id,
        "newWorkActivity": "Structural Steel",
        "transferDate": "2026-04-01"
    }
    res_trans = client.post(f"/api/v1/workforce/assignments/{assign_1_id}/transfer", json=transfer_req, headers=headers)
    assert res_trans.status_code == 200, f"Transfer failed: {res_trans.text}"
    assign_2 = res_trans.json()
    assert assign_2["projectId"] == p2_id
    assert assign_2["assignmentStatus"] == "Active"

    # 3. Verify Assignment History preserving both records
    res_hist = client.get(f"/api/v1/workforce/assignments/history/{w_id}", headers=headers)
    assert res_hist.status_code == 200
    history = res_hist.json()
    assert len(history) >= 2
    statuses = [h["assignmentStatus"] for h in history]
    assert "Transferred" in statuses
    assert "Active" in statuses


def test_shift_creation_and_worker_assignment():
    headers = get_auth_headers("admin@buildtrack.com")
    db = SessionLocal()
    try:
        p = db.query(Project).first()
        w = db.query(Worker).first()
        p_id = p.id
        w_id = w.id
    finally:
        db.close()

    shift_payload = {
        "shiftName": "Night Pouring Shift",
        "startTime": "22:00",
        "endTime": "06:00",
        "projectId": p_id,
        "shiftDate": "2026-08-10",
        "shiftStatus": "Scheduled",
        "location": "Basement B2",
        "assignedWorkerIds": [w_id]
    }
    res = client.post("/api/v1/workforce/shifts", json=shift_payload, headers=headers)
    assert res.status_code == 201, f"Shift creation failed: {res.text}"
    s = res.json()
    assert s["shiftName"] == "Night Pouring Shift"
    assert s["assignedWorkerCount"] == 1


def test_attendance_and_shift_comparison():
    headers = get_auth_headers("admin@buildtrack.com")
    db = SessionLocal()
    try:
        w = db.query(Worker).filter(Worker.worker_id == "WRK-2026-002").first()
        if not w:
            w = db.query(Worker).first()
        p = db.query(Project).first()
        assert w is not None and p is not None
        w_id = w.id
        p_id = p.id

    finally:
        db.close()

    att_payload = {
        "workerId": w_id,
        "projectId": p_id,
        "date": "2026-08-15",
        "status": "Present",
        "checkIn": "08:00",
        "checkOut": "17:30",
        "remarks": "Formwork slab inspection"
    }
    res = client.post("/api/v1/workforce/attendance", json=att_payload, headers=headers)
    assert res.status_code == 201, f"Attendance creation failed: {res.text}"
    att = res.json()
    assert att["hoursWorked"] == 9.5
    assert att["overtimeHours"] == 1.5

    # Prevent duplicate attendance for same worker, project, date
    res_dup = client.post("/api/v1/workforce/attendance", json=att_payload, headers=headers)
    assert res_dup.status_code == 400

    # Test Attendance summary
    res_sum = client.get(f"/api/v1/workforce/attendance/summary?projectId={p_id}&attendanceDate=2026-08-15", headers=headers)
    assert res_sum.status_code == 200
    summary = res_sum.json()
    assert summary["presentWorkers"] >= 1


def test_payroll_monitoring_and_calculations():
    headers = get_auth_headers("admin@buildtrack.com")
    db = SessionLocal()
    try:
        w = db.query(Worker).first()
        p = db.query(Project).first()
        w_id = w.id
        p_id = p.id
    finally:
        db.close()

    payroll_payload = {
        "workerId": w_id,
        "projectId": p_id,
        "payPeriodStart": "2026-08-01",
        "payPeriodEnd": "2026-08-07",
        "payRate": 600.0,
        "workingDays": 6.0,
        "workingHours": 48.0,
        "overtimeHours": 4.0,
        "payrollStatus": "Pending"
    }
    res = client.post("/api/v1/workforce/payroll", json=payroll_payload, headers=headers)
    assert res.status_code == 201, f"Payroll generation failed: {res.text}"
    pay = res.json()
    # Expected pay = 6 * 600 + (4 * (600/8) * 1.5) = 3600 + 450 = 4050.0
    assert pay["estimatedPay"] == 4050.0
    pay_id = pay["id"]

    # Update payroll status to Approved
    res_update = client.put(f"/api/v1/workforce/payroll/{pay_id}/status?status=Approved", headers=headers)
    assert res_update.status_code == 200
    assert res_update.json()["payrollStatus"] == "Approved"


def test_workforce_dashboard_endpoint():
    headers = get_auth_headers("admin@buildtrack.com")
    res = client.get("/api/v1/workforce/dashboard", headers=headers)
    assert res.status_code == 200, f"Dashboard endpoint failed: {res.text}"
    stats = res.json()
    assert "totalWorkers" in stats
    assert "categoryBreakdown" in stats
    assert "projectBreakdown" in stats


def test_existing_modules_unbroken():
    headers = get_auth_headers("admin@buildtrack.com")
    # Module 1 Auth / Users
    res_users = client.get("/api/v1/users", headers=headers)
    assert res_users.status_code == 200

    # Module 2 Projects
    res_proj = client.get("/api/v1/projects", headers=headers)
    assert res_proj.status_code == 200

    # Module 3 Site Progress
    res_prog = client.get("/api/v1/site-progress/daily-reports", headers=headers)
    assert res_prog.status_code == 200

    # Module 4 Resources
    res_res = client.get("/api/v1/resources", headers=headers)
    assert res_res.status_code == 200

    # Module 5 Materials
    res_mat = client.get("/api/v1/materials", headers=headers)
    assert res_mat.status_code == 200


if __name__ == "__main__":
    from main import startup_event
    startup_event()
    print("Running Module 6 tests...")

    test_workforce_categories()
    print("  [PASS] test_workforce_categories")
    test_worker_crud_and_validation()
    print("  [PASS] test_worker_crud_and_validation")
    test_bulk_worker_import()
    print("  [PASS] test_bulk_worker_import")
    test_workforce_allocation_and_transfer_history()
    print("  [PASS] test_workforce_allocation_and_transfer_history")
    test_shift_creation_and_worker_assignment()
    print("  [PASS] test_shift_creation_and_worker_assignment")
    test_attendance_and_shift_comparison()
    print("  [PASS] test_attendance_and_shift_comparison")
    test_payroll_monitoring_and_calculations()
    print("  [PASS] test_payroll_monitoring_and_calculations")
    test_workforce_dashboard_endpoint()
    print("  [PASS] test_workforce_dashboard_endpoint")
    test_existing_modules_unbroken()
    print("  [PASS] test_existing_modules_unbroken")
    print("ALL MODULE 6 TESTS PASSED SUCCESSFULLY!")

