import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Anomaly } from '../../types';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GombeMapProps {
  anomalies: Anomaly[];
  onSelectAnomaly?: (anomaly: Anomaly) => void;
}

// Center of Gombe State
const GOMBE_CENTER: [number, number] = [10.2897, 11.1711];
const ZOOM_LEVEL = 9;

// Component to dynamically change map view
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function GombeMap({ anomalies, onSelectAnomaly }: GombeMapProps) {
  const [activeCenter, setActiveCenter] = useState<[number, number]>(GOMBE_CENTER);
  const [activeZoom, setActiveZoom] = useState(ZOOM_LEVEL);

  // Helper to determine color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444'; // red-500
      case 'high': return '#f97316'; // orange-500
      case 'medium': return '#eab308'; // yellow-500
      case 'warning': return '#a855f7'; // purple-500
      default: return '#3b82f6'; // blue-500
    }
  };

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden shadow-lg border border-dark-border">
      <MapContainer 
        center={GOMBE_CENTER} 
        zoom={ZOOM_LEVEL} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#1e293b' }}
      >
        <ChangeView center={activeCenter} zoom={activeZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {anomalies.map((anomaly, idx) => {
          // If we had actual lat/long per anomaly, we'd use them. 
          // For now, we simulate slight offsets from Gombe center based on ID or index
          // In a real scenario, anomalies would join with polling_units to get exact lat/long
          
          // Using a deterministic jitter for demonstration since exact lat/lng might be missing in Anomaly interface
          const id = anomaly.id || idx;
          const latJitter = (id % 10) * 0.05 - 0.25;
          const lngJitter = (id % 7) * 0.05 - 0.15;
          const lat = GOMBE_CENTER[0] + latJitter;
          const lng = GOMBE_CENTER[1] + lngJitter;

          return (
            <CircleMarker
              key={anomaly.id || idx}
              center={[lat, lng]}
              radius={8}
              pathOptions={{ 
                fillColor: getSeverityColor(anomaly.severity), 
                color: '#1e293b', 
                weight: 2, 
                fillOpacity: 0.8 
              }}
              eventHandlers={{
                click: () => {
                  setActiveCenter([lat, lng]);
                  setActiveZoom(12);
                  if (onSelectAnomaly) onSelectAnomaly(anomaly);
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-sm text-gray-800 mb-1">{anomaly.type?.replace(/_/g, ' ').toUpperCase()}</h3>
                  <p className="text-xs text-gray-600 mb-2">{anomaly.detail}</p>
                  <div className="text-xs font-semibold text-gray-700">
                    <p>LGA: {anomaly.lga_name || 'Unknown'}</p>
                    <p>Ward: {anomaly.ward_name || 'Unknown'}</p>
                    <p>PU: {anomaly.polling_unit_name || 'Unknown'}</p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Controls / Legend overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-dark-surface/90 backdrop-blur-md p-3 rounded-lg border border-dark-border shadow-xl">
        <h4 className="text-xs font-semibold text-text-primary mb-2">Severity Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-xs text-text-muted">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-xs text-text-muted">High</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-xs text-text-muted">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span className="text-xs text-text-muted">Warning</span>
          </div>
        </div>
      </div>
    </div>
  );
}
