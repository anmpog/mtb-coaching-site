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
<div class='sm:px-2 md:px-4 lg:px-6'>
  ...
</div>
```
