import { useMemo } from 'react'

export default function SensorPanel({ imuData, encoderData, lidarData }) {

  const lidarStats = useMemo(() => {
    if (!lidarData || lidarData.length === 0) return { hits: 0, minD: 0 }
    const hits = lidarData.filter(d => d.hit)
    const dists = hits.map(d => d.distance)
    return { hits: hits.length, minD: dists.length ? Math.min(...dists) : 0 }
  }, [lidarData])

  return (
    <div style={{
      position: 'absolute',
      right: 10,
      top: 10,
      width: 260,
      background: '#0d1117',
      borderRadius: 14,
      padding: 14,
      color: 'white',
      border: '1px solid #30363d',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      fontFamily: "'Segoe UI', monospace",
      zIndex: 10
    }}>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '1px solid #21262d'
      }}>
        <span style={{ fontSize: 16 }}>📡</span>
        <span style={{ color: '#58a6ff', fontWeight: 'bold', fontSize: 13 }}>
          Sensor Panel
        </span>
        <span style={{
          marginLeft: 'auto',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#3fb950'
        }} />
      </div>

      {/* IMU */}
      <Section title="IMU">
        <Item label="Roll" value={imuData?.orientation?.roll} />
        <Item label="Pitch" value={imuData?.orientation?.pitch} />
        <Item label="Yaw" value={imuData?.orientation?.yaw} />
      </Section>

      {/* ENCODERS */}
      <Section title="Encoders">
        <Item label="Left RPM" value={encoderData?.left?.rpm} />
        <Item label="Right RPM" value={encoderData?.right?.rpm} />
        <Item label="Distance" value={encoderData?.totalDistance} />
      </Section>

      {/* LIDAR */}
      <Section title="LiDAR">
        <Item label="Hits" value={lidarStats.hits} />
        <Item label="Min Dist" value={lidarStats.minD} />
      </Section>

    </div>
  )
}

// ---------- COMPONENTS ----------

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        color: '#f0883e',
        fontSize: 11,
        marginBottom: 6
      }}>
        {title}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 6
      }}>
        {children}
      </div>
    </div>
  )
}

function Item({ label, value }) {
  return (
    <div style={{
      background: '#161b22',
      padding: 8,
      borderRadius: 8,
      border: '1px solid #21262d'
    }}>
      <div style={{
        fontSize: 10,
        color: '#8b949e'
      }}>
        {label}
      </div>

      <div style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3fb950'
      }}>
        {(value ?? 0).toFixed(2)}
      </div>
    </div>
  )
}