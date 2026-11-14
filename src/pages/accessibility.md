---

layout: ../layouts/Page.astro
title: Accessibility
description: How Sotto's website is built to be usable by everyone, what is known not to work yet, and how to report a problem.
---

# Accessibility

Last updated 13 November 2026.

This site aims to meet WCAG 2.2 at level AA. It has been checked by hand with a keyboard and in a browser, but it has not had an independent audit or testing with every screen reader.

## What is in place

- Every control works from the keyboard and shows a visible focus ring.
- The page has header, main and footer landmarks and one top-level heading.
- All text meets a contrast ratio of at least 4.5 to 1 against its background.
- With reduced motion turned on, entrance animations and the moving background are off.
- The moving background rests after a few seconds without input.
- Copying a command and choosing a color are announced to screen readers.
- Color dots and hex chips keep their real colors in high contrast mode.

## Known limitations

- Clicking a word in the code sample works with a mouse or touch only. From the keyboard, the color dots above the editor show the same thing.
- When a color is selected, the other words in the code dim below the usual contrast level. This is temporary and ends when you select again, click away or press Escape.
- On narrow screens the code sample scrolls sideways.

## Report a problem

If something here does not work for you, open an issue on [GitHub](https://github.com/steelesh/sotto/issues) and say what you were trying to do.
