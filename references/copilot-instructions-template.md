# MDM Kiosk Web MC — Design System & Code Generation Rules

> These rules ensure AI-generated code follows the established design system
> derived from the **Configuration** and **Workflows** apps.
> All new components MUST follow these conventions.

---

## 1. Project Overview & Tech Stack

- **Framework:** Angular (latest) with Nx monorepo + Module Federation
- **UI Library:** Angular Material (MDC-based, Material Design 2)
- **Forms:** Reactive Forms (`FormGroup`, `FormControl`) — NO template-driven forms
- **Change Detection:** OnPush strategy preferred
- **Control Flow:** Use new Angular `@if`, `@for`, `@switch` syntax — NOT `*ngIf`, `*ngFor`
- **Global Styles:** `apps/host/src/styles.scss` + partials in `apps/host/src/app/styles/`
- **Shared Components:** `shared/src/lib/components/` — reuse before creating new ones
- **Font:** Roboto, 'Helvetica Neue', sans-serif

---

## 2. CSS Utility Classes — Spacing (Margin & Padding)

The project has a comprehensive utility-first CSS class system generated in `apps/host/src/styles.scss`.
**DO NOT write custom margin/padding in component SCSS when a utility class exists.**

### Pixel-based (0–1000px range)

| Direction     | Margin class     | Padding class    |
|---------------|------------------|------------------|
| Bottom        | `mb-{n}px`       | `pb-{n}px`       |
| Top           | `mt-{n}px`       | `pt-{n}px`       |
| Left          | `ml-{n}px`       | `pl-{n}px`       |
| Right         | `mr-{n}px`       | `pr-{n}px`       |
| Vertical      | `my-{n}px`       | `py-{n}px`       |
| Horizontal    | `mx-{n}px`       | `px-{n}px`       |

Negative margins: `mlm-{n}px`, `mrm-{n}px`, `mtm-{n}px`, `mbm-{n}px`

### Scale-based (4px base unit, 0–12)

| Class pattern        | Example        | Result         |
|----------------------|----------------|----------------|
| `mb-{n}`             | `mb-3`         | margin-bottom: 12px |
| `mt-{n}`             | `mt-6`         | margin-top: 24px    |
| `ms-{n}`             | `ms-2`         | margin-left: 8px    |
| `me-{n}`             | `me-2`         | margin-right: 8px   |
| `m-{n}`              | `m-0`          | margin: 0           |
| `p-{n}`              | `p-3`          | padding: 12px       |
| `py-{n}`, `px-{n}`   | `py-2`         | padding-y: 8px      |

### Gap (0–200px)

```
gap-{n}    → gap: {n}px
```

Common values: `gap-4`, `gap-8`, `gap-12`, `gap-16`, `gap-20`, `gap-24`, `gap-30`, `gap-40`

### Common Spacing Values

Prefer these values for visual consistency: **4, 6, 8, 10, 12, 16, 20, 24, 32, 40px**

### Line Height

```
lh-{n}px   → line-height: {n}px
```

Common: `lh-16px`, `lh-20px`, `lh-32px`

---

## 3. CSS Utility Classes — Width & Height

### Pixel-based (0–1000px)

```
w-{n}px       h-{n}px
max-w-{n}px   max-h-{n}px
min-w-{n}px   min-h-{n}px
```

### Percentage (10–100 in increments of 10)

```
w-{10|20|30|40|50|60|70|80|90|100}   → width: n%
h-{10|20|30|40|50|60|70|80|90|100}   → height: n%
```

### Special

```
w-full         → width: 100%
h-full         → height: 100%
w-max-content  → width: max-content
w-fit-content  → width: fit-content
w-screen       → width: 100vw
h-screen       → height: 100vh
```

### Common Form Field Widths

- Small number input: `w-50px`, `w-80px`
- Medium input: `w-200px`, `w-250px`
- Standard input: `w-320px`
- Wide input: `w-480px`, `w-500px`
- Full width: `w-100` (100%)

---

