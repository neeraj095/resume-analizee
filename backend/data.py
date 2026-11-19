
import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "careerprep.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            job_role TEXT NOT NULL,
            ats_score INTEGER,
            found_skills TEXT,
            missing_skills TEXT,
            resume_length INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_role TEXT NOT NULL,
            category TEXT NOT NULL,
            total_questions INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            interview_id INTEGER,
            question TEXT NOT NULL,
            user_answer TEXT NOT NULL,
            feedback TEXT,
            score INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (interview_id) REFERENCES interviews(id)
        )
    """)

    conn.commit()
    conn.close()

    print("Database tables created successfully!")


def save_resume_analysis(
    filename,
    job_role,
    ats_score,
    found_skills,
    missing_skills,
    resume_length
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO resumes (
            filename,
            job_role,
            ats_score,
            found_skills,
            missing_skills,
            resume_length
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        filename,
        job_role,
        ats_score,
        json.dumps(found_skills),
        json.dumps(missing_skills),
        resume_length
    ))

    resume_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return resume_id


# Fetch all saved resume analyses
def get_resume_analyses():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM resumes
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    resumes = []

    for row in rows:
        resume = dict(row)

        resume["found_skills"] = json.loads(
            resume["found_skills"] or "[]"
        )

        resume["missing_skills"] = json.loads(
            resume["missing_skills"] or "[]"
        )

        resumes.append(resume)

    return resumes


def create_interview(job_role, category, total_questions):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO interviews (
            job_role,
            category,
            total_questions
        )
        VALUES (?, ?, ?)
    """, (job_role, category, total_questions))

    interview_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return interview_id


def save_interview_answer(
    interview_id,
    question,
    user_answer,
    feedback=None,
    score=None
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO answers (
            interview_id,
            question,
            user_answer,
            feedback,
            score
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        interview_id,
        question,
        user_answer,
        feedback,
        score
    ))

    conn.commit()
    conn.close()


if __name__ == "__main__":
    initialize_database()
