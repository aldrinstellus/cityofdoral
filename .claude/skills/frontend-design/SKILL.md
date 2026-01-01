# Frontend Design Skill - City of Doral

This skill guides Claude to create polished, production-grade admin interfaces following the City of Doral design system.

## When to Use

Apply this skill when:
- Creating admin dashboard pages
- Building forms, tables, and data displays
- Implementing navigation and layout components
- Designing any UI for the City of Doral project

## Design System

### Color Palette

**Primary Colors:**
```css
--doral-primary: #000080;        /* Navy - headers, primary buttons */
--doral-primary-dark: #000034;   /* Headings */
--doral-primary-hover: #0000a0;  /* Hover states */
```

**Secondary Colors:**
```css
--doral-business-blue: #1D4F91;  /* Links, table headers */
--doral-teal: #006A52;           /* Selected states */
```

**Status Colors:**
```css
--doral-success: #22c55e;        /* Green - positive */
--doral-error: #ef4444;          /* Red - errors */
--doral-warning: #f59e0b;        /* Amber - warnings */
```

**Neutral Colors:**
```css
--doral-white: #FFFFFF;
--doral-light-gray: #F5F9FD;     /* Alternating rows */
--doral-medium-gray: #F3F4F6;    /* Card backgrounds */
--doral-text: #363535;           /* Body text */
--doral-text-light: #666666;     /* Secondary text */
--doral-border: #E7EBF0;         /* Borders */
```

### Typography

- **Font Family:** `"Figtree", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **H1:** 38px, Bold, #000034
- **H2:** 32px, Bold, #000034
- **H3:** 26px, Bold, #000034
- **Body:** 18px, 500 weight, #363535
- **Small:** 15px, Normal, #666666

### Component Patterns

**Primary Button:**
- Background: #000080
- Hover: #0000a0
- Text: white
- Border-radius: 0px (sharp corners)
- Padding: 8px 16px

**Cards:**
- Background: white
- Border: 1px solid #E7EBF0
- Border-radius: 8px
- Padding: 16px-24px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)

**Tables:**
- Header: #1D4F91 background, white text
- Rows: Alternate white and #F5F9FD
- Borders: 1px solid #E7EBF0
- Padding: 12px 16px

**Form Inputs:**
- Border: 1px solid #E7EBF0
- Border-radius: 6px
- Padding: 10px 14px
- Focus: border-color #000080

**Navigation:**
- Sidebar: #000080 background
- Active: #0000a0 or white background with navy text
- Icons: 20px, Lucide React icons

### Spacing

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Icons

Use Lucide React icons:
```tsx
import { Home, Settings, Users, MessageSquare, BarChart3 } from "lucide-react";
```

## Implementation Guidelines

1. **Use shadcn/ui components** - Already installed in project
2. **Use Tailwind CSS** - Follow utility-first approach
3. **Use CSS variables** - Define in globals.css for consistency
4. **Responsive design** - Mobile-first, breakpoints at 640px, 768px, 1024px
5. **Accessibility** - WCAG 2.1 AA compliance, proper ARIA labels
6. **Loading states** - Use Loader2 spinner from Lucide
7. **Error handling** - Display user-friendly error messages

## File Locations

- Pages: `src/app/admin/[page]/page.tsx`
- Components: `src/components/admin/`
- Styles: `src/app/globals.css`

## Example Page Structure

```tsx
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#000080] text-white px-6 py-4">
        <h1 className="text-xl font-bold">Page Title</h1>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Card className="p-6">
          {/* Content */}
        </Card>
      </main>
    </div>
  );
}
```
