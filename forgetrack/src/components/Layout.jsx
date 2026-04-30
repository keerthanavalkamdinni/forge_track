import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  const { role } = useOutletContext();

  return (
    <div className="app-main flex">
      <Sidebar role={role} />
      
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-8 pt-4">
          <Outlet context={{ role }} />
        </main>
      </div>
    </div>
  );
}
