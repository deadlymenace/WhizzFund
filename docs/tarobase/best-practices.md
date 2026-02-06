# Tarobase Best Practices

1. **Use Typed Interfaces**
   - Leverage the TypeScript interfaces generated for your data models

2. **Handle Loading & Error States**
   - Always account for loading and error states when fetching data

3. **Clean Up Subscriptions**
   - Return unsubscribe functions in useEffect cleanup

4. **Authentication Gates**
   - Check for user authentication before accessing protected resources

5. **Optimistic UI Updates**
   - Update UI immediately before waiting for database operations

```tsx
// Example of optimistic update
const markComplete = async (id) => {
  // Update UI immediately
  setTodos(todos.map(todo => 
    todo.id === id ? {...todo, completed: true} : todo
  ));
  
  // Actual update
  try {
    await setTodo(id, { completed: true });
  } catch (error) {
    // Revert on error
    setTodos(originalTodos);
    console.error('Failed to update todo:', error);
  }
};
```
