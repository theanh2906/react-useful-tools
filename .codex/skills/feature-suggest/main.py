import os
import sys
import json
import re
import requests
from urllib.parse import unquote

# Helper to find and parse .env files
def load_env_vars(project_path=None):
    env_vars = {}
    
    # Paths to search for .env
    search_paths = []
    if project_path:
        search_paths.append(os.path.join(project_path, ".env"))
        search_paths.append(os.path.join(project_path, ".env.local"))
    search_paths.append(os.path.join(os.getcwd(), ".env"))
    search_paths.append(os.path.join(os.getcwd(), ".env.local"))
    
    # Also go up one level from cwd just in case
    search_paths.append(os.path.join(os.path.dirname(os.getcwd()), ".env"))

    for path in search_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#"):
                            continue
                        if "=" in line:
                            key, val = line.split("=", 1)
                            env_vars[key.strip()] = val.strip().strip('"').strip("'")
            except Exception:
                pass
    return env_vars

# Exclude lists for scanning
EXCLUDE_DIRS = {
    ".git", "node_modules", "venv", ".venv", "__pycache__", "bin", "obj", 
    "dist", "build", ".idea", ".vscode", "vendor", ".gemini", "tmp", "temp", 
    "target", "out", "pkg", "browser_recordings", "html_artifacts"
}

EXCLUDE_EXTS = {
    ".exe", ".dll", ".so", ".dylib", ".zip", ".gz", ".tar", ".rar", 
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf", ".db", ".sqlite", 
    ".sqlite3", ".log", ".lock", ".sum", ".mp4", ".avi", ".mov"
}

EXCLUDE_FILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "go.sum", 
    "Cargo.lock", "poetry.lock"
}

def scan_project(project_path):
    summary = {
        "tech_stack": [],
        "tree": [],
        "manifests": {},
        "readme": "",
        "key_files": {}
    }
    
    if not os.path.exists(project_path):
        return summary
    
    # 1. Walk files and collect a directory tree + detect tech stack
    all_files = []
    manifest_paths = {}
    readme_path = None
    
    for root, dirs, files in os.walk(project_path):
        # In-place modify dirs to skip excluded ones
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        rel_root = os.path.relpath(root, project_path)
        if rel_root == ".":
            rel_root = ""
            
        for file in files:
            name, ext = os.path.splitext(file)
            if ext.lower() in EXCLUDE_EXTS or file in EXCLUDE_FILES:
                continue
                
            full_path = os.path.join(root, file)
            rel_path = os.path.join(rel_root, file).replace("\\", "/")
            all_files.append(rel_path)
            
            # Detect tech stack & manifest files
            if file == "package.json":
                summary["tech_stack"].append("Node.js/JavaScript/TypeScript")
                manifest_paths["package.json"] = full_path
            elif file == "go.mod":
                summary["tech_stack"].append("Go (Golang)")
                manifest_paths["go.mod"] = full_path
            elif file in ["requirements.txt", "pyproject.toml", "Pipfile"]:
                summary["tech_stack"].append("Python")
                if file not in manifest_paths: # prefer pyproject.toml if multiple
                    manifest_paths[file] = full_path
            elif file == "Cargo.toml":
                summary["tech_stack"].append("Rust")
                manifest_paths["Cargo.toml"] = full_path
            elif file == "pom.xml" or file == "build.gradle":
                summary["tech_stack"].append("Java")
                manifest_paths[file] = full_path
            elif ext.lower() == ".csproj":
                summary["tech_stack"].append(".NET/C#")
                manifest_paths[file] = full_path
                
            # Detect Readme
            if file.lower() == "readme.md":
                readme_path = full_path
                
    summary["tech_stack"] = list(set(summary["tech_stack"]))
    if not summary["tech_stack"]:
        summary["tech_stack"].append("Generic/Polyglot Project")
        
    # Generate tree (limit to first 80 entries for readability)
    summary["tree"] = all_files[:80]
    if len(all_files) > 80:
        summary["tree"].append(f"... and {len(all_files) - 80} more files")
        
    # 2. Read manifests
    for name, path in manifest_paths.items():
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read(2000) # limit to 2000 chars
                summary["manifests"][name] = content
        except Exception:
            pass
            
    # 3. Read Readme
    if readme_path:
        try:
            with open(readme_path, "r", encoding="utf-8", errors="ignore") as f:
                summary["readme"] = f.read(4000) # limit to 4000 chars
        except Exception:
            pass
            
    # 4. Extract content of key source files (up to 4 files, max 5000 chars each)
    # Target files: main entry points, controllers, business logic files
    key_file_patterns = [
        r"^main\.(go|py|js|ts)$",
        r"^index\.(js|ts)$",
        r"^app\.(js|ts)$",
        r"cmd/.*main\.go$",
        r"routes/.*",
        r"controllers/.*",
        r"business/.*",
        r"services/.*"
    ]
    
    extracted_count = 0
    for rel_path in all_files:
        if extracted_count >= 4:
            break
        # Match against patterns
        is_key = False
        for pattern in key_file_patterns:
            if re.search(pattern, rel_path, re.IGNORECASE):
                is_key = True
                break
        
        if is_key:
            full_path = os.path.join(project_path, rel_path)
            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read(4000)
                    summary["key_files"][rel_path] = content
                    extracted_count += 1
            except Exception:
                pass
                
    # Fallback to first 2 source files if no key patterns matched
    if extracted_count == 0:
        source_exts = {".go", ".py", ".js", ".ts", ".rs", ".java", ".cs", ".cpp"}
        for rel_path in all_files:
            if extracted_count >= 2:
                break
            _, ext = os.path.splitext(rel_path)
            if ext.lower() in source_exts and not rel_path.startswith("cli/"):
                full_path = os.path.join(project_path, rel_path)
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        summary["key_files"][rel_path] = f.read(4000)
                        extracted_count += 1
                except Exception:
                    pass
                    
    return summary

