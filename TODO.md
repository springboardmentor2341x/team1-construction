# TODO: Fix Live Backend Data for Attendance, Notifications & Shifts

## Backend
- [ ] Add `attendance`, `notification` fields to existing models (expand placeholders.py)
- [ ] Create `ShiftModel` (backend/app/models/shift.py)
- [ ] Create `attendance.py` router (GET/POST /attendance)
- [ ] Create `notifications.py` router (GET /notifications, mark-read, read-all, clear)
- [ ] Create `shifts.py` router (GET/POST/PUT/DELETE /shifts)
- [ ] Register new routers & seed sample data in `backend/main.py`

## Frontend
- [ ] Create `attendance.service.ts`
- [ ] Create `notification.service.ts`
- [ ] Create `shift.service.ts`
- [ ] Wire `MyAttendanceComponent` to fetch from backend
- [ ] Wire `NotificationsComponent` to fetch from backend
- [ ] Wire `ShiftScheduleComponent` to fetch from backend

