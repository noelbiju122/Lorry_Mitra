import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, FileScan, Wallet, Settings, 
  PhoneCall, ShieldAlert, Mic, Volume2, 
  UploadCloud, MapPin, Truck, AlertTriangle,
  CloudRain, PlusCircle, Clock, ChevronRight, Fuel, TrendingUp,
  X, CheckCircle, LogOut, Users, Activity, FileText
} from 'lucide-react';
import { processDocumentImage, translateLogisticsJargon } from './utils/ocrParser';
import { supabase } from './lib/supabase';
import Auth from './Auth';

function VandiMitra() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [highContrast, setHighContrast] = useState(false);
  const [role, setRole] = useState('DRIVER'); 
  
  // Modals & Interactive States
  const [showSOS, setShowSOS] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Data States
  const [scanStatus, setScanStatus] = useState('IDLE'); // IDLE, FILE_SELECTED, SCANNING, SUCCESS
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [docData, setDocData] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [greeting, setGreeting] = useState('');

  const [expenses, setExpenses] = useState([
    { id: 1, item: 'Fuel (ഡീസൽ)', amt: 3500, date: 'Today, 10:30 AM', type: 'fuel' },
    { id: 2, item: 'Toll (ടോൾ)', amt: 450, date: 'Today, 08:15 AM', type: 'toll' },
    { id: 3, item: 'Food (ഭക്ഷണം)', amt: 300, date: 'Yesterday', type: 'food' },
  ]);

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amt, 0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  useEffect(() => {
    if (highContrast) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');
  }, [highContrast]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('സുപ്രഭാതം (Good Morning)');
    else if (hour < 16) setGreeting('ശുഭ ഉച്ചതിരിഞ്ഞ് (Good Afternoon)');
    else setGreeting('ശുഭ സായാഹ്നം (Good Evening)');
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setScanStatus('FILE_SELECTED');
    }
  };

  const handleProcessScan = async () => {
    setScanStatus('SCANNING');
    const data = await processDocumentImage(selectedFile);
    setDocData(data.extractedData);
    setScanStatus('SUCCESS');
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setDocData(null);
    setScanStatus('IDLE');
  };

  const handleTTS = () => {
    if ('speechSynthesis' in window && docData) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
      }
      const text = `ഇ-വേ ബിൽ വിവരങ്ങൾ. ചരക്ക്: ${docData.cargoDescription.ml}. ${docData.pickupLocation.ml} ൽ നിന്ന് ${docData.deliveryDestination.ml} ലേക്ക്. കാലാവധി പന്ത്രണ്ടു മണിക്കൂർ കൂടി ഉണ്ട്.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ml-IN';
      utterance.onend = () => setIsReading(false);
      setIsReading(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const simulateVoiceAssist = () => {
    setShowVoice(true);
    setVoiceText('Listening... (സംസാരിക്കുക)');
    setTimeout(() => {
      setVoiceText('"വണ്ടി എവിടെ എത്തി?" (Where is the vehicle?)');
      setTimeout(() => {
        setVoiceText('വണ്ടി ഇപ്പോൾ തൃശൂർ എത്തിയിട്ടുണ്ട്. (Vehicle is currently at Thrissur.)');
        setTimeout(() => setShowVoice(false), 3000);
      }, 2000);
    }, 2000);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = Number(formData.get('amount'));
    const desc = formData.get('desc');
    const type = formData.get('type');
    
    if (amount && desc) {
      setExpenses([{
        id: Date.now(), item: desc, amt: amount, date: 'Just now', type: type
      }, ...expenses]);
      setShowAddExpense(false);
    }
  };

  // ---- ROLE RENDERERS ----

  const renderAdminDashboard = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-kerala-teak">System Admin Dashboard</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <Users size={32} className="text-blue-500 mb-2" />
          <h3 className="font-bold text-2xl text-gray-800">1,245</h3>
          <p className="text-xs text-gray-500 uppercase font-bold">Total Drivers</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <Truck size={32} className="text-green-500 mb-2" />
          <h3 className="font-bold text-2xl text-gray-800">340</h3>
          <p className="text-xs text-gray-500 uppercase font-bold">Active Trips</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center col-span-2">
          <Activity size={32} className="text-orange-500 mb-2" />
          <h3 className="font-bold text-2xl text-gray-800">12,450</h3>
          <p className="text-xs text-gray-500 uppercase font-bold">Docs Scanned this month</p>
        </div>
      </div>

      <h3 className="font-bold text-gray-800 mt-6 mb-2">Recent System Alerts</h3>
      <div className="bg-red-50 p-4 rounded-xl border border-red-100">
        <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
          <AlertTriangle size={16} /> API Rate Limit Warning
        </div>
        <p className="text-xs text-red-800">OCR processing pipeline is operating at 85% capacity in the Kerala region.</p>
      </div>
    </div>
  );

  const renderFleetOwnerDashboard = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-kerala-teak">Fleet Status (വണ്ടികളുടെ വിവരം)</h2>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-kerala-green flex justify-between items-center">
        <div>
          <h3 className="font-bold">KL 01 X 9999 (Suresh)</h3>
          <p className="text-sm text-gray-500">Ernakulam → Trivandrum</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-white bg-green-500 px-2 py-1 rounded">ON TIME</span>
          <p className="text-xs text-gray-500 mt-1">150 KM left</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500 flex justify-between items-center">
        <div>
          <h3 className="font-bold">KL 07 B 1234 (Ramesh)</h3>
          <p className="text-sm text-gray-500">Palakkad → Kozhikode</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-1 rounded">DELAYED</span>
          <p className="text-xs text-gray-500 mt-1">Traffic block</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-gray-300 flex justify-between items-center opacity-70">
        <div>
          <h3 className="font-bold">KL 05 C 5555 (Unni)</h3>
          <p className="text-sm text-gray-500">Idle at Kottayam</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded">IDLE</span>
        </div>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="p-4 space-y-5 pb-28 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-kerala-teak tracking-tight">വണ്ടിമിത്ര</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">{greeting}</p>
          <p className="text-lg font-bold text-kerala-green mt-1">
            {role === 'DRIVER' ? 'Suresh Kumar (KL 01 X 9999)' : role === 'ADMIN' ? 'System Administrator' : 'Fleet Owner: Menon Transports'}
          </p>
        </div>
        <button 
          onClick={() => setShowSOS(true)}
          className="bg-red-50 text-red-600 p-3 rounded-full flex flex-col items-center shadow-md border border-red-100 active:scale-95 transition-transform"
        >
          <ShieldAlert size={26} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">SOS</span>
        </button>
      </div>

      {role === 'ADMIN' && renderAdminDashboard()}
      {role === 'FLEET_OWNER' && renderFleetOwnerDashboard()}
      
      {role === 'DRIVER' && (
        <>
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3 shadow-sm">
            <div className="bg-blue-100 p-2 rounded-full"><CloudRain className="text-blue-600" size={20}/></div>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-900">മഴ മുന്നറിയിപ്പ് (Rain Alert)</p>
              <p className="text-xs text-blue-700">Heavy rain expected in Thrissur. Drive slow.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-kerala-teak to-[#5D4037] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10"><TrendingUp size={100} /></div>
            <p className="text-sm text-kerala-gold-light mb-1 font-medium">ഈ ആഴ്ചത്തെ വരുമാനം (This Week)</p>
            <h2 className="text-3xl font-bold mb-4">₹ 14,500</h2>
            <div className="flex gap-3">
              <button 
                onClick={() => { setActiveTab('expenses'); setShowAddExpense(true); }} 
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors py-2 rounded-lg text-sm font-semibold flex justify-center items-center gap-2"
              >
                <Fuel size={16} /> ഇന്ധനം ചേർക്കുക (Add Fuel)
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-lg font-bold text-kerala-teak">നിലവിലെ യാത്ര (Active Trip)</h2>
              <span className="text-xs font-bold text-kerala-green bg-green-50 px-2 py-1 rounded-md">ON TIME</span>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 relative">
              <div className="absolute top-4 right-4 text-gray-300"><Truck size={40} /></div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-kerala-green ring-4 ring-green-50"></div>
                <p className="font-bold text-gray-800">Kochi Port</p>
              </div>
              <div className="ml-1.5 border-l-2 border-dashed border-gray-200 py-2 pl-4">
                <p className="text-xs text-gray-500 font-medium">150 KM remaining • ETA: 4:30 PM</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-3 h-3 rounded-full bg-kerala-gold ring-4 ring-yellow-50"></div>
                <p className="font-bold text-gray-800">Technopark, Trivandrum</p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="text-sm font-bold text-gray-700">E-Way Bill: 12h left</span>
                </div>
                <button onClick={() => setActiveTab('scan')} className="text-kerala-green text-sm font-bold flex items-center gap-1 hover:underline">
                  View Details <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3 text-kerala-teak">പെട്ടെന്നുള്ളവ (Quick Actions)</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setActiveTab('scan')} className="bg-white text-kerala-teak p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 active:scale-95 transition-transform">
                <div className="bg-orange-50 p-3 rounded-full"><FileScan size={28} className="text-orange-600" /></div>
                <span className="font-bold text-sm">Scan Document</span>
              </button>
              <button onClick={simulateVoiceAssist} className="bg-white text-kerala-teak p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 active:scale-95 transition-transform">
                <div className="bg-kerala-green/10 p-3 rounded-full"><Mic size={28} className="text-kerala-green" /></div>
                <span className="font-bold text-sm">Voice Assist</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderScan = () => (
    <div className="p-4 pb-28 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-kerala-teak">Document Scanner</h2>
      
      {scanStatus === 'IDLE' && (
        <div className="flex-1 flex flex-col justify-center pb-20 gap-4">
          <input 
            type="file" 
            accept="image/*,.pdf" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={cameraInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          
          <div className="text-center mb-4">
             <h3 className="text-xl font-bold text-kerala-teak mb-2">Select or Capture</h3>
             <p className="text-sm text-gray-500 max-w-[200px] mx-auto">രേഖകൾ സ്കാൻ ചെയ്യുകയോ അപ്‌ലോഡ് ചെയ്യുകയോ ചെയ്യുക</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => cameraInputRef.current.click()}
              className="bg-kerala-teak text-white p-6 rounded-3xl flex flex-col items-center gap-4 shadow-lg active:scale-95 transition-transform"
            >
              <div className="bg-white/20 p-4 rounded-full"><FileScan size={32} /></div>
              <span className="font-bold">Open Camera</span>
            </button>

            <button 
              onClick={() => fileInputRef.current.click()}
              className="bg-white text-kerala-teak border-2 border-dashed border-gray-300 p-6 rounded-3xl flex flex-col items-center gap-4 shadow-sm hover:border-kerala-gold hover:bg-yellow-50 active:scale-95 transition-all"
            >
              <div className="bg-orange-50 p-4 rounded-full"><UploadCloud size={32} className="text-orange-600" /></div>
              <span className="font-bold">Choose File</span>
            </button>
          </div>
        </div>
      )}

      {scanStatus === 'FILE_SELECTED' && (
        <div className="flex-1 flex flex-col justify-center pb-20 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-sm border border-gray-100">
            <FileText size={64} className="text-kerala-green mb-4" />
            <h3 className="font-bold text-lg text-gray-800 mb-1">File Selected</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-[250px] truncate text-center">
              {selectedFile?.name || 'Document ready for scanning'}
            </p>
            
            <button 
              onClick={handleProcessScan}
              className="w-full py-4 bg-kerala-green text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-md"
            >
              Process Document (സ്കാൻ ചെയ്യുക)
            </button>
            <button 
              onClick={resetScanner}
              className="w-full py-3 mt-3 text-gray-500 font-bold hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {scanStatus === 'SCANNING' && (
        <div className="flex-1 flex flex-col items-center justify-center pb-20">
          <div className="relative">
            <div className="animate-ping absolute inset-0 rounded-full bg-kerala-gold opacity-20"></div>
            <div className="bg-white p-6 rounded-full shadow-lg relative z-10">
              <FileScan size={48} className="text-kerala-teak animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-kerala-teak mt-8 mb-2">രേഖകൾ വായിക്കുന്നു...</h3>
          <p className="text-gray-500 text-sm">Extracting details with AI</p>
        </div>
      )}

      {scanStatus === 'SUCCESS' && docData && (
        <div className="space-y-4 animate-fade-in pb-10">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h3 className="text-xl font-bold text-kerala-green">ബിൽ സംഗ്രഹം</h3>
              <p className="text-xs text-gray-500">Document Summary</p>
            </div>
            <button 
              onClick={handleTTS}
              className={`p-4 rounded-full shadow-md transition-all ${isReading ? 'bg-kerala-gold text-white scale-110' : 'bg-gray-50 text-kerala-teak hover:bg-gray-100'}`}
            >
              <Volume2 size={24} />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-yellow-50 p-4 flex items-center justify-between border-b border-yellow-100">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-200 p-2 rounded-full"><Clock className="text-yellow-700" size={16} /></div>
                <div>
                  <p className="text-sm font-bold text-yellow-900">കാലാവധി (Validity)</p>
                  <p className="text-xs text-yellow-700 font-medium">12 മണിക്കൂർ കൂടി ബാക്കിയുണ്ട്</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex gap-4">
                <div className="bg-gray-50 p-3 rounded-xl"><MapPin className="text-kerala-teak" size={24} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold tracking-wide uppercase mb-1">റൂട്ട് (Route)</p>
                  <p className="font-bold text-gray-800 text-lg leading-tight">{docData.pickupLocation.ml}</p>
                  <p className="text-gray-400 text-sm my-1">↓</p>
                  <p className="font-bold text-gray-800 text-lg leading-tight">{docData.deliveryDestination.ml}</p>
                </div>
              </div>

              <div className="flex gap-4 border-t border-gray-100 pt-5">
                <div className="bg-gray-50 p-3 rounded-xl"><Truck className="text-kerala-teak" size={24} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold tracking-wide uppercase mb-1 cursor-help" title={translateLogisticsJargon('Cargo')}>ചരക്ക് (Cargo)</p>
                  <p className="font-bold text-gray-800 text-base">{docData.cargoDescription.ml}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
                <div className="border border-gray-100 p-3 rounded-xl flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 cursor-help" title={translateLogisticsJargon('Consignor')}>അയക്കുന്ന ആൾ</p>
                    <p className="font-bold text-gray-800 text-sm leading-tight mb-3">{docData.consignor.name}</p>
                  </div>
                  <a href={`tel:${docData.consignor.phone}`} className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-kerala-green py-2 rounded-lg w-full hover:bg-green-700 transition-colors">
                    <PhoneCall size={14} /> Call
                  </a>
                </div>
                <div className="border border-gray-100 p-3 rounded-xl flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 cursor-help" title={translateLogisticsJargon('Consignee')}>കൈപ്പറ്റുന്ന ആൾ</p>
                    <p className="font-bold text-gray-800 text-sm leading-tight mb-3">{docData.consignee.name}</p>
                  </div>
                  <a href={`tel:${docData.consignee.phone}`} className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-kerala-green py-2 rounded-lg w-full hover:bg-green-700 transition-colors">
                    <PhoneCall size={14} /> Call
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={resetScanner}
            className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} /> പുതിയത് സ്കാൻ ചെയ്യുക
          </button>
        </div>
      )}
    </div>
  );

  const getIconForType = (type) => {
    switch(type) {
      case 'fuel': return <Fuel size={20} className="text-blue-600"/>;
      case 'toll': return <MapPin size={20} className="text-orange-600"/>;
      default: return <Clock size={20} className="text-green-600"/>;
    }
  };
  const getBgForType = (type) => {
    switch(type) {
      case 'fuel': return 'bg-blue-50';
      case 'toll': return 'bg-orange-50';
      default: return 'bg-green-50';
    }
  };

  const renderExpenses = () => (
    <div className="p-4 pb-28 h-full">
      <h2 className="text-2xl font-bold mb-6 text-kerala-teak">ചെലവുകൾ (Expenses)</h2>
      
      <div className="bg-kerala-teak rounded-3xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4"><Wallet size={120} /></div>
        <p className="text-sm text-gray-300 mb-1">Total Trip Expense</p>
        <p className="text-4xl font-extrabold mb-6 tracking-tight">₹ {totalExpense.toLocaleString('en-IN')}</p>
        
        <button 
          onClick={() => setShowAddExpense(true)}
          className="w-full bg-kerala-gold text-kerala-teak py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-yellow-400 transition-colors"
        >
          <PlusCircle size={20} /> Add New Expense
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-gray-800">Recent Logs</h3>
        <button className="text-sm font-bold text-kerala-green">View All</button>
      </div>

      <div className="space-y-3">
        {expenses.map((exp) => (
          <div key={exp.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`${getBgForType(exp.type)} p-3 rounded-xl`}>{getIconForType(exp.type)}</div>
              <div>
                <p className="font-bold text-gray-800">{exp.item}</p>
                <p className="text-xs text-gray-500 font-medium">{exp.date}</p>
              </div>
            </div>
            <p className="font-bold text-gray-900 text-lg">₹ {exp.amt.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-4 pb-28 h-full">
      <h2 className="text-2xl font-bold mb-6 text-kerala-teak">ക്രമീകരണങ്ങൾ (Settings)</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        <div className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
          <div>
            <span className="font-bold text-gray-800 block">High Contrast Mode</span>
            <span className="text-xs text-gray-500">കൂടിയ വെളിച്ചത്തിൽ ഉപയോഗിക്കാൻ</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={highContrast} onChange={() => setHighContrast(!highContrast)} />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-kerala-green shadow-inner"></div>
          </label>
        </div>
        
        <div className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
          <div>
            <span className="font-bold text-gray-800 block">App Role (റോൾ)</span>
            <span className="text-xs text-gray-500">Change dashboard view</span>
          </div>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="bg-gray-100 border border-transparent font-bold text-kerala-teak rounded-xl p-2.5 focus:ring-2 focus:ring-kerala-gold outline-none cursor-pointer"
          >
            <option value="DRIVER">Driver</option>
            <option value="FLEET_OWNER">Fleet Owner</option>
          </select>
        </div>
        
        <button onClick={handleLogout} className="w-full p-5 text-center hover:bg-red-50 transition-colors">
          <span className="text-red-600 font-bold flex justify-center items-center gap-2"><LogOut size={18}/> Logout / പുറത്തുകടക്കുക</span>
        </button>
      </div>
    </div>
  );

  if (!session) {
    return <Auth onLoginSuccess={setSession} />;
  }

  if (session?.role === 'ADMIN') {
    return <AdminApp onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative max-w-md mx-auto shadow-[0_0_40px_rgba(0,0,0,0.1)] overflow-hidden font-sans selection:bg-kerala-gold selection:text-white">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="h-full overflow-y-auto relative z-10 scroll-smooth">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'scan' && renderScan()}
        {activeTab === 'expenses' && renderExpenses()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      <div className="absolute bottom-6 left-4 right-4 z-40">
        <div className="bg-white rounded-2xl flex justify-around p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100">
          <NavButton icon={<Home />} label="Home" id="home" active={activeTab} set={setActiveTab} />
          <NavButton icon={<FileScan />} label="Scan" id="scan" active={activeTab} set={setActiveTab} />
          
          <div className="relative -top-6">
            <button onClick={() => setActiveTab('scan')} className="bg-kerala-teak text-white p-4 rounded-full shadow-lg border-4 border-gray-50 hover:bg-[#2A1A17] hover:scale-105 transition-all">
              <UploadCloud size={28} />
            </button>
          </div>

          <NavButton icon={<Wallet />} label="Expenses" id="expenses" active={activeTab} set={setActiveTab} />
          <NavButton icon={<Settings />} label="Settings" id="settings" active={activeTab} set={setActiveTab} />
        </div>
      </div>
      
      {/* Voice Assistant Modal */}
      {showVoice && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-end animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-3xl p-6 text-center space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-kerala-green rounded-full animate-ping opacity-30"></div>
              <div className="bg-kerala-green rounded-full p-5 text-white relative z-10">
                <Mic size={48} />
              </div>
            </div>
            <p className="text-lg font-bold text-kerala-teak px-4 py-2 bg-gray-50 rounded-xl inline-block border border-gray-100">
              {voiceText}
            </p>
            <button onClick={() => setShowVoice(false)} className="block w-full py-3 text-gray-500 font-bold">Cancel</button>
          </div>
        </div>
      )}

      {/* SOS Modal */}
      {showSOS && (
        <div className="absolute inset-0 z-50 bg-red-900/80 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full rounded-3xl p-6 text-center space-y-4">
            <div className="bg-red-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-2">
              <ShieldAlert size={40} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-600">അടിയന്തരാവസ്ഥ (Emergency)</h3>
            <p className="text-gray-600">നിങ്ങൾക്ക് സഹായം ആവശ്യമുണ്ടോ?</p>
            
            <div className="space-y-3 mt-6">
              <button className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
                <PhoneCall size={20}/> പോലീസിനെ വിളിക്കുക (112)
              </button>
              <button className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
                <PhoneCall size={20}/> ഉടമയെ വിളിക്കുക (Owner)
              </button>
              <button onClick={() => setShowSOS(false)} className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl">
                റദ്ദാക്കുക (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-end animate-fade-in">
          <div className="bg-white w-full rounded-t-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-kerala-teak">ചെലവ് ചേർക്കുക (Add Expense)</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-gray-400 bg-gray-100 rounded-full p-1"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Amount (തുക)</label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">₹</span>
                  <input required name="amount" type="number" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-8 pr-4 font-bold text-lg focus:ring-2 focus:ring-kerala-gold outline-none" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                <select name="type" className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium focus:ring-2 focus:ring-kerala-gold outline-none">
                  <option value="fuel">Fuel (ഡീസൽ)</option>
                  <option value="toll">Toll (ടോൾ)</option>
                  <option value="food">Food (ഭക്ഷണം)</option>
                  <option value="other">Other (മറ്റുള്ളവ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Description (വിവരണം)</label>
                <input required name="desc" type="text" placeholder="e.g. Paliyekkara Toll" className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-kerala-gold outline-none" />
              </div>
              
              <button type="submit" className="w-full bg-kerala-teak text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-[#2A1A17] transition-colors">
                <CheckCircle size={20} /> Save Expense
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const NavButton = ({ icon, label, id, active, set }) => {
  const isActive = active === id;
  return (
    <button 
      onClick={() => set(id)}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-kerala-teak scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
    >
      <div>{React.cloneElement(icon, { size: 22, strokeWidth: isActive ? 2.5 : 2, className: isActive ? 'drop-shadow-sm' : '' })}</div>
      <span className={`text-[10px] font-bold ${isActive ? 'text-kerala-teak' : 'text-gray-500'}`}>{label}</span>
    </button>
  );
};

const AdminApp = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, users
  
  const [users, setUsers] = useState([
    { id: 1, name: 'Suresh Kumar', phone: '+91 9876543210', role: 'Driver' },
    { id: 2, name: 'Ramesh M', phone: '+91 8765432109', role: 'Driver' },
    { id: 3, name: 'Menon Transports', phone: '+91 7654321098', role: 'Fleet Owner' },
  ]);
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '' });
  
  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ name: user.name, phone: user.phone, role: user.role });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if(editingId) {
      setUsers(users.map(u => u.id === editingId ? { ...u, ...editForm } : u));
      setEditingId(null);
    } else {
      setUsers([...users, { id: Date.now(), ...editForm }]);
      setEditingId(null);
    }
  };

  const totalUsers = users.length;
  const totalDrivers = users.filter(u => u.role === 'Driver').length;
  const totalFleetOwners = users.filter(u => u.role === 'Fleet Owner').length;

  return (
    <div className="min-h-screen bg-gray-50 max-w-5xl mx-auto shadow-xl flex flex-col font-sans selection:bg-red-900 selection:text-white">
      {/* Admin Header */}
      <div className="bg-red-900 text-white p-5 shadow-md flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <ShieldAlert size={28} className="text-red-200" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">System Admin</h1>
            <p className="text-red-200 text-xs">VandiMitra Control Panel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-black/20 rounded-lg p-1">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-white text-red-900 shadow-sm' : 'text-red-100 hover:text-white'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'users' ? 'bg-white text-red-900 shadow-sm' : 'text-red-100 hover:text-white'}`}>User Management</button>
          </div>
          <button onClick={onLogout} className="bg-white/10 hover:bg-white/20 transition-colors p-2.5 rounded-xl flex items-center gap-2 font-bold text-sm">
            <LogOut size={16} /> <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Nav Fallback */}
      <div className="md:hidden flex bg-white border-b border-gray-200 sticky top-[76px] z-10 shadow-sm">
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 font-bold text-sm ${activeTab === 'dashboard' ? 'text-red-800 border-b-2 border-red-800' : 'text-gray-500'}`}>Dashboard</button>
        <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 font-bold text-sm ${activeTab === 'users' ? 'text-red-800 border-b-2 border-red-800' : 'text-gray-500'}`}>Users</button>
      </div>

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Details Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-full"><Users size={28} className="text-blue-500" /></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Total Users</p>
                  <h3 className="font-bold text-2xl text-gray-800">{totalUsers}</h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-green-50 p-3 rounded-full"><Truck size={28} className="text-green-500" /></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Active Drivers</p>
                  <h3 className="font-bold text-2xl text-gray-800">{totalDrivers}</h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="bg-orange-50 p-3 rounded-full"><Activity size={28} className="text-orange-500" /></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Fleet Owners</p>
                  <h3 className="font-bold text-2xl text-gray-800">{totalFleetOwners}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active SOS Alerts */}
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                  <h3 className="font-bold text-red-800 flex items-center gap-2"><ShieldAlert size={18}/> Active SOS Alerts</h3>
                  <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">1 New</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="border border-red-100 bg-red-50/50 p-3 rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-800 text-sm">KL 01 X 9999 - Suresh Kumar</p>
                      <span className="text-xs text-gray-500">2 mins ago</span>
                    </div>
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1"><MapPin size={12}/> Highway 47, Thrissur (Breakdown)</p>
                    <div className="mt-3 flex gap-2">
                      <button className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex-1">Call Driver</button>
                      <button className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg">Resolve</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Activity Feed */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><Activity size={18}/> Live System Activity</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-full h-fit"><FileScan size={16}/></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">E-Way Bill Scanned</p>
                      <p className="text-xs text-gray-500">Driver Ramesh M processed a document successfully.</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">10 mins ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-green-50 text-green-600 p-2 rounded-full h-fit"><CheckCircle size={16}/></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Trip Completed</p>
                      <p className="text-xs text-gray-500">KL 05 C 5555 arrived at Ernakulam Port.</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-orange-50 text-orange-600 p-2 rounded-full h-fit"><Wallet size={16}/></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">High Expense Alert</p>
                      <p className="text-xs text-gray-500">Suresh Kumar logged a fuel expense of ₹15,000.</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
              <button 
                onClick={() => { setEditingId(''); setEditForm({ name: '', phone: '', role: 'Driver' }); }}
                className="bg-kerala-green text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm text-sm sm:text-base"
              >
                <PlusCircle size={18} /> <span className="hidden sm:inline">Add New User</span><span className="sm:hidden">Add</span>
              </button>
            </div>

            {editingId !== null && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6 animate-fade-in">
                <h3 className="font-bold text-lg mb-4">{editingId === '' ? 'Add User' : 'Edit User'}</h3>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Full Name" className="border p-3 rounded-lg bg-gray-50" />
                  <input required value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Phone Number" className="border p-3 rounded-lg bg-gray-50" />
                  <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="border p-3 rounded-lg bg-gray-50">
                    <option value="Driver">Driver</option>
                    <option value="Fleet Owner">Fleet Owner</option>
                  </select>
                  <div className="col-span-full flex gap-3 mt-2">
                    <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-700 font-bold px-6 py-2 rounded-lg">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase">
                    <th className="p-4 font-bold">User Name</th>
                    <th className="p-4 font-bold">Phone</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">{user.name}</td>
                      <td className="p-4 text-gray-600 font-medium">{user.phone}</td>
                      <td className="p-4"><span className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-bold rounded-full">{user.role}</span></td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><X size={20} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VandiMitra;
