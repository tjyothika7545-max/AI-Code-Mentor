import re

SUPPORTED_LANGUAGES = {
    "python": "Python",
    "java": "Java",
    "c": "C",
    "cpp": "C++",
    "c++": "C++",
    "javascript": "JavaScript",
    "js": "JavaScript",
}

SUPPORTED_TASKS = {
    "explain": "Code Explanation",
    "debug": "Bug Detection & Debugging",
    "optimize": "Code Improvement & Optimization",
    "complexity": "Time & Space Complexity Analysis",
    "generate": "Code Generation",
    "chat": "Follow-Up Conversation"
}

DIFFICULTIES = {"beginner", "intermediate", "advanced"}

MAX_CODE_LENGTH = 50000
MAX_PROMPT_LENGTH = 5000

def normalize_language(lang: str) -> str:
    if not lang:
        return "python"
    clean = lang.strip().lower()
    if clean in ("c++", "cpp"):
        return "cpp"
    if clean in ("javascript", "js"):
        return "javascript"
    if clean in ("python", "py"):
        return "python"
    if clean in ("java", "c"):
        return clean
    return "python"

def validate_analyze_request(data: dict):
    if not isinstance(data, dict):
        return False, "Request body must be a valid JSON object."

    task = data.get("task", "").strip().lower()
    if not task or task not in SUPPORTED_TASKS:
        return False, f"Invalid task '{task}'. Supported tasks: {list(SUPPORTED_TASKS.keys())}"

    lang = normalize_language(data.get("language", "python"))
    code = data.get("code", "")
    prompt = data.get("prompt", "")

    if not isinstance(code, str):
        return False, "Field 'code' must be a string."
    if not isinstance(prompt, str):
        return False, "Field 'prompt' must be a string."

    if len(code) > MAX_CODE_LENGTH:
        return False, f"Code exceeds maximum allowed limit of {MAX_CODE_LENGTH} characters."

    if len(prompt) > MAX_PROMPT_LENGTH:
        return False, f"Prompt exceeds maximum allowed limit of {MAX_PROMPT_LENGTH} characters."

    # If task is NOT code generation, code is required
    if task != "generate" and not code.strip():
        return False, "Code snippet is required for this analysis task."

    # If task IS code generation, prompt is required
    if task == "generate" and not prompt.strip() and not code.strip():
        return False, "Requirement prompt is required to generate code."

    return True, {
        "task": task,
        "language": lang,
        "code": code.strip(),
        "prompt": prompt.strip(),
        "session_id": data.get("session_id")
    }

def validate_chat_request(data: dict):
    if not isinstance(data, dict):
        return False, "Request body must be a valid JSON object."

    message = data.get("message", "")
    if not isinstance(message, str) or not message.strip():
        return False, "Message is required."

    if len(message) > MAX_PROMPT_LENGTH:
        return False, f"Message exceeds maximum limit of {MAX_PROMPT_LENGTH} characters."

    code = data.get("code", "")
    if isinstance(code, str) and len(code) > MAX_CODE_LENGTH:
        return False, f"Code exceeds maximum limit of {MAX_CODE_LENGTH} characters."

    return True, {
        "message": message.strip(),
        "code": code.strip() if isinstance(code, str) else "",
        "language": normalize_language(data.get("language", "python")),
        "session_id": data.get("session_id")
    }

def validate_quiz_request(data: dict):
    if not isinstance(data, dict):
        return False, "Request body must be a valid JSON object."

    topic = data.get("topic", "").strip()
    if not topic:
        topic = "General Programming & Data Structures"

    difficulty = data.get("difficulty", "intermediate").strip().lower()
    if difficulty not in DIFFICULTIES:
        difficulty = "intermediate"

    language = normalize_language(data.get("language", "general"))
    count = data.get("count", 5)
    try:
        count = max(1, min(10, int(count)))
    except (ValueError, TypeError):
        count = 5

    return True, {
        "topic": topic[:100],
        "language": language,
        "difficulty": difficulty,
        "count": count
    }
