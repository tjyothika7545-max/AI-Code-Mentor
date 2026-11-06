import os
import json
import logging
from google import genai
from google.genai import types, errors
from app.config import Config
from app.services import mock_service

logger = logging.getLogger(__name__)

# Client cache
_client = None
_cached_api_key = None

def get_current_api_key() -> str:
    """Retrieves GEMINI_API_KEY from environment or Config without revealing secrets."""
    return Config.get_gemini_api_key()

def get_current_model() -> str:
    """Retrieves GEMINI_MODEL from environment or Config."""
    return Config.get_gemini_model()

def is_ai_configured() -> bool:
    """Checks whether a valid Gemini API key is configured."""
    return Config.is_ai_configured()

def get_gemini_client() -> genai.Client:
    """Initializes and returns the Gemini client using GEMINI_API_KEY."""
    global _client, _cached_api_key

    current_key = get_current_api_key()
    if not is_ai_configured():
        return None

    # Re-initialize client if key changes
    if _client is not None and _cached_api_key == current_key:
        return _client

    try:
        _client = genai.Client(api_key=current_key)
        _cached_api_key = current_key
        return _client
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {type(e).__name__}")
        raise

# Backward compatibility alias
get_openai_client = get_gemini_client

def _call_gemini_api(system_instruction: str, user_content: str, model: str = None) -> str:
    """
    Calls the Google Gemini API using the configured GEMINI_MODEL.
    """
    client = get_gemini_client()
    if not client:
        raise errors.APIError(401, "Gemini client is not configured with an API key.")

    target_model = model or get_current_model()

    response = client.models.generate_content(
        model=target_model,
        contents=user_content,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
        ),
    )
    return response.text or ""

_call_openai_responses_api = _call_gemini_api


def analyze_code(task: str, language: str, code: str, prompt: str = "") -> dict:
    """
    Executes one of the 5 core AI mentor tasks:
    'explain', 'debug', 'optimize', 'complexity', 'generate'
    """
    # If no API key configured, use mock service for offline testing
    if not is_ai_configured():
        logger.info("GEMINI_API_KEY not configured. Using offline mock service.")
        if task == "explain":
            return mock_service.get_mock_explanation(code, language)
        elif task == "debug":
            return mock_service.get_mock_debugging(code, language)
        elif task == "optimize":
            return mock_service.get_mock_optimization(code, language)
        elif task == "complexity":
            return mock_service.get_mock_complexity(code, language)
        elif task == "generate":
            return mock_service.get_mock_generation(prompt or code, language)
        return mock_service.get_mock_explanation(code, language)

    # Live Gemini API Prompts
    prompts = {
        "explain": (
            f"You are AI Code Mentor, an expert programming tutor in {language}.\n"
            "Explain the provided code line-by-line and conceptually for a student.\n"
            "Structure your response with:\n"
            "1. High-Level Summary (what the algorithm accomplishes)\n"
            "2. Interactive Line-by-Line Breakdown (connect key lines with clear pedagogical explanations)\n"
            "3. Execution Flow & State Changes\n"
            "4. Core Programming Concepts & Invariants\n"
            "Use clear markdown with bold terms and code formatting."
        ),
        "debug": (
            f"You are AI Code Mentor, an expert debugger for {language}.\n"
            "Inspect the submitted code for syntax errors, logical bugs, off-by-one errors, and unhandled edge cases.\n"
            "Structure your response with:\n"
            "1. Issue Overview (Category, Severity: High/Medium/Low, Line numbers)\n"
            "2. Root Cause Analysis (explain *why* the bug happens)\n"
            "3. Step-by-Step Fix Recommendations\n"
            "4. Corrected Code Snippet (complete and working)\n"
            "5. Defensive Programming Takeaways (how to test/prevent this in the future)."
        ),
        "optimize": (
            f"You are AI Code Mentor, an expert software architect specializing in {language}.\n"
            "Analyze the submitted code and provide concrete optimizations for performance, idiomatic cleanliness, and memory.\n"
            "Structure your response with:\n"
            "1. Algorithmic Optimizations (redundant operations, optimal data structures)\n"
            "2. Readability & Idiomatic Conventions (clean code, naming, best practices)\n"
            "3. Refactored Optimized Code\n"
            "4. Before vs After Comparison Table (time, space, lines)."
        ),
        "complexity": (
            f"You are AI Code Mentor, a Computer Science professor specializing in Big-O algorithmic analysis in {language}.\n"
            "Provide a rigorous Time and Space Complexity analysis of the submitted code.\n"
            "Structure your response with:\n"
            "1. Big-O Summary: Best Case, Average Case, Worst Case Time Complexity; Auxiliary and Total Space Complexity\n"
            "2. Mathematical Step-by-Step Derivation (loop bounds, recurrence relations, memory allocations)\n"
            "3. Dominant Operations and Bottlenecks\n"
            "4. Optimization Suggestions to reduce complexity if applicable."
        ),
        "generate": (
            f"You are AI Code Mentor, an expert software engineer.\n"
            f"Generate clean, well-commented, production-ready {language} code fulfilling the user requirements.\n"
            "Structure your response with:\n"
            "1. Approach & Design Rationale\n"
            "2. Complete Implementation in a clean code block\n"
            "3. Step-by-Step Logic Explanation\n"
            "4. Example Usage & Test Cases."
        )
    }

    system_instruction = prompts.get(task, prompts["explain"])
    user_input = f"Target Language: {language}\n"
    if prompt:
        user_input += f"User Requirement / Context: {prompt}\n"
    if code:
        user_input += f"Code:\n```{language}\n{code}\n```"

    # Call Gemini API without swallowing auth errors
    raw_output = _call_gemini_api(system_instruction, user_input)
    return {
        "content": raw_output,
        "metadata": {
            "mode": "live",
            "task": task,
            "language": language,
            "model": get_current_model()
        }
    }


