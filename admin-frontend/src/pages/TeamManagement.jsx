import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useEffect } from "react";
import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:5000/api/admin",
  withCredentials: true,
});

// Data & Helpers 

const STATUS_STYLE = {
  Active:   { bg: "#E8F5E9", text: "#2E7D32", dot: "#34A853", darkBg: "rgba(52,168,83,0.15)", darkText: "#4ADE80" },
  Inactive: { bg: "#F1F3F4", text: "#5F6368", dot: "#9AA0A6", darkBg: "rgba(148,163,184,0.15)", darkText: "#A3A3A3" },
  Pending:  { bg: "#FFF8E1", text: "#E65100", dot: "#FBBC04", darkBg: "rgba(251,188,4,0.15)", darkText: "#FBBF24" },
};

const AVATAR_COLORS = ["#4285F4", "#EA4335", "#34A853", "#FBBC04", "#9C27B0"];

//color for eeach team
function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function generateCode() {
  return "GDG-" + Math.floor(1000 + Math.random() * 9000);
}

// Modals 

function DeleteModal({ team, onConfirm, onCancel, darkMode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(28,27,31,0.40)", backdropFilter: "blur(2px)" }}>
      <div className={`rounded-[20px] p-8 flex flex-col gap-6 shadow-2xl ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'}`} style={{ width: "400px" }}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: darkMode ? 'rgba(234,67,53,0.15)' : '#FFEBEE' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M8 4h6M3 7h16M5 7l1 11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-11" stroke="#EA4335" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 11v5M13 11v5" stroke="#EA4335" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className={`text-[18px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Remove Team?</h3>
          <p className={`text-[14px] leading-relaxed font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>
            You are about to permanently remove <strong className={darkMode ? 'text-white' : 'text-[#1C1B1F]'}>{team.name}</strong> from the contest. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold transition-colors border font-['DM_Sans'] ${darkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-[#E0E0E0] text-[#5F6368] hover:bg-[#F1F3F4]'}`}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold text-white transition-all bg-[#EA4335] hover:bg-[#C62828] font-['DM_Sans'] shadow-[0_2px_6px_rgba(234,67,53,0.30)]"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTeamModal({ onClose, onAdd, darkMode }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [members, setMembers] = useState(3);
  const [nameFocus, setNameFocus] = useState(false);
  const [codeFocus, setCodeFocus] = useState(false);
  const [shake, setShake] = useState(false);


  //add team 
  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onAdd(name.trim(), code.trim(), members);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(28,27,31,0.45)", backdropFilter: "blur(3px)" }}>
      <div
        className={`flex flex-col w-[480px] rounded-[24px] shadow-2xl ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'}`}
        style={{ animation: shake ? "modalShake 0.35s ease" : undefined }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-7 pt-7 pb-5 border-b ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: darkMode ? 'rgba(58,124,245,0.15)' : '#E8F0FE' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="7" cy="6" r="3.5" stroke="#3A7CF5" strokeWidth="1.5" />
                <path d="M1 16c0-3 2.5-5 6-5s6 2 6 5" stroke="#3A7CF5" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 7v4M15 9h-4" stroke="#3A7CF5" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className={`text-[18px] font-bold tracking-[-0.2px] font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Add New Team</h2>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-[#F1F3F4]'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-7 py-6">
          <div className="flex flex-col gap-1.5">
            <label className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>Team Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
              placeholder="e.g., Binary_Bosses"
              className={`w-full px-4 py-3 text-[14px] rounded-[8px] outline-none transition-all duration-150 font-['Roboto'] ${darkMode ? 'bg-neutral-950 text-white placeholder-neutral-600' : 'bg-white text-[#1C1B1F]'}`}
              style={{ border: nameFocus ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}` }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>Access Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                onFocus={() => setCodeFocus(true)}
                onBlur={() => setCodeFocus(false)}
                placeholder="e.g., GDG-1234"
                className={`flex-1 px-4 py-3 text-[14px] rounded-[8px] outline-none transition-all duration-150 tracking-wider font-['JetBrains_Mono'] ${darkMode ? 'bg-neutral-950 text-white placeholder-neutral-600' : 'bg-white text-[#1C1B1F]'}`}
                style={{ border: codeFocus ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}` }}
              />
              <button
                onClick={() => setCode(generateCode())}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-all font-['DM_Sans'] ${darkMode ? 'hover:bg-blue-950/50' : 'hover:bg-[#E8F0FE]'}`}
                style={{ border: "1.5px solid #3A7CF5", color: "#3A7CF5" }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7a5 5 0 1 1 1.5 3.5" stroke="#3A7CF5" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M2 10.5V7H5.5" stroke="#3A7CF5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Generate
              </button>
            </div>
            <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Share this code with the team to allow them to log in.</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>Number of Members</label>
            <div className="flex items-center gap-3">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setMembers(n)}
                  className={`flex-1 py-2.5 rounded-[8px] text-[14px] font-semibold transition-all duration-150 font-['DM_Sans']`}
                  style={{
                    border: members === n ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`,
                    backgroundColor: members === n ? (darkMode ? 'rgba(58,124,245,0.15)' : '#E8F0FE') : 'transparent',
                    color: members === n ? "#3A7CF5" : (darkMode ? "#A3A3A3" : "#5F6368"),
                  }}
                >
                  {n} {n === 1 ? "Member" : "Members"}
                </button>
              ))}
            </div>
            <span className={`text-[11px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
              Note: not sent to the backend yet — the teams table has no members column.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-7 py-5 border-t ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-[10px] text-[14px] font-semibold transition-colors border font-['DM_Sans'] ${darkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-[#E0E0E0] text-[#5F6368] hover:bg-[#F1F3F4]'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-[14px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-all active:scale-[0.97] font-['DM_Sans'] shadow-[0_2px_8px_rgba(58,124,245,0.35)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Register Team
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTeamModal({ team, onClose, onEdit, darkMode }) {
  const [name, setName] = useState(team.name);
  const [code, setCode] = useState(team.code);
  const [nameFocus, setNameFocus] = useState(false);
  const [codeFocus, setCodeFocus] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onEdit(name.trim(), code.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(28,27,31,0.45)", backdropFilter: "blur(3px)" }}>
      <div
        className={`flex flex-col w-[480px] rounded-[24px] shadow-2xl ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'}`}
        style={{ animation: shake ? "modalShake 0.35s ease" : undefined }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-7 pt-7 pb-5 border-b ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: darkMode ? 'rgba(58,124,245,0.15)' : '#E8F0FE' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M12.5 2.5l3 3L6 15H3v-3L12.5 2.5Z" stroke="#3A7CF5" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className={`text-[18px] font-bold tracking-[-0.2px] font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Edit Team</h2>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-[#F1F3F4]'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-7 py-6">
          <div className="flex flex-col gap-1.5">
            <label className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>Team Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
              placeholder="e.g., Binary_Bosses"
              className={`w-full px-4 py-3 text-[14px] rounded-[8px] outline-none transition-all duration-150 font-['Roboto'] ${darkMode ? 'bg-neutral-950 text-white placeholder-neutral-600' : 'bg-white text-[#1C1B1F]'}`}
              style={{ border: nameFocus ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}` }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>Access Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                onFocus={() => setCodeFocus(true)}
                onBlur={() => setCodeFocus(false)}
                placeholder="e.g., GDG-1234"
                className={`flex-1 px-4 py-3 text-[14px] rounded-[8px] outline-none transition-all duration-150 tracking-wider font-['JetBrains_Mono'] ${darkMode ? 'bg-neutral-950 text-white placeholder-neutral-600' : 'bg-white text-[#1C1B1F]'}`}
                style={{ border: codeFocus ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}` }}
              />
              <button
                onClick={() => setCode(generateCode())}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-all font-['DM_Sans'] ${darkMode ? 'hover:bg-blue-950/50' : 'hover:bg-[#E8F0FE]'}`}
                style={{ border: "1.5px solid #3A7CF5", color: "#3A7CF5" }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7a5 5 0 1 1 1.5 3.5" stroke="#3A7CF5" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M2 10.5V7H5.5" stroke="#3A7CF5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Generate
              </button>
            </div>
            <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Share this code with the team to allow them to log in.</span>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-7 py-5 border-t ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-[10px] text-[14px] font-semibold transition-colors border font-['DM_Sans'] ${darkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-[#E0E0E0] text-[#5F6368] hover:bg-[#F1F3F4]'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-[14px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-all active:scale-[0.97] font-['DM_Sans'] shadow-[0_2px_8px_rgba(58,124,245,0.35)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 7l2.5 2.5L10 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Component 

export default function TeamManagement() {
  const { darkMode } = useOutletContext() || {};

  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchFocus, setSearchFocus] = useState(false);

  const fetchTeams = async () => {
    try {
      const response = await api.get("/teams");
      setTeams(response.data.teams);
    } catch (error) {
      console.error(error);
    }
  };
  //not error 
  useEffect(() => {
    fetchTeams();
  }, []);

    const filtered = teams.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase())
    );

  const handleAdd = async (name, code) => {
      try {
        
          await api.post("/teams", {
              team_name: name,
              access_code: code
          });

          fetchTeams();

      } catch (error) {
          console.error(error);
      }
  };

  const handleEdit = async (name, code) => {
      if (!editTarget) return;
      try {

          await api.patch(`/teams/${editTarget.id}`, {
              team_name: name,
              access_code: code
          });

          fetchTeams();

      } catch (error) {
          console.error(error);
      }
  };

  const handleDelete = async () => {

      if (!deleteTarget) return;

      try {

          await api.delete(
              `/teams/${deleteTarget.id}`
          );

          fetchTeams();

          setDeleteTarget(null);

      } catch (error) {

          console.error(error);

      }

  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page title + action bar */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className={`text-[26px] font-bold tracking-[-0.4px] font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>
            Manage Contest Teams
          </h1>
          <p className={`text-[14px] mt-1 font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>
            Register participating teams and manage credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative flex items-center">
            <svg className="absolute left-3.5 pointer-events-none" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke={searchFocus ? "#3A7CF5" : (darkMode ? "#737373" : "#9AA0A6")} strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke={searchFocus ? "#3A7CF5" : (darkMode ? "#737373" : "#9AA0A6")} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Search teams..."
              className={`pl-10 pr-4 py-2.5 text-[14px] w-[240px] rounded-[10px] outline-none transition-all duration-150 font-['Roboto'] ${darkMode ? 'bg-neutral-900 text-white placeholder-neutral-500' : 'bg-white text-[#1C1B1F]'}`}
              style={{ border: searchFocus ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}` }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 hover:opacity-70 transition-opacity">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M4 4L10 10M10 4L4 10" stroke={darkMode ? "#A3A3A3" : "#9AA0A6"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[14px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-all active:scale-[0.97] font-['DM_Sans'] shadow-[0_2px_8px_rgba(58,124,245,0.30)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Add New Team
          </button>
        </div>
      </div>

      {/* Teams table card */}
      <div className={`rounded-[16px] overflow-hidden border shadow-sm ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#E0E0E0]'}`}>
        
        {/* Table header */}
        <div
          className={`grid px-6 py-3.5 border-b ${darkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-[#F8F9FA] border-[#E0E0E0]'}`}
          style={{ gridTemplateColumns: "1fr 160px 120px 100px", gap: "16px" }}
        >
          {["Team Name", "Access Code", "Status", "Actions"].map((h, i) => (
            <div key={h} className="text-[11px] font-bold uppercase tracking-wider font-['Roboto'] text-[#9AA0A6]" style={{ textAlign: i === 3 ? "center" : "left" }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="18" cy="18" r="13" stroke={darkMode ? "#404040" : "#E0E0E0"} strokeWidth="2" />
              <path d="M28 28L36 36" stroke={darkMode ? "#404040" : "#E0E0E0"} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className={`text-[14px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>No teams match your search.</span>
          </div>
        ) : (
          filtered.map((team, idx) => {
            const s = STATUS_STYLE[team.status];
            return (
              <div
                key={team.id}
                className={`grid px-6 py-4 items-center transition-colors group ${darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-[#FAFAFA]'} ${idx < filtered.length - 1 ? (darkMode ? 'border-b border-neutral-800' : 'border-b border-[#F8F9FA]') : ''}`}
                style={{ gridTemplateColumns: "1fr 160px 120px 100px", gap: "16px" }}
              >
                {/* Team name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 font-['DM_Sans']" style={{ backgroundColor: colorForName(team.name) }}>
                    {team.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className={`text-[14px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-neutral-200' : 'text-[#1C1B1F]'}`}>{team.name}</div>
                    <div className={`text-[11px] font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#9AA0A6]'}`}>Joined {team.joined}</div>
                  </div>
                </div>

                {/* Access code */}
                <div className="flex items-center gap-2">
                  <code className={`text-[13px] font-medium px-2.5 py-1 rounded-[6px] font-['JetBrains_Mono'] ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-[#F1F3F4] text-[#3C4043]'}`}>
                    {team.code}
                  </code>
                  <button
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-[4px] ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-[#E8F0FE]'}`}
                    title="Copy code"
                    onClick={() => navigator.clipboard.writeText(team.code).catch(() => {})}
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <rect x="4" y="1" width="9" height="9" rx="2" stroke={darkMode ? "#A3A3A3" : "#9AA0A6"} strokeWidth="1.4" />
                      <path d="M1 5v7a2 2 0 0 0 2 2h7" stroke={darkMode ? "#A3A3A3" : "#9AA0A6"} strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold font-['Roboto']"
                    style={{ backgroundColor: darkMode ? s.darkBg : s.bg, color: darkMode ? s.darkText : s.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                    {team.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setEditTarget(team)} className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all border ${darkMode ? 'border-neutral-700 hover:bg-neutral-800' : 'border-[#E0E0E0] hover:bg-[#E8F0FE]'}`} title="Edit team">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5Z" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteTarget(team)} className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all border ${darkMode ? 'border-neutral-700 hover:bg-red-950/40' : 'border-[#E0E0E0] hover:bg-[#FFEBEE]'}`} title="Delete team">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 4.5h9M5 4.5V3h4v1.5M5.5 6.5v4M8.5 6.5v4M3.5 4.5l.7 7h5.6l.7-7" stroke="#EA4335" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-3 border-t ${darkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-[#F8F9FA] border-[#E0E0E0]'}`}>
          <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
            {filtered.length} of {teams.length} teams
          </span>
          <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
            {teams.filter(t => t.status === "Active").length} active · {teams.filter(t => t.status === "Pending").length} pending
          </span>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddTeamModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} darkMode={darkMode} />}
      {editTarget && <EditTeamModal team={editTarget} onClose={() => setEditTarget(null)} onEdit={handleEdit} darkMode={darkMode} />}
      {deleteTarget && <DeleteModal team={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} darkMode={darkMode} />}

      <style>{`
        @keyframes modalShake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          60%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
