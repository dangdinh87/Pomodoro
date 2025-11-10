# Loading System Documentation

This document explains how to use the loading system in your Pomodoro Focus App.

## Components

### 1. Loader Component (`loader.tsx`)
A beautiful animated loader component with customizable size and text.

**Props:**
- `title?: string` - Main loading text (default: "Preparing your focus workspace...")
- `subtitle?: string` - Secondary loading text (default: "Setting up your Pomodoro timer for maximum productivity")
- `size?: "sm" | "md" | "lg"` - Loader size (default: "md")
- `className?: string` - Additional CSS classes
- `...props` - Any other div attributes

**Usage:**
```tsx
import Loader from '@/components/ui/loader'

<Loader 
  title="Custom title" 
  subtitle="Custom subtitle" 
  size="lg" 
/>
```

### 2. Global Loader Component (`global-loader.tsx`)
A full-screen overlay loader that can be triggered from anywhere in the app.

**Features:**
- Fixed positioning with backdrop blur
- Uses the beautiful Loader component internally
- Controlled by the global loading state

### 3. App Initializer Component (`app-initializer.tsx`)
Handles the initial app loading sequence when the website first loads.

**Features:**
- Shows a sequence of loading messages during app initialization
- Automatically hides when initialization is complete
- Reduced loading time for better UX (1.3 seconds total)

## Hooks

### useGlobalLoader Hook (`use-global-loader.ts`)
A convenient hook to control the global loader from any component.

**Returns:**
- `showLoader(message?: string, subtitle?: string)` - Shows the loader
- `hideLoader()` - Hides the loader

**Usage:**
```tsx
import { useGlobalLoader } from '@/hooks/use-global-loader'

function MyComponent() {
  const { showLoader, hideLoader } = useGlobalLoader()
  
  const handleAsyncOperation = async () => {
    showLoader('Processing...', 'Please wait while we complete your request')
    
    try {
      await someAsyncOperation()
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      hideLoader()
    }
  }
  
  return (
    <button onClick={handleAsyncOperation}>
      Start Operation
    </button>
  )
}
```

## State Management

The loading state is managed through the `useSystemStore`:

```tsx
interface SystemState {
  isLoading: boolean
  loadingMessage?: string
  loadingSubtitle?: string
  setLoading: (isLoading: boolean, message?: string, subtitle?: string) => void
}
```

## Theme Support

The loader component automatically adapts to dark/light mode:
- Light mode: Black/gray gradients
- Dark mode: White/light gray gradients
- Smooth transitions between themes

## Integration

The loading system is integrated into your app through:

1. **Layout Integration** (`layout.tsx`):
   - AppInitializer wraps the entire app
   - GlobalLoader is available throughout the app

2. **Example Usage** (`enhanced-timer.tsx`):
   - Shows loader when switching timer modes
   - Demonstrates async operation handling

## Best Practices

1. **Use for meaningful operations**: Show the loader for operations that take more than 300ms
2. **Provide context**: Always include meaningful messages about what's happening
3. **Keep it brief**: Don't show the loader for too long to avoid user frustration
4. **Handle errors**: Always hide the loader in error cases
5. **Be consistent**: Use the same loading experience throughout the app

## Customization

You can customize the loader by:
1. Modifying the colors and animations in `loader.tsx`
2. Adjusting the initialization sequence in `app-initializer.tsx`
3. Adding new sizes or variants to the loader component
4. Customizing the backdrop blur and overlay styles in `global-loader.tsx`