"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

export default function Home() {
  const [videos, setVideos] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [stats, setStats] = useState<any>({ people:0, helmet:0, noHelmet:0 });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/videos")
      .then(res => res.json())
      .then(data => {
        setVideos(data.videos);
        setSelected(data.videos[0]);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`http://127.0.0.1:8000/set-video?name=${selected}`);
  }, [selected]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://127.0.0.1:8000/stats")
        .then(res => res.json())
        .then(data => {
          setStats(data);

          setHistory(prev => [
            ...prev.slice(-10),
            {
              time: new Date().toLocaleTimeString(),
              ...data
            }
          ]);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const barData = [
    { name: "People", value: stats.people },
    { name: "Helmet", value: stats.helmet },
    { name: "No Helmet", value: stats.noHelmet }
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "white" }}>
      <div style={{ width: 220, padding: 20, background: "#020617" }}>
        <h3>Cameras</h3>
        {videos.map(v => (
          <div key={v} onClick={() => setSelected(v)}
            style={{ padding:10, marginTop:10, cursor:"pointer",
              background: selected===v ? "#2563eb":"#1e293b" }}>
            {v}
          </div>
        ))}
      </div>

      <div style={{ flex:1, padding:20 }}>
        <h1>PPE Dashboard</h1>

        <div style={{ display:"flex", gap:20 }}>
          <div style={{ flex:1, background:"#020617", padding:10 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey="value"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex:1, background:"#020617", padding:10 }}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="time"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line dataKey="people"/>
                <Line dataKey="helmet"/>
                <Line dataKey="noHelmet"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <img
          src="http://127.0.0.1:8000/video_feed"
          style={{ width:"60%", marginTop:20, borderRadius:10 }}
        />
      </div>
    </div>
  );
}