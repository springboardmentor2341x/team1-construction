Role	Email	Password
Administrator	admin@buildtrack.com	Admin@1234
Project Manager	pm@buildtrack.com	Admin@1234
Site Engineer	engineer@buildtrack.com	Admin@1234
Contractor	contractor@buildtrack.com	Admin@1234
Worker	worker@buildtrack.com	Admin@1234
Client	client@buildtrack.com	Admin@1234

Role	Name	Email	Employee ID
Administrator	Alex Vance	admin@buildtrack.com	ADM-1001
Project Manager	Sarah Jenkins	pm@buildtrack.com	PM-2004
Site Engineer	David Miller	engineer@buildtrack.com	ENG-3012
Contractor	Marcus Brody	contractor@buildtrack.com	CON-4022
Worker	Robert Thorne	worker@buildtrack.com	WRK-5099
Client	Apex Real Estate	client@buildtrack.com	CLI-
Restart the backend so the new CORS config takes effect (stop the current process, then run):

cd backend
uvicorn main:app --reload


cd frontend
npx ng serve