# DuckDuckGo Lite search scraper
def search_ddg(query, max_results=5):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    try:
        r = requests.post("https://lite.duckduckgo.com/lite/", data={"q": query}, headers=headers, timeout=12)
        if r.status_code != 200:
            return []
        
        html = r.text
        results = []
        tr_blocks = re.findall(r"<tr>(.*?)</tr>", html, re.DOTALL)
        
        for block in tr_blocks:
            link_match = re.search(r"<a\s+[^>]*href=\"([^\"]+)\"\s+class=['\"]result-link['\"][^>]*>(.*?)</a>", block, re.DOTALL)
            if link_match:
                url = link_match.group(1)
                if "/l/?uddg=" in url:
                    url = url.split("/l/?uddg=")[1].split("&")[0]
                    url = unquote(url)
                elif "uddg=" in url:
                    url = url.split("uddg=")[1].split("&")[0]
                    url = unquote(url)
                
                title = re.sub(r"<[^>]+>", "", link_match.group(2)).strip()
                results.append({"url": url, "title": title, "snippet": ""})
            
            snippet_match = re.search(r"<td\s+class=['\"]result-snippet['\"][^>]*>(.*?)</td>", block, re.DOTALL)
            if snippet_match and results:
                snippet_text = re.sub(r"<[^>]+>", "", snippet_match.group(1)).strip()
                snippet_text = re.sub(r"\s+", " ", snippet_text)
                results[-1]["snippet"] = snippet_text
                
        return results[:max_results]
    except Exception as e:
        sys.stderr.write(f"Search warning: {str(e)}\n")
        return []

# LLM APIs via requests
def call_gemini(api_key, prompt, model="gemini-1.5-flash"):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.7
        }
    }
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            res_json = response.json()
            return res_json['candidates'][0]['content']['parts'][0]['text']
        else:
            return f"Error Gemini API: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Exception Gemini API: {str(e)}"

def call_openai(api_key, prompt, model="gpt-4o-mini"):
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            res_json = response.json()
            return res_json['choices'][0]['message']['content']
        else:
            return f"Error OpenAI API: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Exception OpenAI API: {str(e)}"

def parse_llm_output(output_text):
    # Try to extract JSON from block
    json_data = {"features": []}
    markdown_report = ""
    
    # Extract JSON match
    json_match = re.search(r"```json\s*(.*?)\s*```", output_text, re.DOTALL)
    if json_match:
        try:
            json_data = json.loads(json_match.group(1).strip())
        except Exception:
            pass
        # Markdown report is everything outside the json block, typically following it
        markdown_report = output_text.replace(json_match.group(0), "").strip()
    else:
        # Fallback if no json block found
        # Let's see if we can find a raw JSON object
        json_obj_match = re.search(r"(\{.*?\})", output_text, re.DOTALL)
        if json_obj_match:
            try:
                json_data = json.loads(json_obj_match.group(1).strip())
                markdown_report = output_text.replace(json_obj_match.group(0), "").strip()
            except Exception:
                markdown_report = output_text
        else:
            markdown_report = output_text
            
    # Clean up markdown report header artifacts if any
    markdown_report = re.sub(r"^.*?#\s*", "# ", markdown_report, count=1)
    
    return json_data, markdown_report

