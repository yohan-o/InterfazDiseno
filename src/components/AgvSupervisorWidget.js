import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

/* 
  ==============================================================
  CONFIGURACIÓN DEL AGV (Llenar cuando estén listos los datos)
  ==============================================================
*/
const CONFIG = {
  // IP del servidor Flask para el video MJPEG (Red local del compañero o la tuya)
  VIDEO_URL: 'http://localhost:5000/video', 
  // IP y puerto de WebSockets del broker MQTT (Usamos uno público para pruebas)
  MQTT_WS_URL: 'ws://broker.emqx.io:8083/mqtt',
  // Tópico donde publica el AGV
  TOPIC_POSICION: 'wms/agv/AGV_01/posicion'
};

/* ── Paleta U de Pamplona (Heredada del dashboard) ── */
const PRIMARY = '#003366';
const ACCENT  = '#AD3333';
const GREEN   = '#1A9E5A';
const WARN    = '#D48B00';
const NEUTRAL = '#F5F7FA';
const FONT    = "'Century Gothic', Candara, 'Trebuchet MS', sans-serif";
const MONO    = "'Roboto Mono', monospace";

export default function AgvSupervisorWidget({ isMobile }) {
  const [agvData, setAgvData] = useState({
    ubicacion: 'Desconocida',
    coordenadas: [0, 0],
    destino: 'Ninguno',
    instruccion: 'ESPERANDO DESTINO...',
    visto: false,
    timestamp: 'N/A'
  });
  
  const [mqttStatus, setMqttStatus] = useState('esperando...');
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setMqttStatus('Conectando MQTT...');
    const client = mqtt.connect(CONFIG.MQTT_WS_URL);

    client.on('connect', () => {
      setMqttStatus('Conectado al Broker');
      client.subscribe(CONFIG.TOPIC_POSICION, (err) => {
        if (err) console.error("Error al suscribirse al AGV:", err);
      });
    });

    client.on('message', (topic, message) => {
      if (topic === CONFIG.TOPIC_POSICION) {
        try {
          const payload = JSON.parse(message.toString());
          setAgvData(payload);
        } catch (e) {
          console.error("Error parseando JSON de MQTT:", e);
        }
      }
    });

    client.on('error', (err) => {
      console.error("MQTT Error: ", err);
      setMqttStatus('Error de conexión');
    });

    client.on('close', () => {
      setMqttStatus('Desconectado');
    });

    return () => {
      if (client) client.end();
    };
  }, []);

  const getStatusColor = (visto) => visto ? GREEN : ACCENT;

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #DADADA', borderRadius: '14px',
      padding: isMobile ? '16px' : '20px 28px', boxShadow: '0 2px 10px rgba(0,51,102,0.06)',
      marginTop: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: PRIMARY, fontSize: '16px', fontWeight: '600', fontFamily: FONT }}>
          📷 Supervisor Inteligente del AGV
        </h2>
        <span style={{ 
          fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '8px',
          background: mqttStatus === 'Conectado al Broker' ? 'rgba(26,158,90,0.1)' : 'rgba(173,51,51,0.1)',
          color: mqttStatus === 'Conectado al Broker' ? GREEN : ACCENT,
          fontFamily: FONT
        }}>
          {mqttStatus}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 400px) 1fr',
        gap: '20px'
      }}>
        {/* PANEL DE VIDEO */}
        <div style={{ 
          background: '#000', borderRadius: '10px', overflow: 'hidden', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '280px', position: 'relative', border: '1px solid #DADADA'
        }}>
          {videoError ? (
            <div style={{ color: '#AD3333', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
              <b>Esperando conexión...</b><br/>No se pudo conectar al video del AGV.
            </div>
          ) : (
            <img 
              src={CONFIG.VIDEO_URL} 
              alt="Live Feed AGV" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              onError={() => setVideoError(true)}
            />
          )}
          
          {/* Overlay Status (Recording/Visible) */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ 
              width: '8px', height: '8px', borderRadius: '50%',
              background: getStatusColor(agvData.visto),
              boxShadow: `0 0 8px ${getStatusColor(agvData.visto)}`
            }} />
            <span style={{ color: '#FFF', fontSize: '11px', fontFamily: FONT, fontWeight: '600' }}>
              {agvData.visto ? 'AGV DETECTADO' : 'AGV FUERA DE CÁMARA'}
            </span>
          </div>
        </div>

        {/* PANEL DE TELEMETRÍA */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', alignContent: 'start' }}>
          
          <div style={{ background: NEUTRAL, padding: '14px', borderRadius: '10px', border: '1px solid #EBEBEB' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#777', fontWeight: '500', fontFamily: FONT }}>📍 Ubicación Actual</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: PRIMARY, fontFamily: MONO }}>{agvData.ubicacion}</p>
          </div>

          <div style={{ background: NEUTRAL, padding: '14px', borderRadius: '10px', border: '1px solid #EBEBEB' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#777', fontWeight: '500', fontFamily: FONT }}>🎯 Destino</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: PRIMARY, fontFamily: MONO }}>{agvData.destino}</p>
          </div>

          <div style={{ background: NEUTRAL, padding: '14px', borderRadius: '10px', border: '1px solid #EBEBEB' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#777', fontWeight: '500', fontFamily: FONT }}>🧭 Coordenadas (X, Y)</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: PRIMARY, fontFamily: MONO }}>
              {agvData.coordenadas[0]}, {agvData.coordenadas[1]}
            </p>
          </div>

          <div style={{ background: NEUTRAL, padding: '14px', borderRadius: '10px', border: '1px solid #EBEBEB' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#777', fontWeight: '500', fontFamily: FONT }}>⏱️ Última Lectura</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: PRIMARY, fontFamily: MONO }}>{agvData.timestamp}</p>
          </div>

          <div style={{ 
            gridColumn: isMobile ? 'span 1' : 'span 2', 
            background: 'rgba(0,51,102,0.04)', padding: '14px', borderRadius: '10px', border: `1px solid rgba(0,51,102,0.15)`
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#777', fontWeight: '500', fontFamily: FONT }}>🤖 Instrucción Modelo de IA</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: PRIMARY, fontFamily: MONO }}>{agvData.instruccion}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
