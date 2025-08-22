# Production Ready Prompt Generator for React/TypeScript

## Command: /generate-prp $ARGUMENTS

### Purpose
Generate a comprehensive PRP from feature file (e.g., Initial.md) that enables Claude Code to implement React/TypeScript features successfully in one pass.

---

## Step 1: Read and Analyze Feature File
Read the provided feature file ($ARGUMENTS) to understand:
- What component/feature needs to be built
- UI/UX requirements
- State management needs
- API integrations required
- Any design system or styling requirements

---

## Step 2: Research Phase

### 2.1 Codebase Analysis
Search the codebase for:
- **Similar components or patterns**
  ```bash
  # Find similar React components
  grep -r "export.*function\|export.*const" --include="*.tsx" --include="*.ts" .
  find . -name "*.tsx" -type f | xargs grep -l "useState\|useEffect"
  
  # Find similar hooks
  find . -path "*/hooks/*.ts" -o -path "*/hooks/*.tsx"
  
  # Find API integration patterns
  grep -r "fetch\|axios\|react-query" --include="*.ts" --include="*.tsx" .
  ```

- **Existing conventions**
  - Component structure (functional vs class)
  - State management (Context, Redux, Zustand, etc.)
  - Styling approach (CSS Modules, Styled Components, Tailwind, etc.)
  - TypeScript patterns (interfaces vs types)
  - File organization (components/, hooks/, utils/, types/)

- **Test patterns**
  ```bash
  # Find test examples
  find . -name "*.test.tsx" -o -name "*.test.ts" -o -name "*.spec.tsx"
  
  # Check testing library usage
  grep -r "@testing-library\|jest\|vitest" --include="*.tsx" --include="*.ts" .
  ```

### 2.2 Project Configuration Check
```bash
# Check build setup
cat package.json | grep -A5 "scripts\|dependencies\|devDependencies"

# Check TypeScript config
cat tsconfig.json

# Check ESLint/Prettier setup
ls -la .eslintrc* .prettierrc*

# Check for CSS/styling setup
find . -name "*.module.css" -o -name "*.module.scss" | head -5
grep -l "styled-components\|@emotion\|tailwind" package.json
```

### 2.3 External Research (if needed)
- **React Documentation**: [React Docs](https://react.dev)
- **TypeScript React**: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/react.html)
- **Library specific docs**: Include URLs for any libraries used
- **Component examples**: Find similar implementations

### 2.4 Clarifications Needed
If anything is unclear from Initial.md, list questions:
- [ ] Component props interface?
- [ ] State management approach?
- [ ] API endpoint details?
- [ ] Responsive breakpoints?
- [ ] Accessibility requirements?

---

## Step 3: Generate the PRP

### Template Structure
Use this template to create the PRP:

```markdown
# PRP: [Feature/Component Name from Initial.md]

## Objective
[Clear description of the React component/feature to build]

## Context & References

### Files to Study
- `components/similar/SimilarComponent.tsx` - Component structure reference
- `hooks/useSimilarHook.ts` - Custom hook pattern
- `types/interfaces.ts` - TypeScript patterns used
- `styles/Component.module.css` - Styling approach
- `__tests__/Example.test.tsx` - Testing patterns

### External Documentation
- [React Hook Docs](URL) - Specific hook usage
- [Library Docs](URL) - Third-party library reference
- [Design System](URL) - If using MUI, Ant Design, etc.

### Key Patterns to Follow
1. **Component Structure**: Functional components with hooks
2. **TypeScript**: Interface definitions before component
3. **State Management**: [Context/Redux/Zustand] pattern in use
4. **Styling**: [CSS Modules/Styled/Tailwind] approach
5. **Error Boundaries**: Error handling pattern

## Implementation Plan

### Phase 1: Setup & Types
1. Create TypeScript interfaces/types
2. Set up file structure:
   ```
   src/
   ├── components/
   │   └── FeatureName/
   │       ├── FeatureName.tsx
   │       ├── FeatureName.module.css (or .styles.ts)
   │       ├── FeatureName.test.tsx
   │       └── index.ts
   ├── hooks/
   │   └── useFeatureName.ts (if needed)
   └── types/
       └── featureName.types.ts
   ```

### Phase 2: Core Implementation

```typescript
// Pseudocode showing React/TypeScript approach

// types/featureName.types.ts
export interface FeatureNameProps {
  id: string;
  data: DataType;
  onAction: (value: string) => void;
}

export interface FeatureState {
  loading: boolean;
  error: Error | null;
  items: Item[];
}

// components/FeatureName/FeatureName.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from './FeatureName.module.css';
import { FeatureNameProps, FeatureState } from '../../types/featureName.types';

export const FeatureName: React.FC<FeatureNameProps> = ({ 
  id, 
  data, 
  onAction 
}) => {
  // State management (follow pattern from components/Similar/Similar.tsx)
  const [state, setState] = useState<FeatureState>({
    loading: false,
    error: null,
    items: []
  });

  // Custom hook if needed (see hooks/useSimilar.ts)
  const { fetchData, isLoading } = useCustomHook();

  // Event handlers
  const handleClick = useCallback((value: string) => {
    // Implementation
    onAction(value);
  }, [onAction]);

  // Effects
  useEffect(() => {
    // Side effects (follow pattern from similar components)
  }, [dependency]);

  // Render
  return (
    <div className={styles.container}>
      {/* JSX structure */}
    </div>
  );
};
```

### Phase 3: Styling
```css
/* FeatureName.module.css - if using CSS Modules */
.container {
  /* Follow existing style patterns */
}

