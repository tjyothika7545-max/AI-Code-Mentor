"""
Mock AI Service providing high-quality pedagogical fallback responses
when GEMINI_API_KEY is not configured or in offline test mode.
"""

def get_mock_explanation(code: str, language: str) -> dict:
    lines = [l for l in code.split("\n") if l.strip()]
    line_breakdown = []
    for i, line in enumerate(lines[:8], start=1):
        line_breakdown.append({
            "line_number": i,
            "code": line,
            "explanation": f"Evaluates and executes `{line.strip()}` within the {language.capitalize()} execution context."
        })

    markdown = f"""### 📘 Code Explanation ({language.capitalize()})

#### Overview
This code defines a modular algorithm structured to process inputs sequentially. It demonstrates foundational programming principles such as state tracking, boundary verification, and conditional branching.

#### Execution Walkthrough
1. **Initialization:** The function allocates working variables and verifies base preconditions.
2. **Core Logic:** Iterates over the problem space, updating internal state as conditions evaluate to true.
3. **Termination:** Reaches a deterministic conclusion and yields the computed result.

#### Key Programming Concepts Highlighted
- **Control Flow:** Deterministic loop execution ensures predictable state transformations.
- **Invariants:** The invariant holds true before and after each iteration.
- **Defensive Invariants:** Early exit guards prevent null pointer or out-of-bounds references.
"""

    return {
        "content": markdown,
        "metadata": {
            "mode": "mock",
            "task": "explain",
            "language": language,
            "line_breakdown": line_breakdown,
            "concepts": ["Control Flow", "State Tracking", "Boundary Checks"]
        }
    }


def get_mock_debugging(code: str, language: str) -> dict:
    markdown = f"""### 🐛 Bug Diagnostic & Debug Report ({language.capitalize()})

#### 1. Issue Identification
- **Category:** Logic Bug & Boundary Edge Case
- **Severity:** `Medium` ⚠️
- **Location:** Loop termination condition / state update logic

#### 2. Root Cause Analysis
The loop condition does not sufficiently protect against empty or boundary inputs. Under standard inputs it executes, but whenever the input size is zero or boundary limits are reached, unexpected behavior or off-by-one indices may occur.

#### 3. Recommended Fix
Ensure loop bounds adhere strictly to valid index boundaries (`0 <= index < size`), and add guard clauses at the beginning of the function.

```markdown
// Recommended Guard Clause:
if (!input || input.length === 0) return default_value;
```

#### 4. Corrected Code
```python
# Refactored robust implementation
def solved_routine(data):
    if not data:
        return None
    result = []
    for item in data:
        if item is not None:
            result.append(item)
    return result
```

#### 5. Defensive Programming Takeaways
Always validate function arguments upon entry, and write unit tests for the zero-element and single-element cases.
"""
    return {
        "content": markdown,
        "metadata": {
            "mode": "mock",
            "task": "debug",
            "language": language,
            "bugs": [
                {
                    "severity": "medium",
                    "title": "Potential off-by-one or boundary condition",
                    "description": "Ensure loop termination matches dynamic array bounds."
                }
            ],
            "corrected_code": "# Guarded implementation\nif not data:\n    return None\nreturn [x for x in data if x is not None]"
        }
    }


def get_mock_optimization(code: str, language: str) -> dict:
    markdown = f"""### ⚡ Code Optimization & Refactoring ({language.capitalize()})

#### 1. Algorithmic Enhancements
- **Redundant Iterations:** Replaced nested iteration with single-pass hash lookups, reducing runtime complexity.
- **Memory Allocation:** Re-used pre-allocated buffers rather than constructing transient intermediate arrays.

#### 2. Readability & Idiomatic Conventions
- Clean, descriptive identifier names conforming to standard naming guidelines.
- Factored out complex inline logic into concise helper expressions.

#### 3. Optimized Version
```{language}
// Idiomatic, high-performance refactoring
// Applies early-exit optimization and memory reuse
```

#### 4. Summary of Improvements
| Metric | Original | Optimized |
| :--- | :--- | :--- |
| **Time Complexity** | $O(n^2)$ | $O(n)$ |
| **Space Overhead** | $O(n)$ | $O(1)$ auxiliary |
| **Cyclomatic Complexity** | 6 | 2 |
"""
    return {
        "content": markdown,
        "metadata": {
            "mode": "mock",
            "task": "optimize",
            "language": language,
            "improvements": [
                "Reduced time complexity from O(n^2) to O(n)",
                "Adopted idiomatic naming conventions",
                "Decreased cyclomatic complexity"
            ],
            "optimized_code": code
        }
    }


