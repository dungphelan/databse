import { AppProvider, useApp } from '@/context';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import HomePage from '@/pages/HomePage';
import ListPage from '@/pages/ListPage';
import SeatSelection from '@/pages/SeatSelection';
import BookingPage from '@/pages/BookingPage';
import MyTicketsPage from '@/pages/MyTicketsPage';

function PageContent() {
  const { page } = useApp();

  return (
    <>
      {page === 'home' && <HomePage />}
      {page === 'list' && <ListPage />}
      {page === 'seat' && <SeatSelection />}
      {page === 'booking' && <BookingPage />}
      {page === 'tickets' && <MyTicketsPage view="tickets" />}
      {page === 'transactions' && <MyTicketsPage view="transactions" />}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <Navbar />
      <PageContent />
      <Footer />
    </AppProvider>
  );
}

export default App;
