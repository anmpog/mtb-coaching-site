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

```html
<div class="sm:px-2 md:px-4 lg:px-6">...</div>
```

## Layout

### Side By Side

The `<SideBySide />` layout component has two slots: content and image. The slots determine the layout on desktop. On smaller screens (phones) the content will default to a column layout wherein non-graphical content will appear first, followed by graphical content.

In the site as it existed before I attempted to rebuild it, all side-by-side layouts were roughly 50/50 width on desktop, and one side was always an image and the other was always textual (text or form).

The `<SiceBySide />` component is meant to be used alongside the `<SideBySideText />` and `<SideBySideImage />` which contain styling directives most appropriate to their respective content types. The `<SideBySide />` component defaults to a layout of content (on the left) and image (on the right), but this can be changed by way of the component's `contentDirection` prop. The `main.css` The `<SideBySide />` component has a `data-` attribute that allows styling of child components to respond to the orientation determined by the `contentDirection` prop.