def main():
    # Read inputs
    try:
        input_data = json.loads(sys.stdin.read())
    except Exception:
        input_data = {}
        
    project_path = input_data.get("project_path")
    if not project_path:
        # Default to current directory
        project_path = os.getcwd()
    project_path = os.path.abspath(project_path)
    
    focus_areas = input_data.get("focus_areas", "")
    model = input_data.get("model")
    custom_search_query = input_data.get("search_query")
    
    # Load environment variables
    env_vars = load_env_vars(project_path)
    
    gemini_key = input_data.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY") or env_vars.get("GEMINI_API_KEY")
    openai_key = input_data.get("openai_api_key") or os.environ.get("OPENAI_API_KEY") or env_vars.get("OPENAI_API_KEY")
    
    # Determine default models
    if not model:
        if gemini_key:
            model = "gemini-1.5-flash"
        elif openai_key:
            model = "gpt-4o-mini"
        else:
            model = "local-rules"
            
    # Scan the project
    sys.stderr.write(f"🔍 Scanning project path: {project_path}...\n")
    scan_results = scan_project(project_path)
    
    tech_stack_str = ", ".join(scan_results["tech_stack"])
    sys.stderr.write(f"💻 Detected Stack: {tech_stack_str}\n")
    
    # Perform Search Research
    search_query = custom_search_query
    if not search_query:
        # Determine keywords from stack
        tech_words = " ".join([stack.split("/")[0] for stack in scan_results["tech_stack"]])
        if "AgentHub" in project_path or "agent" in project_path.lower():
            search_query = f"ai agent hub orchestration features framework"
        elif "go-project" in project_path or "drive" in project_path.lower():
            search_query = f"golang google drive client sync features"
        else:
            search_query = f"{tech_words} modern project design patterns features".strip()
            
    sys.stderr.write(f"🌐 Researching the web for: '{search_query}'...\n")
    web_results = search_ddg(search_query, max_results=4)
    
    web_results_str = ""
    for idx, r in enumerate(web_results):
        web_results_str += f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['snippet']}\n\n"
        
    if not web_results_str:
        web_results_str = "No search results returned (offline or search blocked)."
        
    # Check LLM Key and execute reasoning
    has_api = gemini_key or openai_key
    
    if not has_api:
        sys.stderr.write("⚠️ Warning: No GEMINI_API_KEY or OPENAI_API_KEY found. Generating static suggestions.\n")
        
        # Static suggestions based on tech stack
        features = []
        static_report = f"""# 🚀 Feature Recommendations for {os.path.basename(project_path)}

> [!WARNING]
> **API Key Missing**: No GEMINI_API_KEY or OPENAI_API_KEY was detected. Below is a structural analysis of your project and standard high-value feature recommendations based on your detected tech stack. Configure an API key to enable tailored, creative, AI-driven suggestions.

### 📋 Scanned Project Profile
* **Project Path**: `{project_path}`
* **Detected Tech Stack**: `{tech_stack_str}`
* **Files Scanned**: {len(scan_results['tree'])} files identified.

---

## 🛠️ Tech-Specific Feature Recommendations

"""
        
        if "Go" in tech_stack_str:
            features.append({
                "title": "Structured Log Telemetry & Metrics",
                "description": "Integrate Zerolog/Zap and Prometheus exporter to monitor runtime and API latency in real time.",
                "rationale": "High-performance Go applications benefit heavily from structured JSON logs and metrics to trace concurrency bugs.",
                "technical_feasibility": "Create a new package `/internal/telemetry` or `/pkg/metrics` using `prometheus/client_golang` and integrate middleware into API handlers.",
                "creativity_score": "5/10 - Standard production best-practice"
            })
            features.append({
                "title": "Database Migration & Schema Sync Component",
                "description": "Add support for schema migrations to control the state of database connectors automatically on startup.",
                "rationale": "Ensures schema robustness and simplifies development workspace setup.",
                "technical_feasibility": "Create a `/migrations` directory. Implement migration loading inside main startup logic using `golang-migrate`.",
                "creativity_score": "4/10 - Utility tool"
            })
        
        if "Node.js" in tech_stack_str or "JavaScript" in tech_stack_str:
            features.append({
                "title": "Interactive CLI Scaffold Dashboard",
                "description": "Add an interactive terminal UI (using Ink or Blessed) for CLI users to review and manage components graphically.",
                "rationale": "Significantly improves developer onboarding and user engagement.",
                "technical_feasibility": "Add dependency `ink` or `prompts` to `package.json`, create a CLI rendering module in `cli/dashboard.js`.",
                "creativity_score": "7/10 - Enhanced CLI Experience"
            })
            features.append({
                "title": "Robust Input Validation Layer with Zod",
                "description": "Enforce strict schema validation on all inputs, parameters, and environment configurations.",
                "rationale": "Reduces runtime errors and crashes due to malformed configuration or user inputs.",
                "technical_feasibility": "Install `zod`. Define input schemas and run `.parse()` inside component entrypoints.",
                "creativity_score": "4/10 - Operational reliability"
            })
            
        if "Python" in tech_stack_str:
            features.append({
                "title": "Async Task Runner & Pipeline",
                "description": "Add support for Celery or RQ to handle background skill executions concurrently without blocking the main event loop.",
                "rationale": "Critical for scales where agents trigger long-running scraping or analysis scripts.",
                "technical_feasibility": "Add `celery` and `redis` to `requirements.txt`. Create a `tasks.py` worker configuration.",
                "creativity_score": "6/10 - Performance scaler"
            })
            
        # Build Markdown report
        for f in features:
            static_report += f"### ✨ {f['title']}\n"
            static_report += f"* **Description**: {f['description']}\n"
            static_report += f"* **Rationale**: {f['rationale']}\n"
            static_report += f"* **Technical Feasibility**: {f['technical_feasibility']}\n"
            static_report += f"* **Creativity & Impact**: {f['creativity_score']}\n\n"
            
        static_report += """
---
### 🌐 Web Research References (DuckDuckGo Lite)
"""
        for r in web_results:
            static_report += f"- [{r['title']}]({r['url']}) - *{r['snippet']}*\n"
            
        result = {
            "status": "warning",
            "message": "No API key configured. Suggestions generated using local static rules.",
            "project_summary": {
                "tech_stack": scan_results["tech_stack"],
                "file_count": len(scan_results["tree"])
            },
            "web_research": web_results,
            "suggested_features": features,
            "markdown_report": static_report
        }
        print(json.dumps(result))
        return
        
    # Prepare LLM Prompts
    manifests_str = ""
    for name, content in scan_results["manifests"].items():
        manifests_str += f"--- file: {name} ---\n{content}\n\n"
        
    key_files_str = ""
    for name, content in scan_results["key_files"].items():
        key_files_str += f"--- file: {name} ---\n{content}\n\n"
        
    prompt = f"""You are a visionary Product Manager and Lead Systems Architect. 
Your goal is to suggest 3-5 innovative, highly useful, and feasible new features for the project described below.

--- PROJECT CONTEXT ---
Path: {project_path}
Tech Stack: {tech_stack_str}

Project File Tree (Sample):
{chr(10).join(scan_results['tree'])}

Manifests / Dependencies:
{manifests_str}

README.md Context:
{scan_results['readme']}

Key Source Files Content:
{key_files_str}
---------------------

--- WEB RESEARCH TRENDS ---
{web_results_str}
--------------------------

--- USER FOCUS AREAS / CONSTRAINTS ---
{focus_areas if focus_areas else "None specified. Focus on creative, high-value business features."}
-------------------------------------

Please analyze the project business logic, plugins, connectors, features, and environments. Based on this and the web research, propose 3 to 5 innovative features that can be added. 

Requirements for each feature:
1. It must be highly creative yet realistic and feasible to implement in this codebase.
2. It must focus heavily on real-world business value and user needs.
3. It must not be limited by programming language syntax; focus on features, user experience, and architectural changes.
4. Include a detailed technical feasibility assessment explaining how to integrate it (which files/packages to add or modify).

You must return your response in two parts.
First part: A JSON block containing the structured features.
Second part: A beautifully formatted, premium Markdown report that the user can read directly.

Use the following exact format for your output (with the JSON block inside ```json and the Markdown report after it):

```json
{{
  "features": [
    {{
      "title": "Feature Name",
      "description": "Short description of business value and user need.",
      "rationale": "Why it fits this project's stack and business logic.",
      "technical_feasibility": "How to implement it (files/directories to create/modify).",
      "creativity_score": "Description of why this is creative and how it impacts users (e.g. 9/10 - explain why)"
    }}
  ]
}}
```

# 🚀 Premium Feature Recommendation Report
... (detailed Markdown report with beautiful headings, bullet points, and tables if applicable, using Outfit/Inter typography vibe, emojis, etc.)
"""

    # Call LLM
    sys.stderr.write(f"🧠 Querying model: {model}...\n")
    if gemini_key:
        llm_response = call_gemini(gemini_key, prompt, model=model)
    else:
        llm_response = call_openai(openai_key, prompt, model=model)
        
    features_json, markdown_report = parse_llm_output(llm_response)
    
    result = {
        "status": "success",
        "project_summary": {
            "tech_stack": scan_results["tech_stack"],
            "file_count": len(scan_results["tree"])
        },
        "web_research": web_results,
        "suggested_features": features_json.get("features", []),
        "markdown_report": markdown_report
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
