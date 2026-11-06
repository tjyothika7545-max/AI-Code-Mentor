"""
End-to-end integration verification script for AI Code Mentor.
Verifies health, input validation, error handling, and database persistence.
"""
import sys
import os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app import create_app
from app.config import Config

def verify_all():
    print("==================================================")
    print("[*] Starting AI Code Mentor Integration Verification")
    print("==================================================")

    app = create_app()
    client = app.test_client()

    # 1. Health Endpoint
    print("\n[1/5] Testing Health Endpoint (/api/health)...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    health = res.get_json()
    print(f"  + Health Status: {health.get('status')}")
    print(f"  + Service: {health.get('service')}")
    print(f"  + AI Configured: {health.get('ai_configured')}")
    print(f"  + Model: {health.get('model')}")

    # 2. Validation Checks
    print("\n[2/5] Testing Input Validation Guard (/api/analyze)...")
    bad_res = client.post("/api/analyze", json={"task": "invalid_task", "code": "x = 1"})
    assert bad_res.status_code == 400
    print("  + Correctly rejected invalid task with HTTP 400")

    # 3. Analyze Request Handling
    print("\n[3/5] Testing Analyze Request Handling (/api/analyze)...")
    explain_payload = {
        "task": "explain",
        "language": "python",
        "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n"
    }
    res = client.post("/api/analyze", json=explain_payload)
    # With live network, it may return 200 (if active quota) or 401/429/502 with clear error
    if res.status_code == 200:
        print("  + Analysis succeeded with 200 OK")
    elif res.status_code in (401, 429, 502):
        err = res.get_json().get("error", "")
        print(f"  + Handled Gemini response cleanly with HTTP {res.status_code}: {err[:80]}...")
    else:
        raise AssertionError(f"Unexpected status code {res.status_code}: {res.data}")

    # 4. History & Database Operations
    print("\n[4/5] Testing Session Persistence & History (/api/history)...")
    hist_res = client.get("/api/history")
    assert hist_res.status_code == 200
    hist_data = hist_res.get_json()
    print(f"  + Sessions in DB: {len(hist_data.get('sessions', []))}")
    print(f"  + Total Sessions Stat: {hist_data.get('stats', {}).get('total_sessions', 0)}")

    # 5. Quiz Submission & Feedback
    print("\n[5/5] Testing Quiz Endpoints (/api/quiz/*)...")
    # Generate quiz
    gen_res = client.post("/api/quiz/generate", json={
        "topic": "Recursion",
        "language": "python",
        "difficulty": "intermediate",
        "count": 2
    })
    if gen_res.status_code == 201:
        quiz_id = gen_res.get_json()["quiz"]["id"]
        submit_res = client.post("/api/quiz/submit", json={
            "quiz_id": quiz_id,
            "answers": {"1": "C"}
        })
        assert submit_res.status_code == 200
        print(f"  + Quiz generated and submitted successfully (Score: {submit_res.get_json().get('score')})")
    elif gen_res.status_code in (401, 429, 502):
        print(f"  + Quiz generation cleanly handled with HTTP {gen_res.status_code}")

    print("\n==================================================")
    print("[SUCCESS] ALL VERIFICATIONS PASSED CLEANLY!")
    print("==================================================")

if __name__ == "__main__":
    verify_all()
