# Execute Production Ready Prompts (React/TypeScript)

## Command: /execute-prp $ARGUMENTS

Execute a React/TypeScript feature implementation using the specified PRP file with comprehensive validation and iterative refinement.

---

## Phase 1: Load and Analyze PRP 📋

### 1.1 Read PRP File
```bash
# Load the specified PRP file
cat PRPs/$ARGUMENTS
```

### 1.2 Context Verification
- [ ] **Objective** clearly understood
- [ ] **File references** accessible and reviewed
- [ ] **External documentation** URLs noted
- [ ] **Validation commands** executable
- [ ] **Success criteria** measurable

### 1.3 Dependency Check
```bash
# Verify all required dependencies are installed
npm list | grep -E "react|typescript|@types"
cat package.json | grep -A20 "dependencies"

# Install missing dependencies if needed
npm install [missing-packages]
```

### 1.4 Extended Research (if needed)
If PRP lacks context, perform additional research:
```bash
# Find more examples in codebase
find . -name "*.tsx" -type f -exec grep -l "similar-pattern" {} \;

# Check component structure patterns
ls -la src/components/*/index.ts

# Review existing tests for patterns
find . -name "*.test.tsx" -exec head -20 {} \;
```

---

## Phase 2: ULTRATHINK - Comprehensive Planning 🧠

### 2.1 Implementation Strategy
Create a detailed mental model:
```typescript
/*
THINK THROUGH:
1. Component hierarchy and data flow
2. State management approach
3. TypeScript interfaces needed
4. Props drilling vs Context
5. Performance implications
6. Error boundaries placement
7. Testing strategy
8. Accessibility requirements
*/
```

### 2.2 Task Breakdown with TODOs
Use TodoWrite tool to create implementation plan:

```markdown
## Implementation TODOs

### Setup Tasks
- [ ] Create component directory structure
- [ ] Define TypeScript interfaces/types
- [ ] Set up test file structure
- [ ] Configure styling approach

### Core Implementation
- [ ] Implement base component structure
- [ ] Add state management
- [ ] Implement event handlers
- [ ] Add data fetching logic
- [ ] Handle loading states
- [ ] Handle error states

### Styling & UI
- [ ] Apply base styles
- [ ] Implement responsive design
- [ ] Add animations/transitions
- [ ] Ensure accessibility

### Testing
- [ ] Write unit tests
- [ ] Add integration tests
- [ ] Test error scenarios
- [ ] Check accessibility

### Optimization
- [ ] Add React.memo where needed
- [ ] Implement useMemo/useCallback
- [ ] Code splitting if applicable
- [ ] Performance profiling
```

### 2.3 Pattern Identification
Review and document patterns to follow:
```typescript
// Document patterns found in codebase
const patterns = {
  componentStructure: "Functional with hooks",
  stateManagement: "Context API / Redux / Zustand",
  styling: "CSS Modules / Styled Components / Tailwind",
  testing: "React Testing Library + Jest",
  errorHandling: "Error Boundary wrapper",
  dataFetching: "Custom hooks / React Query / SWR"
};
```

---

## Phase 3: Execute Implementation 🚀

### 3.1 File Structure Creation
```bash
# Create component structure
mkdir -p src/components/FeatureName
touch src/components/FeatureName/FeatureName.tsx
touch src/components/FeatureName/FeatureName.module.css
touch src/components/FeatureName/FeatureName.test.tsx
touch src/components/FeatureName/index.ts

# Create type definitions
mkdir -p src/types
touch src/types/featureName.types.ts

# Create hooks if needed
mkdir -p src/hooks
touch src/hooks/useFeatureName.ts
```

### 3.2 Progressive Implementation

#### Step 1: TypeScript Interfaces
```typescript
// Start with type definitions
// src/types/featureName.types.ts
export interface FeatureProps {
  // Define all props with proper types
}

export type FeatureState = {
  // Define state shape
}
```

#### Step 2: Component Shell
```typescript
// Build component incrementally
// src/components/FeatureName/FeatureName.tsx
import React from 'react';
import { FeatureProps } from '../../types/featureName.types';

export const FeatureName: React.FC<FeatureProps> = (props) => {
  // Start with minimal render
  return <div>Component Shell</div>;
};
```

#### Step 3: Add Functionality
- Add state management
- Implement hooks
- Add event handlers
- Connect to APIs

#### Step 4: Styling
- Apply styles based on project approach
- Ensure responsive design
- Add dark mode support if applicable

#### Step 5: Tests
- Write tests parallel to implementation
- Follow TDD if possible

### 3.3 Continuous Validation
After each major change:
```bash
# TypeScript check
npm run tsc --noEmit

# Lint check
npm run lint

# Test current implementation
npm test -- --watchAll=false
```

---

## Phase 4: Validate Implementation ✅

### 4.1 Run All Validation Commands
Execute each validation from the PRP:

