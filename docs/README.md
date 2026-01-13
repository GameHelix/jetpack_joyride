# Educy Development Documentation

Welcome to the Educy development documentation! This directory contains comprehensive guidelines for maintaining design consistency and code quality across the platform.

## 📁 Documentation Structure

```
docs/
├── README.md (you are here)
├── design-system/
│   ├── DESIGN_SYSTEM.md - Complete design guide
│   └── COMPONENT_LIBRARY.md - Copy-paste components
└── development/
    └── TROUBLESHOOTING.md - Common issues & fixes
```

## 📚 Documentation Files

### 🎨 Design System

#### 1. [design-system/DESIGN_SYSTEM.md](./design-system/DESIGN_SYSTEM.md)
**Your complete guide to Educy's design language**

**When to use:**
- Starting a new feature or page
- Unsure about which colors to use
- Need to know proper text sizing
- Want to understand spacing and layout rules
- Checking focus states and accessibility requirements

**Key sections:**
- **Color Palette** - All brand colors with usage guidelines
- **Typography** - Font sizes, weights, and responsive patterns
- **Form Components** - Critical input styling patterns
- **Accessibility** - WCAG compliance and focus states
- **Common Pitfalls** - Learn from past mistakes to avoid repeating them

**⚠️ Most Important Section:** Common Pitfalls - **Read this first!**

This section documents actual bugs we've fixed (like invisible white text on forms) and shows you how to avoid them.

---

#### 2. [design-system/COMPONENT_LIBRARY.md](./design-system/COMPONENT_LIBRARY.md)
**Copy-paste ready component code**

**When to use:**
- Building a new form
- Adding buttons or CTAs
- Creating cards or modals
- Implementing tables
- Adding alerts and notifications

**Key sections:**
- **Complete Form Example** - Full working form with all best practices
- **Buttons** - All button variations (primary, secondary, outline, gradient)
- **Cards** - Various card layouts and patterns
- **Modals** - Confirmation dialogs and complex modals
- **Tables** - Responsive data tables with actions
- **Notifications** - Success, error, warning, info alerts

**How to use:**
1. Find the component you need
2. Copy the entire code block
3. Paste into your file
4. Customize props, state, and content
5. The styling will already be correct!

---

### 🛠️ Development

#### 3. [development/TROUBLESHOOTING.md](./development/TROUBLESHOOTING.md)
**Solutions to common development issues**

**When to use:**
- Something isn't working
- Getting TypeScript errors
- Styles not applying
- Build or deployment issues

**Key sections:**
- **Form & Input Issues** - Invisible text, validation problems
- **Styling Issues** - Tailwind not working, focus states
- **Layout Issues** - Responsiveness, z-index conflicts
- **TypeScript Errors** - Type mismatches, null checks
- **Build & Deploy Issues** - Module errors, environment variables

**Quick diagnostics included!**

---

## 🎨 Quick Start Guide

### For New Developers

