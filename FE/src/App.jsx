import { Outlet } from 'react-router-dom';
import { Providers } from './app/providers';

function App() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}

export default App;
