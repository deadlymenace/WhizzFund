# Tarobase Real-time Updates

## Using the useTarobaseData Hook

```tsx
import { useTarobaseData } from '@/hooks/use-tarobase-data';
import { subscribeTodoMany } from '@/lib/tarobase';

function TodoList() {
  const isLoggedIn = true;
  const { data, loading, error } = useTarobaseData(
    subscribeTodoMany,
    isLoggedIn, // Flag to toggle if this subscription should be enabled, or give back empty data
    'limit 5 sorted by tarobase_created_at desc' // Don't make this conditional, use a different subscribe call with a different relevant enabled flag instead
  );
  
  const todos = data || [];
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

## Manual Subscription

```tsx
const unsubscribe = subscribeTodoMany('filter', (data) => {
  // Handle updated data
});

// Don't forget to clean up
return () => unsubscribe();
```
