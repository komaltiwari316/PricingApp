import PricingPage from "./components/PricingPage.jsx";

export default function App() {
  const year = new Date().getFullYear();

  return (
    <>
      <header>
        <nav className="navbar">
          <div className="container nav-inner">
            <span className="brand">PricingApp</span>
            <span className="nav-link">Pricing Table</span>
          </div>
        </nav>
      </header>
      <div className="container">
        <main>
          <PricingPage />
        </main>
      </div>
      <footer className="footer">
        <div className="container">&copy; {year} PricingApp</div>
      </footer>
    </>
  );
}