```bash
# 1. TypeScript compilation
npm run tsc --noEmit
# If fails: Fix type errors, check imports

# 2. Linting
npm run lint --fix
# If fails: Apply auto-fixes, resolve remaining issues

# 3. Formatting
npm run format
# Auto-formats code to project standards

# 4. Unit Tests
npm test -- --coverage --watchAll=false
# If fails: Debug failing tests, check assertions

# 5. Build Verification
npm run build
# If fails: Check for compilation errors, missing dependencies
```

### 4.2 Error Resolution Workflow
For each failure:
1. **Identify** the specific error
2. **Reference** PRP's "Common Issues & Solutions"
3. **Search** codebase for similar error fixes
4. **Apply** fix
5. **Re-validate** specific command
6. **Repeat** until passing

### 4.3 Performance Validation
```bash
# React DevTools Profiler
# Check for unnecessary re-renders

# Bundle size check
npm run build
# Check build output size

# Lighthouse audit (if applicable)
# Run in browser DevTools
```

---

## Phase 5: Complete and Verify 🎯

### 5.1 Final Checklist
Review all items from PRP:
- [ ] All TypeScript types defined
- [ ] Component renders without errors
- [ ] All props properly typed
- [ ] State management implemented
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Tests passing with >80% coverage
- [ ] Accessibility requirements met
- [ ] Responsive design working
- [ ] Code follows existing patterns

### 5.2 Integration Testing
```bash
# Start development server
npm start

# Manual testing checklist:
- [ ] Component renders in app context
- [ ] User interactions work as expected
- [ ] No console errors or warnings
- [ ] Network requests successful
- [ ] State updates correctly
- [ ] Error boundaries catch errors
```

### 5.3 Documentation Update
```markdown
# Update relevant documentation
- [ ] Component README if needed
- [ ] Storybook stories if applicable
- [ ] API documentation
- [ ] Props documentation with examples
```

### 5.4 Final Validation Suite
```bash
# Run complete validation
npm run validate:all || (
  npm run tsc --noEmit &&
  npm run lint &&
  npm run test -- --coverage &&
  npm run build
)
```

---

## Phase 6: Reference and Iterate 🔄

### 6.1 Re-read PRP
```bash
# Review PRP again to ensure nothing missed
cat PRPs/$ARGUMENTS

# Check each section:
- [ ] Objective fully met
- [ ] All patterns followed
- [ ] All validations passing
- [ ] Success criteria achieved
```

### 6.2 Performance Review
- **Bundle size**: Within acceptable limits?
- **Runtime performance**: No unnecessary re-renders?
- **Test coverage**: Meets minimum threshold?
- **Type safety**: All any types eliminated?

### 6.3 Code Quality Review
```typescript
// Self-review checklist
const codeQuality = {
  readable: "Can another dev understand this?",
  maintainable: "Easy to modify/extend?",
  testable: "Well-tested with good coverage?",
  performant: "Optimized where necessary?",
  accessible: "WCAG compliant?",
  documented: "Self-documenting with comments where needed?"
};
```

---

## Completion Report Template 📊

```markdown
## Implementation Complete: [Feature Name]

### Summary
- **PRP File**: $ARGUMENTS
- **Implementation Time**: X hours
- **Files Created/Modified**: Y files
- **Test Coverage**: Z%

### Validation Results
- ✅ TypeScript compilation: PASS
- ✅ Linting: PASS
- ✅ Tests: PASS (X tests)
- ✅ Build: PASS
- ✅ Coverage: X%

### Implementation Notes
- [Any deviations from PRP]
- [Challenges encountered]
- [Additional improvements made]

### Next Steps
- [ ] Code review
- [ ] Deploy to staging
- [ ] Performance monitoring
- [ ] User acceptance testing
```

---

## Error Recovery Patterns 🔧

### Common React/TypeScript Issues

| Error Type | Quick Fix | Detailed Solution |
|------------|-----------|-------------------|
| `Cannot find module` | Check imports and paths | Verify tsconfig paths, check case sensitivity |
| `Type 'X' is not assignable` | Fix type definitions | Review interface/type, use proper generics |
| `Hook called conditionally` | Move hook to top level | Ensure hooks not in conditions/loops |
| `Missing dependency` | Add to useEffect deps | Include all referenced values |
| `Test timeout` | Add async/await | Use waitFor, increase timeout |
| `Build fails` | Check for type errors | Run tsc separately, fix all errors |

### Recovery Commands
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force

# Reset TypeScript cache
rm -rf tsconfig.tsbuildinfo

# Fresh build
rm -rf build dist
npm run build
```

---

## Notes for Claude Code 📝

### Execution Priority
1. **Type Safety First**: Define all types before implementation
2. **Test Early**: Write tests as you implement
3. **Incremental Progress**: Commit working states frequently
4. **Validate Often**: Run checks after each component section

### When Stuck
1. Reference similar components in codebase
2. Check PRP's "Common Issues & Solutions"
3. Search for patterns in test files
4. Use web search for library-specific issues
5. Simplify to minimal working version, then enhance

### Success Indicators
- No TypeScript errors
- All tests passing
- Component renders without warnings
- Meets all PRP success criteria
- Follows established patterns

Remember: The goal is complete, working implementation that passes all validations and follows project conventions.