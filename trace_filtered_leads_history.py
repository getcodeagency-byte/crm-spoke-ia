import json

path = "/Users/macbook/.gemini/antigravity/brain/29667d9f-431e-4d0c-96ef-71b818564768/.system_generated/logs/transcript.jsonl"
with open(path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        step = data.get("step_index")
        if step and step >= 3284 and step <= 3650:
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name")
                args = tc.get("args", {})
                if name in ["replace_file_content", "multi_replace_file_content"]:
                    content = args.get("ReplacementContent") or ""
                    if "filteredLeads" in content or "activeLeadExists" in content:
                        print(f"Step {step} - Replacement content snippet:")
                        print(content[:300])
                        print("="*40)
