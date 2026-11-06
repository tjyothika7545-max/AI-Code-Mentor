/**
 * Standard starter templates and algorithmic snippets for each supported language
 */

export const BOILERPLATE = {
  python: `# Binary Search Algorithm in Python
def binary_search(arr, target):
    """
    Returns the index of target if found in sorted arr, else -1.
    Time Complexity: O(log n) | Space: O(1)
    """
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        guess = arr[mid]

        if guess == target:
            return mid
        elif guess < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1

# Sample test run
if __name__ == "__main__":
    numbers = [2, 4, 7, 11, 19, 23, 29, 31, 37, 43]
    print("Found target 23 at index:", binary_search(numbers, 23))
`,

  javascript: `// Two Sum Problem in JavaScript
/**
 * Finds two indices whose elements sum to target.
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}

// Sample test run
const testArray = [2, 7, 11, 15];
console.log("Indices for sum 9:", twoSum(testArray, 9));
`,

  java: `// Linked List Reversal in Java
public class Solution {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;

        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }

        return prev;
    }

    public static void main(String[] args) {
        ListNode node1 = new ListNode(1);
        node1.next = new ListNode(2);
        node1.next.next = new ListNode(3);

        ListNode reversed = reverseList(node1);
        System.out.println("Reversed head value: " + reversed.val);
    }
}
`,

  cpp: `// Maximum Subarray (Kadane's Algorithm) in C++
#include <iostream>
#include <vector>
#include <algorithm>

int maxSubArray(const std::vector<int>& nums) {
    int maxCurrent = nums[0];
    int maxGlobal = nums[0];

    for (size_t i = 1; i < nums.size(); ++i) {
        maxCurrent = std::max(nums[i], maxCurrent + nums[i]);
        if (maxCurrent > maxGlobal) {
            maxGlobal = maxCurrent;
        }
    }

    return maxGlobal;
}

int main() {
    std::vector<int> sample = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    std::cout << "Max subarray sum: " << maxSubArray(sample) << std::endl;
    return 0;
}
`,

  c: `// Bubble Sort with Early Exit in C
#include <stdio.h>
#include <stdbool.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubbleSort(arr, n);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    return 0;
}
`
};

export const SNIPPET_PRESETS = [
  { name: 'Binary Search (O(log n))', lang: 'python' },
  { name: 'Two Sum (Hash Map)', lang: 'javascript' },
  { name: 'Reverse Linked List', lang: 'java' },
  { name: "Kadane's Subarray (C++)", lang: 'cpp' },
  { name: 'Bubble Sort with Guard (C)', lang: 'c' },
];
