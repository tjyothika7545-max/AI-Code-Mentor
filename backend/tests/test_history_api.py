def test_history_and_session_crud(client):
    # Create two sessions via analyze
    res1 = client.post("/api/analyze", json={
        "task": "explain",
        "language": "python",
        "code": "print('hello world')"
    })
    session_id1 = res1.get_json()["session_id"]

    res2 = client.post("/api/analyze", json={
        "task": "complexity",
        "language": "javascript",
        "code": "const n = 10;"
    })
    session_id2 = res2.get_json()["session_id"]

    # Test history listing & stats
    hist_res = client.get("/api/history")
    assert hist_res.status_code == 200
    hist_data = hist_res.get_json()
    assert "sessions" in hist_data
    assert len(hist_data["sessions"]) >= 2
    assert "stats" in hist_data
    assert hist_data["stats"]["total_sessions"] >= 2

    # Test get single session
    s_res = client.get(f"/api/sessions/{session_id1}")
    assert s_res.status_code == 200
    s_data = s_res.get_json()["session"]
    assert s_data["id"] == session_id1
    assert len(s_data["messages"]) >= 2

    # Test delete session
    del_res = client.delete(f"/api/sessions/{session_id1}")
    assert del_res.status_code == 200

    # Verify session is gone
    check_res = client.get(f"/api/sessions/{session_id1}")
    assert check_res.status_code == 404

    # Test clear history
    clear_res = client.delete("/api/history/clear")
    assert clear_res.status_code == 200

    # Verify sessions are empty
    empty_hist = client.get("/api/history").get_json()
    assert len(empty_hist["sessions"]) == 0
