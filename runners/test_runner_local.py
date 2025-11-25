#!/usr/bin/env python3
"""
Test runner service locally without docker.
Execute: python3 test_runner_local.py
"""

import sys
import subprocess
import json
from datetime import datetime

# Test cases for each language
TEST_CASES = {
    "python": {
        "code": """n = int(input())
print(n * 2)""",
        "cases": [
            {"input": "5", "expected": "10"},
            {"input": "100", "expected": "200"},
            {"input": "0", "expected": "0"},
        ]
    },
    "node": {
        "code": """const n = parseInt(require('fs').readFileSync(0, 'utf-8'));
console.log(n * 2);""",
        "cases": [
            {"input": "5", "expected": "10"},
            {"input": "100", "expected": "200"},
        ]
    },
    "cpp": {
        "code": """#include <iostream>
using namespace std;
int main() {
  int n;
  cin >> n;
  cout << n * 2 << endl;
  return 0;
}""",
        "cases": [
            {"input": "5", "expected": "10"},
            {"input": "100", "expected": "200"},
        ]
    },
    "java": {
        "code": """import java.util.Scanner;
public class Solution {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    System.out.println(n * 2);
  }
}""",
        "cases": [
            {"input": "5", "expected": "10"},
            {"input": "100", "expected": "200"},
        ]
    }
}

def run_local_test(language, code, test_input):
    """Execute code locally without Docker."""
    try:
        if language == "python":
            result = subprocess.run(
                ["python3", "-c", code],
                input=test_input,
                capture_output=True,
                text=True,
                timeout=5
            )
        elif language == "node":
            result = subprocess.run(
                ["node", "-e", code],
                input=test_input,
                capture_output=True,
                text=True,
                timeout=5
            )
        elif language == "cpp":
            # Compile
            compile_result = subprocess.run(
                ["g++", "-o", "/tmp/test_cpp", "-x", "c++", "-"],
                input=code,
                capture_output=True,
                text=True,
                timeout=5
            )
            if compile_result.returncode != 0:
                return None, "COMPILATION_ERROR", compile_result.stderr
            
            # Run
            result = subprocess.run(
                ["/tmp/test_cpp"],
                input=test_input,
                capture_output=True,
                text=True,
                timeout=5
            )
        elif language == "java":
            # Compile
            import tempfile
            import os
            with tempfile.TemporaryDirectory() as tmpdir:
                java_file = os.path.join(tmpdir, "Solution.java")
                with open(java_file, 'w') as f:
                    f.write(code)
                
                compile_result = subprocess.run(
                    ["javac", java_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if compile_result.returncode != 0:
                    return None, "COMPILATION_ERROR", compile_result.stderr
                
                # Run
                result = subprocess.run(
                    ["java", "-cp", tmpdir, "Solution"],
                    input=test_input,
                    capture_output=True,
                    text=True,
                    timeout=5,
                    cwd=tmpdir
                )
        else:
            return None, "UNKNOWN_LANGUAGE", ""
        
        status = "RUNTIME_ERROR" if result.returncode != 0 else "OK"
        return result.stdout.strip(), status, result.stderr.strip()
        
    except subprocess.TimeoutExpired:
        return None, "TIME_LIMIT_EXCEEDED", "Timeout"
    except Exception as e:
        return None, "ERROR", str(e)

def main():
    print("=" * 60)
    print("Runner Service - Local Test")
    print("=" * 60)
    
    for language, test_data in TEST_CASES.items():
        print(f"\n[{language.upper()}]")
        code = test_data["code"]
        cases = test_data["cases"]
        
        for i, case in enumerate(cases, 1):
            output, status, stderr = run_local_test(language, code, case["input"])
            passed = status == "OK" and output == case["expected"]
            
            result = "✓ PASS" if passed else "✗ FAIL"
            print(f"  Case {i}: {result}")
            print(f"    Input: {case['input']}")
            print(f"    Expected: {case['expected']}")
            print(f"    Got: {output}")
            print(f"    Status: {status}")
            if stderr:
                print(f"    Error: {stderr[:100]}")
    
    print("\n" + "=" * 60)
    print("Test complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