def get_mock_complexity(code: str, language: str) -> dict:
    markdown = f"""### 📊 Time & Space Complexity Analysis ({language.capitalize()})

#### Big-O Summary
- **Time Complexity:** **$O(n)$** (Linear)
  - *Best Case:* $O(1)$ when early termination occurs on initial check.
  - *Average Case:* $O(n)$ proportional to input length.
  - *Worst Case:* $O(n)$ where $n$ is the total elements processed.
- **Space Complexity:** **$O(1)$** Auxiliary Space (Constant Memory)
  - *Total Space:* $O(n)$ to store input elements.

#### Step-by-Step Mathematical Derivation
1. **Initialization:** Primitive variables allocated on stack -> O(1) space.
2. **Main Loop:** Executes exactly once per element in the dataset -> sum(c) = c * n -> O(n) time.
3. **Inside Loop Body:** Constant-time arithmetic and comparison operations O(1).
4. **Conclusion:** Dominated by linear iteration -> O(n) overall runtime.

#### Scalability Rating
- 🟢 **Optimal:** Linear scaling is well-suited for datasets with up to millions of items in real-time execution.
"""
    return {
        "content": markdown,
        "metadata": {
            "mode": "mock",
            "task": "complexity",
            "language": language,
            "time_complexity": "O(n)",
            "space_complexity": "O(1)",
            "best_case": "O(1)",
            "worst_case": "O(n)",
            "rating": "optimal"
        }
    }


def get_mock_generation(prompt: str, language: str) -> dict:
    lang = language.lower()
    code_samples = {
        "python": """def process_solution(items: list) -> dict:
    \"\"\"
    Solves the requirement: {prompt}
    \"\"\"
    if not items:
        return {"status": "empty", "result": []}
    
    seen = set()
    unique_items = []
    for item in items:
        if item not in seen:
            seen.add(item)
            unique_items.append(item)
            
    return {"status": "success", "result": unique_items}

# Example Usage:
if __name__ == "__main__":
    sample_data = [3, 1, 4, 1, 5, 9, 2, 6, 5]
    output = process_solution(sample_data)
    print("Processed Output:", output)
""",
        "javascript": """/**
 * Solves the requirement: {prompt}
 * @param {Array} items
 * @returns {Object}
 */
function processSolution(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return { status: 'empty', result: [] };
  }

  const seen = new Set();
  const uniqueItems = [];

  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item);
      uniqueItems.push(item);
    }
  }

  return { status: 'success', result: uniqueItems };
}

// Example Usage:
const sampleData = [3, 1, 4, 1, 5, 9, 2, 6, 5];
console.log('Processed Output:', processSolution(sampleData));
""",
        "java": """import java.util.*;

public class Solution {
    /**
     * Solves the requirement: {prompt}
     */
    public static List<Integer> processSolution(int[] items) {
        if (items == null || items.length == 0) {
            return Collections.emptyList();
        }
        
        Set<Integer> seen = new LinkedHashSet<>();
        for (int item : items) {
            seen.add(item);
        }
        return new ArrayList<>(seen);
    }

    public static void main(String[] args) {
        int[] sample = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        System.out.println("Result: " + processSolution(sample));
    }
}
"""
    }

    code = code_samples.get(lang, code_samples["python"]).replace("{prompt}", prompt or "Custom Algorithm")
    markdown = f"""### 💡 Generated Code ({language.capitalize()})

Requirement: **"{prompt or 'Standard Algorithm Implementation'}"**

#### Implementation
```{language}
{code}
```

#### How It Works
1. **Safety Checks:** Verifies inputs are valid before processing.
2. **Optimal Data Structures:** Uses a hash set to achieve $O(1)$ lookup times.
3. **Clean Architecture:** Well-commented, modular, and ready for production or test integration.
"""
    return {
        "content": markdown,
        "metadata": {
            "mode": "mock",
            "task": "generate",
            "language": language,
            "generated_code": code
        }
    }


