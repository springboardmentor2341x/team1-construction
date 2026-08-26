from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.project import Project

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, project_id: str) -> Optional[Project]:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def get_by_code(self, project_code: str) -> Optional[Project]:
        return self.db.query(Project).filter(Project.project_code == project_code).first()

    def get_all(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Project]:
        query = self.db.query(Project)
        if search:
            q = f"%{search.lower()}%"
            query = query.filter(
                (Project.project_name.ilike(q)) |
                (Project.project_code.ilike(q)) |
                (Project.client_name.ilike(q))
            )
        if category:
            query = query.filter(Project.category == category)
        if priority:
            query = query.filter(Project.priority == priority)
        if status:
            query = query.filter(Project.status == status)

        return query.order_by(Project.created_at.desc()).all()

    def create(self, project: Project) -> Project:
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def update(self, project: Project) -> Project:
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project: Project) -> None:
        self.db.delete(project)
        self.db.commit()