## 4. CSS Utility Classes — Flexbox & Grid

### Flex

```
flex             → display: flex
flex-col         → flex-direction: column
flex-column      → flex-direction: column  (alias)
flex-row         → flex-direction: row
flex-wrap        → flex-wrap: wrap
flex-1           → flex: 1
inline-flex      → display: inline-flex
```

### Alignment

```
items-center     → align-items: center
items-start      → align-items: flex-start
items-end        → align-items: flex-end
items-base-line  → align-items: baseline
```

### Justification

```
justify-between  → justify-content: space-between
justify-center   → justify-content: center
justify-end      → justify-content: flex-end
justify-start    → justify-content: flex-start
```

### Grid

```
grid             → display: grid
grid-cols-{2-6}  → grid-template-columns: repeat(n, 1fr)
```

### Common Flex Combos (use these patterns)

```html
<div class="flex flex-col gap-12">          <!-- Vertical list with 12px spacing -->
<div class="flex items-center gap-8">       <!-- Horizontal centered items -->
<div class="flex justify-between items-center">  <!-- Space-between row -->
<div class="flex flex-col items-start gap-12">   <!-- Left-aligned vertical list -->
```

---

## 5. CSS Utility Classes — Typography

### Heading / Label Classes

| Class              | Font Size | Weight | Line Height | Notes                    |
|--------------------|-----------|--------|-------------|--------------------------|
| `title-h1`         | 14px      | 500    | 20px        | Section title            |
| `title-h2`         | 13px      | 500    | 20px        | Sub-section title        |
| `label`            | 13px      | 500    | 20px        | Form label, mb: 4px, display: block |

### Text Style Utilities

```
bold               → font-weight: 500
text-bold          → font-weight: 500, color: #3d4a68
text-bold-darker   → font-weight: 500, color: #1b273c
fs-13              → font-size: 13px
fw-500             → font-weight: 500
line-height-20     → line-height: 20px
```

### Text Alignment & Overflow

```
text-center        → text-align: center
text-left          → text-align: left
truncate           → text-overflow: ellipsis + overflow: hidden + white-space: nowrap
wrap-text          → word-wrap: break-word
overflow-ellipsis  → text-overflow: ellipsis
```

### Page Headings Convention

- **Page title (h2):** 20px, weight 500, lh-32px, margin: 0
- **Section heading:** Use `title-h1` (14px, 500)
- **Sub-section heading:** Use `title-h2` (13px, 500)
- **Form labels:** Use `label` class (13px, 500, block)

---

## 6. CSS Utility Classes — Colors

### Text Colors

| Class               | Color   | Usage                       |
|----------------------|---------|-----------------------------|
| `text-grey`          | #485161 | Secondary text              |
| `text-grey-opacity`  | #707682 | Tertiary / disabled text    |
| `text-green`         | #008a00 | Success text                |
| `text-red`           | #d00300 | Error text                  |
| `text-link`          | #1d6bfc | Clickable link text         |
| `text-orange`        | #ed6706 | Warning text                |
| `text-yellow`        | #f6bf2a | Caution text                |

### Background Colors

| Class          | Color   | Usage               |
|----------------|---------|---------------------|
| `bg-white`     | #ffffff | Default background  |
| `bg-error`     | #fceded | Error background    |
| `bg-success`   | #dbeedb | Success background  |
| `bg-warning`   | #fff6dc | Warning background  |
| `bg-info`      | #f4f4f5 | Info / neutral bg   |

### Status Accent Colors

```
.red     → color: #ff0000
.green   → color: #148b14
.orange  → color: #f26c51
```

### Color Palette Reference

| Purpose          | Hex     |
|------------------|---------|
| Primary          | #1d6bfc |
| Primary Hover    | #154fba |
| Text Primary     | #1b273c |
| Text Secondary   | #485161 |
| Text Tertiary    | #707682 |
| Disabled         | #a4a8ae |
| Border Default   | #e9eaeb |
| Border Strong    | #bcbfc3 |
| Error            | #d00300 |
| Success          | #008a00 |
| Highlight Row    | #bed5fe |
| Background Light | #f4f4f5 |