def get_mock_quiz(topic: str, language: str, difficulty: str, count: int = 5) -> list:
    questions = [
        {
            "id": 1,
            "question": f"In {language.capitalize()}, what is the time complexity of searching for an element in an unsorted array of size N?",
            "code_snippet": None,
            "options": [
                {"id": "A", "text": "O(1)"},
                {"id": "B", "text": "O(log N)"},
                {"id": "C", "text": "O(N)"},
                {"id": "D", "text": "O(N log N)"}
            ],
            "correct_option": "C",
            "explanation": "Because the array is unsorted, in the worst case we must inspect every single element from index 0 to N-1, requiring linear O(N) time."
        },
        {
            "id": 2,
            "question": "What is the primary difference between a Stack and a Queue data structure?",
            "code_snippet": None,
            "options": [
                {"id": "A", "text": "Stacks are FIFO (First-In, First-Out); Queues are LIFO (Last-In, First-Out)"},
                {"id": "B", "text": "Stacks are LIFO (Last-In, First-Out); Queues are FIFO (First-In, First-Out)"},
                {"id": "C", "text": "Stacks allow random access at any index; Queues do not"},
                {"id": "D", "text": "Queues only hold integer values while Stacks hold any object"}
            ],
            "correct_option": "B",
            "explanation": "A stack pushes and pops from the top (LIFO - Last In, First Out), like a stack of plates. A queue enqueues at the back and dequeues at the front (FIFO - First In, First Out), like a line of people."
        },
        {
            "id": 3,
            "question": "What will happen if a recursive function lacks a valid base case?",
            "code_snippet": "def countdown(n):\n    return countdown(n - 1)",
            "options": [
                {"id": "A", "text": "It returns None automatically"},
                {"id": "B", "text": "It executes infinitely until a Stack Overflow / RecursionError occurs"},
                {"id": "C", "text": "It pauses until the computer CPU cools down"},
                {"id": "D", "text": "The compiler optimizes it into an empty string"}
            ],
            "correct_option": "B",
            "explanation": "Each recursive call allocates a stack frame in call memory. Without a terminating base condition, call stack depth exceeds the system recursion threshold, triggering a Stack Overflow (RecursionError in Python)."
        },
        {
            "id": 4,
            "question": "Which data structure provides average-case O(1) time complexity for lookup, insertion, and deletion?",
            "code_snippet": None,
            "options": [
                {"id": "A", "text": "Binary Search Tree"},
                {"id": "B", "text": "Hash Table / Dictionary"},
                {"id": "C", "text": "Singly Linked List"},
                {"id": "D", "text": "Sorted Array"}
            ],
            "correct_option": "B",
            "explanation": "A Hash Table maps keys to buckets via a hashing function, allowing immediate O(1) average lookup, insertion, and deletion."
        },
        {
            "id": 5,
            "question": "Why is Big-O notation used to describe algorithm performance instead of measuring execution seconds directly?",
            "code_snippet": None,
            "options": [
                {"id": "A", "text": "Seconds cannot be measured accurately on modern operating systems"},
                {"id": "B", "text": "Big-O measures asymptotic growth rate independent of hardware, CPU clock speed, and compiler optimizations"},
                {"id": "C", "text": "Big-O only applies to quantum computers"},
                {"id": "D", "text": "Execution time in seconds is copyrighted"}
            ],
            "correct_option": "B",
            "explanation": "Direct wall-clock timing varies wildly across machines and background loads. Big-O analyzes how runtime or memory scales mathematically as input size N grows toward infinity."
        }
    ]
    return questions[:count]
