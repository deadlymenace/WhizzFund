# Tarobase Authentication

## Using the useAuth Hook

```tsx
import { useAuth } from '@tarobase/js-sdk';

function AuthButton() {
  const { login, logout, user, loading } = useAuth();

  if (loading) return <button disabled>Loading...</button>;
  
  if (user) {
    return (
      <div>
        <p>Connected: {user.address}</p>
        <button onClick={logout}>Disconnect</button>
      </div>
    );
  }
  
  return <button onClick={login}>Connect Wallet</button>;
}
```

## Checking Authentication

Before accessing protected resources, check the user's authentication state:

```tsx
if (!user) {
  return <div>Please log in to access this feature</div>;
}
```

Refer to function comments in tarobase.ts that specify authentication requirements.
