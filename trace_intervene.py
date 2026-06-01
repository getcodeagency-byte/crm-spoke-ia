import json

path = "/Users/macbook/.gemini/antigravity/brain/29667d9f-431e-4d0c-96ef-71b818564768/.system_generated/logs/transcript.jsonl"
with open(path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        step = data.get("step_index")
        content = json.dumps(data)
        if "intervene" in content or "Hablar con" in content:
            # Print a summary of the step
            print(f"Step {step}: type={data.get('type')}, source={data.get('source')}, status={data.get('status')}")
            # print first 100 chars of content if present
            c = data.get("content") or ""
            if c:
                print(f"  Content: {c[:120]}...")
            tc = data.get("tool_calls")
            if tc:
                print(f"  Tool calls: {[x.get('name') for x in tc]}")
            print("-" * 50)
