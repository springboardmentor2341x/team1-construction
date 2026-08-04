# Fix: Frontend must require backend & remove dummy data

## Tasks
- [x] Add PATCH /tasks/{id} endpoint to backend (task status updates)
- [x] Add updateTaskStatus() to frontend TaskService
- [x] Wire my-tasks startTask/completeTask to backend
- [ ] Add backend health check endpoint
- [ ] Add checkBackend() to AuthService; gate login on backend connectivity
- [ ] Make isLoggedIn()/validateSession() strictly require backend verification
- [ ] Admin dashboard: remove hardcoded 128/94/$180M/65%/12; wire user counts
- [ ] Client dashboard: derive progress from real milestone data (remove hardcoded % map)
- [ ] Executive report: derive progress from real data (remove hardcoded % map)
- [ ] Analytics reports: derive progress from real data (remove hardcoded % map)
- [ ] Services: surface backend errors instead of silently returning [] where required
- [ ] Build/verify frontend and backend