---

## 7. CSS Utility Classes — Borders

```
border           → 1px solid #e9eaeb (all sides)
border-left      → 1px solid #e9eaeb (left only)
border-right     → 1px solid #e9eaeb (right only)
border-top       → 1px solid #e9eaeb (top only)
border-bottom    → 1px solid #e9eaeb (bottom only)
thin-border      → 1px solid #e9eaeb
strong-border    → 1px solid #bcbfc3
```

---

## 8. CSS Utility Classes — Other

```
cursor-pointer   → cursor: pointer
scroll           → overflow-y: auto
block            → display: block
absolute         → position: absolute
relative         → position: relative
top-0            → top: 0
left-0           → left: 0
right-0          → right: 0
bottom-0         → bottom: 0
ms-auto          → margin-left: auto
m-0              → margin: 0
p-0              → padding: 0
disabled         → opacity: 0.5, pointer-events: none, cursor: none, user-select: none
overflow-hidden  → overflow: hidden
overflow-y-auto  → overflow-y: auto
overflow-x-hidden → overflow-x: hidden
```

---

## 9. Component Template — mat-form-field

**ALWAYS** use these conventions for form fields:

```html
<!-- Standard text input -->
<mat-form-field appearance="outline" class="small remove-space w-320px">
  <input matInput maxlength="255" type="text" formControlName="fieldName" />
</mat-form-field>

<!-- Number input (narrow) -->
<mat-form-field appearance="outline" class="small remove-space w-80px">
  <input matInput [maxLength]="10" type="number" formControlName="fieldName" />
</mat-form-field>

<!-- Select dropdown -->
<mat-form-field appearance="outline" class="small remove-space w-200px">
  <mat-select formControlName="fieldName">
    <mat-option [value]="'option1'">Option 1</mat-option>
    <mat-option [value]="'option2'">Option 2</mat-option>
  </mat-select>
</mat-form-field>

<!-- Full-width input -->
<mat-form-field appearance="outline" class="small remove-space w-100">
  <input matInput maxlength="1000" type="text" formControlName="fieldName" />
</mat-form-field>
```

### Rules

- **ALWAYS** add `appearance="outline"` — never use `fill` or default appearance
- **ALWAYS** add `class="small"` to reduce field height to 32px
- Add `remove-space` to remove bottom margin reserved for error messages (when no validation needed)
- Add a width class (`w-{n}px` or `w-100`) — never let form fields auto-size
- Use `subscriptSizing="dynamic"` when error messages are present and space should grow
- For error display:

```html
<mat-form-field appearance="outline" class="small w-320px" subscriptSizing="dynamic">
  <input matInput formControlName="fieldName" />
  @if (form.controls['fieldName'].hasError('required')) {
    <mat-error>Field is required</mat-error>
  }
  @if (form.controls['fieldName'].hasError('invalidEmail')) {
    <mat-error>Invalid email</mat-error>
  }
</mat-form-field>
```

---

## 10. Component Template — mat-expansion-panel (Accordion)

### Standard Accordion

```html
<mat-accordion [hideToggle]="true" multi>
  <mat-expansion-panel #panelRef>
    <mat-expansion-panel-header>
      <mat-panel-title>
        <mat-icon
          [svgIcon]="panelRef.expanded ? 'chevron_down' : 'chevron_right'"
          class="small me-2"
        ></mat-icon>
        Panel Title
      </mat-panel-title>
    </mat-expansion-panel-header>

    <div class="accordion-content">
      <!-- Panel content here -->
    </div>
  </mat-expansion-panel>
</mat-accordion>
```

### Rules

- **ALWAYS** use `[hideToggle]="true"` — custom chevron icon replaces the default toggle
- **ALWAYS** use `multi` attribute to allow multiple panels open
- **ALWAYS** use `#panelRef` template variable for expanded state
- **ALWAYS** add chevron icon with `class="small me-2"`:
  - `svgIcon="chevron_down"` when expanded
  - `svgIcon="chevron_right"` when collapsed