/* OR if using Styled Components/Emotion */
// FeatureName.styles.ts
import styled from 'styled-components';

export const Container = styled.div`
  /* styles */
`;

/* OR if using Tailwind */
// Use className with Tailwind utilities
<div className="flex flex-col p-4 bg-white rounded-lg shadow">
```

### Phase 4: Testing
```typescript
// FeatureName.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureName } from './FeatureName';

describe('FeatureName', () => {
  const mockProps = {
    id: 'test-id',
    data: mockData,
    onAction: jest.fn()
  };

  it('should render correctly', () => {
    render(<FeatureName {...mockProps} />);
    expect(screen.getByTestId('feature-name')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<FeatureName {...mockProps} />);
    
    await user.click(screen.getByRole('button'));
    expect(mockProps.onAction).toHaveBeenCalled();
  });

  // Add more tests following existing patterns
});
```

## Validation Commands
```bash
# These commands should all pass when implementation is complete

# 1. TypeScript compilation
npm run tsc --noEmit
# or
yarn tsc --noEmit

# 2. Linting
npm run lint
# or
eslint . --ext .ts,.tsx --fix

# 3. Formatting
npm run format
# or
prettier --write "src/**/*.{ts,tsx,css}"

# 4. Run tests
npm test -- --coverage
# or
jest --coverage
# or
vitest run --coverage

# 5. Build check
npm run build
# or
yarn build
```

## Success Criteria
- [ ] TypeScript compiles without errors
- [ ] All ESLint rules pass
- [ ] Component renders without errors
- [ ] All props are properly typed
- [ ] Tests pass with >80% coverage
- [ ] Component is accessible (ARIA attributes)
- [ ] Responsive design works
- [ ] Error states handled gracefully
- [ ] Loading states implemented
- [ ] Code follows existing patterns

## Common React/TypeScript Issues & Solutions
| Issue | Solution |
|-------|----------|
| TypeScript errors | Check `tsconfig.json` and ensure types are exported/imported correctly |
| Hook dependency warnings | Add dependencies to useEffect/useCallback arrays |
| Testing library errors | Ensure proper async handling with waitFor/findBy |
| Style not applying | Check CSS Module imports or Tailwind config |
| State update batching | Use functional updates: `setState(prev => ...)` |
| Memory leaks | Clean up effects: return cleanup function |

## React-Specific Considerations
- **Performance**: Use React.memo, useMemo, useCallback where appropriate
- **Accessibility**: Include ARIA labels, roles, keyboard navigation
- **SEO**: Consider Next.js requirements if applicable
- **Code Splitting**: Use lazy loading for large components
- **Error Boundaries**: Wrap components in error boundaries

## Notes for Claude Code
- Start with TypeScript interfaces/types
- Follow the existing component structure exactly
- Use the same state management pattern as similar components
- Match the styling approach used in the project
- Run TypeScript compiler after each major change
- Test component in isolation before integration
```

---

## Step 4: Save the PRP
Save as: `PRPs/[component-name].md`

Where component-name is derived from Initial.md content.

---

## Step 5: Quality Check

Before finalizing, verify:
- [ ] All TypeScript types/interfaces defined
- [ ] Component structure matches existing patterns
- [ ] Hooks usage follows React best practices
- [ ] Styling approach consistent with project
- [ ] Test coverage includes user interactions
- [ ] Build and lint commands verified

### Confidence Score
Rate the PRP's completeness (1-10):
- 8-10: Ready for one-pass implementation
- 5-7: May need minor clarifications  
- 1-4: Needs more research/context

---

## Quick Checklist for React/TypeScript Success

**Must Have:**
- TypeScript interfaces for all props
- Proper React hook usage
- Component file structure
- Test file with coverage
- Consistent styling approach

**Should Have:**
- Custom hooks extraction
- Error boundary implementation
- Loading/error states
- Accessibility attributes
- Responsive design

**Nice to Have:**
- Performance optimizations
- Storybook stories
- E2E test considerations
- Documentation/JSDoc comments

---

## Example Usage

```bash
# Run this command in Claude Code:
/generate-prp Initial.md

# Claude Code will:
1. Read Initial.md
2. Research React/TypeScript codebase
3. Generate PRP following this template
4. Save to PRPs/component-name.md
5. Report confidence score
```

## Framework-Specific Adaptations

### For Next.js Projects
- Include Server/Client component considerations
- Add metadata and SEO requirements
- Consider ISR/SSR/SSG patterns

### For Vite Projects
- Use Vite-specific commands
- Consider HMR requirements
- Check vite.config.ts settings

### For Create React App
- Standard CRA patterns
- Check for ejected configuration
- Use CRA-specific scripts

Remember: The goal is to give Claude Code everything it needs to implement the React/TypeScript feature successfully without asking for clarifications.