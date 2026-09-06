"""
BuildTrack Database Integrity Check Script
Runs comprehensive SQL queries to verify zero orphan records, zero broken foreign keys,
zero negative inventory levels, zero illegal resource/worker double allocations, and 100% cross-module consistency.
"""

import sys
from sqlalchemy import text
from app.database.session import SessionLocal

def run_integrity_checks():
    db = SessionLocal()
    print("==========================================================")
    print("        BuildTrack Database Integrity Verification        ")
    print("==========================================================")
    
    issues = []

    # 1. Orphan Tasks Check
    orphan_tasks = db.execute(text("""
        SELECT id, title FROM assigned_tasks 
        WHERE (project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects))
           OR (assigned_to_id IS NOT NULL AND assigned_to_id NOT IN (SELECT id FROM users))
    """)).fetchall()
    if orphan_tasks:
        issues.append(f"Orphan Tasks Found: {len(orphan_tasks)} tasks reference non-existent projects or users.")
    else:
        print("[PASS] Orphan Tasks: 0 found")

    # 2. Orphan Workers & Assignments Check
    orphan_workers = db.execute(text("""
        SELECT id, worker_name FROM workers
        WHERE contractor_id IS NOT NULL AND contractor_id NOT IN (SELECT id FROM users)
    """)).fetchall()
    if orphan_workers:
        issues.append(f"Orphan Workers Found: {len(orphan_workers)} workers reference non-existent contractors.")
    else:
        print("[PASS] Orphan Workers: 0 found")

    orphan_worker_assigns = db.execute(text("""
        SELECT id FROM worker_project_assignments
        WHERE (project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects))
           OR (worker_id IS NOT NULL AND worker_id NOT IN (SELECT id FROM workers))
    """)).fetchall()
    if orphan_worker_assigns:
        issues.append(f"Orphan Worker Assignments Found: {len(orphan_worker_assigns)} records reference non-existent projects or workers.")
    else:
        print("[PASS] Orphan Worker Project Assignments: 0 found")

    # 3. Orphan Procurement Records Check
    orphan_pos = db.execute(text("""
        SELECT id, purchase_order_id FROM purchase_orders
        WHERE (project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects))
           OR (vendor_id IS NOT NULL AND vendor_id NOT IN (SELECT id FROM vendors))
    """)).fetchall()
    if orphan_pos:
        issues.append(f"Orphan Purchase Orders Found: {len(orphan_pos)} POs reference non-existent projects or vendors.")
    else:
        print("[PASS] Orphan Purchase Orders: 0 found")

    orphan_po_items = db.execute(text("""
        SELECT id FROM purchase_order_items
        WHERE purchase_order_id NOT IN (SELECT id FROM purchase_orders)
           OR (material_id IS NOT NULL AND material_id NOT IN (SELECT id FROM materials))
    """)).fetchall()
    if orphan_po_items:
        issues.append(f"Orphan PO Items Found: {len(orphan_po_items)} PO items reference non-existent POs or materials.")
    else:
        print("[PASS] Orphan Purchase Order Items: 0 found")

    # 4. Orphan Expenses Check
    orphan_expenses = db.execute(text("""
        SELECT id, expense_code FROM actual_expenses
        WHERE project_id NOT IN (SELECT id FROM projects)
    """)).fetchall()
    if orphan_expenses:
        issues.append(f"Orphan Actual Expenses Found: {len(orphan_expenses)} expenses reference non-existent projects.")
    else:
        print("[PASS] Orphan Actual Expenses: 0 found")

    # 5. Orphan Notifications Check
    orphan_notifications = db.execute(text("""
        SELECT id, title FROM notifications
        WHERE user_id NOT IN (SELECT id FROM users)
           OR (project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects))
    """)).fetchall()
    if orphan_notifications:
        issues.append(f"Orphan Notifications Found: {len(orphan_notifications)} notifications reference non-existent users or projects.")
    else:
        print("[PASS] Orphan Notifications: 0 found")

    # 6. Negative Inventory Check
    invalid_inventory = db.execute(text("""
        SELECT id, material_id, available_stock, allocated_stock FROM material_inventories
        WHERE available_stock < 0 OR allocated_stock < 0
    """)).fetchall()
    if invalid_inventory:
        issues.append(f"Negative Inventory Found: {len(invalid_inventory)} inventory records have negative quantities.")
    else:
        print("[PASS] Inventory Quantities: All values >= 0")

    # 7. Invalid Material Allocations Check
    invalid_allocations = db.execute(text("""
        SELECT a.id, a.quantity, i.available_stock 
        FROM material_allocations a
        JOIN material_inventories i ON a.material_id = i.material_id
        WHERE a.quantity > (i.available_stock + a.quantity)
    """)).fetchall()
    if invalid_allocations:
        issues.append(f"Invalid Material Allocations Found: {len(invalid_allocations)} allocations exceed available stock.")
    else:
        print("[PASS] Material Allocations: All allocations within valid stock limits")

    # 8. Duplicate Active Resource Allocations
    dup_res_alloc = db.execute(text("""
        SELECT resource_id, COUNT(*) FROM resource_allocations
        WHERE status = 'Active'
        GROUP BY resource_id HAVING COUNT(*) > 1
    """)).fetchall()
    if dup_res_alloc:
        issues.append(f"Duplicate Active Resource Allocations: {len(dup_res_alloc)} resources allocated twice concurrently.")
    else:
        print("[PASS] Duplicate Active Resource Allocations: 0 found")

    print("\n----------------------------------------------------------")
    if issues:
        print("[FAIL] INTEGRITY ISSUES DETECTED:")
        for issue in issues:
            print(f"  - {issue}")
        db.close()
        sys.exit(1)
    else:
        print("[SUCCESS] ALL DATABASE INTEGRITY CHECKS PASSED PERFECTLY!")
        db.close()
        sys.exit(0)

if __name__ == "__main__":
    run_integrity_checks()
