
import React, { useState } from "react";
import StationStatus from '../components/recepcion/StationStatus';
import ProductQueue from '../components/recepcion/ProductQueue';
import QRScanner from '../components/recepcion/QRScanner';
import LocalAlerts from '../components/recepcion/LocalAlerts';
import OperationControls from '../components/recepcion/OperationControls';

export default function Recepcion() {
  // Estado dinámico
  const [products] = useState([
    {
      id: 'PROD-0001',
      status: 'En banda transportadora',
      time: '22:04:10',
      state: 'Pendiente'
    }
  ]);

  const [alerts] = useState([
    {
      message: 'Producto PROD-0001 en banda transportadora esperando',
      time: '22:04:10'
    },
    {
      message: 'Verificación de QR requerida para PROD-0002',
      time: '22:05:30'
    }
  ]);

  // Handlers para los controles
  const handleStart = () => console.log('Iniciar operación');
  const handleCallRobot = () => console.log('Llamar a Robot');
  const handlePause = () => console.log('Pausar operación');
  const handleAbort = () => console.log('Abortar operación');
  const handleScan = () => console.log('Iniciar escaneo QR');

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f6f9",
      fontFamily: "'Century Gothic', Candara, 'Trebuchet MS', sans-serif",
    }}>
      {/* CONTENT */}
      <div style={{padding: "28px"}}>
        
        {/* MAIN GRID */}
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px'}}>
        
          {/* LEFT COLUMN */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <StationStatus stationName="D1" isActive={true} />
            <ProductQueue products={products} />
            <QRScanner onScan={handleScan} />
          </div>

          {/* RIGHT COLUMN - Alarmas */}
          <div>
            <LocalAlerts alerts={alerts} />
          </div>

        </div>

        {/* Control de Operaciones - Full Width */}
        <OperationControls
          onStart={handleStart}
          onCallRobot={handleCallRobot}
          onPause={handlePause}
          onAbort={handleAbort}
        />

      </div>
    </div>
  );
}