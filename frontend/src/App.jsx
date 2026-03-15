import { useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

function App() {
  // --- THE UNIVERSAL RADAR (Deployment Fix) ---
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // --- AUTH STATE ---
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(localStorage.getItem('username') || '');
  const [authMode, setAuthMode] = useState('login'); 
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [showAuth, setShowAuth] = useState(!token);

  // --- RESUME DATA (Back to a clean slate!) ---
  const [resumeData, setResumeData] = useState({
    fullName: '', email: '', phone: '', summary: '', degree: '', institution: '', skills: '',
    projects: '', certifications: '', awards: '', languages: '', associations: ''
  });

  // --- UI STATE ---
  const [darkMode, setDarkMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "System Online. Your secure workspace is active. How can I help you refine your resume?" }
  ]);

  // --- LOAD DATA ON BOOT ---
  useEffect(() => {
    if (token) {
      const loadResume = async () => {
        try {
          const response = await fetch(`${API_URL}/api/resume`, {
            headers: { 'Authorization': token }
          });
          const data = await response.json();
          if (data && !data.error) setResumeData(data);
        } catch (err) { console.log("New session started."); }
      };
      loadResume();
    }
  }, [token, API_URL]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value })
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? 'login' : 'register';
    try {
      const res = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setToken(data.token);
        setUser(data.username);
        setShowAuth(false);
      } else if (authMode === 'signup') {
        alert("Success! Now please login.");
        setAuthMode('login');
      } else { alert(data.error); }
    } catch (err) { alert("Server Error"); }
  };

  const logout = () => {
    localStorage.clear();
    setToken('');
    setUser('');
    setShowAuth(true);
    setResumeData({ fullName: '', email: '', phone: '', summary: '', degree: '', institution: '', skills: '', projects: '', certifications: '', awards: '', languages: '', associations: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch(`${API_URL}/api/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(resumeData),
      });
      alert("Resume securely saved! 🚀");
    } catch (error) { alert("Error saving."); }
    finally { setIsSaving(false); }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const element = document.getElementById('resume-preview');
    try {
      const dataUrl = await toPng(element, { quality: 1.0, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, (element.offsetHeight * 210) / element.offsetWidth);
      pdf.save(`${resumeData.fullName || 'My'}_Resume.pdf`);
    } finally { setIsDownloading(false); }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user', text: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsAiTyping(true);
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, currentResume: resumeData }),
      });
      const data = await response.json();
      setChatMessages([...newMessages, { role: 'ai', text: data.reply }]);
    } finally { setIsAiTyping(false); }
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      
      {/* LOGIN MODAL */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="text" placeholder="Username" required className="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
                value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
              <input type="password" placeholder="Password" required className="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
                value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition-all cursor-pointer">
                {authMode === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm">
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-blue-600 hover:underline cursor-pointer">
                {authMode === 'login' ? 'Need an account? Sign Up' : 'Have an account? Login'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Smart Resume Builder</h1>
        <div className="flex gap-4 items-center">
          {user && <span className="text-sm font-semibold opacity-70">Hello, {user}</span>}
          <button onClick={toggleTheme} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer"> {darkMode ? '☀️' : '🌙'} </button>
          {token && <button onClick={logout} className="text-sm font-bold text-red-500 cursor-pointer">Logout</button>}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-6 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: FORM AREA */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700 h-[75vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 border-b pb-2 dark:border-gray-700">Resume Details</h2>
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Personal Info</h3>
                <input type="text" name="fullName" placeholder="Full Name" value={resumeData.fullName} onChange={handleInputChange} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" name="email" placeholder="Email" value={resumeData.email} onChange={handleInputChange} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded" />
                  <input type="tel" name="phone" placeholder="Phone" value={resumeData.phone} onChange={handleInputChange} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded" />
                </div>
                <textarea name="summary" placeholder="Professional Summary" value={resumeData.summary} onChange={handleInputChange} rows="3" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded resize-none" />
              </div>

              <div className="space-y-4 border-t pt-4 dark:border-gray-700">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Education & Skills</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="degree" placeholder="Degree" value={resumeData.degree} onChange={handleInputChange} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded" />
                  <input type="text" name="institution" placeholder="Institution" value={resumeData.institution} onChange={handleInputChange} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded" />
                </div>
                <input type="text" name="skills" placeholder="Technical Skills" value={resumeData.skills} onChange={handleInputChange} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded" />
              </div>

              <div className="space-y-4 border-t pt-4 dark:border-gray-700">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Projects & Honors</h3>
                <textarea name="projects" placeholder="Projects / Work Experience" value={resumeData.projects} onChange={handleInputChange} rows="8" className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded resize-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="certifications" placeholder="Certifications" value={resumeData.certifications} onChange={handleInputChange} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded" />
                  <input type="text" name="awards" placeholder="Awards" value={resumeData.awards} onChange={handleInputChange} className="w-full p-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-95 disabled:bg-gray-400 cursor-pointer">
                  {isSaving ? 'Saving...' : 'Save to Account'}
                </button>
                <button type="button" onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer">
                  {isDownloading ? 'Working...' : 'Download PDF'}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-700 h-[75vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">Live Preview</h2>
            <div id="resume-preview" className="p-10 bg-white text-black shadow-lg min-h-[1000px] font-sans">
              <h1 className="text-4xl font-bold text-center border-b-2 border-black pb-2 mb-4 uppercase">{resumeData.fullName || "Your Name"}</h1>
              <div className="text-center text-xs mb-8 font-semibold flex justify-center gap-4">
                <span>{resumeData.email || "email@example.com"}</span>
                <span>|</span>
                <span>{resumeData.phone || "+91 0000000000"}</span>
              </div>
              
              <div className="space-y-6">
                {resumeData.summary && (
                  <section>
                    <h3 className="text-sm font-bold border-b border-gray-400 mb-2 uppercase">Professional Summary</h3>
                    <p className="text-xs leading-relaxed">{resumeData.summary}</p>
                  </section>
                )}
                
                {(resumeData.degree || resumeData.institution) && (
                  <section>
                    <h3 className="text-sm font-bold border-b border-gray-400 mb-2 uppercase">Education</h3>
                    <div className="flex justify-between text-xs font-bold">
                      <span>{resumeData.degree || "Your Degree"}</span>
                      <span>{resumeData.institution || "Your Institution"}</span>
                    </div>
                  </section>
                )}

                {resumeData.skills && (
                  <section>
                    <h3 className="text-sm font-bold border-b border-gray-400 mb-2 uppercase">Technical Skills</h3>
                    <p className="text-xs">{resumeData.skills}</p>
                  </section>
                )}

                {resumeData.projects && (
                  <section>
                    <h3 className="text-sm font-bold border-b border-gray-400 mb-2 uppercase">Projects & Experience</h3>
                    <p className="text-xs whitespace-pre-wrap">{resumeData.projects}</p>
                  </section>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {resumeData.certifications && (
                    <section>
                      <h3 className="text-xs font-bold border-b border-gray-400 mb-2 uppercase">Certifications</h3>
                      <p className="text-[10px] whitespace-pre-wrap">{resumeData.certifications}</p>
                    </section>
                  )}
                  {resumeData.awards && (
                    <section>
                      <h3 className="text-xs font-bold border-b border-gray-400 mb-2 uppercase">Awards</h3>
                      <p className="text-[10px] whitespace-pre-wrap">{resumeData.awards}</p>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- NEW: DEVELOPER FOOTER --- */}
      <footer className="w-full py-6 mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Built with 💻 by <span className="font-bold text-blue-600 dark:text-blue-400">B. Sharana Basava</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          ECE Engineering @ BITM | <a href="https://github.com/Sharanx77" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">GitHub: Sharanx77</a>
        </p>
      </footer>

      {/* CHATBOT */}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all z-50">💬</button>
      {isChatOpen && (
        <div className="fixed bottom-24 right-8 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 flex flex-col z-50 overflow-hidden">
          <div className="bg-blue-600 p-4 text-white font-bold flex justify-between items-center">
            <span className="text-sm">AI Assistant</span>
            <button onClick={() => setIsChatOpen(false)} className="cursor-pointer">✕</button>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 text-xs">
            {chatMessages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg ${m.role === 'ai' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200' : 'bg-gray-200 dark:bg-gray-700 self-end'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded outline-none text-xs" placeholder="Ask AI..." />
            <button onClick={handleSendMessage} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold cursor-pointer">Send</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default App