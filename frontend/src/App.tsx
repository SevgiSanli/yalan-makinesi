import { useEffect, useRef, useState } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

export default function App() {
  const chartRef = useRef<HTMLDivElement>(null);
  const uplotInstance = useRef<uPlot | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastData, setLastData] = useState({ gsr: 0, resp: 0, ppg: 0 });

  const dataBuffer = useRef<[number[], number[], number[], number[]]>([[], [], [], []]);

  useEffect(() => {
    if (!chartRef.current) return;

    const opts: uPlot.Options = {
      title: "Canlı Biyometrik Sensör Verileri",
      width: 800,
      height: 400,
      scales: {
        x: { time: true },
        y: { auto: true },
      },
      series: [
        {},
        { label: "GSR (Terleme)", stroke: "#ef4444", width: 2 },
        { label: "RESP (Solunum)", stroke: "#3b82f6", width: 2 },
        { label: "PPG (Nabız)", stroke: "#10b981", width: 2 },
      ],
    };

    uplotInstance.current = new uPlot(opts, [[], [], [], []], chartRef.current);

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/live");

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setLastData(parsed);

      const now = Date.now() / 1000;
      const buf = dataBuffer.current;

      buf[0].push(now);
      buf[1].push(parsed.gsr);
      buf[2].push(parsed.resp);
      buf[3].push(parsed.ppg);

      if (buf[0].length > 500) {
        buf[0].shift();
        buf[1].shift();
        buf[2].shift();
        buf[3].shift();
      }

      uplotInstance.current?.setData(buf);
    };

    return () => {
      ws.close();
      uplotInstance.current?.destroy();
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Yalan Makinesi - Test Operatör Paneli</h2>
      <p>
        Bağlantı Durumu: {' '}
        <span style={{ color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>
          {isConnected ? 'CANLI BAĞLANTI AKTİF' : 'BAĞLANTI BEKLENİYOR'}
        </span>
      </p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: '#fee2e2', padding: '10px 20px', borderRadius: '8px' }}>
          <strong>GSR:</strong> {lastData.gsr}
        </div>
        <div style={{ background: '#dbeafe', padding: '10px 20px', borderRadius: '8px' }}>
          <strong>Solunum:</strong> {lastData.resp}
        </div>
        <div style={{ background: '#d1fae5', padding: '10px 20px', borderRadius: '8px' }}>
          <strong>Nabız:</strong> {lastData.ppg}
        </div>
      </div>

      <div ref={chartRef} />
    </div>
  );
}