# Project Structure

## Meta Data

Static data sources live in the `src/data` directory. This is a convenient way to store data and load it site-wide. This keeps us from having to manually write data into our markup. This makes content editing easier as well, since we can edit the content without worrying about the markup in an ideal scenario.

## CSS Approach

Astro allows several ways to write CSS. For complex components like the main site navigation, I opted to author the styles in Astro's `<style>` tags. I felt that this made reading the CSS more intelligible than trying to parse classnames to see what controls what at various breakpoints.

At the start of this project, I opted to use Tailwind 3 because it has greater compatibility with older devices. Wherever possible, hard-coded "magic numbers" should be assumed to have come from the defaults provided by Tailwind 3. This shows up in places where styles are authored using `<style>` tags – namely, media queries (seemingly) cannot reference theme variables provided by tailwind, or even ones defined on the `@base` layer in the project's `main.css` file. The goal in all cases is to defer to sensible defaults that are provided by Tailwind, even in instances where we are not able to take advantage of the class names that make Tailwind tick.

This example comes from the `<Navigation>` component:

```css
  /* 768px comes from default "medium screen" value in Tailwind 3 */
  @media (width >= 768px) {
    #menu-button {
      display: none;
    }
    ...
  }
```

The media query's defined breakpoint of `768px` comes from the [Tailwind 3 defaults](https://v3.tailwindcss.com/docs/responsive-design). I also copied these breakpoint values in the `main.css` file for easier reference, even though the breakpoints can be taken advantage of by using Tailwind classes like so:

```jsx
<div class='sm:px-2 md:px-4 lg:px-6'>...</div>
```

### Focus Styles

Focus styles are an important accessibility marker for users who rely on
keyboard navigation. To ensure that interactive elements receive proper focus
styling, I tried to define some flexible global styles that ensure that focus
styles have a sensible default, but that the default is also easy to override.

