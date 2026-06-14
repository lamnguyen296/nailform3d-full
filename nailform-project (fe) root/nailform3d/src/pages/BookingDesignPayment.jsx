import React, { Suspense, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './BookingDesignPayment.css';

function Scene({ skinColor, baseNailColor, baseStyle }) {
  const hand = useGLTF('/HandIDK_4.glb');
  const nail = useGLTF(baseStyle || '/nail/NailIDK_4.glb');
  useEffect(() => {
    [{ scene: hand.scene, color: skinColor || '#FDDBB4' }, { scene: nail.scene, color: baseNailColor || '#cc3366' }]
      .forEach(({ scene, color }) => {
        const c = new THREE.Color(color);
        scene.traverse(n => { if (n.isMesh && n.material?.color) { n.material.color.set(c); n.material.needsUpdate = true; } });
      });
  }, [skinColor, baseNailColor, hand.scene, nail.scene]);
  return <><primitive object={hand.scene} /><primitive object={nail.scene} /></>;
}

export default function BookingDesignPayment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { appointment, salonName, technician, selectedDesign, date, time, notes } = state || {};

  const designJson = useMemo(() => {
    if (!selectedDesign?.designData) return null;
    try { return JSON.parse(selectedDesign.designData); } catch { return null; }
  }, [selectedDesign]);

  // If accessed directly (no state), show fallback
  if (!appointment) {
    return (
      <div className="bookingpayment-page">
        <div className="container"><Navbar />
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <h2 style={{ color: '#111827' }}>No booking data found.</h2>
            <p>Please start from the <Link to="/booking" style={{ color: '#7c3aed', fontWeight: 'bold' }}>Booking page</Link>.</p>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div className="bookingpayment-page">
      <div className="ambient-shape-1" />
      <div className="ambient-shape-2" />

      <div className="container">
        <Navbar />

        {/* ── Success Banner ─────────────────────────────────────────────── */}
        <div style={s.successBanner}>
          <div style={s.successIcon}>✓</div>
          <div>
            <h1 style={s.successTitle}>Booking Confirmed!</h1>
            <p style={s.successSub}>Your appointment has been sent to <strong>{salonName}</strong>. They will confirm shortly.</p>
          </div>
        </div>

        <div className="booking-page-content">
          <div style={s.layout}>

            {/* ── LEFT: Details ──────────────────────────────────────────── */}
            <div style={s.left}>

              {/* Booking Reference */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>📋 Booking Reference</h2>
                <div style={s.refCode}>#{appointment.id?.substring(0, 8).toUpperCase()}</div>
                <p style={{ color: '#6b7280', fontSize: 13, margin: '8px 0 0' }}>Save this ID for tracking your appointment</p>
              </div>

              {/* Appointment Details */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>🏪 Salon & Technician</h2>
                <div style={s.detailRow}><span style={s.detailLabel}>Salon</span><span style={s.detailVal}>{salonName || appointment.salonId}</span></div>
                <div style={s.detailRow}>
                  <span style={s.detailLabel}>Technician</span>
                  {technician ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {technician.avatarBase64
                        ? <img src={technician.avatarBase64} alt={technician.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>{technician.name?.charAt(0)}</div>
                      }
                      <div>
                        <div style={{ color: '#111827', fontWeight: 700 }}>{technician.name}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{technician.specialty}</div>
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#d97706', fontWeight: 600 }}>✨ Assigned by salon</span>
                  )}
                </div>
                <div style={s.detailRow}><span style={s.detailLabel}>Date</span><span style={s.detailVal}>{formattedDate}</span></div>
                <div style={s.detailRow}><span style={s.detailLabel}>Time</span><span style={s.detailVal}>{time}</span></div>
                {appointment.location && <div style={s.detailRow}><span style={s.detailLabel}>Location</span><span style={s.detailVal}>{appointment.location}</span></div>}
                {notes && <div style={s.detailRow}><span style={s.detailLabel}>Notes</span><span style={{ ...s.detailVal, fontStyle: 'italic' }}>"{notes}"</span></div>}
                <div style={s.detailRow}><span style={s.detailLabel}>Status</span><span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>⏳ PENDING</span></div>
              </div>

              {/* Design info */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>🎨 Design</h2>
                {selectedDesign ? (
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {selectedDesign.thumbnailBase64 && (
                      <img src={selectedDesign.thumbnailBase64} alt="design" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ color: '#111827', fontWeight: 700 }}>Design #{selectedDesign.id?.substring(0, 6).toUpperCase()}</div>
                      {designJson && <>
                        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Skin: <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: designJson.skinColor, verticalAlign: 'middle', marginLeft: 4, border: '1px solid #d1d5db' }} /></div>
                        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Nail color: <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: designJson.baseNailColor, verticalAlign: 'middle', marginLeft: 4, border: '1px solid #d1d5db' }} /></div>
                        {designJson.placedCharms?.length > 0 && <div style={{ color: '#7c3aed', fontSize: 12, marginTop: 2, fontWeight: 600 }}>✦ {designJson.placedCharms.length} charm(s) placed</div>}
                      </>}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No specific design — salon will suggest a style 🌸</div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => navigate('/user-appointments')} style={s.primaryBtn}>View My Appointments</button>
                <button onClick={() => navigate('/booking')} style={s.secondaryBtn}>Book Another</button>
              </div>
            </div>

            {/* ── RIGHT: 3D Preview ───────────────────────────────────────── */}
            {designJson && (
              <div style={s.right}>
                <div style={s.card}>
                  <h2 style={s.cardTitle}>🖐️ 3D Design Preview</h2>
                  <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Drag to rotate · Scroll to zoom</p>
                  <div style={{ height: 340, borderRadius: 14, overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                    <Canvas camera={{ position: [0.5, 6, -45], fov: 35 }} gl={{ antialias: true }}>
                      <Environment preset="studio" />
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[0, 10, -10]} intensity={1.5} />
                      <ContactShadows position={[0, -0.05, 0]} opacity={0.4} scale={12} blur={2} far={8} />
                      <Suspense fallback={null}>
                        <Scene skinColor={designJson.skinColor} baseNailColor={designJson.baseNailColor} baseStyle={designJson.baseStyle} />
                      </Suspense>
                      <OrbitControls makeDefault target={[0, 0.5, -2]} enableDamping dampingFactor={0.08} rotateSpeed={0.6} />
                    </Canvas>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: 11, textAlign: 'center', marginTop: 10 }}>
                    This is the reference design shown to the salon technician
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const s = {
  successBanner: { display: 'flex', alignItems: 'center', gap: 20, background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #10b981', borderRadius: 20, padding: '24px 28px', margin: '24px 0 32px', flexWrap: 'wrap' },
  successIcon: { width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #34d399, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 900, flexShrink: 0, boxShadow: '0 8px 20px rgba(52,211,153,0.3)' },
  successTitle: { color: '#065f46', margin: '0 0 6px', fontSize: 22, fontWeight: 900 },
  successSub: { color: '#047857', margin: 0, fontSize: 14 },
  layout: { display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' },
  left: { flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 20 },
  right: { flex: '0 0 360px' },
  card: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 18, padding: '22px 24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  cardTitle: { color: '#111827', margin: '0 0 18px', fontSize: 16, fontWeight: 800 },
  refCode: { fontSize: 28, fontWeight: 900, color: '#7c3aed', letterSpacing: 2, fontFamily: 'monospace' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6', gap: 12, flexWrap: 'wrap' },
  detailLabel: { color: '#6b7280', fontSize: 13, fontWeight: 600, flexShrink: 0 },
  detailVal: { color: '#111827', fontSize: 14, fontWeight: 600, textAlign: 'right' },
  primaryBtn: { flex: 1, padding: '14px 20px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: 14, boxShadow: '0 6px 20px rgba(236,72,153,0.25)' },
  secondaryBtn: { padding: '14px 20px', background: 'white', border: '1px solid #d1d5db', borderRadius: 14, cursor: 'pointer', color: '#4b5563', fontWeight: 700, fontSize: 14 },
};

useGLTF.preload('/nail/NailIDK_4.glb');
useGLTF.preload('/nail/R_RSquare_Nails  .glb');
useGLTF.preload('/nail/R_Ribbon Nails  .glb');
useGLTF.preload('/nail/basicnail.glb');
