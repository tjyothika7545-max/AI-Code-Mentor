import json

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
    assert "ai_configured" in data
    assert "model" in data

def test_analyze_validation_errors(client):
    # Missing task
    res = client.post("/api/analyze", json={"code": "print(1)"})
    assert res.status_code == 400
    assert "error" in res.get_json()

    # Invalid task
    res = client.post("/api/analyze", json={"task": "hack_system", "code": "print(1)"})
    assert res.status_code == 400

    # Missing code for explain task
    res = client.post("/api/analyze", json={"task": "explain", "code": "   "})
    assert res.status_code == 400

def test_analyze_explain(client):
    payload = {
        "task": "explain",
        "language": "python",
        "code": "def add(a, b):\n    return a + b\n"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert "session_id" in data
    assert "message_id" in data
    assert data["task"] == "explain"
    assert "content" in data
    assert len(data["content"]) > 0

def test_analyze_debug(client):
    payload = {
        "task": "debug",
        "language": "javascript",
        "code": "for (let i = 0; i <= arr.length; i++) { console.log(arr[i]); }"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["task"] == "debug"
    assert "metadata" in data

def test_analyze_optimize(client):
    payload = {
        "task": "optimize",
        "language": "python",
        "code": "result = []\nfor i in range(len(arr)):\n    result.append(arr[i] * 2)"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["task"] == "optimize"

def test_analyze_complexity(client):
    payload = {
        "task": "complexity",
        "language": "python",
        "code": "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["task"] == "complexity"
    assert "metadata" in data

def test_analyze_generate(client):
    payload = {
        "task": "generate",
        "language": "python",
        "prompt": "Create a function to reverse a string"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["task"] == "generate"
    assert "generated_code" in data.get("metadata", {}) or "def " in data.get("content", "")

def test_chat_follow_up(client):
    # First create an analysis to have a session
    init_res = client.post("/api/analyze", json={
        "task": "explain",
        "language": "python",
        "code": "x = 42"
    })
    session_id = init_res.get_json()["session_id"]

    # Now ask follow-up question
    chat_res = client.post("/api/chat", json={
        "session_id": session_id,
        "message": "Why is x assigned to 42?",
        "code": "x = 42",
        "language": "python"
    })
    assert chat_res.status_code == 200
    data = chat_res.get_json()
    assert data["session_id"] == session_id
    assert "reply" in data
    assert len(data["reply"]) > 0

def test_authentication_error_handling(client, monkeypatch):
    from google.genai import errors

    # Mock analyze_code to simulate an AuthenticationError (401)
    def mock_auth_fail(*args, **kwargs):
        raise errors.APIError(401, "API_KEY_INVALID: The provided Gemini API key is invalid.")

    from app.services import ai_service
    monkeypatch.setattr(ai_service, "analyze_code", mock_auth_fail)

    response = client.post("/api/analyze", json={
        "task": "explain",
        "language": "python",
        "code": "print('hello')"
    })
    assert response.status_code == 401
    data = response.get_json()
    assert "error" in data
    assert "Gemini Authentication Failed (401)" in data["error"]