The approach I implemented here came from [this article by Stephanie Eckles](https://css-tricks.com/standardizing-focus-styles-with-css-custom-properties/).
She created and documented an approach that allows us a flexible, maintainable
way to ensure that focus styling is applied accessibly and without much fuss
for the developer.

```css
@layer base {
  :root {
    /* ... other root styles */
    :is(a, button, input, textarea, summary) {
      --outline-size: max(2px, 0.08em);
      --outline-style: solid;
      --outline-color: var(--focus-color, currentColor);
    }

    :is(a, button, input, textarea, summary):focus {
      outline: var(--outline-size) var(--outline-style) var(--outline-color);
      outline-offset: var(--outline-offset, var(--outline-size));
    }

    :is(a, button, input, textarea, summary):focus-visible {
      outline: var(--outline-size) var(--outline-style) var(--outline-color);
      outline-offset: var(--outline-offset, var(--outline-size));
    }

    :is(a, button, input, textarea, summary):focus:not(:focus-visible) {
      outline: none;
    }
  }
  /* ...rest of styles */
}
```

These CSS rules define a series of variables that establish default focus
styling for links, buttons, inputs, text areas, and summaries, and define both
`:focus` and `:focus-visible` styles to ensure that native browser behaviors
are not disrupted. **(Important note: This list of elements is not an
exhaustive list of elements that can receive focus.)**

The following rule defines the default/fallback behavior:

```css
:is(a, button, input, textarea, summary) {
  --outline-size: max(2px, 0.08em);
  --outline-style: solid;
  --outline-color: var(--focus-color, currentColor);
}
```

The important declaration is the `--outline-color: var(--focus-color, 
currentColor)`. This rule defines a variable called `--outline-color` that can
be used in other rules. The use of the `var()` keyword is responsible for the
fallback behavior: in the event that a `--focus-color` value hasn't been
defined, the `--outline-color` falls back to the CSS `currentColor`, which is
the computed `color` property of the given element.

This pattern allows individual components to define a `--focus-color`
property, providing a way to customize the outline color of a focused element
when the `currentColor` default doesn't provide sufficient contrast.

```css
/* example of overriding the --focus-color for a specific component */
.navigation-link.active {
  --focus-color: theme('colors.brand-blue');
  font-weight: theme(fontWeight.semibold);
  background-color: theme('colors.active-link');
  color: theme(colors.slate.100);
}
```

In the example above, a background color is used to help provide a visual
indication of the `.active` element, and the `color` of the element is set to
provide adequate contrast against the background. Because the
`.navigation-link` elements appear against a light-colored background, and
`currentColor` would resolve to the light-colored `colors.slate.100` value,
it was necessary to override the default outline color that would be applied
to the element by providing a color value that will have more contrast against
the light colored background. It is still important to ensure that chosen
colors have sufficient contrast against their backgrounds so that the styles
are visually accessible.

## Layout

### Side By Side

The `<SideBySide />` layout component has two slots: content and image. The slots determine the layout on desktop. On smaller screens (phones) the content will default to a column layout wherein non-graphical content will appear first, followed by graphical content.

In the site as it existed before I attempted to rebuild it, all side-by-side layouts were roughly 50/50 width on desktop, and one side was always an image and the other was always textual (text or form).

The `<SideBySide />` component is meant to be used alongside the `<SideBySideContent />` and `<SideBySideImage />` which contain styling directives most appropriate to their respective content types. The `<SideBySide />` component defaults to a layout of content (on the left) and image (on the right), but this can be changed by way of the component's `contentDirection` prop. The `main.css` The `<SideBySide />` component has a `data-` attribute that allows styling of child components to respond to the orientation determined by the `contentDirection` prop.

## Site Meta Data

The file `src/data/site-data.json` is a way to store "static" site data. The data in this file should conform to specific structures. For example, the file contains an array (list) of `navLinks` that represent the site's available pages. Inside that list, there are objects that all have an identical structure:

- `title`: a human-readable title that describes where a nav link will take you
- `path`: a [valid `href` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#href) that is passed to an `<a>` element to create a working link

The corresponding component that renders the data in this file should be constructed to consume this data. For example, in the `Navigation.astro` file, the navigation links are imported and rendered dynamically as a list:

```javascript
---
// import the data
import siteData from '@data/site-data.json'
// destructure the nav links from the rest of the site data
const { navLinks } = siteData
// purpose built component for rendering an <a> element consistently
import NavLink from '@components/NavLink.astro'
---

<nav id='main-nav' class='main-nav'>
  <ul id='menu'>
    {
      navLinks.map(({ title, path }) => (
        <NavLink title={title} path={path} currentPath={currentPath} />
      ))
    }
  </ul>
</nav>
```

This reduces (or, ideally, eliminates) the need to update multiple files at once manually. If the data is structured thoughtfully and rendered dynamically, the possibility of making errors is dramatically reduced and our site is more flexible and easier to update.

## Form Architecture

### Design Notes

This system intentionally favors:

- native browser form behavior
- declarative HTML structure
- centralized submission logic
- schema-driven validation
- minimal framework coupling
- accessibility-first interactions

The result is a lightweight form architecture with shared validation and submission behavior across all forms.

### Basic Structure

Forms in this project use a shared client-side submission handler built around:

- native HTML forms
- Netlify Forms
- Zod validation
- progressive enhancement
- accessible error/state handling

All forms opt into the shared behavior using the `data-schema` attribute.

### High-Level Flow

1. A form declares a schema key using the `data-schema` attribute
2. The global form handler finds all matching forms
3. The corresponding Zod schema is looked up from the `schemaMap`
4. On submit:
   - form values are collected with `FormData`
   - values are validated with Zod
   - validation errors are mapped back to UI elements
   - valid submissions are POSTed to Netlify

5. UI state is updated throughout the lifecycle (idle, loading, success, error)

### Registering A New Form Schema

Create a new schema in `src/schemas` with a sensible name.

```ts
import { z } from 'zod'

const signupFormSchema = z.object({
  'signup-email': z.email().trim().max(254),
  'signup-confirm': z.string().max(254).optional(),
})

export default signupFormSchema
```

Then, register a schema in the `form-submit.ts` file:

```ts
import signUpFormSchema from '@schemas/signUpForm'

const schemaMap = {
  'signup-form': signUpFormSchema,
}
```

In your new form, the `<form>` must include a `data-schema` attribute must exactly match the name of one of the keys on the `schemaMap` object.

```tsx
<form data-schema='signup-form'>...</form>
```

### Form Initialization

Forms are automatically initialized on page load:

```ts
document.querySelectorAll('[data-schema]')
```

Forms are selected by the presence of hte custom `data-schema` attribute since a schema is required (by convention) in order to validate forms before submission.

### General Form Structure

The forms rely on several structural conventions:

```tsx
<form
  data-netlify='true' // <-- required for Netlify to detect form
  data-schema='contact-form'
  method='post'
  name='contact-form'
>
  // ...
</form>
```

The `data-netlify` field is required in order for Netlify to automatically detect and process form submissions.

The `data-schema` attribute is used to make a validation schema available to a form dynamically.

Attributes like `method` and `name` are required by standard best practices.

Additionally, in order for forms to work properly on Netlify, forms must include a hidden field that indicate the name of the form and a value to be used for Netlify's handling of form submissions from a given form:

```tsx
<form>
  // hidden field for Netlify to successfully process submissions
  <input hidden name='form-name' value='contact-form' />
</form>
```

### Form Control Structure

Each required field must:

- be wrapped in `.form-control`
- contain:
  - an `input` or `textarea`
  - a working, correctly structured `<label>`
  - an associated error element represented by a `<span>` element with an `id` attribute whose value conforms to the convention `associatedFieldName-error`.
    > _example_: if the field that the error element is associated with has an ID attribute value of `email` then the error element's id attribute value should be `email-error`. This is semantically the same as associating a field with an element using the `aria-describedby` attribute.
  - an `aria-describedby` attribute whose value associates the input element with its requisite error element

```tsx
<div class='form-control'>
  <label for='name'>Your Name</label>
  <input
    id='name'
    name='name'
    aria-describedby='name-error'
    aria-invalid='false'
    required
    type='text'
  />
  <span id='name-error' data-default-error-message='Name must be longer'>
    Name must be longer
  </span>
</div>
```

### Error Element Structure

The form handler searches for error elements using:

```css
[id$='-error']
```

This means all validation error elements must end with `-error`. To associate an error element with an input field with an `id` value of `email`, the error element's `id` attribute would be given the value `email-error`.

The default validation message is read from a custom `data-default-error-message` attribute. For the sake of consistency, make sure any text value in the error element is exactly the same as the value given to the `data-default-error-message` attribute.

```tsx
<span id='name-error' data-default-error-message='Name must be longer'>
  Name must be longer
</span>
```

This allows the error message to be reset to a safe value without the use of a more robust state-management solution.

### Accessibility Features

1. Inputs are (and must be) associated with their respective validation status text/error element by way of the `aria-describedby` attribute.
2. Invalid fields receive `aria-invalid="true"`
3. A form must contain a live region, which announces general form state to users who are reliant on assistive technologies:

   ```tsx
   <span
     id='form-status'
     class='sr-only' // <-- visually hidden
     aria-live='polite'
     aria-atomic='true'
     data-default-status-text='Form idle' // <-- default state `data-*` attr
   >
     Form idle
   </span>
   ```

### Submission Lifecycle

Pre submit validation:

    1. field errors are displayed
    2. invalid inputs receive aria-invalid="true"
    3. the first invalid field receives focus
    4. no network request is made

If validation is successful:

    1.  Form data is URL encoded
    2.  A POST request is sent to /
    3.  Netlify processes the submission
    4.  The form resets
    5.  UI state changes to success

### Netlify Requirements

Forms are submitted directly to Netlify. To successfully submit a form to Netlify, the request is formatted as such:

```ts
const formData = new FormData(form)
const params = new URLSearchParams() // <-- encode params in URL

for (const [key, value] of formData.entries()) {
  if (typeof value === 'string') {
    params.append(key, value)
  }
}

fetch('/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: params.toString(),
})
```

### Adding a New Form

To add a new form to the site:

1. Create a Zod schema in `src/schemas`
2. Register it in `schemaMap` in `form-submit.ts`
3. Add `data-schema` attribute to the form
4. Follow the required field/error structure
5. Include a live status region
6. Import the shared form handler script

## Honeypot Field(s)

Forms on this site will/should contain a "honeypot" field. This is a field that is designed to trick automated scrapers/bots (which are usually responsible for spam) into filling in the field. The field is not viewable or accessible to human users, so the inclusion of this field's value in the event of a form submission is indicative of a bot submitting the form. This makes it easier to reject/ignore spam submissions on the server. The general implementation is to make the field look like an "email confirmation" field, because scrapers are potentially sophisticated enough to skip fields that are obviously labelled as honeypot fields.

In keeping with the other form inputs, the honeypot field is included in the schema that controls form validation. Importantly, the honeypot field will be optional as it pertains to validation and form submission. I decided to treat it as a normal field and let it be validated as such with the thought that submissions that don't satisfy the (admittedly basic) validation logic will be rejected, which might make the honeypot marginally more efficacious:

```ts
import { z } from 'zod'

const signupFormSchema = z.object({
  'signup-email': z.email().trim().max(254),
  'signup-confirm': z.string().max(254).optional(), // <-- honeypot field
})

export default signupFormSchema
```

Then, to use the Honeypot field, include it within your `<form>` alongside your other form fields, passing a value that exactly matches the field name you defined on the validation schema to the required `netlifyHoneypotName` attribute:

```tsx
<form>
  ...
  <Honeypot netlifyHoneypotName="signup-confirm" /> // <-- name of honeypot
  ...
</form>
```

The form submission logic in general relies on a selector `.querySelectorAll('.form-control:not([data-optional])')` to _avoid_ selecting the honeypot field and attaching any event listeners to it. If the `<Honeypot>` component is not used, be aware of the fact that the `form-submit.ts` script will avoid attaching listeners to any field that has a custom attribute of `data-optional`.

## Obfuscating Contact Information

I anticipate that displaying plain contact information on the website probably generates a lot of noise, so I wanted to specifically attempt to cut down on this noise by obfuscating the contact information on the website. In the interest of not over-engineering an approach, I referenced [this article](https://spencermortensen.com/articles/email-obfuscation/) by one Spencer Mortensen, which seems to show a sound, up to date exploration of various obfuscation techniques and their success tested against numerous scrapers/bots.

## Adding Images

I'm trying to work alongside Astro's built-in image processing utilities. In order for images to be processed and optimized, they _must_ appear inside the `src/` folder. For that purpose, the project has a `src/assets/` folder. In this folder, assets are stored (for organizational purposes) in a folder that shares the name of the page that they appear in. This is essential both to allowing Astro to apply its default processing to these images, and for a special script I've created to generate image placeholders that are used to keep the site's initial payload manageable.

If a new page is created, for example, `src/pages/blog`, then corresponding images for the `src/pages/blog` page would live in `src/assets/blog`. It's worth noting that if a blog is created, photos for individual blog pages would likely need to [create a content collection](https://docs.astro.build/en/guides/content-collections/#types-of-collections).

Another important aspect of images in this project is that they must have unique names. It is good practice to make the names descriptive in some way. As of this writing, images have been named with some reference to where they appear in the site. For example, the image-heavy `pages/services` page has images named things like `clinics-jumping-img.jpg` or `clinics-manuals-img.jpg`.

### LQIP Image Generation and Use

Images must have unique names because of a small pre-build script I've created that parses images from these directories to generate an LQIP (Low Quality Image Placeholder) for each image. This is an important part of keeping the site performant. These LQIP images are low-resolution images that are served with the initial HTML payload to the browser, and serve as a "blurred" version of the higher-resolution images that take longer for the browser to load. This makes the site appear less janky and gives the browser time to request the heavier images after the initial page load without confusing image-swapping behavior being as apparent to the user.

The LQIP images are encoded into a base64 string, which allows them to be delivered to the browser in a lightweight way, and to be painted immediately. The script for this can be found in the project's root directly in the `/scripts` folder. This script is executed by including it in the list of scripts in the `package.json` file. For more information about the pre-build scripts, see the [`package.json` documentation here](https://docs.npmjs.com/cli/v11/using-npm/scripts#pre--post-scripts).

In order to use LQIP images in a given page, a utility function called `getLqip` is provided from the `src/utils` directory. This function takes the natively-generated image path created by the Astro image service and looks up the image in question from a manifest file that is created by the pre-build `generate-lqip-image-manifest` script. This file is a simple key-value store that holds the base64 encoded image assets.

As usual for Astro, images are imported into the file, and then the imported image's `src` is passed to the `getLqip` function:

```tsx
---
export interface Props {
  /** The image source for the image */
  imageSrc: ImageMetadata
}

import type { ImageMetadata } from 'astro'
import getLqip from '@utils/getLqip.ts'
const { imageSrc } = Astro.props
const lqip = getLqip(imageSrc)
---
...
  // Browser stuff goes here
...
```

**Note for local development:** Sharp, which is used by the LQIP-generation script (and other dependencies in the project), relies on the native image-processing library `libvips`.

During installation, Sharp can detect a globally installed version of `libvips` (for example, one installed through Homebrew) and attempt to build against it rather than use its prebuilt binaries. This can cause dependency installation to fail when the local environment doesn't have the necessary build dependencies.

To avoid this behavior, I've included an `install:deps` script in `package.json`. It sets the `SHARP_IGNORE_GLOBAL_LIBVIPS` environment variable during installation, instructing Sharp to ignore any globally installed `libvips` and use its bundled binaries instead.

_(ChatGTP was used extensively to document and trouble-shoot this issue.)_

### Responsive Navigation

So far the biggest hurdle in this project has been implementing a responsive
navigation component. At this point this represents the bulk of the work I've
done on this site. I have been learning a lot about progressive enhancement and
accessibility. My primary concerns were:

- Responsive: works fluidly across various viewport sizes.
- Accessibile: provides an accessible experience for users who rely on
  assistive technologies.
- Maintainable: This is a subjective goal, but I wanted something that was easy
  to reason about and make changes to.

I found an article [by Andy Bell](https://piccalil.li/blog/build-a-fully-responsive-progressively-enhanced-burger-menu/) that details the
implementation of a Web Component-based navigation with an emphasis on
accessibility. Web Components are new to me, but I liked this option because
it seemed like a tidy way to encapsulate this interactive component's
functionality.

I borrowed heavily/verbatim from the article I linked to above. The primary
differences in my implementation involve adapting the Web Component to work
alongside Astro's conventions.

#### Accessibility

A primary accessibility concern was ensuring that there is a usable menu in the
event that JavaScript fails to load/execute. (This concern overlaps with the
progressive enhancement strategy outline below.)

In the event that scripting _is_ enabled, the menu's default state is designed
to be appropriately hidden from assistive technologies. The menu is both
visually hidden, and hidden from keyboard navigation until the user interacts
with it to change its state. The menu can be opened and closed via keyboard
interactions. Elements contained in the menu have appropriate focus ordering.

The menu is stateful and conveys state through appropriate `aria-` attributes,
responding to user interaction in various forms. The menu will automatically
close if a focus moves outside its boundaries. Care is taken to ensure that
focus styling is applied to elements that receive focus.

```js
// hamburger-menu.ts

// Note the aria-label and aria-hidden attributes indicating menu state and
// interactivity
  render() {
    this.innerHTML = `
      <div class="burger-menu" data-element="burger-root">
        <button class="burger-menu__trigger" data-element="burger-menu-trigger" type="button" aria-label="Open menu">
          <span class="burger-menu__bar" aria-hidden="true"></span>
        </button>
        <div class="burger-menu__panel" data-element="burger-menu-panel">
          ${this.initialMarkup}
        </div>
      </div>
    `

    this.postRender()
  }
// ... rest of component definition ...
```

#### Progressive Enhancement

I tried to emphasize progressive enhancement, so that there is a
workable navigation menu in the event a user is blocking scripting in
their browser, or the custom component fails to initialize for some reason.
The "default" menu is not necessarily pretty, but it is functional.

The menu is designed around the idea that if the user has scripting disabled,
the custom element will not be registered and its interactive functionality
will not be initialized. In this scenario, the burger menu would not function as
designed, which necessitates a workable fallback. To serve as an indicator for
a (un)successful initialization, the `hamburger-menu.ts` script adds a class
attribute to the `<hamburger-menu>` element. Child elements can use this class
as a selector to apply an "enhanced presentation".

```html
<!-- Custom component successfully initialized -->
<hamburger-menu class="js-enabled">
  <!-- Children -->
</hamburger-menu>

<!-- Custom component not initialized -->
<hamburger-menu>
  <!-- Children -->
</hamburger-menu>
```

In the event that the `hamburger-menu.ts` script does not load/execute, the
custom `<hamburger-menu>` element will not have the `js-enabled` class appended
to it. This provides a mechanism for styling the various menu components in a
way that corresponds to the availability of the JavaScript that enhances the
presentation of the menu.

The baseline styling approach for the menu and its children is based on an
assumption that JavaScript is unavailable for enhancing the presentation and
behavior of the menu. That is to say, changes to the menu's presentation should
be made in a way that, at baseline, does not rely on JavaScript. To achieve
this on my first pass, I made use of dev tooling that disabled JavaScript so I
could test the menu's appearance and behavior in its absence. Disabling and
enabling JavaScript should cause the menu to change appearance and behavior.

#### Maintainability

I tried to separate the responsibilities of the component(s) so that the
`<hamburger-menu>` Web Component is responsible for JavaScript-driven
interactivity of the menu, as well as establishing the state required for its
enhanced presentation. CSS selectors of the component and its children can
reference attributes that are modified by the script in response to user
interactions.

The `<hamburger-menu>` element wraps a generic unordered list of links, which
is a common HTML structure when building a list of navigation links. It
provides a way for its children to adapt their presentation in the event that a
user has JavaScript disabled or the component fails to initialize for some
reason. This is achieved by appending a class `js-enabled` to the outermost
HTML element in the component, which serves as an indicator that the JavaScript
that powers the menu has successfully initialized. CSS selectors in the child
elements can use this class to change their presentation accordingly.

The styling for the custom `<hamburger-menu>` itself should live in the
`hamburger-menu.css` file. This file contains the styling that animates the
component and provides the general layout of the enhanced component. The
styling herein is aimed at positioning the menu at the top of the viewport,
and animating the menu's "open" and "closed" states.

To visually represent the state of the `<burger-menu>`, CSS responds to the
state created by the custom element. At the component level, state is
represented as:

```js
// Not enabled, closed
{
  status: 'closed',
  enabled: false,
}

// Enabled, open
{
  status: 'open',
  enabled: true,
}
```

The core structure of the menu is straightforward:

```html
<div class="burger-menu" data-element="burger-root">
  <button
    class="burger-menu__trigger"
    data-element="burger-menu-trigger"
    type="button"
    aria-label="Open menu"
  >
    <span class="burger-menu__bar" aria-hidden="true"></span>
  </button>
  <div class="burger-menu__panel" data-element="burger-menu-panel">
    ${this.initialMarkup}
    <!-- Children are rendered here -->
  </div>
</div>
```

When state changes in response to a user interaction, the menu's attributes are
changed to respond to the state change. The `root` of the menu has the
attributes `status` and `enabled` which mirror the state object depicted
above. Additionally, relevant `aria-` attributes are updated:

```js
//...
  processStateChange() {
    this.root.setAttribute('status', this.state.status)
    this.root.setAttribute('enabled', this.state.enabled ? 'true' : 'false')

    this.manageFocus()

    switch (this.state.status) {
      case 'closed':
        this.trigger.setAttribute('aria-expanded', 'false')
        this.trigger.setAttribute('aria-label', 'Open menu')
        break
      case 'open':
        this.trigger.setAttribute('aria-expanded', 'true')
        this.trigger.setAttribute('aria-label', 'Close menu')
        break
    }
  }
//...
```

Thus, the enhanced menu's styling can be applied by way of CSS selectors that
target the custom element's attributes:

```css
.burger-menu[enabled='true'] .burger-menu__trigger {
  /* STYLES */
}

.burger-menu[enabled='true'] .burger-menu__panel {
  /* STYLES */
}

.burger-menu[enabled='true'][status='open'] .burger-menu__panel {
  /* STYLES */
}
```

I created an Astro component called `<ResponsiveNavigation />` to bring
together the Web Component `<hamburger-menu>` and the Astro conventions used
throughout the rest of the project. This component imports the script
and stylesheet that registers, defines, and styles the `<hamburger-menu>`
component.

The `<NavigationLinks />` Astro component sticks with Astro's styling
conventions and relies on component-scoped styling via the `<style>` tag. The
styles in this component apply to the `<ul>` that wraps the actual
navigational elements of the main site navigation. It does not apply styling to
the individual links it renders. Its responsibility is to style the container
around the links themselves. It responds to the presence or absence of
JavaScript by looking for a `js-emablled` class attached to an ancestor in the
case that the `<hamburger-menu>` Web Component is successfully initialized.

The `<NavigationLink />` component also adheres to Astro's component-scoped
styling conventions. The styles for this component only apply to the individual
link elements that appear in the navigation component.

The `<SubnavigationMenu />` component also relies on Astro's component-scoped
styles to control its presentation.

The general component structure looks something like this:

```
ResponsiveNavigation (Astro)
│
└── hamburger-menu (Web Component)
    │
    └── NavigationLinks (Astro)
        │
        ├── NavigationLink (Astro)
        ├── NavigationLink (Astro)
        └── NavigationLink (Astro)
```

#### `data-breakpoint` Attribute of `<hamburger-menu>`

To control the display of the mobile-friendly hamburger menu, the
`<hamburger-menu>` has a `data-breakpoint` attribute which is used to determine
the viewport width at which the enhanced presentation of the menu is enabled/
disabled. The `<ResponsiveNavigation />` component contains the type definition
that documents the attribute and its intended use.

The `data-breakpoint` attribute accepts a string value that represents the
maximum viewport width (inclusive) at which the enhanced presentation of the
menu is enabled. At viewport dimensions above this value, the hamburger menu is
disabled and a more traditional row of links is displayed.

The `<ResponsiveNavigation />` component (which is responsible for rendering
the `<hamburger-menu>`), a default value supplied to the `data-breakpoint`
attribute is set to `'640'`, which corresponds to the Tailwind 3 `screens.sm`
breakpoint. The [full theme](https://github.com/tailwindlabs/tailwindcss/blob/v3/stubs/config.full.js) documents default values.

In the `hamburger-menu.ts` script, a fallback value of `9999` is supplied by
the `breakpoint` getter, which makes the breakpoint value available to the
component's logic where needed. This effectively enables the enhanced
presentation of the menu in the event that there is an error retrieving the
`data-breakpoint` attribute value in the script.

The `hamburger-menu.ts` script uses the `data-breakpoint` attribute's value to
control the `enabled` state of the component in relation to the viewport width.
This is achieved by interpolating the value into a `max-width` media query and
then passing the media query to `window.matchMedia()`. The `matchMedia()` method
returns a `MediaQueryList` object, whose `.matches` property can be used to
check if the document matches the media query.

The `MediaQueryList` object exposes an `addEventListener()` method that can be
used to register a callback function for a `change` event. When the component
is mounted to the DOM, the callback function is invoked to set the initial
`enabled` state based on whether the document matches the aforementioned media
query. The same callback function is passed to the `addEventListener()` to
update the `enabled` state in response to changes in viewport dimension that
change the `MediaQueryList.matches` property. Additionally, if the viewport
dimension changes and no longer matches the media query while the menu is open,
the callback function will change the `status` of the component to `closed`.
