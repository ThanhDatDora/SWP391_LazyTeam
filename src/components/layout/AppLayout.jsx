import Header from './Header';
import SideNav from './SideNav';
import Footer from './Footer';

const AppLayout = ({ children, user }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6 flex-1">
        <aside className="col-span-12 lg:col-span-3">
          <SideNav user={user} />
        </aside>
        <section className="col-span-12 lg:col-span-9">
          {children}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AppLayout;
