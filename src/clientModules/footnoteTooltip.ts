import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export function onRouteDidUpdate() {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }

  // Find all footnote links. In Docusaurus/remark-gfm, they use the `data-footnote-ref` attribute.
  const footnoteRefs = document.querySelectorAll('a[data-footnote-ref]');

  footnoteRefs.forEach((ref) => {
    // Skip if tippy is already initialized on this element
    // @ts-ignore
    if (ref._tippy) return;

    const targetHref = ref.getAttribute('href');
    if (!targetHref || !targetHref.startsWith('#')) return;

    // The targetHref is something like '#user-content-fn-1', we need the ID
    const targetId = targetHref.substring(1);
    
    // We use getElementById instead of querySelector because IDs with numbers or hyphens are safer this way
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    // Clone the footnote content to safely manipulate it without affecting the bottom footnotes
    const contentClone = targetEl.cloneNode(true) as HTMLElement;

    // Remove the backref arrow link(s) (e.g., ↩) typically found at the end of the footnote
    const backrefs = contentClone.querySelectorAll('.data-footnote-backref');
    backrefs.forEach(backref => backref.remove());

    // Initialize tippy tooltip
    tippy(ref as Element, {
      content: contentClone.innerHTML,
      allowHTML: true,
      interactive: true, // Allows user to hover over the tooltip itself (useful if there are links inside)
      placement: 'top',
      maxWidth: 400,
      delay: [200, 0], // slight delay to prevent flickering
      theme: 'docusaurus', // Custom theme we will style in custom.css
    });
  });
}
