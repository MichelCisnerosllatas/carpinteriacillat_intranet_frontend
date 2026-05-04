/**
 * layout-script.ts
 *
 * Generates the inline <script> that runs BEFORE React hydrates to apply
 * the saved layout settings (variant + collapsible) from localStorage.
 *
 * This eliminates the flash/jump of sidebar variant changing after hydration.
 * Same technique used by next-themes for dark mode.
 *
 * The script:
 *  1. Reads 'layout-settings' from localStorage (Zustand persist key)
 *  2. Applies data-variant and data-collapsible attributes to <html>
 *  3. Sidebar reads these attributes in its initial render
 */
export function getLayoutScript(): string {
  return `(function(){try{
    var s=localStorage.getItem('layout-settings');
    if(s){
      var d=JSON.parse(s).state;
      if(d&&d.variant)   document.documentElement.setAttribute('data-sidebar-variant',d.variant);
      if(d&&d.collapsible)document.documentElement.setAttribute('data-sidebar-collapsible',d.collapsible);
    }
  }catch(e){}})();`
}
