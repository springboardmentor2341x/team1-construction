# Fix Frontend Data Not Storing in PostgreSQL Backend - COMPLETED

## All Tasks Completed:
- [x] 1. Add `address` field to `backend/models/user.py`
- [x] 2. Add `address` field to `backend/schemas/auth.py` RegisterRequest
- [x] 3. Update `backend/routes/auth.py` - register endpoint handles address, added `PUT /auth/profile` endpoint
- [x] 4. Create `backend/.env` with PostgreSQL DATABASE_URL and SECRET_KEY (password: postgres123)
- [x] 5. Created PostgreSQL database `buildtrack`
- [x] 6. Fix `frontend/login/login.js` - Added fetch API call to backend, stores token + profile, redirects
- [x] 7. Fix `frontend/login.js` - Added fetch API call to backend, stores token + profile, redirects
- [x] 8. Fix `frontend/Profile Page/profile.js` - Fetches profile from `/auth/me` API, falls back to localStorage
- [x] 9. Fix `frontend/Profile Page/Edit/edit.js` - Saves profile to backend `/auth/profile` API
- [x] 10. Fix `frontend/register/register.js` - Sends address field to backend
- [x] 11. ✅ TESTED: Registration stores data in PostgreSQL (user_id: 1 returned)
- [x] 12. ✅ TESTED: Login returns JWT token successfully
- [x] 13. ✅ TESTED: Profile retrieval from `/auth/me` returns all fields including address
python -m http.server 8080
## How to run:
1. Backend: `cd backend && python -m uvicorn app:app --reload --port 8000`
2. Frontend: Open any HTML file in browser (e.g., `login/login.html`)
Register: http://127.0.0.1:5500/register/register.html
Login: http://127.0.0.1:5500/login/login.html
Profile: http://127.0.0.1:5500/Profile%20Page/Profile.html
All frontend data will now store in PostgreSQL backend. 