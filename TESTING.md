# Running Tests in This Project

This project uses Jest for testing TypeScript code.

## Setup

1. **Install Jest and TypeScript types:**

   Open a terminal in the project root and run:
   ```sh
   npm install --save-dev jest ts-jest @types/jest
   ```

2. **Initialize Jest config for TypeScript:**

   ```sh
   npx ts-jest config:init
   ```
   This will create a `jest.config.js` file.

3. **Add a test script to your `package.json`:**

   ```json
   "scripts": {
     "test": "jest"
   }
   ```
   (Add this if it doesn't already exist.)

## Running Tests

To run all tests:
```sh
npm test
```

## Test Location

All test files should be placed in the `test/` directory and named with `.test.ts` or `.test.js`.

## Troubleshooting
- If you see errors like `Cannot find name 'describe'`, make sure you have installed `@types/jest` and restarted your editor.
- If you use VS Code, reload the window after installing dependencies to clear TypeScript errors.

---

For more info, see the [Jest documentation](https://jestjs.io/docs/getting-started).
