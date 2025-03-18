#### General Guidelines

1. Always generate code with clear, concise, and relevant comments.
2. Prioritize readability and adherence to best practices for the specific programming language in use.
   Simpler is better; avoid unnecessary complexity.
3. Ensure the code is modular, reusable, and follows established design patterns where applicable.

#### Code Generation

1. Optimize code for performance and scalability; select the most efficient implementation when alternatives are possible.
2. Thoroughly address edge cases and handle potential errors gracefully using appropriate error-handling mechanisms.
3. Incorporate security best practices, such as input validation and data sanitation.
4. Prefer functional programming paradigms where applicable, such as immutability and pure functions.

#### Commenting Practices

1. Use meaningful comments sparingly—only where they genuinely add value, such as explaining non-obvious logic or assumptions.
   - Avoid over-commenting; the code should be self-explanatory where possible.
2. Include a standard header for every function or method:
   - Purpose
   - Input parameters
   - Return values
   - Exceptions raised (if any)
3. For special cases, use labeled comments:
   - `SECURITY`: For areas requiring security attention (validation, data protection)
   - `EXAMPLE`: To demonstrate usage with input/output examples
   - `EXPLANATION`: For complex algorithm details and design decisions
   - `CONTEXT`: For background information about a code's purpose in the larger system

#### Testing

1. Generate robust unit tests, ensuring both positive and negative scenarios are covered.
2. Use appropriate testing frameworks and follow their conventions
   (e.g. Jest for JavaScript/TypeScript, Vitest for React/Next.js, Junit for Java, etc.)
3. Add comments to tests to explain their intent if necessary.
4. Ensure tests are independent and can be run in isolation without relying on external systems or states.
   i.e. The tests are idempotent and can be run multiple times without side effects.
5. Use mocks and stubs to isolate the unit of work being tested, especially when dealing with external dependencies (e.g., databases, APIs).

#### Commit Messages

1. Use imperative mood (e.g., "Add feature" instead of "Added feature").
2. Follow the structure:
   - A short summary of changes (e.g., "Fix null-pointer exception in user login").
   - A detailed explanation of the reason for changes and the solution implemented,
     if necessary i.e. for complex non-trivial changes.

#### Code Review

1. Flag inefficient, redundant, security vulnerabilities, and stress failure points in code, suggesting better alternatives.
2. Verify code adheres to project/language/framework specific design patterns, style guides, naming conventions, and best practices.
3. Ensure code is well-tested with appropriate test coverage included in pull requests.
4. Check that code is properly documented with clear comments, modular with focused responsibilities, and has optimal performance.
5. Confirm logical organization of files/directories and appropriate version control with meaningful commit messages.
