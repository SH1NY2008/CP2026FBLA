/**
 * Pure helpers for parsing Google Geocoding `address_components`.
 * Decouples response shaping from HTTP handlers (single responsibility).
 */

export function parseLocalityAndCountry(
  components: Array<{ types: string[]; long_name: string }>,
): { city: string; country: string } {
  let city = '';
  let country = '';
  for (const component of components) {
    if (
      component.types.includes('locality') ||
      component.types.includes('postal_town')
    ) {
      city = component.long_name;
    }
    if (component.types.includes('country')) {
      country = component.long_name;
    }
  }
  return { city, country };
}