1. **Read this first:** [design-system/DESIGN_SYSTEM.md - Common Pitfalls](./design-system/DESIGN_SYSTEM.md#common-pitfalls)
   - Learn about the #1 bug: invisible text on forms
   - Understand why `text-gray-900 bg-white` is required on all inputs
   - See examples of what to do and what to avoid

2. **Bookmark the Color Palette:** [design-system/DESIGN_SYSTEM.md - Color Palette](./design-system/DESIGN_SYSTEM.md#color-palette)
   - Primary Purple: `#5C2482` - Headers, branding
   - Primary Orange: `#F95B0E` - CTAs, important actions
   - Text: `text-gray-900` - Body text, form inputs
   - Background: `bg-white` - Cards, modals, inputs

3. **Copy components when possible:** [design-system/COMPONENT_LIBRARY.md](./design-system/COMPONENT_LIBRARY.md)
   - Don't reinvent the wheel
   - Use proven patterns
   - Maintain consistency

### For Building Forms

**✅ DO THIS:**
```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Enter value"
/>
```

**❌ NEVER DO THIS:**
```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
  placeholder="Enter value"
/>
```

**Why?** Missing `text-gray-900 bg-white` causes invisible text in some browsers!

### For Adding Buttons

**Primary Action (Orange):**
```tsx
<button className="px-6 py-3 bg-[#F95B0E] hover:bg-[#d94f0c] text-white rounded-xl font-semibold transition">
  Submit
</button>
```

**Secondary Action (Purple):**
```tsx
<button className="px-6 py-3 bg-[#5C2482] hover:bg-[#7B3FA3] text-white rounded-xl font-semibold transition">
  View Details
</button>
```

**Cancel/Outline:**
```tsx
<button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition">
  Cancel
</button>
```

---

## 🔍 Common Questions

### "What color should I use for...?"

| Element | Color Class | Hex Code |
|---------|-------------|----------|
| Page titles | `text-[#5C2482]` | #5C2482 |
| Primary buttons | `bg-[#F95B0E]` | #F95B0E |
| Body text | `text-gray-600` | Tailwind default |
| Form input text | `text-gray-900` | Tailwind default |
| Labels | `text-gray-700` | Tailwind default |
| Helper text | `text-gray-500` | Tailwind default |
| Borders | `border-gray-300` | Tailwind default |

### "My form inputs are invisible!"

**Problem:** Text is white on white background.

**Solution:** Always add `text-gray-900 bg-white` to input className:

```tsx
className="... text-gray-900 bg-white ..."
```

See [design-system/DESIGN_SYSTEM.md - Pitfall #1](./design-system/DESIGN_SYSTEM.md#-pitfall-1-missing-text-color-on-inputs)

### "What border radius should I use?"

**Always use `rounded-xl`** (12px) for consistency:
- Buttons: `rounded-xl`
- Inputs: `rounded-xl`
- Cards: `rounded-xl`
- Modals: `rounded-xl`

### "How do I make my page responsive?"

Use Tailwind's responsive breakpoints:

```tsx
// Responsive text
className="text-2xl sm:text-3xl lg:text-4xl"

// Responsive layout
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Responsive padding
className="p-4 sm:p-6 lg:p-8"
```

See [design-system/DESIGN_SYSTEM.md - Typography](./design-system/DESIGN_SYSTEM.md#typography)

### "What focus state should I use?"

Standard focus pattern for all inputs:

```tsx
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
```

For brand-specific forms, use purple:

```tsx
focus:outline-none focus:ring-2 focus:ring-[#5C2482] focus:border-transparent
```

---

## ✅ Pre-Commit Checklist

Before committing your code, verify:

- [ ] All `<input>`, `<select>`, `<textarea>` have `text-gray-900 bg-white`
- [ ] All form elements have proper focus states
- [ ] Primary actions use orange (`bg-[#F95B0E]`)
- [ ] Headers use purple (`text-[#5C2482]`)
- [ ] All labels are associated with their inputs
- [ ] Border radius is `rounded-xl` everywhere
- [ ] Responsive breakpoints are included (sm:, md:, lg:)
- [ ] Buttons have hover states
- [ ] Text is readable (good contrast)
- [ ] Spacing is consistent (using Tailwind scale)

---

## 🚀 Getting Started

1. **Read:** [design-system/DESIGN_SYSTEM.md](./design-system/DESIGN_SYSTEM.md) - Start with "Common Pitfalls"
2. **Bookmark:** [design-system/COMPONENT_LIBRARY.md](./design-system/COMPONENT_LIBRARY.md) - For quick reference
3. **Check:** [development/TROUBLESHOOTING.md](./development/TROUBLESHOOTING.md) - When something breaks
4. **Build:** Use the checklist above when creating new features
5. **Review:** Check existing similar pages for patterns
6. **Test:** Verify on mobile, tablet, and desktop

---

## 📝 Contributing to Docs

Found a missing pattern or new common mistake?

1. Document it in the appropriate file:
   - Design patterns → `design-system/`
   - Development issues → `development/`
2. Add code examples (good and bad)
3. Explain why it matters
4. Create a PR with your updates

---

## 🔗 Quick Links

### Design System
- [Color Palette](./design-system/DESIGN_SYSTEM.md#color-palette)
- [Form Components](./design-system/DESIGN_SYSTEM.md#form-components)
- [Common Pitfalls](./design-system/DESIGN_SYSTEM.md#common-pitfalls)
- [Complete Form Example](./design-system/COMPONENT_LIBRARY.md#complete-form-example)
- [Button Examples](./design-system/COMPONENT_LIBRARY.md#buttons)
- [Modal Examples](./design-system/COMPONENT_LIBRARY.md#modals)

### Development
- [Troubleshooting Guide](./development/TROUBLESHOOTING.md)
- [Form Issues](./development/TROUBLESHOOTING.md#form--input-issues)
- [Styling Issues](./development/TROUBLESHOOTING.md#styling-issues)
- [Build Issues](./development/TROUBLESHOOTING.md#build--deploy-issues)

---

## 💡 Remember

> **Consistency is better than perfection.**
>
> When in doubt, copy patterns from existing pages that work well. If you're unsure about a design decision, refer to this documentation or ask the team.

> **The #1 Rule: Always add `text-gray-900 bg-white` to form inputs!**
>
> This single guideline prevents the most common bug we've encountered.

Happy coding! 🎉
