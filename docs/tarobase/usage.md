# Tarobase Usage Guide

## Basic Operations

### Importing SDK Functions

```tsx
import { getTodo, setTodo, deleteTodo } from '@/lib/tarobase';
```

### Reading Data

```tsx
// Get single item
const todo = await getTodo('123');

// Get multiple items
const todos = await getTodoMany();

// Filter items
const importantTodos = await getTodoMany('priority:high');
```

The filter parameter accepts natural language queries and can utilize all fields in the model plus `tarobase_created_at`.

### Writing Data

```tsx
// Create/update
await setTodo('123', { 
  title: 'Complete project', 
  completed: false 
});

// Delete
await setTodo('123', null);
// OR
await deleteTodo('123');
```

For new items, generate a random alphanumeric ID.