def chat_follow_up(session_messages: list, new_message: str, code: str, language: str) -> str:
    """
    Retains conversational memory for follow-up questions linked to a code session.
    """
    if not is_ai_configured():
        return (
            f"As your {language.capitalize()} tutor, let's look at your question: *'{new_message}'*.\n\n"
            "When analyzing this snippet, notice how variables are initialized and how loop invariants dictate "
            "each step. Would you like to trace through a specific input value together, or examine how "
            "modifying the condition impacts the result?"
        )

    client = get_gemini_client()
    if not client:
        raise errors.APIError(401, "Gemini client is not configured with an API key.")

    system_prompt = (
        f"You are AI Code Mentor, a friendly, insightful computer science tutor for {language}.\n"
        "You are answering a student's follow-up question regarding the code currently in their workspace.\n"
        "Be encouraging, concise, pedagogical, and reference specific lines or concepts where applicable.\n"
        f"Current Code in Workspace:\n```{language}\n{code}\n```"
    )

    contents = []
    for m in session_messages[-6:]:
        role = "model" if m.get("role") == "assistant" else "user"
        content = m.get("content", "")
        if content:
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=content[:1500])]
                )
            )

    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=new_message)]
        )
    )

    response = client.models.generate_content(
        model=get_current_model(),
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.3,
        ),
    )
    return response.text or ""


def generate_quiz(topic: str, language: str, difficulty: str, count: int = 5) -> list:
    """
    Generates a dynamic interactive programming quiz.
    """
    if not is_ai_configured():
        return mock_service.get_mock_quiz(topic, language, difficulty, count)

    client = get_gemini_client()
    if not client:
        raise errors.APIError(401, "Gemini client is not configured with an API key.")

    system_prompt = (
        "You are a computer science professor creating an interactive programming quiz.\n"
        "Return a strictly valid JSON array of questions. Do NOT wrap the JSON in markdown code fences or extra text.\n"
        "Each question object must adhere exactly to this schema:\n"
        "[\n"
        "  {\n"
        '    "id": 1,\n'
        '    "question": "Question text...",\n'
        '    "code_snippet": "optional short code or null",\n'
        '    "options": [\n'
        '      {"id": "A", "text": "Option A"},\n'
        '      {"id": "B", "text": "Option B"},\n'
        '      {"id": "C", "text": "Option C"},\n'
        '      {"id": "D", "text": "Option D"}\n'
        "    ],\n"
        '    "correct_option": "A",\n'
        '    "explanation": "Clear explanation of why option A is correct and why other choices are incorrect."\n'
        "  }\n"
        "]"
    )

    user_prompt = (
        f"Create a {count}-question quiz on the topic '{topic}' in {language} at the '{difficulty}' level."
    )

    response = client.models.generate_content(
        model=get_current_model(),
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            temperature=0.4,
        ),
    )
    raw_text = (response.text or "").strip()
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    if raw_text.startswith("```"):
        raw_text = raw_text[3:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]

    try:
        parsed = json.loads(raw_text.strip())
        if isinstance(parsed, list) and len(parsed) > 0:
            return parsed[:count]
    except Exception as e:
        logger.warning(f"Failed to parse quiz JSON from Gemini response: {e}")

    return mock_service.get_mock_quiz(topic, language, difficulty, count)
