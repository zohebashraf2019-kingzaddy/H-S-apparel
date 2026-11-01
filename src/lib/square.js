/* global __SQUARE_APP_ID__, __SQUARE_LOCATION_ID__, __SQUARE_ENV__ */
// Square Web Payments SDK loader. Public IDs are injected at build time from
// PUBLIC_SQUARE_APP_ID / PUBLIC_SQUARE_LOCATION_ID / PUBLIC_SQUARE_ENV.
export const SQUARE = {
  appId: __SQUARE_APP_ID__,
  locationId: __SQUARE_LOCATION_ID__,
  env: __SQUARE_ENV__ === 'production' ? 'production' : 'sandbox',
};
export const squareConfigured = Boolean(SQUARE.appId && SQUARE.locationId);

let loading;
export function loadSquare() {
  if (window.Square) return Promise.resolve(window.Square);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SQUARE.env === 'production' ? 'https://web.squarecdn.com/v1/square.js' : 'https://sandbox.web.squarecdn.com/v1/square.js';
    s.onload = () => (window.Square ? resolve(window.Square) : reject(new Error('Square failed to load')));
    s.onerror = () => reject(new Error('Square failed to load'));
    document.head.appendChild(s);
  });
  return loading;
}

export const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
];
