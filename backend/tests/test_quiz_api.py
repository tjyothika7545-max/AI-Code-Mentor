def test_quiz_generation(client):
    res = client.post("/api/quiz/generate", json={
        "topic": "Recursion",
        "language": "python",
        "difficulty": "intermediate",
        "count": 3
    })
    assert res.status_code == 201
    data = res.get_json()
    assert "quiz" in data
    quiz = data["quiz"]
    assert quiz["topic"] == "Recursion"
    assert len(quiz["questions"]) == 3
    # Verify answers are hidden in initial output
    assert "correct_option" not in quiz["questions"][0]

def test_quiz_submission(client):
    # Generate quiz first
    gen_res = client.post("/api/quiz/generate", json={
        "topic": "Data Structures",
        "language": "python",
        "difficulty": "beginner",
        "count": 2
    })
    quiz_id = gen_res.get_json()["quiz"]["id"]

    # Submit answers
    submit_res = client.post("/api/quiz/submit", json={
        "quiz_id": quiz_id,
        "answers": {
            "1": "C",
            "2": "B"
        }
    })
    assert submit_res.status_code == 200
    data = submit_res.get_json()
    assert data["quiz_id"] == quiz_id
    assert "score" in data
    assert "total" in data
    assert data["total"] == 2
    assert "feedback" in data
    assert len(data["feedback"]) == 2
    assert "explanation" in data["feedback"][0]

def test_quiz_history(client):
    res = client.get("/api/quiz/history")
    assert res.status_code == 200
    data = res.get_json()
    assert "quizzes" in data
