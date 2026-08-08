"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Package, Search, AlertTriangle, Store as StoreIcon, ArrowRight, Calendar, Stethoscope, Bot, ArrowLeft, MapPin, ExternalLink, Navigation, Clock, Eye, Sparkles, LocateFixed, Users, UserCheck, Edit3, Check, Crosshair } from "lucide-react";

interface Store {
  id: string;
  name: string;
  type: "Hospital" | "Clinic" | "Homeopathy";
  location: string;
  mapQuery: string;
  lat: number;
  lon: number;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  packSize: string;
  stock: number;
  price: number;
  expiryDate: string;
}

export default function Dashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeView, setActiveView] = useState<"hub" | "inventory" | "appointment" | "consult" | "ai-assistant">("hub");

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // User Address & Coordinates state
  const [userAddress, setUserAddress] = useState("Bhubaneswar, Odisha");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [estimatedTimes, setEstimatedTimes] = useState<{ [key: string]: number }>({});
  const [hasCalculated, setHasCalculated] = useState(false);

  // Appointment form state
  const [appointment, setAppointment] = useState({ patientName: "", date: "", time: "", notes: "" });
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  // Generate a list of the next 7 available dates formatted as DD-MM-YYYY for the dropdown
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  });

  // Available consultation time slots
  const availableTimes = [
    "09:00 AM - 09:30 AM",
    "09:30 AM - 10:00 AM",
    "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM",
    "11:00 AM - 11:30 AM",
    "11:30 AM - 12:00 PM",
    "02:00 PM - 02:30 PM",
    "02:30 PM - 03:00 PM",
    "03:00 PM - 03:30 PM",
    "03:30 PM - 04:00 PM",
    "05:00 PM - 05:30 PM",
    "05:30 PM - 06:00 PM"
  ];

  // AI Assistant state
  const [symptomsInput, setSymptomsInput] = useState("");
  const [aiResult, setAiResult] = useState<{ specialist: string; advice: string; medicines: string[]; availableStore: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // FIFO Teleconsultation Queue state
  const [queueStatus, setQueueStatus] = useState<"idle" | "checking" | "in-queue" | "connected">("idle");
  const [ticketNumber, setTicketNumber] = useState<number>(0);
  const [currentServing, setCurrentServing] = useState<number>(1);
  const [queueLength, setQueueLength] = useState<number>(0);

  // Load major hospitals, minor clinics, and homeopathy drugstores in Bhubaneswar
  useEffect(() => {
    setStores([
      { 
        id: "aiims-bhubaneswar", 
        name: "AIIMS Bhubaneswar", 
        type: "Hospital",
        location: "Sijua, Patrapada, Bhubaneswar", 
        mapQuery: "https://www.google.com/maps/search/?api=1&query=AIIMS+Bhubaneswar+Odisha",
        lat: 20.2226, lon: 85.7663
      },
      { 
        id: "sum-hospital", 
        name: "IMS and SUM Hospital", 
        type: "Hospital",
        location: "K8, Kalinga Nagar, Ghatikia, Bhubaneswar", 
        mapQuery: "https://www.google.com/maps/search/?api=1&query=IMS+and+SUM+Hospital+Bhubaneswar",
        lat: 20.2731, lon: 85.7533
      },
      { 
        id: "apollo-hospitals", 
        name: "Apollo Hospitals", 
        type: "Hospital",
        location: "15, Acharya Vihar, Unit 15, Bhubaneswar", 
        mapQuery: "https://www.google.com/maps/search/?api=1&query=Apollo+Hospitals+Bhubaneswar",
        lat: 20.3013, lon: 85.8336
      },
      { 
        id: "kims-hospital", 
        name: "Kalinga Institute of Medical Sciences (KIMS)", 
        type: "Hospital",
        location: "Patia, Bhubaneswar", 
        mapQuery: "https://www.google.com/maps/search/?api=1&query=KIMS+Hospital+Bhubaneswar",
        lat: 20.3541, lon: 85.8166
      },
      { 
        id: "saheed-nagar-clinic", 
        name: "Saheed Nagar Community Clinic", 
        type: "Clinic",
        location: "Plot 42, Saheed Nagar, Bhubaneswar", 
        mapQuery: "https://www.google.com/maps/search/?api=1&query=Saheed+Nagar+Clinic+Bhubaneswar",
        lat: 20.2858, lon: 85.8456
      },
      { 
        id: "nayapalli-health-centre", 
        name: "Nayapalli Primary Health Centre", 
        type: "Clinic",
        location: "IRC Village, Nayapalli, Bhubaneswar", 
        mapQuery: "https://www.google.com/maps/search/?api=1&query=Nayapalli+Primary+Health+Centre+Bhubaneswar",
        lat: 20.2941, lon: 85.8145
      },
      { 
        id: "rajdhani-homeo", 
        name: "Rajdhani Homeo Hall", 
        type: "Homeopathy",
        location: "Bapuji Nagar, Bhubaneswar", 
        mapQuery: "https://www.google.com/maps/search/?api=1&query=Rajdhani+Homeo+Hall+Bhubaneswar",
        lat: 20.2678, lon: 85.8392
      },
      { 
        id: "dr-batras-homeopathy", 
        name: "Dr. Batra's Homeopathy Clinic", 
        type: "Homeopathy",
        location: "Janpath, Kharvel Nagar, Bhubaneswar", 
        mapQuery: "https://www.google.com/maps/search/?api=1&query=Dr+Batras+Homeopathy+Bhubaneswar",
        lat: 20.2783, lon: 85.8431
      }
    ]);
  }, []);

  // Haversine distance formula
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const computeEtas = (lat: number, lon: number) => {
    const newTimes: { [key: string]: number } = {};
    stores.forEach((store) => {
      const distKm = calculateDistanceKm(lat, lon, store.lat, store.lon);
      const drivingMinutes = Math.round((distKm / 25) * 60 + 3);
      newTimes[store.id] = Math.max(2, drivingMinutes);
    });
    setEstimatedTimes(newTimes);
    setHasCalculated(true);
  };

  // Auto-detect location function ("Detect Me")
  const handleAutoDetectLocation = () => {
    setUserAddress("Detecting your location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await res.json();
            setUserAddress(data?.display_name || `Bhubaneswar GPS Location (${lat.toFixed(3)}, ${lon.toFixed(3)})`);
          } catch (e) {
            setUserAddress(`Bhubaneswar GPS Location (${lat.toFixed(3)}, ${lon.toFixed(3)})`);
          }
          computeEtas(lat, lon);
          setIsEditingAddress(false);
        },
        () => {
          setUserAddress("Master Canteen Square, Bhubaneswar (Default)");
          computeEtas(20.2961, 85.8245);
          setIsEditingAddress(false);
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    } else {
      setUserAddress("Master Canteen Square, Bhubaneswar (Default)");
      computeEtas(20.2961, 85.8245);
      setIsEditingAddress(false);
    }
  };

  // Auto-detect location on initial mount
  useEffect(() => {
    handleAutoDetectLocation();
  }, [stores]);

  const handleAddressUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingAddress(false);
    const seed = userAddress.length % 4;
    computeEtas(20.2961 + seed * 0.01, 85.8245 + seed * 0.01);
  };

  const sortedStores = [...stores].sort((a, b) => {
    const timeA = estimatedTimes[a.id] ?? 99;
    const timeB = estimatedTimes[b.id] ?? 99;
    return timeA - timeB;
  });

  // Load tailored inventory with tablet/unit pack sizes based on facility type
  useEffect(() => {
    if (selectedStore && activeView === "inventory") {
      let sampleMeds: Medicine[] = [];

      if (selectedStore.type === "Homeopathy") {
        sampleMeds = [
          { id: "h1", name: "Arsenicum Album 30C", category: "Homeopathic Remedy", packSize: "30ml Liquid Dilution", stock: 150, price: 120.00, expiryDate: "2029-12-31" },
          { id: "h2", name: "Arnica Montana 200CH", category: "Homeopathic Remedy", packSize: "100 Pills Bottle", stock: 200, price: 145.00, expiryDate: "2029-10-15" },
          { id: "h3", name: "Nux Vomica 30C", category: "Digestive Care", packSize: "100 Pills Bottle", stock: 110, price: 135.00, expiryDate: "2028-08-20" },
          { id: "h4", name: "Rhus Toxicodendron 30C", category: "Joint & Muscle", packSize: "30ml Liquid Dilution", stock: 85, price: 125.00, expiryDate: "2029-05-10" },
          { id: "h5", name: "Belladonna 30C", category: "Fever & Inflammation", packSize: "100 Pills Bottle", stock: 95, price: 140.00, expiryDate: "2028-11-30" },
          { id: "h6", name: "Bryonia Alba 30C", category: "Respiratory Care", packSize: "30ml Liquid Dilution", stock: 60, price: 130.00, expiryDate: "2029-02-18" },
          { id: "h7", name: "Pulsatilla 30C", category: "Cold & Cough", packSize: "100 Pills Bottle", stock: 130, price: 125.00, expiryDate: "2028-09-12" }
        ];
      } else if (selectedStore.type === "Clinic") {
        sampleMeds = [
          { id: "c1", name: "Paracetamol 500mg", category: "Analgesic", packSize: "10 Tablets (Strip)", stock: 250, price: 18.00, expiryDate: "2028-12-31" },
          { id: "c2", name: "Cetirizine 10mg", category: "Antihistamine", packSize: "10 Tablets (Strip)", stock: 180, price: 12.00, expiryDate: "2028-09-30" },
          { id: "c3", name: "ORS Electrolyte Packets", category: "Hydration", packSize: "1 Sachet (21.8g)", stock: 300, price: 22.00, expiryDate: "2029-06-30" },
          { id: "c4", name: "Pantoprazole 40mg", category: "Gastrointestinal", packSize: "15 Tablets (Strip)", stock: 90, price: 45.00, expiryDate: "2028-05-12" },
          { id: "c5", name: "Ibuprofen 400mg", category: "Anti-inflammatory", packSize: "10 Tablets (Strip)", stock: 120, price: 25.00, expiryDate: "2029-01-10" },
          { id: "c6", name: "Azithromycin 250mg", category: "Antibiotic", packSize: "6 Tablets (Strip)", stock: 35, price: 75.00, expiryDate: "2027-08-19" }
        ];
      } else {
        sampleMeds = [
          { id: "m1", name: "Paracetamol 650mg", category: "Analgesic", packSize: "15 Tablets (Strip)", stock: 850, price: 22.50, expiryDate: "2028-12-31" },
          { id: "m2", name: "Amoxicillin 500mg", category: "Antibiotic", packSize: "10 Capsules (Strip)", stock: 45, price: 95.00, expiryDate: "2027-06-15" },
          { id: "m3", name: "Cetirizine 10mg", category: "Antihistamine", packSize: "10 Tablets (Strip)", stock: 620, price: 15.00, expiryDate: "2028-09-30" },
          { id: "m4", name: "Omeprazole 20mg", category: "Gastrointestinal", packSize: "14 Capsules (Strip)", stock: 210, price: 45.00, expiryDate: "2027-03-20" },
          { id: "m5", name: "Ibuprofen 400mg", category: "Anti-inflammatory", packSize: "10 Tablets (Strip)", stock: 380, price: 28.00, expiryDate: "2029-01-10" },
          { id: "m6", name: "Metformin 500mg", category: "Antidiabetic", packSize: "20 Tablets (Strip)", stock: 510, price: 34.50, expiryDate: "2028-11-05" },
          { id: "m7", name: "Azithromycin 500mg", category: "Antibiotic", packSize: "5 Tablets (Strip)", stock: 145, price: 110.00, expiryDate: "2027-08-19" },
          { id: "m8", name: "Pantoprazole 40mg", category: "Gastrointestinal", packSize: "15 Tablets (Strip)", stock: 115, price: 55.00, expiryDate: "2028-05-12" },
          { id: "m9", name: "Montelukast 10mg", category: "Respiratory", packSize: "10 Tablets (Strip)", stock: 190, price: 130.00, expiryDate: "2028-10-14" },
          { id: "m10", name: "Amlodipine 5mg", category: "Cardiovascular", packSize: "15 Tablets (Strip)", stock: 400, price: 18.00, expiryDate: "2029-04-25" }
        ];
      }

      setMedicines(sampleMeds);
    }
  }, [selectedStore, activeView]);

  const handleAiAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomsInput.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const text = symptomsInput.toLowerCase();
      let result = {
        specialist: "General Practitioner (GP)",
        advice: "Ensure proper hydration, get adequate rest, and monitor your temperature regularly.",
        medicines: ["Paracetamol 650mg", "Cetirizine 10mg"],
        availableStore: "Saheed Nagar Community Clinic & AIIMS Bhubaneswar",
      };

      if (text.includes("chest") || text.includes("heart") || text.includes("breath")) {
        result = {
          specialist: "Cardiologist / Emergency Medicine",
          advice: "Seek immediate medical attention if shortness of breath or sharp chest pains persist.",
          medicines: ["Aspirin", "Prescription Nitrates"],
          availableStore: "Apollo Hospitals & IMS and SUM Hospital",
        };
      } else if (text.includes("skin") || text.includes("rash") || text.includes("itch")) {
        result = {
          specialist: "Dermatologist",
          advice: "Keep the affected area clean and dry. Avoid scratching or applying harsh chemical soaps.",
          medicines: ["Antihistamine Cream", "Cetirizine 10mg"],
          availableStore: "Saheed Nagar Community Clinic & KIMS",
        };
      } else if (text.includes("headache") || text.includes("migraine") || text.includes("dizzy")) {
        result = {
          specialist: "Neurologist / General Practitioner",
          advice: "Rest in a quiet, dark room and avoid screen time until symptoms subside.",
          medicines: ["Ibuprofen 400mg", "Paracetamol 650mg"],
          availableStore: "IMS and SUM Hospital & Nayapalli Primary Health Centre",
        };
      } else if (text.includes("stomach") || text.includes("nausea") || text.includes("digestion") || text.includes("pain")) {
        result = {
          specialist: "Gastroenterologist",
          advice: "Stick to a bland diet and consume electrolytes to stay hydrated.",
          medicines: ["Omeprazole 20mg", "ORS Electrolyte Packets"],
          availableStore: "AIIMS Bhubaneswar & Rajdhani Homeo Hall",
        };
      } else if (text.includes("cold") || text.includes("cough") || text.includes("fever")) {
        result = {
          specialist: "General Practitioner / ENT Specialist",
          advice: "Drink warm fluids, gargle with warm salt water, and take plenty of rest.",
          medicines: ["Paracetamol 650mg", "Azithromycin 500mg"],
          availableStore: "Apollo Hospitals & Saheed Nagar Community Clinic",
        };
      }

      setAiResult(result);
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentBooked(true);
  };

  // FIFO Queue simulation
  const handleJoinConsultation = () => {
    setQueueStatus("checking");
    setTimeout(() => {
      const activeServing = 4;
      const totalInLine = 6;
      const myTicket = totalInLine + 1;

      setCurrentServing(activeServing);
      setTicketNumber(myTicket);
      setQueueLength(myTicket - activeServing);

      if (myTicket - activeServing > 0) {
        setQueueStatus("in-queue");
      } else {
        setQueueStatus("connected");
      }
    }, 1200);
  };

  const handleRefreshQueue = () => {
    setQueueStatus("checking");
    setTimeout(() => {
      const nextServing = currentServing + 1;
      setCurrentServing(nextServing);
      const remaining = Math.max(0, ticketNumber - nextServing);
      setQueueLength(remaining);

      if (remaining === 0) {
        setQueueStatus("connected");
      } else {
        setQueueStatus("in-queue");
      }
    }, 800);
  };

  const filteredMedicines = medicines.filter(
    (med: Medicine) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.packSize.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockCount = medicines.reduce((acc: number, item: Medicine) => acc + item.stock, 0);
  const lowStockCount = medicines.filter((item: Medicine) => item.stock < 10).length;

  // STEP 1: First Interface
  if (!selectedStore) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: AI Symptom Checker */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="inline-flex p-2.5 bg-teal-950 text-teal-400 rounded-xl mb-1">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-teal-400">AI Symptom Assistant</h2>
              <p className="text-xs text-slate-400">Describe your symptoms below to get specialist recommendations, general health advice, and stock locations.</p>
            </div>

            <form onSubmit={handleAiAnalysis} className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <label className="block text-xs text-slate-400">What are your symptoms?</label>
                <textarea
                  rows={3}
                  required
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="e.g., severe headache, fever, stomach pain..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-500 text-slate-200"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Symptoms"}
              </button>
            </form>

            {aiResult && (
              <div className="bg-slate-950 border border-teal-800/60 p-4 rounded-xl space-y-2.5 text-xs animate-fadeIn">
                <div>
                  <span className="text-teal-400 font-semibold uppercase tracking-wider text-[10px]">Recommended Specialist:</span>
                  <div className="font-bold text-slate-100">{aiResult.specialist}</div>
                </div>
                <div>
                  <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px]">General Advice Line:</span>
                  <div className="text-slate-300 font-medium italic">"{aiResult.advice}"</div>
                </div>
                <div>
                  <span className="text-teal-400 font-semibold uppercase tracking-wider text-[10px]">Suggested Medicines:</span>
                  <div className="text-teal-300 font-medium">{aiResult.medicines.join(", ")}</div>
                </div>
                <div>
                  <span className="text-blue-400 font-semibold uppercase tracking-wider text-[10px]">Available At Facility:</span>
                  <div className="text-blue-200 font-semibold">{aiResult.availableStore}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Active Location Bar & Proximity Facility Finder */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="inline-flex p-2.5 bg-emerald-950 text-emerald-400 rounded-xl mb-1">
                <StoreIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-emerald-400">Nearby Facilities</h2>
              <p className="text-xs text-slate-400">Accurate ETAs calculated from your detected or custom location.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5"><LocateFixed className="w-3.5 h-3.5 text-emerald-400" /> Active Location Bar</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    title="Detect Me"
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Crosshair className="w-3 h-3" /> Detect Me
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Edit3 className="w-3 h-3" /> {isEditingAddress ? "Cancel" : "Edit Custom"}
                  </button>
                </div>
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleAddressUpdate} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="Type custom location..."
                    className="flex-1 bg-slate-950 border border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                </form>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={userAddress}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 truncate focus:outline-none cursor-default"
                />
              )}
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {sortedStores.map((store, index) => (
                <div
                  key={store.id}
                  className={`w-full flex items-center justify-between p-3 bg-slate-950 border rounded-xl transition group ${index === 0 ? 'border-emerald-500/80 bg-emerald-950/10' : 'border-slate-800 hover:border-slate-700'}`}
                >
                  <button
                    onClick={() => {
                      setSelectedStore(store);
                      setActiveView("hub");
                      setQueueStatus("idle");
                    }}
                    className="flex-1 text-left space-y-0.5 pr-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-xs text-slate-200 group-hover:text-emerald-400 transition">{store.name}</h4>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                          store.type === 'Hospital' ? 'bg-blue-950 text-blue-400 border border-blue-800/60' :
                          store.type === 'Clinic' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                          'bg-purple-950 text-purple-400 border border-purple-800/60'
                        }`}>
                          {store.type}
                        </span>
                        {index === 0 && (
                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                            Closest
                          </span>
                        )}
                      </div>
                      {estimatedTimes[store.id] !== undefined && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> ~{estimatedTimes[store.id]}m
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" /> {store.location}
                    </p>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={store.mapQuery}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Google Maps"
                      className="p-2 bg-slate-900 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        setSelectedStore(store);
                        setActiveView("hub");
                        setQueueStatus("idle");
                      }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </main>
    );
  }

  // STEP 2: Service Selection Hub
  if (activeView === "hub") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-emerald-400">{selectedStore.name}</h1>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{selectedStore.type}</span>
              </div>
              <p className="text-xs text-slate-400">{selectedStore.location}</p>
            </div>
            <button
              onClick={() => setSelectedStore(null)}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Change Facility
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-300 font-medium">What would you like to do today?</p>
            
            <button
              onClick={() => setActiveView("inventory")}
              className="w-full flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl transition group text-left"
            >
              <div className="p-3 bg-emerald-950 text-emerald-400 rounded-lg group-hover:scale-105 transition">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-200 group-hover:text-emerald-400 transition">View Facility Inventory</h3>
                <p className="text-xs text-slate-500">Browse available medicines, check stock levels, and pricing.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400" />
            </button>

            <button
              onClick={() => setActiveView("appointment")}
              className="w-full flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl transition group text-left"
            >
              <div className="p-3 bg-blue-950 text-blue-400 rounded-lg group-hover:scale-105 transition">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition">Make an Appointment</h3>
                <p className="text-xs text-slate-500">Schedule an in-person physical visit with specialists.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400" />
            </button>

            <button
              onClick={() => { setActiveView("consult"); setQueueStatus("idle"); }}
              className="w-full flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 hover:border-purple-500 rounded-xl transition group text-left"
            >
              <div className="p-3 bg-purple-950 text-purple-400 rounded-lg group-hover:scale-105 transition">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-200 group-hover:text-purple-400 transition">Consult a Doctor Online</h3>
                <p className="text-xs text-slate-500">Connect with an on-duty general practitioner or specialist instantly.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  // STEP 3: Appointment Booking Interface
  if (activeView === "appointment") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
          <button
            onClick={() => { setActiveView("hub"); setAppointmentBooked(false); }}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Services Hub
          </button>

          <div className="space-y-1">
            <h1 className="text-xl font-bold flex items-center gap-2 text-blue-400">
              <Calendar className="w-5 h-5" /> Book an Appointment
            </h1>
            <p className="text-xs text-slate-400">Facility: {selectedStore.name}</p>
          </div>

          {appointmentBooked ? (
            <div className="bg-emerald-950/40 border border-emerald-800/60 p-6 rounded-xl text-center space-y-3">
              <h3 className="text-lg font-semibold text-emerald-400">Appointment Confirmed!</h3>
              <p className="text-sm text-slate-300">We have scheduled your visit for <strong>{appointment.date}</strong> at <strong>{appointment.time}</strong>.</p>
              <button
                onClick={() => setAppointmentBooked(false)}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg transition"
              >
                Book Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={appointment.patientName}
                  onChange={(e) => setAppointment({ ...appointment, patientName: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Preferred Date (DD-MM-YYYY)</label>
                  <select
                    required
                    value={appointment.date}
                    onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-slate-300"
                  >
                    <option value="" disabled>Choose date...</option>
                    {availableDates.map((dateStr, idx) => (
                      <option key={idx} value={dateStr}>
                        {dateStr} {idx === 0 ? "(Today)" : idx === 1 ? "(Tomorrow)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Preferred Time Slot</label>
                  <select
                    required
                    value={appointment.time}
                    onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 text-slate-300"
                  >
                    <option value="" disabled>Choose time...</option>
                    {availableTimes.map((timeSlot, idx) => (
                      <option key={idx} value={timeSlot}>
                        {timeSlot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Symptoms or Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={appointment.notes}
                  onChange={(e) => setAppointment({ ...appointment, notes: e.target.value })}
                  placeholder="Briefly describe reason for visit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition"
              >
                Confirm Appointment
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  // STEP 3B: Doctor Teleconsultation Interface with FIFO Queue
  if (activeView === "consult") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6 text-center">
          <button
            onClick={() => setActiveView("hub")}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Services Hub
          </button>

          <div className="inline-flex p-4 bg-purple-950 text-purple-400 rounded-2xl">
            <Stethoscope className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold">Online Doctor Consultation</h1>
            <p className="text-sm text-slate-400">FIFO Virtual Queue for <strong>{selectedStore.name}</strong>.</p>
          </div>

          {queueStatus === "idle" && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Available Specialists:</span>
                  <span className="text-emerald-400 font-medium">Online</span>
                </div>
                <p className="text-sm font-medium text-slate-200">Dr. Rajesh Kumar, M.D. (General Practitioner)</p>
                <p className="text-xs text-slate-500">Join the line to secure your queue ticket.</p>
              </div>

              <button
                onClick={handleJoinConsultation}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-lg transition"
              >
                Join consultancy room
              </button>
            </div>
          )}

          {queueStatus === "checking" && (
            <div className="bg-slate-950 border border-purple-900/60 p-6 rounded-xl space-y-3 animate-pulse">
              <Users className="w-8 h-8 text-purple-400 mx-auto animate-bounce" />
              <h3 className="text-sm font-bold text-slate-200">Allocating Queue Ticket...</h3>
              <p className="text-xs text-slate-400">Assigning your position in First-In, First-Out order.</p>
            </div>
          )}

          {queueStatus === "in-queue" && (
            <div className="bg-amber-950/40 border border-amber-800/60 p-6 rounded-xl space-y-4 animate-fadeIn">
              <div className="inline-flex p-3 bg-amber-950 text-amber-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-amber-400">FIFO Queue Ticket Assigned</h3>
              
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 block">Your Ticket:</span>
                  <span className="text-lg font-bold text-amber-300">#{ticketNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Currently Serving:</span>
                  <span className="text-lg font-bold text-emerald-400">#{currentServing}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300">
                There are <strong>{queueLength} {queueLength === 1 ? 'patient' : 'patients'}</strong> ahead of you in line.
              </p>
              <p className="text-xs text-slate-400">Estimated wait time: ~{queueLength * 3} minutes. You will be admitted automatically in FIFO order.</p>
              
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setQueueStatus("idle")}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-lg transition"
                >
                  Leave Queue
                </button>
                <button
                  onClick={handleRefreshQueue}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Check Queue Status
                </button>
              </div>
            </div>
          )}

          {queueStatus === "connected" && (
            <div className="bg-emerald-950/40 border border-emerald-800/60 p-6 rounded-xl space-y-4 animate-fadeIn">
              <div className="inline-flex p-3 bg-emerald-950 text-emerald-400 rounded-xl">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-400">It's Your Turn!</h3>
              <p className="text-sm text-slate-300">Ticket #{ticketNumber} is now being served. Opening secure video link with Dr. Rajesh Kumar.</p>
              <button
                onClick={() => alert("Connected successfully to secure video teleconsultation room!")}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition"
              >
                Enter Video Room Now
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // STEP 4: View-Only Inventory Interface
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-emerald-400">Facility Stock Catalog</h1>
                <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" /> View Only
                </span>
              </div>
              <p className="text-xs text-slate-400">Facility: <span className="text-slate-200 font-medium">{selectedStore.name}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={selectedStore.mapQuery}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-slate-900 border border-slate-800 hover:border-emerald-500 text-slate-300 px-3 py-2 rounded-lg transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" /> Open in Maps
            </a>
            <button
              onClick={() => setActiveView("hub")}
              className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Services Hub
            </button>
          </div>
        </header>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-950 text-emerald-400 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Store Stock Volume</p>
              <h3 className="text-2xl font-bold">{totalStockCount}</h3>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-amber-950 text-amber-400 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Low Stock Alerts (&lt;10)</p>
              <h3 className="text-2xl font-bold">{lowStockCount}</h3>
            </div>
          </div>
        </div>

        {/* Inventory List (View Only) */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold">Available Stock Catalog</h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                  <th className="py-3 px-4">Medicine Name & Price</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Tablets / Pack Size</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-500">
                      No medicines match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((med: Medicine) => (
                    <tr key={med.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-100">{med.name}</div>
                        <div className="text-xs text-emerald-400 font-semibold mt-0.5">₹{med.price.toFixed(2)}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{med.category}</td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{med.packSize}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${med.stock < 10 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                          {med.stock} units {med.stock < 10 && "(Low Stock)"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(med.expiryDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}