/**
 * @format
 */

import ReactTestRenderer from 'react-test-renderer';
// The app lives in src/ — importing '../App' silently resolves to app.json on
// case-insensitive filesystems, which is why this test used to fail.
import App from '../src/App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