- Content wrapper: `<div class="accordion-content">` (applies `margin-left: 37px`)
- Lazy-load heavy content with `<ng-template matExpansionPanelContent>`

### Nested Expansion Panel

```html
<mat-expansion-panel #nestedPanel class="ml-40px with-border">
  <mat-expansion-panel-header>
    <mat-panel-title>
      <mat-icon
        [svgIcon]="nestedPanel.expanded ? 'chevron_down' : 'chevron_right'"
        class="small me-2"
      ></mat-icon>
      Nested Section Title
    </mat-panel-title>
  </mat-expansion-panel-header>

  <div class="body-section">
    <!-- Nested content -->
  </div>
</mat-expansion-panel>
```

### Rules for Nested Panels

- Add `class="ml-40px with-border"` on the nested `mat-expansion-panel`
- Use `<div class="body-section">` for nested content wrapper
- Maintain the same chevron icon pattern

### Lazy-loaded Content

```html
<mat-expansion-panel #panelRef>
  <mat-expansion-panel-header>
    <mat-panel-title>
      <mat-icon
        [svgIcon]="panelRef.expanded ? 'chevron_down' : 'chevron_right'"
        class="small me-2"
      ></mat-icon>
      Heavy Content Panel
    </mat-panel-title>
  </mat-expansion-panel-header>

  <ng-template matExpansionPanelContent>
    <app-heavy-component [form]="form"></app-heavy-component>
  </ng-template>
</mat-expansion-panel>
```

---

## 11. Component Template — mat-tab

### Pattern A: Router-Based Tabs (Page-Level Navigation)

Use `mat-tab-nav-bar` when tabs correspond to routes.

```html
<nav
  mat-tab-nav-bar
  [tabPanel]="tabPanel"
  [mat-stretch-tabs]="false"
  class="nav-bar"
>
  @for (tab of tabItems; track tab) {
    <a
      mat-tab-link
      [routerLink]="tab.route"
      #rla="routerLinkActive"
      routerLinkActive="active"
      [active]="rla.isActive"
    >
      {{ tab.title }}
    </a>
  }
</nav>
<mat-tab-nav-panel #tabPanel>
  <div class="tab-content">
    <router-outlet></router-outlet>
  </div>
</mat-tab-nav-panel>
```

### Pattern B: Dynamic In-Page Tabs

Use `mat-tab-group` when tabs switch content within the same page.

```html
<mat-tab-group
  #tabGroup
  [mat-stretch-tabs]="false"
  animationDuration="0ms"
  class="custom-tab"
>
  @for (tab of tabItems; track tab) {
    <mat-tab [disabled]="tab.disabled" [label]="tab.title">
      <ng-template matTabContent>
        <div class="tab-content">
          <ng-container *ngComponentOutlet="tab.component"></ng-container>
        </div>
      </ng-template>
    </mat-tab>
  }
</mat-tab-group>
```

### Rules

- **ALWAYS** use `[mat-stretch-tabs]="false"` — tabs should NOT stretch
- For dynamic tabs: add `animationDuration="0ms"` and `class="custom-tab"`
- Use `<ng-template matTabContent>` for lazy rendering of tab content
- Tab header is sticky at `top: 84px` with `z-index: 1000` (global style)
- Tab label gap: 30px (global style)
- Tab height: 30px
- Active indicator color: #1b273c
- Inactive label color: #707682

### Custom Tab Body Padding (component SCSS)

```scss
::ng-deep .custom-tab {
  .mat-mdc-tab-body-wrapper {
    padding: 12px 0 32px 0;
  }
}
```

---

## 12. Component Template — Tables

### Standard mat-table

```html
<table mat-table [dataSource]="dataSource" class="mb-12px">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef style="width: calc((100vw - 370px) / 3)">
      Name
    </th>
    <td mat-cell *matCellDef="let element">{{ element.name }}</td>
  </ng-container>

  <ng-container matColumnDef="status">
    <th mat-header-cell *matHeaderCellDef style="width: 100px">
      Status
    </th>
    <td mat-cell *matCellDef="let element">{{ element.status }}</td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true" style="background: white"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
</table>
```

