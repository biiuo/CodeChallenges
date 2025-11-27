import sys

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

def run_test(nums, target, expected):
    result = two_sum(nums, target)
    # Sort result to match expected if order doesn't matter, but problem says "indices", usually order matters or not.
    # The problem description says "retorna los índices". Usually any order is fine, or specific order.
    # The test cases output "0 1", "1 2", "0 1". It seems to be sorted.
    result.sort()
    expected.sort()
    
    if result == expected:
        print(f"PASS: nums={nums}, target={target} -> {result}")
    else:
        print(f"FAIL: nums={nums}, target={target} -> {result}, expected {expected}")

if __name__ == '__main__':
    # Case 1
    run_test([2, 7, 11, 15], 9, [0, 1])
    # Case 2
    run_test([3, 2, 4], 6, [1, 2])
    # Case 3
    run_test([3, 3], 6, [0, 1])
