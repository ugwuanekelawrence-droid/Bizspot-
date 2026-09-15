import { useMemo, useState } from 'react';

type Business = {
  id: number;
  name: string;
  category: string;
  state: string;
  city: string;
  description: string;
  phone: string;
  open: boolean;
  featured?: boolean;
};

const states = ['All States','Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT'];
const categories = ['All Categories','Food & Restaurant','Fashion','Beauty','Electronics','Health','Professional Services','Hotels & Travel','Automotive','Education','Home Services','Shopping'];

const sampleBusinesses: Business[] = [
  { id: 1, name: 'Emmy Kitchen', category: 'Food & Restaurant', state: 'Rivers', city: 'Port Harcourt', description: 'Local meals, snacks and event catering.', phone: '+234 800 000 0001', open: true, featured: true },
  { id: 2, name: 'Naija Style Hub', category: 'Fashion', state: 'Lagos', city: 'Ikeja', description: 'Ready-to-wear fashion and accessories.', phone: '+234 800 000 0002', open: true, featured: true },
  { id: 3, name: 'Eastern Tech Store', category: 'Electronics', state: 'Anambra', city: 'Awka', description: 'Phones, accessories and electronics.', phone: '+234 800 000 0003', open: false },
  { id: 4, name: 'Capital Wellness Clinic', category: 'Health', state: 'FCT', city: 'Abuja', description: 'General wellness and outpatient services.', phone: '+234 800 000 0004', open: true },
];

function App() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('All States');
  const [category, setCategory] = useState('All Categories');
  const [saved, setSaved] = useState<number[]>(() => JSON.parse(localStorage.getItem('bizspot-saved') || '[]'));
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const results = useMemo(() => sampleBusinesses.filter(b => {
    const q = query.toLowerCase();
    return (!q || `${b.name} ${b.category} ${b.city} ${b.state}`.toLowerCase().includes(q))
      && (state === 'All States' || b.state === state)
      && (category === 'All Categories' || b.category === category);
  }), [query, state, category]);

  function toggleSaved(id: number) {
    const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    setSaved(next);
    localStorage.setItem('bizspot-saved', JSON.stringify(next));
  }

  function submitBusiness(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Business submitted for review. It will appear publicly after approval.');
    setShowForm(false);
  }

  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="logo">B</span><span>Bizspot <small>Nigeria</small></span></div>
      <button className="owner-btn" onClick={() => setShowForm(true)}>+ Add Business</button>
    </header>

    <main>
      <section className="hero">
        <p className="eyebrow">🇳🇬 BUSINESS DISCOVERY ACROSS NIGERIA</p>
        <h1>Find businesses near you.</h1>
        <p className="hero-copy">Discover trusted local businesses by name, category, city or state.</p>
        <div className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search businesses, services or places..." /></div>
      </section>

      <section className="filters">
        <select value={state} onChange={e => setState(e.target.value)}>{states.map(s => <option key={s}>{s}</option>)}</select>
        <select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select>
        <button onClick={() => { setQuery(''); setState('All States'); setCategory('All Categories'); }}>Reset</button>
      </section>

      {message && <div className="notice">✓ {message}</div>}

      <section className="section-head"><div><h2>{query || state !== 'All States' || category !== 'All Categories' ? 'Search results' : 'Featured businesses'}</h2><p>{results.length} business{results.length === 1 ? '' : 'es'} found</p></div></section>
      <section className="grid">
        {results.map(b => <article className="card" key={b.id}>
          {b.featured && <span className="featured">FEATURED</span>}
          <div className="card-icon">{b.category === 'Food & Restaurant' ? '🍽️' : b.category === 'Fashion' ? '👗' : b.category === 'Electronics' ? '📱' : '🏪'}</div>
          <div className="card-body"><div className="card-title"><h3>{b.name}</h3><button className="save" onClick={() => toggleSaved(b.id)} aria-label="Save">{saved.includes(b.id) ? '♥' : '♡'}</button></div><p className="muted">{b.category} · {b.city}, {b.state}</p><p>{b.description}</p><div className="meta"><span className={b.open ? 'open' : 'closed'}>{b.open ? '● Open' : '● Closed'}</span><span>☎ {b.phone}</span></div></div>
        </article>)}
        {!results.length && <div className="empty"><strong>No businesses found yet.</strong><span>Try another search or state.</span></div>}
      </section>

      <section className="cta"><div><h2>Own a business?</h2><p>List your business on Bizspot and reach customers across Nigeria.</p></div><button onClick={() => setShowForm(true)}>List My Business</button></section>
    </main>

    {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowForm(false)}>×</button><h2>Add your business</h2><p>Submissions are reviewed before they appear publicly.</p><form onSubmit={submitBusiness}><input required placeholder="Business name" /><select required defaultValue=""><option value="" disabled>Category</option>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select><select required defaultValue=""><option value="" disabled>State</option>{states.slice(1).map(s => <option key={s}>{s}</option>)}</select><input required placeholder="City / area" /><input placeholder="Phone number" /><textarea placeholder="Short business description" /><button className="submit" type="submit">Submit for review</button></form></div></div>}
  </div>;
}

export default App;
