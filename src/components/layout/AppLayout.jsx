import React from 'react';
import SimpleHeader from './SimpleHeader';
import SimpleSideNav from './SimpleSideNav';
import SimpleFooter from './SimpleFooter';

const AppLayout = ({ children, user }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <SimpleHeader user={user} />
      
      <main className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6 flex-1">
        <aside className="col-span-12 lg:col-span-3">
          <SimpleSideNav user={user} />
        </aside>
        <section className="col-span-12 lg:col-span-9">
          {children}
        </section>
      </main>
      
      <SimpleFooter />
    </div>
  );
};

export default AppLayout;