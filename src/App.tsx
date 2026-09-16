import { useMemo, useState } from 'react';

type Business = { id: number; name: string; category: string; state: string; city: string; description: string; phone: string; open: boolean; featured?: boolean };
type Photo = { name: string; data: string };

const states = ['All States','Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT'];
const categories = ['All Categories','Food & Restaurant','Fashion','Beauty','Electronics','Health','Professional Services','Hotels & Travel','Automotive','Education','Home Services','Shopping'];

const sampleBusinesses: Business[] = [
  { id: 1, name: 'Emmy Kitchen', category: 'Food & Restaurant', state: 'Rivers', city: 'Port Harcourt', description: 'Local meals, snacks and event catering.', phone: '+234 800 000 0001', open: true, featured: true },
  { id: 2, name: 'Naija Style Hub', category: 'Fashion', state: 'Lagos', city: 'Ikeja', description: 'Ready-to-wear fashion and accessories.', phone: '+234 800 000 0002', open: true, featured: true },
  { id: 3, name: 'Eastern Tech Store', category: 'Electronics', state: 'Anambra', city: 'Awka', description: 'Phones, accessories and electronics.', phone: '+234 800 000 0003', open: false },
  { id: 4, name: 'Capital Wellness Clinic', category: 'Health', state: 'FCT', city: 'Abuja', description: 'General wellness and outpatient services.', phone: '+234 800 000 0004', open: true },
];

function resizePhoto(file: File): Promise<Photo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1000;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('Canvas unavailable'));
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ name: file.name, data: canvas.toDataURL('image/jpeg', 0.78) });
      };
      img.onerror = () => reject(new Error('Could not read image'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function App() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('All States');
  const [category, setCategory] = useState('All Categories');
  const [saved, setSaved] = useState<number[]>(() => JSON.parse(localStorage.getItem('bizspot-saved') || '[]'));
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState('');

  const results = useMemo(() => sampleBusinesses.filter(b => {
    const q = query.toLowerCase();
    return (!q || `${b.name} ${b.category} ${b.city} ${b.state}`.toLowerCase().includes(q)) && (state === 'All States' || b.state === state) && (category === 'All Categories' || b.category === category);
  }), [query, state, category]);

  function toggleSaved(id: number) {
    const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    setSaved(next);
    localStorage.setItem('bizspot-saved', JSON.stringify(next));
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError('');
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      setPhotoError('You can upload up to 5 business photos.');
      return;
    }
    const valid = files.filter(file => file.type.startsWith('image/') && file.size <= 8 * 1024 * 1024);
    if (valid.length !== files.length) setPhotoError('Only image files up to 8MB each are allowed.');
    try {
      const newPhotos = await Promise.all(valid.map(resizePhoto));
      setPhotos(prev => [...prev, ...newPhotos]);
    } catch {
      setPhotoError('One of the selected images could not be processed.');
    }
    e.currentTarget.value = '';
  }

  function submitBusiness(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const submission = {
      id: Date.now(),
      businessName: String(form.get('businessName') || ''),
      category: String(form.get('category') || ''),
      state: String(form.get('state') || ''),
      city: String(form.get('city') || ''),
      phone: String(form.get('phone') || ''),
      description: String(form.get('description') || ''),
      photos,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    const pending = JSON.parse(localStorage.getItem('bizspot-pending-submissions') || '[]');
    localStorage.setItem('bizspot-pending-submissions', JSON.stringify([...pending, submission]));
    setMessage('Business submitted for review with its photos. It will appear publicly after approval.');
    setPhotos([]);
    setPhotoError('');
    setShowForm(false);
  }

  return <div className="app">
    <header className="topbar"><div className="brand"><span className="logo">B</span><span>Bizspot <small>Nigeria</small></span></div><button className="owner-btn" onClick={() => setShowForm(true)}>+ Add Business</button></header>
    <main>
      <section className="hero"><p className="eyebrow">🇳🇬 BUSINESS DISCOVERY ACROSS NIGERIA</p><h1>Find businesses near you.</h1><p className="hero-copy">Discover trusted local businesses by name, category, city or state.</p><div className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search businesses, services or places..." /></div></section>
      <section className="filters"><select value={state} onChange={e => setState(e.target.value)}>{states.map(s => <option key={s}>{s}</option>)}</select><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select><button onClick={() => { setQuery(''); setState('All States'); setCategory('All Categories'); }}>Reset</button></section>
      {message && <div className="notice">✓ {message}</div>}
      <section className="section-head"><div><h2>{query || state !== 'All States' || category !== 'All Categories' ? 'Search results' : 'Featured businesses'}</h2><p>{results.length} business{results.length === 1 ? '' : 'es'} found</p></div></section>
      <section className="grid">{results.map(b => <article className="card" key={b.id}>{b.featured && <span className="featured">FEATURED</span>}<div className="card-icon">{b.category === 'Food & Restaurant' ? '🍽️' : b.category === 'Fashion' ? '👗' : b.category === 'Electronics' ? '📱' : '🏪'}</div><div className="card-body"><div className="card-title"><h3>{b.name}</h3><button className="save" onClick={() => toggleSaved(b.id)} aria-label="Save">{saved.includes(b.id) ? '♥' : '♡'}</button></div><p className="muted">{b.category} · {b.city}, {b.state}</p><p>{b.description}</p><div className="meta"><span className={b.open ? 'open' : 'closed'}>{b.open ? '● Open' : '● Closed'}</span><span>☎ {b.phone}</span></div></div></article>)}{!results.length && <div className="empty"><strong>No businesses found yet.</strong><span>Try another search or state.</span></div>}</section>
      <section className="cta"><div><h2>Own a business?</h2><p>List your business on Bizspot and reach customers across Nigeria.</p></div><button onClick={() => setShowForm(true)}>List My Business</button></section>
    </main>
    {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowForm(false)}>×</button><h2>Add your business</h2><p>Submissions are reviewed before they appear publicly.</p><form onSubmit={submitBusiness}><input name="businessName" required placeholder="Business name" /><select name="category" required defaultValue=""><option value="" disabled>Category</option>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select><select name="state" required defaultValue=""><option value="" disabled>State</option>{states.slice(1).map(s => <option key={s}>{s}</option>)}</select><input name="city" required placeholder="City / area" /><input name="phone" placeholder="Phone number" /><textarea name="description" placeholder="Short business description" /><div className="photo-upload"><label htmlFor="business-photos" className="upload-box"><span className="upload-icon">📷</span><strong>Upload business photos</strong><small>Add up to 5 photos of your shop, products or services.</small><span className="upload-button">Choose Photos</span></label><input id="business-photos" className="file-input" type="file" accept="image/*" multiple onChange={handlePhotos} />{photoError && <div className="photo-error">{photoError}</div>}{photos.length > 0 && <div className="photo-grid">{photos.map((photo, index) => <div className="photo-preview" key={`${photo.name}-${index}`}><img src={photo.data} alt={`Business photo ${index + 1}`} /><button type="button" onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}>×</button></div>)}</div>}</div><button className="submit" type="submit">Submit for review</button></form></div></div>}
  </div>;
}

export default App;
