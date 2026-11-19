
from flask import Flask, request, jsonify
from flask_cors import CORS
from pypdf import PdfReader
from io import BytesIO

from data import (
    initialize_database,
    save_resume_analysis,
    get_resume_analyses
)

app = Flask(__name__)
CORS(app)

initialize_database()

skills_list = [
    "HTML", "CSS", "JavaScript", "React",
    "Python", "Java", "SQL", "Flask",
    "Django", "Node.js", "Bootstrap",
    "Tailwind CSS", "Git", "MySQL"
]


@app.route("/")
def home():
    return jsonify({
        "message": "CareerPrep AI Backend is Running"
    })


# Resume Analysis API
@app.route("/api/analyze-resume", methods=["POST"])
def analyze_resume():

    try:
        if "resume" not in request.files:
            return jsonify({"error": "Please upload a resume"}), 400

        file = request.files["resume"]

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Only PDF files are allowed"}), 400

        job_role = request.form.get("jobRole", "")
        job_description = request.form.get("jobDescription", "")

        pdf_data = BytesIO(file.read())
        reader = PdfReader(pdf_data)

        resume_text = ""

        for page in reader.pages:
            resume_text += page.extract_text() or ""

        if not resume_text.strip():
            return jsonify({
                "error": "Could not extract text from PDF"
            }), 400

        resume_lower = resume_text.lower()

        found_skills = []

        for skill in skills_list:
            if skill.lower() in resume_lower:
                found_skills.append(skill)

        if job_description.strip():

            keywords = [
                word.lower()
                for word in job_description.split()
                if len(word) > 3
            ]

            unique_keywords = set(keywords)

            matched_keywords = [
                word for word in unique_keywords
                if word in resume_lower
            ]

            total_keywords = len(unique_keywords)

            if total_keywords > 0:
                score = round(
                    len(matched_keywords) / total_keywords * 100
                )
            else:
                score = 0

        else:
            score = round(
                len(found_skills) / len(skills_list) * 100
            )

        missing_skills = [
            skill for skill in skills_list
            if skill not in found_skills
        ]

        resume_id = save_resume_analysis(
            file.filename,
            job_role,
            score,
            found_skills,
            missing_skills,
            len(resume_text)
        )

        return jsonify({
            "success": True,
            "resumeId": resume_id,
            "jobRole": job_role,
            "atsScore": score,
            "foundSkills": found_skills,
            "missingSkills": missing_skills,
            "totalSkills": len(found_skills),
            "resumeLength": len(resume_text),
            "message": "Resume analysis completed and saved"
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500


# Dashboard API - Fetch Resume History
@app.route("/api/resumes", methods=["GET"])
def get_resumes():

    try:
        resumes = get_resume_analyses()

        return jsonify({
            "success": True,
            "totalResumes": len(resumes),
            "resumes": resumes
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