### Rules

- **ALWAYS** use `sticky: true` on header row
- **ALWAYS** add `style="background: white"` on sticky header row
- Column widths: use `calc()` for responsive sizing — e.g., `calc((100vw - 370px) / 3)`
- Row height: 40px (global), header height: 40px (global)
- Hover background: #f4f4f5 (global)
- Highlight selected row: add `highlight-row` class (background: #bed5fe)
- Cell padding: `0 8px` (global)
- Use `div-table` + `custom-mat-column` for custom drag-and-drop tables

---

## 13. Component Template — Page Layout

### Page Header (Sticky)

```html
<div class="page-header">
  <h2>Page Title</h2>
  <div class="page-header-actions">
    <button mat-stroked-button [disabled]="!hasChanges">Discard</button>
    <button mat-flat-button color="primary" [disabled]="!hasChanges">Save Updates</button>
  </div>
</div>
```

```scss
.page-header {
  display: flex;
  justify-content: space-between;
  padding: 22px 0 32px 0;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10000;

  h2 {
    font-weight: 500;
    font-size: 20px;
    margin: 0;
    line-height: 32px;
  }
}

.page-header-actions {
  gap: 8px;
  display: flex;
}
```

### Component Container Pattern

Every component should wrap content in a named container:

```html
<div class="my-component">
  <div class="my-component_container">
    <!-- Content here -->
  </div>
</div>
```

Convention: `{component-name}_container`

### Card Layout (Workflows Pattern)

```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
    <section>
      <mat-slide-toggle customToggle formControlName="enabled"></mat-slide-toggle>
    </section>
  </div>
  <div class="description">Description text explaining this section.</div>
  <div class="card-body">
    <!-- Card content -->
  </div>
</div>
```

```scss
.card {
  border: 1px solid #d3d9e6;
  padding: 20px;
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;

  h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
}

.card-body {
  margin-top: 8px;
}

.description {
  font-size: 13px;
  color: #485161;
  margin: 12px 0;
}
```

### Section Divider

```html
<div class="mb-8px pb-10px" style="border-bottom: 1px solid #e9eaeb">
  <!-- Section content -->
</div>
```

---

## 14. Component Template — Form Controls

### Checkbox

```html
<!-- Angular Material checkbox with custom directive -->
<mat-checkbox customCheckbox formControlName="fieldName">
  Checkbox Label
</mat-checkbox>

<!-- Shared mdm-checkbox component -->
<mdm-checkbox
  [label]="'Checkbox Label'"
  formControlName="fieldName"
></mdm-checkbox>
```

### Slide Toggle

```html
<mat-slide-toggle customToggle formControlName="fieldName"></mat-slide-toggle>
```

Toggle with label:

```html
<div class="switch-button">
  <mat-slide-toggle customToggle formControlName="fieldName"></mat-slide-toggle>
  <span>Enable feature</span>
</div>
```

### Radio Buttons

```html
<mat-radio-group formControlName="fieldName">
  <div class="flex flex-col gap-12">
    <mat-radio-button [value]="'option1'">Option 1</mat-radio-button>
    <mat-radio-button [value]="'option2'">Option 2</mat-radio-button>
  </div>
</mat-radio-group>
```

Inline radio:

```html
<mat-radio-group formControlName="fieldName" class="flex gap-20">
  <mat-radio-button [value]="0">Option A</mat-radio-button>
  <mat-radio-button [value]="1">Option B</mat-radio-button>
</mat-radio-group>
```

### Form Group Pattern (Vertical list of controls)

```html
<div class="form-group">
  <mat-checkbox customCheckbox formControlName="option1">Option 1</mat-checkbox>
  <mat-checkbox customCheckbox formControlName="option2">Option 2</mat-checkbox>
  <mat-checkbox customCheckbox formControlName="option3">Option 3</mat-checkbox>
</div>
```

```scss
.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}
```

### Inline Form Pattern (Label + Input on same line)

```html
<div class="inline-text-form mb-3">
  <span>Timeout after</span>
  <mat-form-field appearance="outline" class="small remove-space w-50px">
    <input matInput type="number" formControlName="timeout_value" />
  </mat-form-field>
  <mat-form-field appearance="outline" class="small remove-space">
    <mat-select formControlName="timeout_unit">
      <mat-option value="SECOND">seconds</mat-option>
      <mat-option value="MINUTE">minutes</mat-option>
    </mat-select>
  </mat-form-field>
</div>
```

```scss
.inline-text-form {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
```

### Nested / Child Form Controls (Indented)

```html
<div class="form-group">
  <mat-checkbox customCheckbox formControlName="parentOption">Parent Option</mat-checkbox>
  <div class="form-group-child">
    <mat-form-field appearance="outline" class="small remove-space">
      <input matInput formControlName="childField" />
    </mat-form-field>
  </div>
</div>
```

```scss
.form-group-child {
  margin-left: 2.3rem;
}
```

### Number Input (Shared Component)

```html
<mdm-number-input
  [style]="'width: 80px;'"
  name="fieldName"
  [form]="form"
></mdm-number-input>
```

### Size Input (Shared Component)

```html
<mdm-size-input
  name="fieldName"
  [form]="form"
></mdm-size-input>
```

### Password Input (Shared Component)

```html
<app-password
  [feedback]="false"
  [maskToggle]="passwordToggle$"
  [form]="form"
  name="password_field"
  class="mt-12px"
></app-password>
```

### Chips / Tag Input (Shared Component)

```html
<mdm-chips formControlName="tags"></mdm-chips>
<mdm-input-tag formControlName="emails"></mdm-input-tag>
```

---

## 15. Design Tokens — CSS Custom Properties

These are the global Material Design token overrides. **DO NOT redefine these in component styles.**

| Token                                      | Value   |
|--------------------------------------------|---------|
| `--mat-form-field-container-height`        | 32px    |
| `--mat-form-field-container-vertical-padding` | 6px  |
| `--mat-form-field-container-text-size`     | 14px    |
| `--mat-button-outlined-container-height`   | 32px    |
| `--mat-button-filled-container-height`     | 32px    |
| `--mat-tab-container-height`               | 30px    |
| `--mat-table-header-container-height`      | 40px    |
| `--mat-table-row-item-container-height`    | 40px    |
| `--mat-radio-state-layer-size`             | 16px    |
| `--mat-checkbox-state-layer-size`          | 16px    |
| `--mat-option-label-text-size`             | 14px    |
| `--mat-option-label-text-line-height`      | 20px    |

### Button Shape

All buttons have `border-radius: 0` (rectangular). **DO NOT add border-radius to buttons.**

### Form Field Shape

All form fields have `border-radius: 0`. **DO NOT add border-radius to form fields.**

### Chip Shape

All chips have `border-radius: 0`. Height: 24px, font-size: 13px.

---

## 16. Notification & Info Patterns

### Notification Message

```html
<span class="notification-message">
  <mat-icon svgIcon="grey_notification"></mat-icon>
  <span>This is an informational message.</span>
</span>
```

The `.notification-message` class provides: flex, gap: 0.5rem, padding: 8px, background: #f4f4f5.

### Tooltip / Hover Info

```html
<span class="hover-info" customTooltip [text]="'Tooltip explanation text'"></span>
```

With icon:

```html
<mat-icon
  svgIcon="info"
  customTooltip
  [contentTemplate]="tooltipTemplate"
  [tooltipPostion]="'right'"
></mat-icon>
```

### Error Message (outside form field)

```html
<span class="error-message">Error description text</span>
```

`.error-message` = color: #ff0000, font-size: 12px, padding-top: 4px.

### Required Indicator

```html
<span class="required">*</span>
```

`.required` = color: #d00300, font-weight: 500, font-size: 13px.

### Warning Text

```html
<span class="warning-text">Warning message</span>
```

`.warning-text` = color: #d00300.

---

## 17. File Upload / Drop Zone Pattern

```html
<div class="drop-area" mdmDragDrop (fileDropped)="onFileDropped($event)">
  <mat-icon svgIcon="upload"></mat-icon>
  <div>Choose a file or drag it here</div>
</div>
```

```scss
.drop-area {
  display: flex;
  flex-direction: column;
  width: 240px;
  height: 150px;
  padding: 6px 12px 6px 8px;
  border: 1px dashed #d2d4d6;
  background: #f4f4f5;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
```

---

## 18. Angular Code Conventions

### Control Flow

Use new Angular control flow syntax:

```html
<!-- Conditional rendering -->
@if (condition) {
  <div>Content</div>
} @else {
  <div>Fallback</div>
}

<!-- Loop -->
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

<!-- Switch -->
@switch (status) {
  @case ('active') { <span class="text-green">Active</span> }
  @case ('error') { <span class="text-red">Error</span> }
  @default { <span class="text-grey">Unknown</span> }
}
```

**DO NOT** use `*ngIf`, `*ngFor`, `*ngSwitch` in new code.

### Reactive Forms

- Pass `FormGroup` as `@Input()` to child components
- Use `formControlName` for binding (not `[(ngModel)]`)
- Create forms in the parent/service, pass to child
- Use `FormBaseComponent` or `SubscriptionBaseComponent` as base class when appropriate

### Component Architecture

- Use `OnPush` change detection: `changeDetection: ChangeDetectionStrategy.OnPush`
- Extend `SubscriptionBaseComponent` for automatic subscription cleanup
- Place component-specific styles in `.component.scss` — only use `::ng-deep` when overriding Material internals
- Prefer shared components from `shared/src/lib/components/` before creating new ones

### Custom Directives (use these instead of raw Material)

| Directive          | Applied To              | Purpose                          |
|--------------------|-------------------------|----------------------------------|
| `customCheckbox`   | `mat-checkbox`          | Custom checkbox styling          |
| `customToggle`     | `mat-slide-toggle`      | Custom toggle styling            |
| `customTooltip`    | Any element             | Custom tooltip behavior          |
| `mdmDragDrop`      | Drop zone container     | File drag-and-drop               |
| `numberOnly`       | `input`                 | Allow only numeric input         |
| `loadingButton`    | `button`                | Loading state for buttons        |

### Imports

```typescript
// Shared components & services
import { MDMCheckbox, MDMInput, MDMNumberInput } from '@shared';
import { AuthService, ConfigService, UtilsService } from '@shared';

// Shared models, constants, pipes
import { FormBaseComponent, SubscriptionBaseComponent } from '@shared';
import { CastPipe, FormatDatePipe } from '@shared';
```

---

## 19. DO NOT Rules (Anti-Patterns)

- **DO NOT** use `appearance="fill"` for mat-form-field — always use `"outline"`
- **DO NOT** add `border-radius` to buttons, form fields, or chips — design is rectangular (0)
- **DO NOT** write custom margin/padding in SCSS when a utility class exists
- **DO NOT** use `*ngIf`, `*ngFor`, `*ngSwitch` — use `@if`, `@for`, `@switch`
- **DO NOT** use template-driven forms (`[(ngModel)]`) — use Reactive Forms
- **DO NOT** use the default Material expansion panel toggle — always `[hideToggle]="true"` with custom chevron
- **DO NOT** create new shared components without checking if one already exists in `shared/src/lib/components/`
- **DO NOT** use `mat-stretch-tabs` true — always `[mat-stretch-tabs]="false"`
- **DO NOT** redefine global Material Design tokens in component styles
- **DO NOT** use inline styles for spacing when a utility class exists (e.g., `style="margin-bottom: 12px"` → use `class="mb-12px"`)
- **DO NOT** use auto-width for form fields — always specify a width class
