"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

const mockSessions = [
  { id: "1", title: "Current Session", active: true },
  { id: "2", title: "Hypertension Query", active: false },
  { id: "3", title: "Drug Interaction Check", active: false },
  { id: "4", title: "Patient Symptoms Review", active: false },
  { id: "5", title: "Lab Results Analysis", active: false },
];

type Tab = "chat" | "business" | "services" | "faqs";

export function Sidebar({ isOpen, onClose, onNewChat }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [ownerEmail, setOwnerEmail] = useState("");

  // Business Info
  const [businessName, setBusinessName] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [businessSaving, setBusinessSaving] = useState(false);
  const [businessMsg, setBusinessMsg] = useState("");

  // Services
  const [services, setServices] = useState([{ title: "", description: "" }]);
  const [servicesSaving, setServicesSaving] = useState(false);
  const [servicesMsg, setServicesMsg] = useState("");

  // FAQs
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [faqsSaving, setFaqsSaving] = useState(false);
  const [faqsMsg, setFaqsMsg] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setOwnerEmail(data.user.email);
    });
  }, []);

  const saveBusinessInfo = async () => {
    if (!ownerEmail) return;
    setBusinessSaving(true);
    setBusinessMsg("");
    const { error } = await supabase.from("businesses").upsert({
      owner_email: ownerEmail,
      business_name: businessName,
      address: businessHours, // reusing address field for hours
    }, { onConflict: "owner_email" });
    setBusinessSaving(false);
    setBusinessMsg(error ? "Failed to save." : "Changes saved successfully.");
  };

  const saveServices = async () => {
    if (!ownerEmail) return;
    setServicesSaving(true);
    setServicesMsg("");
    await supabase.from("services").delete().eq("owner_email", ownerEmail);
    const rows = services.filter(s => s.title).map(s => ({ ...s, owner_email: ownerEmail }));
    const { error } = await supabase.from("services").insert(rows);
    setServicesSaving(false);
    setServicesMsg(error ? "Failed to save." : "Changes saved successfully.");
  };

  const saveFaqs = async () => {
    if (!ownerEmail) return;
    setFaqsSaving(true);
    setFaqsMsg("");
    await supabase.from("faqs").delete().eq("owner_email", ownerEmail);
    const rows = faqs.filter(f => f.question).map(f => ({ ...f, owner_email: ownerEmail }));
    const { error } = await supabase.from("faqs").insert(rows);
    setFaqsSaving(false);
    setFaqsMsg(error ? "Failed to save." : "Changes saved successfully.");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed lg:relative inset-y-0 left-0 z-20 w-64 bg-white border-r border-black/[0.06] flex flex-col lg:translate-x-0 transition-transform duration-300"
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        style={{ translateX: undefined }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <div className="px-6 py-7 border-b border-black/[0.05]">
          <div className="font-serif text-[22px] tracking-tight text-gray-950">Recuria</div>
          <div className="text-[11px] text-gray-400 mt-0.5 tracking-wide">powered by Aidoe</div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/[0.05] text-[11px] font-medium">
          {(["chat","business","services","faqs"] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 capitalize transition-colors ${activeTab === tab ? "text-gray-950 border-b-2 border-gray-950" : "text-gray-400 hover:text-gray-600"}`}>
              {tab === "chat" ? "Chat" : tab === "business" ? "Info" : tab === "services" ? "Services" : "FAQs"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">

          {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div className="pt-3 pb-4">
              <div className="px-3 pb-3">
                <button onClick={onNewChat}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-950 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Session
                </button>
              </div>
              <div className="px-5 pt-2 pb-2 text-[10px] font-semibold tracking-widest text-gray-300 uppercase">Recent</div>
              {mockSessions.map(session => (
                <button key={session.id}
                  className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-left rounded-xl mx-2 transition-colors ${session.active ? "bg-gray-100 text-gray-950 font-medium" : "text-gray-500 hover:bg-gray-50"}`}
                  style={{ width: "calc(100% - 16px)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: session.active ? "#5a8a3a" : "#c7d8b0" }} />
                  <span className="text-[13.5px] truncate">{session.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* BUSINESS INFO TAB */}
          {activeTab === "business" && (
            <div className="p-4 flex flex-col gap-3">
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Business Info</p>
              <div className="flex flex-col gap-1">
                <label className="text-[10.5px] text-gray-400 uppercase tracking-wide">Business Name</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-400"
                  placeholder="Your clinic name" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10.5px] text-gray-400 uppercase tracking-wide">Business Hours</label>
                <input value={businessHours} onChange={e => setBusinessHours(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-400"
                  placeholder="Mon–Fri 9am–6pm" />
              </div>
              {businessMsg && <p className="text-[12px] text-green-600">{businessMsg}</p>}
              <button onClick={saveBusinessInfo} disabled={businessSaving}
                className="bg-gray-950 text-white text-[13px] font-medium rounded-xl py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50">
                {businessSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === "services" && (
            <div className="p-4 flex flex-col gap-3">
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Services</p>
              {services.map((s, i) => (
                <div key={i} className="flex flex-col gap-1 border border-gray-100 rounded-xl p-3">
                  <input value={s.title} onChange={e => { const n=[...services]; n[i].title=e.target.value; setServices(n); }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-400"
                    placeholder="Service name" />
                  <input value={s.description} onChange={e => { const n=[...services]; n[i].description=e.target.value; setServices(n); }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-400"
                    placeholder="Description (optional)" />
                </div>
              ))}
              <button onClick={() => setServices([...services, { title: "", description: "" }])}
                className="text-[12px] text-gray-400 hover:text-gray-600 text-left">+ Add Service</button>
              {servicesMsg && <p className="text-[12px] text-green-600">{servicesMsg}</p>}
              <button onClick={saveServices} disabled={servicesSaving}
                className="bg-gray-950 text-white text-[13px] font-medium rounded-xl py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50">
                {servicesSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}

          {/* FAQS TAB */}
          {activeTab === "faqs" && (
            <div className="p-4 flex flex-col gap-3">
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">FAQs</p>
              {faqs.map((f, i) => (
                <div key={i} className="flex flex-col gap-1 border border-gray-100 rounded-xl p-3">
                  <input value={f.question} onChange={e => { const n=[...faqs]; n[i].question=e.target.value; setFaqs(n); }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-400"
                    placeholder="Question" />
                  <input value={f.answer} onChange={e => { const n=[...faqs]; n[i].answer=e.target.value; setFaqs(n); }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-gray-400"
                    placeholder="Answer" />
                </div>
              ))}
              <button onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
                className="text-[12px] text-gray-400 hover:text-gray-600 text-left">+ Add FAQ</button>
              {faqsMsg && <p className="text-[12px] text-green-600">{faqsMsg}</p>}
              <button onClick={saveFaqs} disabled={faqsSaving}
                className="bg-gray-950 text-white text-[13px] font-medium rounded-xl py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50">
                {faqsSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-black/[0.05]">
          <div className="text-[10.5px] text-gray-300 leading-relaxed">
            <span className="font-medium text-gray-400 block mb-1">Medical AI Platform</span>
            Recuria is an AI assistant and does not replace professional medical judgment.
          </div>
        </div>
      </motion.aside>
    </>
  );
}
