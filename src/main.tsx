import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

type Screen = "map" | "bike" | "helmet" | "riding" | "return" | "done";

const G = "#6abf72";      // sustainable green — text / icons
const GB = "#4a9e57";     // darker — backgrounds / borders
const GH = "#5ab565";     // hover

const bikes = [
  { id: "L-4821", battery: 92, distance: "0.3 mi away" },
  { id: "L-3307", battery: 78, distance: "0.5 mi away" },
  { id: "L-9154", battery: 61, distance: "0.7 mi away" },
];

function App() {
  const [screen, setScreen] = useState<Screen>("map");
  const [selectedBike, setSelectedBike] = useState(bikes[0]);
  const [helmetChosen, setHelmetChosen] = useState<boolean | null>(null);
  const [helmetReturned, setHelmetReturned] = useState(false);
  const [rideTime, setRideTime] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const playHelmetClick = () => {
    const ctx = new AudioContext();
    const sr = ctx.sampleRate;
    const now = ctx.currentTime;

    const click1Len = Math.floor(sr * 0.008);
    const click1Buf = ctx.createBuffer(1, click1Len, sr);
    const click1Data = click1Buf.getChannelData(0);
    for (let i = 0; i < click1Len; i++) {
      click1Data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.001));
    }
    const click1 = ctx.createBufferSource();
    click1.buffer = click1Buf;
    const click1Filter = ctx.createBiquadFilter();
    click1Filter.type = "bandpass";
    click1Filter.frequency.value = 4000;
    click1Filter.Q.value = 2.0;
    const click1Gain = ctx.createGain();
    click1Gain.gain.value = 0.7;
    click1.connect(click1Filter);
    click1Filter.connect(click1Gain);
    click1Gain.connect(ctx.destination);
    click1.start(now);

    const click2Len = Math.floor(sr * 0.01);
    const click2Buf = ctx.createBuffer(1, click2Len, sr);
    const click2Data = click2Buf.getChannelData(0);
    for (let i = 0; i < click2Len; i++) {
      click2Data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.0015));
    }
    const click2 = ctx.createBufferSource();
    click2.buffer = click2Buf;
    const click2Filter = ctx.createBiquadFilter();
    click2Filter.type = "bandpass";
    click2Filter.frequency.value = 2800;
    click2Filter.Q.value = 1.5;
    const click2Gain = ctx.createGain();
    click2Gain.gain.value = 0.5;
    click2.connect(click2Filter);
    click2Filter.connect(click2Gain);
    click2Gain.connect(ctx.destination);
    click2.start(now + 0.08);

    const tickLen = Math.floor(sr * 0.005);
    const tickBuf = ctx.createBuffer(1, tickLen, sr);
    const tickData = tickBuf.getChannelData(0);
    for (let i = 0; i < tickLen; i++) {
      tickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.0008));
    }
    const tick = ctx.createBufferSource();
    tick.buffer = tickBuf;
    const tickFilter = ctx.createBiquadFilter();
    tickFilter.type = "highpass";
    tickFilter.frequency.value = 6000;
    const tickGain = ctx.createGain();
    tickGain.gain.value = 0.35;
    tick.connect(tickFilter);
    tickFilter.connect(tickGain);
    tickGain.connect(ctx.destination);
    tick.start(now + 0.085);
  };

  const startRide = () => {
    setScreen("riding");
    setRideTime(0);
    const t = setInterval(() => setRideTime(s => s + 1), 1000);
    setTimerRef(t);
  };

  const stopTimer = () => {
    if (timerRef) clearInterval(timerRef);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const cost = ((rideTime / 60) * 0.25 + 1.0).toFixed(2);

  return (
    <div className="top-clearance bottom-clearance min-h-screen bg-black text-white flex flex-col items-center px-4">

      {/* HELMET REATTACHED NOTIFICATION */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${showNotification ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="flex items-center gap-3 bg-gray-900 rounded-2xl px-5 py-3 shadow-xl" style={{ border: `1px solid ${GB}` }}>
          <span style={{ color: G }} className="text-lg">⛑️</span>
          <div>
            <p className="font-bold text-sm" style={{ color: G }}>Helmet secured</p>
            <p className="text-gray-400 text-xs">Thanks for returning it safely</p>
          </div>
          <span style={{ color: G }} className="text-lg">✓</span>
        </div>
      </div>

      {/* MAP SCREEN */}
      {screen === "map" && (
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="text-center mb-2">
            <span className="text-2xl font-black tracking-tight" style={{ color: G }}>Kavro</span>
            <p className="text-gray-400 text-sm mt-1">Nearby e-bikes</p>
          </div>

          <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "repeating-linear-gradient(0deg,#333 0,#333 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#333 0,#333 1px,transparent 1px,transparent 40px)" }} />
            <div className="absolute top-10 left-16 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg" style={{ backgroundColor: GB }}>🚲</div>
              <div className="text-xs mt-1" style={{ color: G }}>L-4821</div>
            </div>
            <div className="absolute top-20 left-32 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg" style={{ backgroundColor: GB }}>🚲</div>
              <div className="text-xs mt-1" style={{ color: G }}>L-3307</div>
            </div>
            <div className="absolute top-8 right-12 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg" style={{ backgroundColor: GB }}>🚲</div>
              <div className="text-xs mt-1" style={{ color: G }}>L-9154</div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg" />
              <div className="text-blue-300 text-xs mt-1">You</div>
            </div>
          </div>

          <p className="text-gray-400 text-xs text-center">Tap a bike to unlock</p>

          {bikes.map(bike => (
            <button
              key={bike.id}
              onClick={() => { setSelectedBike(bike); setScreen("bike"); }}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between transition"
              onMouseEnter={e => (e.currentTarget.style.borderColor = GB)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "")}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚲</span>
                <div className="text-left">
                  <p className="font-bold text-white">{bike.id}</p>
                  <p className="text-gray-400 text-sm">{bike.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${bike.battery}%`, backgroundColor: GB }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: G }}>{bike.battery}%</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* BIKE DETAIL SCREEN */}
      {screen === "bike" && (
        <div className="w-full max-w-sm flex flex-col gap-5">
          <button onClick={() => setScreen("map")} className="text-sm flex items-center gap-1" style={{ color: G }}>← Back</button>
          <div className="text-center">
            <span className="text-2xl font-black tracking-tight" style={{ color: G }}>Kavro</span>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col items-center gap-3">
            <div className="text-6xl">🚲</div>
            <p className="text-xl font-bold">{selectedBike.id}</p>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${selectedBike.battery}%`, backgroundColor: GB }} />
              </div>
              <span className="font-semibold" style={{ color: G }}>{selectedBike.battery}%</span>
            </div>
            <p className="text-gray-400 text-sm">{selectedBike.distance}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex justify-between text-sm">
            <div className="text-center">
              <p className="text-gray-400">Unlock</p>
              <p className="text-white font-bold">$1.00</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Per min</p>
              <p className="text-white font-bold">$0.25</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Range</p>
              <p className="text-white font-bold">~18 mi</p>
            </div>
          </div>

          <button
            onClick={() => { setHelmetChosen(null); setScreen("helmet"); }}
            className="w-full py-4 text-white font-black text-lg rounded-2xl transition"
            style={{ backgroundColor: GB }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = GH)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = GB)}
          >
            Unlock Bike
          </button>
        </div>
      )}

      {/* HELMET SCREEN */}
      {screen === "helmet" && (
        <div className="w-full max-w-sm flex flex-col gap-5">
          <div className="text-center">
            <span className="text-2xl font-black tracking-tight" style={{ color: G }}>Kavro</span>
          </div>

          <div className="text-center">
            <div className="text-5xl mb-3">⛑️</div>
            <h2 className="text-xl font-black">Add a helmet?</h2>
            <p className="text-gray-400 text-sm mt-2">A foldable helmet is attached to this bike. It's free to use — just return it when you're done.</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-4 flex gap-3 items-start" style={{ border: `1px solid ${GB}` }}>
            <div>
              <p className="font-bold text-sm" style={{ color: G }}>Foldable Helmet</p>
              <p className="text-gray-400 text-xs mt-1">Compact, lightweight, certified EN1078. Folds to fit in your bag. Must be reattached to end your ride.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setHelmetChosen(true); startRide(); }}
              className="w-full py-4 text-white font-black text-base rounded-2xl transition flex items-center justify-center gap-2"
              style={{ backgroundColor: GB }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = GH)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = GB)}
            >
              ⛑️ Yes, unlock helmet
            </button>
            <button
              onClick={() => { setHelmetChosen(false); startRide(); }}
              className="w-full py-3 bg-transparent border border-gray-700 text-gray-400 font-semibold text-base rounded-2xl hover:border-gray-500 transition"
            >
              No thanks, ride without
            </button>
          </div>

          <p className="text-gray-600 text-xs text-center">Helmet use is optional. Ride safe.</p>
        </div>
      )}

      {/* RIDING SCREEN */}
      {screen === "riding" && (
        <div className="w-full max-w-sm flex flex-col gap-5 items-center">
          <div className="text-center">
            <span className="text-2xl font-black tracking-tight" style={{ color: G }}>Kavro</span>
          </div>

          <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-2">
            <p className="text-gray-400 text-sm uppercase tracking-widest">Ride time</p>
            <p className="text-5xl font-black text-white tabular-nums">{formatTime(rideTime)}</p>
            <p className="font-bold text-xl" style={{ color: G }}>${cost}</p>
          </div>

          <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{helmetChosen ? "⛑️" : "🚲"}</span>
              <div>
                <p className="text-sm font-semibold">{selectedBike.id}</p>
                <p className="text-gray-400 text-xs">{helmetChosen ? "Helmet unlocked" : "No helmet"}</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: G }} />
          </div>

          {helmetChosen && (
            <div className="w-full bg-yellow-900 border border-yellow-600 rounded-2xl p-3 flex gap-2 items-start">
              <span className="text-yellow-400">⚠️</span>
              <p className="text-yellow-300 text-xs">Remember to reattach your helmet before ending the ride.</p>
            </div>
          )}

          <button
            onClick={() => { stopTimer(); setHelmetReturned(false); setScreen("return"); }}
            className="w-full py-4 text-white font-black text-lg rounded-2xl transition"
            style={{ backgroundColor: GB }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = GH)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = GB)}
          >
            End Ride
          </button>
        </div>
      )}

      {/* RETURN SCREEN */}
      {screen === "return" && (
        <div className="w-full max-w-sm flex flex-col gap-5">
          <div className="text-center">
            <span className="text-2xl font-black tracking-tight" style={{ color: G }}>Kavro</span>
          </div>

          {helmetChosen ? (
            <>
              <div className="text-center">
                <div className="text-5xl mb-3">⛑️</div>
                <h2 className="text-xl font-black">Return your helmet</h2>
                <p className="text-gray-400 text-sm mt-2">Fold the helmet and click it back onto the mount on the bike to end your ride.</p>
              </div>

              <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={helmetReturned ? { backgroundColor: GB, color: "white" } : { backgroundColor: "#374151", color: "#9ca3af" }}>
                    {helmetReturned ? "✓" : "1"}
                  </div>
                  <p className="text-sm" style={helmetReturned ? { color: G } : { color: "white" }}>Fold helmet and attach to mount</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={helmetReturned ? { backgroundColor: GB, color: "white" } : { backgroundColor: "#374151", color: "#9ca3af" }}>
                    {helmetReturned ? "✓" : "2"}
                  </div>
                  <p className="text-sm" style={helmetReturned ? { color: G } : { color: "white" }}>Hear the click — it's locked</p>
                </div>
              </div>

              {!helmetReturned ? (
                <button
                  onClick={() => {
                    setHelmetReturned(true);
                    playHelmetClick();
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 3000);
                  }}
                  className="w-full py-4 text-white font-black text-base rounded-2xl transition"
                  style={{ backgroundColor: GB }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = GH)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = GB)}
                >
                  ✓ Helmet reattached
                </button>
              ) : (
                <button
                  onClick={() => setScreen("done")}
                  className="w-full py-4 text-white font-black text-lg rounded-2xl transition"
                  style={{ backgroundColor: GB }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = GH)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = GB)}
                >
                  Confirm End Ride
                </button>
              )}

              {!helmetReturned && (
                <p className="text-gray-600 text-xs text-center">You must return the helmet to end your ride.</p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <div className="text-5xl mb-3">🚲</div>
                <h2 className="text-xl font-black">Park your bike</h2>
                <p className="text-gray-400 text-sm mt-2">Leave the bike in a designated parking zone and lock it.</p>
              </div>
              <button
                onClick={() => setScreen("done")}
                className="w-full py-4 text-white font-black text-lg rounded-2xl transition"
                style={{ backgroundColor: GB }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = GH)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = GB)}
              >
                Confirm End Ride
              </button>
            </div>
          )}
        </div>
      )}

      {/* DONE SCREEN */}
      {screen === "done" && (
        <div className="w-full max-w-sm flex flex-col gap-5 items-center text-center">
          <div className="text-center">
            <span className="text-2xl font-black tracking-tight" style={{ color: G }}>Kavro</span>
          </div>

          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-black">Ride complete!</h2>

          <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Duration</span>
              <span className="font-bold">{formatTime(rideTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Bike</span>
              <span className="font-bold">{selectedBike.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Helmet used</span>
              <span className="font-bold" style={helmetChosen ? { color: G } : { color: "#9ca3af" }}>{helmetChosen ? "Yes ⛑️" : "No"}</span>
            </div>
            <div className="border-t border-gray-800 pt-3 flex justify-between">
              <span className="text-gray-400 text-sm">Total</span>
              <span className="font-black text-lg" style={{ color: G }}>${cost}</span>
            </div>
          </div>

          {helmetChosen && (
            <div className="w-full bg-gray-900 rounded-2xl p-4 flex gap-3 items-start text-left" style={{ border: `1px solid ${GB}` }}>
              <div>
                <p className="font-bold text-sm" style={{ color: G }}>Thanks for wearing a helmet!</p>
                <p className="text-gray-400 text-xs mt-1">You helped keep our streets safer. See you next ride.</p>
              </div>
            </div>
          )}

          <button
            onClick={() => { setScreen("map"); setHelmetChosen(null); setRideTime(0); setHelmetReturned(false); }}
            className="w-full py-4 text-white font-black text-lg rounded-2xl transition"
            style={{ backgroundColor: GB }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = GH)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = GB)}
          >
            Ride Again
          </button>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);