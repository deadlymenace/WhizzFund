# PROJECT GUIDELINES FOR CLAUDE CODE

## IMPORTANT: Build Verification Rules
**ALWAYS run the build command at the end of your work to ensure code compiles correctly:**
- For UI tasks: Run `npm run build` in the project root
- If the build fails, you MUST fix all errors before marking the task as complete
- Read error messages carefully and fix issues systematically
- Run the build again after fixing errors to confirm success
- Never complete a task with a failing build

Keep in mind you are running as an UI agent on Poof.new for this task. What this means is you should have some message context from a user and assistant that brought you here, and you should ONLY be performing targeted, surgical changes and updates related to fulfilling what was considered required from the UI. This means you are NOT meant to perform tasks intended for the API or DB agent.

## Build/Development Commands
- `npm run build` - Build for production

## Code Style Guidelines
- **Imports**: Use relative paths for local imports
- **TypeScript**: Use strict typing, avoid using `any` when possible
- **Formatting**: Follow existing code conventions with 2-space indentation
- **Components**: PascalCase for component names, camelCase for variables/functions
- **State Management**: Use React hooks for local state
- **Error Handling**: Always use try/catch blocks for async operations
- **Styling**: Use Tailwind classes; prefer composition over custom CSS
- **Tarobase Integration**: Follow Tarobase SDK patterns for data operations
- Avoid using dynamic imports if possible
- Use icons from lucide-react when possible

## File Structure Conventions
- Keep components in appropriate directories
- Place utility functions in lib folders
- Follow existing project structure patterns
- For any database or onchain actions, there is likely a 'lib/tarobase.ts' file that has a relevant function for you to use.
- When reading/looking for a function in the lib/tarobase.ts file, keep in mind the comment above each defined function gives context on how that function works and what it is capable of, and if it runs something onchain or offchain when it is run. Keep in mind onchain means on the solana blockchain.
- For any api calls that are specific to our own service, there is likely an API you can use in the 'lib/api-client.ts' file.
- For constants related to this project, check the 'lib/constants.ts' file.

## Testing Practices
- Run build to verify TypeScript compilation
- Test changes in development environment
- Ensure no console errors in browser

## Important Notes
- If making any UI changes with mock data, attach a '// -- USING MOCK DATA --' comment to the code above it.
- This file provides guidelines for Claude Code when working on this project
- Build verification is mandatory - never skip the build step
- If build commands fail, investigate and fix before completing the task
- If the recent chat message asks for real functionality, to utilize smart contracts, or persist data, find and replace existing mock data with actual functionality using the tarobase.ts and api-client.ts files, if applicable functions exist.
- APIs will NOT exist on our root url. so attempting to call an API without the api client, and with a direct fetch like 'fetch('/api/ping') will NEVER work

## 📡 Tarobase SDK Integration

### Direct API Calls
```tsx
import { getItem, setItem, uploadAppFiles, getWalletTokenBalance, getTokenMetadata } from '@/lib/tarobase';
import { Time, Token } from '@/lib/tarobase';

// Basic CRUD operations
const item = await getItem('itemId');
await setItem('itemId', { 
  name: 'Example',
  timestamp: Time.Now,
  tokenAmount: Token.amount('SOL', 1.5)
});

// File operations
const success = await uploadAppFiles('fileId', file);
const fileItem = await getAppFiles('fileId');

// Blockchain data via Uniblock
const tokenData = await getWalletTokenBalance({
  walletAddress: '45MfLZaA7axCe8rHk3DYTdWU5wyHc1yCK4atDxyGz6S2',
  chainId: 'solana'
});

const tokenMetadata = await getTokenMetadata( {
  tokenAddress : 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn'
})
```

### Special Values
- **`Time.Now`** - Server-side timestamp (Unix seconds)
- **`Token.amount(name, amount)`** - Cryptocurrency values with decimal handling
  - `'SOL'` - Native Solana (9 decimals)
  - `'USDC'` - USDC on Solana (6 decimals)  
  - `'other'` - All other SPL tokens (6 decimals)

### Data Handling
- **Timestamps**: All Tarobase timestamps are in SECONDS, convert with `new Date(timestamp * 1000)`
- **Token decimals**: Tarobase values need division by correct power of 10 for display
- **Uniblock values**: Already in human-readable format, no conversion needed

### Authentication via tarobase. Uses user's configured auth automatically.
import { useAuth } from '@tarobase/js-sdk';
const { login, logout, user, loading } = useAuth();


### Real-time Data with useTarobaseData
```tsx
import { useTarobaseData } from '@/hooks/use-tarobase-data';

/*
  Args to usetarobasedata look like this:
    subscribeFn: (callback: (data: T) => void, ...args: any[]) => Promise<() => void>, // run something when new data has arrived, with 'data' containing all of the data
    enabled: boolean, // enabled is whether or not this hook should be actively subscribed or not
    ...args: any[] // args is to fill in whatever params are needed for the 'subscribe' call afterwards. This can be some ids, can be a plain language filter, and the relevant subscribe in the tarobase file will have context.
*/

// Subscribe to real-time data
const { data: posts, loading, error } = useTarobaseData<Post[]>(
  subscribeManyPosts, true, 'isPublished=true limit 10'
);

// Subscribe to single item with user dependency
const { user } = useAuth();
const { data: profile } = useTarobaseData<UserProfile | null>(
  subscribeUserProfile, !!user, user?.address
);
```
