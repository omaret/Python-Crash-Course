export interface Lesson {
  id: string;
  title: string;
  description: string;
  concept: string;
  initialCode: string;
  challenge: string;
  solutionKeywords: string[];
  pitfalls?: string[];
}

export const CURRICULUM: Lesson[] = [
  {
    id: '1',
    title: 'Variables & Printing',
    description: 'The absolute basics. Storing data and showing it to the world.',
    concept: 'In Python, you create a variable by just giving it a name and a value. Use `print()` to see it.',
    initialCode: '# Create a variable named "name" and print it\nname = "Python Runner"\nprint(name)',
    challenge: 'Change the code to print "Hello PySprint!" instead of the variable.',
    solutionKeywords: ['print', 'Hello PySprint!'],
    pitfalls: [
      'Python is case-sensitive: `Name` is different from `name`.',
      'Variable names cannot start with numbers.'
    ]
  },
  {
    id: '2',
    title: 'Numbers & Math',
    description: 'Python is a powerful calculator.',
    concept: 'You can use +, -, *, /, and ** (for power).',
    initialCode: 'x = 10\ny = 5\n# Calculate the sum and print it\nresult = x + y\nprint(result)',
    challenge: 'Calculate 2 to the power of 10 and print the result.',
    solutionKeywords: ['2', '**', '10', 'print'],
    pitfalls: [
      'Division `/` always returns a float (e.g., 4/2 is 2.0).',
      'Use `//` for integer division if you want to discard the remainder.'
    ]
  },
  {
    id: '3',
    title: 'Conditionals (If/Else)',
    description: 'Making decisions in your code.',
    concept: 'Use `if`, `elif`, and `else` to run code based on conditions. Don\'t forget the colon `:`!',
    initialCode: 'age = 18\nif age >= 18:\n    print("Adult")\nelse:\n    print("Minor")',
    challenge: 'Change age to 15 and add an elif for "Teen" if age is between 13 and 17.',
    solutionKeywords: ['elif', 'age', '15', 'print'],
    pitfalls: [
      'Python uses indentation (spaces) to define blocks of code.',
      'Always use a colon `:` after `if`, `elif`, and `else` statements.'
    ]
  },
  {
    id: '4',
    title: 'Lists (Arrays)',
    description: 'Storing collections of items.',
    concept: 'Lists are created with square brackets `[]`. You can access items by index (starting at 0).',
    initialCode: 'fruits = ["apple", "banana", "cherry"]\nprint(fruits[0])',
    challenge: 'Add "dragonfruit" to the list and print the whole list.',
    solutionKeywords: ['append', 'dragonfruit', 'print'],
    pitfalls: [
      'Indexing starts at 0, not 1.',
      'Accessing an index that doesn\'t exist will cause an `IndexError`.'
    ]
  },
  {
    id: '5',
    title: 'Loops (For)',
    description: 'Doing things repeatedly without getting tired.',
    concept: 'Use `for item in list:` to iterate through items. Indentation is key!',
    initialCode: 'numbers = [1, 2, 3, 4, 5]\nfor n in numbers:\n    print(n * 2)',
    challenge: 'Write a loop that prints "Sprint!" 3 times.',
    solutionKeywords: ['for', 'range', '3', 'print'],
    pitfalls: [
      'The code inside the loop MUST be indented.',
      '`range(3)` produces 0, 1, 2 (it stops BEFORE the number 3).'
    ]
  },
  {
    id: '6',
    title: 'Dictionaries',
    description: 'Key-value pairs for structured data.',
    concept: 'Dictionaries use curly braces `{}` and map keys to values.',
    initialCode: 'user = {"name": "Alice", "level": 10}\nprint(user["name"])',
    challenge: 'Add a new key "xp" with value 500 to the dictionary and print it.',
    solutionKeywords: ['user', 'xp', '500', 'print'],
    pitfalls: [
      'Keys must be unique.',
      'Accessing a non-existent key will cause a `KeyError`.'
    ]
  },
  {
    id: '7',
    title: 'Functions',
    description: 'Reusable blocks of code.',
    concept: 'Define a function with `def name(params):`. Call it with `name(args)`.',
    initialCode: 'def greet(name):\n    print("Hi " + name)\n\ngreet("Python")',
    challenge: 'Define a function named "square" that returns n * n. Then print square(5).',
    solutionKeywords: ['def', 'square', 'return', 'print', '5'],
    pitfalls: [
      'Functions must be defined before they are called.',
      'Variables defined inside a function are not accessible outside (Scope).'
    ]
  },
  {
    id: '8',
    title: 'Error Handling',
    description: 'Preventing your app from crashing.',
    concept: 'Use `try` and `except` to handle potential errors gracefully.',
    initialCode: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")',
    challenge: 'Wrap a print(x) in a try-except block to catch NameError (since x isn\'t defined).',
    solutionKeywords: ['try', 'except', 'NameError', 'print'],
    pitfalls: [
      'Don\'t use a bare `except:` as it catches everything, including system exits.',
      'Always try to catch specific exceptions.'
    ]
  }
];
