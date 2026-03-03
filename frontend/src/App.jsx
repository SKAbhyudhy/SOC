import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Info,
  Terminal,
} from 'lucide-react';

const ATTACK_LIBRARY = {
  brute_force: {
    mitre: { id: 'T1110', description: 'Brute Force attempts to gain unauthorized access by trying many password combinations.' },
    whatIs:
      'A brute-force attack repeatedly attempts logins against internet-facing services until valid credentials are discovered.',
    howWorks: [
      'Attacker discovers exposed authentication endpoint.',
      'Automated scripts cycle through username/password combinations.',
      'Failed attempts spike and trigger lockout thresholds.',
      'A valid credential is eventually found and reused.',
      'Compromised account is used for lateral movement.',
    ],
    whyHappened:
      'Weak password policy and exposed remote login service allowed credential guessing attempts to continue long enough for compromise.',
    impacts: [
      'Unauthorized account access',
      'Privilege abuse',
      'Data confidentiality risks',
      'Service disruption through lockouts',
      'Compliance violations',
      'Potential lateral movement to critical assets',
    ],
    commandSet: [
      { cmd: 'sudo ufw deny from 185.220.101.15 to any port 22', output: 'Rule added: deny 185.220.101.15 -> 22/tcp' },
      { cmd: "sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config", output: 'sshd_config updated: PermitRootLogin no' },
      { cmd: "sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config", output: 'sshd_config updated: PasswordAuthentication no' },
      { cmd: 'sudo systemctl restart sshd', output: 'sshd service restarted successfully' },
      { cmd: 'sudo faillock --user admin --reset', output: 'Failed login counters reset for admin' },
      { cmd: 'sudo chage -d 0 admin', output: 'Password expiration forced for admin' },
      { cmd: "sudo awk -F: '$3==0 {print $1}' /etc/passwd", output: 'root' },
      { cmd: 'sudo journalctl -u ssh --since "-30 min" | tail -n 20', output: 'Recent authentication logs exported for evidence.' },
    ],
  },
  malware: {
    mitre: { id: 'T1059', description: 'Command and Scripting Interpreter used by malware to execute payloads.' },
    whatIs: 'Malware execution indicates a malicious binary or script ran on a monitored endpoint.',
    howWorks: [
      'User receives malicious attachment or drive-by download.',
      'Payload executes through script interpreter.',
      'Persistence entries are dropped in startup locations.',
      'Process contacts command-and-control infrastructure.',
      'Host begins unauthorized actions like data staging.',
    ],
    whyHappened:
      'Endpoint controls were bypassed due to outdated signatures and a user executing an untrusted script from email.',
    impacts: [
      'Endpoint compromise',
      'Potential credential theft',
      'Data tampering',
      'Beaconing to C2 infrastructure',
      'Spread to neighboring hosts',
      'Business operations slowdown',
    ],
    commandSet: [
      { cmd: 'ps aux | grep -Ei "xmrig|miner|payload"', output: 'Suspicious process found: /tmp/.cache/updater.bin (pid 3381)' },
      { cmd: 'sudo kill -9 3381', output: 'Process 3381 terminated' },
      { cmd: 'sudo rm -f /tmp/.cache/updater.bin', output: 'Malicious binary removed' },
      { cmd: 'sudo crontab -l | grep -v updater | sudo crontab -', output: 'Persistence cron entry removed' },
      { cmd: 'sudo find /etc/systemd/system -name "*updater*" -delete', output: '1 malicious service file deleted' },
      { cmd: 'sudo systemctl daemon-reload', output: 'Systemd daemon reloaded' },
      { cmd: 'sudo freshclam', output: 'AV signatures updated to latest baseline' },
      { cmd: 'sudo clamscan -r /home --infected', output: 'Scan complete: 0 infected files remaining' },
    ],
  },
  privilege_escalation: {
    mitre: { id: 'T1068', description: 'Exploitation for Privilege Escalation by abusing vulnerable components.' },
    whatIs: 'Privilege escalation occurs when an attacker gains higher permissions than originally granted.',
    howWorks: [
      'Attacker starts with limited user access.',
      'Enumeration identifies vulnerable binaries or sudo misconfigurations.',
      'Exploit or misconfiguration abuse grants elevated rights.',
      'Administrative tools are used to persist elevated access.',
      'Security controls are disabled to avoid detection.',
    ],
    whyHappened:
      'An over-permissive sudo rule and delayed patching enabled exploit of local privilege boundaries.',
    impacts: [
      'Full host takeover',
      'Security control bypass',
      'Credential database access',
      'Unauthorized policy changes',
      'High-value data exposure',
      'Increased blast radius',
    ],
    commandSet: [
      { cmd: 'sudo -l', output: 'Misconfigured sudo entry identified for user analyst' },
      { cmd: 'sudo sed -i "/analyst ALL=(ALL) NOPASSWD:ALL/d" /etc/sudoers', output: 'Unsafe sudo rule removed' },
      { cmd: 'sudo usermod -L analyst', output: 'Compromised account locked' },
      { cmd: 'sudo find / -perm -4000 -type f 2>/dev/null | head', output: 'SUID audit completed and archived' },
      { cmd: 'sudo apt-get update && sudo apt-get install --only-upgrade -y sudo', output: 'sudo package upgraded with security patch' },
      { cmd: 'sudo ausearch -m USER_ROLE_CHANGE -ts recent', output: 'No additional unauthorized role changes detected' },
      { cmd: 'sudo passwd -l root', output: 'Root password login disabled' },
      { cmd: 'sudo systemctl restart auditd', output: 'Audit service restarted and monitoring resumed' },
    ],
  },
  data_exfiltration: {
    mitre: { id: 'T1048', description: 'Exfiltration Over Alternative Protocol used for unauthorized data transfer.' },
    whatIs:
      'Data exfiltration is the unauthorized movement of sensitive data from internal systems to external destinations.',
    howWorks: [
      'Attacker gains host access and locates sensitive files.',
      'Data is compressed and staged in temporary paths.',
      'Outbound channels are opened to external destinations.',
      'Files are transferred in chunks to evade thresholds.',
      'Artifacts are deleted to hide traces.',
    ],
    whyHappened:
      'Egress controls were too permissive and DLP alerting thresholds were not tuned for abnormal outbound transfers.',
    impacts: [
      'Confidential data leakage',
      'Regulatory penalties',
      'Brand damage',
      'Customer trust loss',
      'Competitive intelligence theft',
      'Legal exposure',
    ],
    commandSet: [
      { cmd: 'sudo ss -tunp | grep ESTAB', output: 'Detected suspicious outbound session to 91.240.118.44:443' },
      { cmd: 'sudo iptables -A OUTPUT -d 91.240.118.44 -j DROP', output: 'Outbound exfil destination blocked' },
      { cmd: 'sudo lsof -i @91.240.118.44', output: 'Process python3 (pid 4120) mapped to outbound session' },
      { cmd: 'sudo kill -9 4120', output: 'Exfiltration process terminated' },
      { cmd: 'sudo find /tmp -name "*.zip" -o -name "*.7z"', output: '/tmp/stage/customer_dump.7z located' },
      { cmd: 'sudo shred -u /tmp/stage/customer_dump.7z', output: 'Staged archive securely deleted' },
      { cmd: 'sudo tar -czf /var/log/forensics/exfil_evidence.tgz /var/log/auth.log', output: 'Forensic evidence package created' },
      { cmd: 'sudo systemctl restart falcon-sensor', output: 'Endpoint telemetry service restarted' },
    ],
  },
  ransomware: {
    mitre: { id: 'T1486', description: 'Data Encrypted for Impact to deny access and demand payment.' },
    whatIs:
      'Ransomware encrypts production files and attempts to force payment in exchange for decryption keys.',
    howWorks: [
      'Initial compromise through phishing or vulnerable service.',
      'Malware disables backups and shadow copies.',
      'Files across mounted drives are encrypted.',
      'Ransom note is dropped and persistence is established.',
      'Attacker threatens data leak to pressure payment.',
    ],
    whyHappened:
      'Patch lag and unrestricted macro execution enabled ransomware loader execution before endpoint controls could isolate host.',
    impacts: [
      'Business downtime',
      'Data unavailability',
      'Recovery cost escalation',
      'Possible data extortion',
      'Regulatory disclosure obligations',
      'Operational disruption across teams',
    ],
    commandSet: [
      { cmd: 'sudo systemctl isolate rescue.target', output: 'Host isolated into rescue mode profile' },
      { cmd: 'sudo pkill -f "encrypt|locker|ransom"', output: 'Encryption-related processes terminated' },
      { cmd: 'sudo ip link set eth0 down', output: 'Network interface disabled to contain spread' },
      { cmd: 'sudo umount /mnt/shared', output: 'Shared drive unmounted to prevent propagation' },
      { cmd: 'sudo restorecon -Rv /srv/data', output: 'File context restoration completed' },
      { cmd: 'sudo rsync -a /backups/latest/ /srv/data/', output: 'Critical data restored from latest backup snapshot' },
      { cmd: 'sudo ip link set eth0 up', output: 'Network interface restored in monitored mode' },
      { cmd: 'sudo systemctl restart edr-agent', output: 'EDR agent restarted with high-alert policy' },
    ],
  },
};

const INCIDENTS = [
  {
    id: 'INC-2026-001',
    severity: 'critical',
    title: 'Ransomware Encryption Activity on Finance File Server',
    source: '10.20.14.33',
    target: 'FS-FIN-01',
    riskScore: 96,
    timestamp: '2026-03-03T09:25:00Z',
    indicators: ['Mass file rename', 'Shadow copy deletion', 'Ransom note created'],
    attackType: 'ransomware',
    detectionSource: 'EDR + SIEM Correlation',
    analysis: { confidence: 98, summary: 'High-confidence ransomware behavior detected across finance share.' },
    postAttackAssessment: { safetyBefore: 24, safetyAfter: 88, humanTimeMinutes: 210 },
  },
  {
    id: 'INC-2026-002',
    severity: 'high',
    title: 'Credential Stuffing Against VPN Gateway',
    source: '185.220.101.15',
    target: 'VPN-GW-01',
    riskScore: 82,
    timestamp: '2026-03-03T10:02:00Z',
    indicators: ['1,200 failed logins', 'Multiple usernames', 'Geo anomaly'],
    attackType: 'brute_force',
    detectionSource: 'Auth Logs + UEBA',
    analysis: { confidence: 91, summary: 'Repeated distributed authentication attempts suggest brute force campaign.' },
    postAttackAssessment: { safetyBefore: 42, safetyAfter: 90, humanTimeMinutes: 95 },
  },
  {
    id: 'INC-2026-003',
    severity: 'high',
    title: 'Outbound Exfiltration to Untrusted ASN',
    source: '172.16.2.41',
    target: 'DB-APP-03',
    riskScore: 88,
    timestamp: '2026-03-03T08:40:00Z',
    indicators: ['Large egress spike', 'Unknown TLS endpoint', 'Compressed archive in /tmp'],
    attackType: 'data_exfiltration',
    detectionSource: 'NDR + DLP',
    analysis: { confidence: 93, summary: 'Sensitive records likely staged and transferred externally.' },
    postAttackAssessment: { safetyBefore: 33, safetyAfter: 86, humanTimeMinutes: 160 },
  },
  {
    id: 'INC-2026-004',
    severity: 'critical',
    title: 'Unauthorized Privilege Escalation on Jump Host',
    source: '192.168.50.21',
    target: 'JUMP-ADM-01',
    riskScore: 90,
    timestamp: '2026-03-03T07:55:00Z',
    indicators: ['Unexpected sudo usage', 'Role change event', 'Audit policy tampering'],
    attackType: 'privilege_escalation',
    detectionSource: 'Linux Auditd',
    analysis: { confidence: 95, summary: 'Privilege escalation path likely exploited via sudo misconfiguration.' },
    postAttackAssessment: { safetyBefore: 29, safetyAfter: 84, humanTimeMinutes: 125 },
  },
  {
    id: 'INC-2026-005',
    severity: 'high',
    title: 'Malware Beaconing from Marketing Workstation',
    source: '10.10.7.55',
    target: 'MK-LAPTOP-22',
    riskScore: 78,
    timestamp: '2026-03-03T06:45:00Z',
    indicators: ['Suspicious binary hash', 'C2 DNS query', 'Persistence cron job'],
    attackType: 'malware',
    detectionSource: 'Endpoint AV + DNS Monitor',
    analysis: { confidence: 89, summary: 'Likely commodity malware with persistence and outbound beacon.' },
    postAttackAssessment: { safetyBefore: 49, safetyAfter: 92, humanTimeMinutes: 80 },
  },
].map((incident) => ({
  ...incident,
  commands: ATTACK_LIBRARY[incident.attackType].commandSet,
}));

const styles = {
  app: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#111827',
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    background: '#ffffff',
    zIndex: 4,
  },
  layout: { display: 'flex', minHeight: 'calc(100vh - 72px)' },
  sidebar: { width: 260, borderRight: '1px solid #e5e7eb', background: '#fafafa', padding: 20 },
  content: { flex: 1, padding: 24, background: '#ffffff' },
};

function timeAgo(timestamp) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function lineColor(type) {
  return {
    info: '#7dd3fc',
    command: '#fb923c',
    output: '#9ca3af',
    success: '#22c55e',
  }[type] || '#e5e7eb';
}

export default function NexusDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showAttackDetails, setShowAttackDetails] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [executionMode, setExecutionMode] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [createdCases, setCreatedCases] = useState([]);
  const [mitigatedIncidents, setMitigatedIncidents] = useState(new Set());

  const timeoutRefs = useRef([]);
  const terminalRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setWsConnected(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalOutput]);

  useEffect(
    () => () => {
      timeoutRefs.current.forEach((id) => clearTimeout(id));
    },
    []
  );

  const activeList = useMemo(() => INCIDENTS.filter((i) => !mitigatedIncidents.has(i.id)), [mitigatedIncidents]);
  const filteredIncidents = useMemo(
    () => activeList.filter((i) => !severityFilter || i.severity === severityFilter),
    [activeList, severityFilter]
  );

  const criticalCount = activeList.filter((i) => i.severity === 'critical').length;
  const highCount = activeList.filter((i) => i.severity === 'high').length;
  const avgRiskScore = activeList.length
    ? Math.round(activeList.reduce((sum, i) => sum + i.riskScore, 0) / activeList.length)
    : 0;

  const resetExecution = () => {
    timeoutRefs.current.forEach((id) => clearTimeout(id));
    timeoutRefs.current = [];
    setSelectedIncident(null);
    setExecutionMode(null);
    setTerminalOutput([]);
    setExecutionProgress(0);
    setActiveSection('overview');
  };

  const startExecution = (incident) => {
    timeoutRefs.current.forEach((id) => clearTimeout(id));
    timeoutRefs.current = [];
    setShowAttackDetails(false);
    setSelectedIncident(incident);
    setExecutionMode('analyze');
    setExecutionProgress(5);
    setTerminalOutput([
      { type: 'info', text: `NEXUS AI ORCHESTRATOR :: Incident ${incident.id}` },
      { type: 'info', text: `Analyzing ${incident.title}` },
      { type: 'info', text: `Source ${incident.source} targeting ${incident.target}` },
      { type: 'info', text: `Risk ${incident.riskScore}/100 | Confidence ${incident.analysis.confidence}%` },
    ]);

    const begin = setTimeout(() => {
      setExecutionMode('execute');
      const commands = incident.commands;
      commands.forEach((entry, index) => {
        const commandDelay = index * 4200;
        const outputDelay = commandDelay + 2000;
        timeoutRefs.current.push(
          setTimeout(() => {
            setTerminalOutput((prev) => [...prev, { type: 'command', text: `$ ${entry.cmd}` }]);
            setExecutionProgress(Math.round(((index + 1) / commands.length) * 85));
          }, commandDelay)
        );
        timeoutRefs.current.push(
          setTimeout(() => {
            setTerminalOutput((prev) => [...prev, { type: 'output', text: entry.output }]);
          }, outputDelay)
        );
      });

      timeoutRefs.current.push(
        setTimeout(() => {
          const now = Date.now();
          const aiTimeSeconds = Math.max(10, Math.floor((now - new Date(incident.timestamp).getTime()) / 1000));
          const humanTimeMinutes = incident.postAttackAssessment.humanTimeMinutes;
          const timeSaved = Math.max(0, humanTimeMinutes * 60 - aiTimeSeconds);
          const newCase = {
            ...incident,
            caseId: `CASE-${Date.now()}`,
            riskReduction: incident.riskScore - Math.max(8, Math.floor(incident.riskScore * 0.18)),
            aiTimeSeconds,
            humanTimeMinutes,
            timeSaved,
            status: 'resolved',
          };

          setCreatedCases((prev) => [newCase, ...prev]);
          setMitigatedIncidents((prev) => new Set([...prev, incident.id]));
          setExecutionProgress(100);
          setExecutionMode('completed');
          setTerminalOutput((prev) => [
            ...prev,
            { type: 'success', text: 'Mitigation completed successfully.' },
            { type: 'success', text: `Case ${newCase.caseId} created. Risk reduced by ${newCase.riskReduction}%` },
            { type: 'success', text: `AI time ${aiTimeSeconds}s vs Human ${humanTimeMinutes}m (${timeSaved}s saved)` },
          ]);
        }, commands.length * 4200 + 1300)
      );
    }, 2000);

    timeoutRefs.current.push(begin);
  };

  return (
    <div style={styles.app}>
      <style>{`
      .tab-btn:hover,.filter-btn:hover,.action-btn:hover,.case-card:hover{transform:translateY(-1px)}
      .fade-in{animation:fadeIn .2s ease-out}
      .slide-up{animation:slideUp .25s ease-out}
      .live-dot{animation:pulse 1.6s infinite}
      .terminal-scroll::-webkit-scrollbar{width:8px}
      .terminal-scroll::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}
      @keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes pulse{0%{opacity:.3}50%{opacity:1}100%{opacity:.3}}
    `}</style>

      <header style={styles.topbar}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>NEXUS<span style={{ color: '#0066ff' }}>.</span></div>
        <nav style={{ display: 'flex', gap: 10 }}>
          {['overview', 'incidents', 'cases'].map((tab) => (
            <button
              key={tab}
              className='tab-btn'
              onClick={() => setActiveSection(tab)}
              style={{
                border: '1px solid #e5e7eb',
                background: activeSection === tab ? '#0066ff' : '#ffffff',
                color: activeSection === tab ? '#fff' : '#111827',
                borderRadius: 8,
                padding: '8px 14px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}>
              {tab}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
          <Circle size={11} className='live-dot' fill={wsConnected ? '#22c55e' : '#9ca3af'} color={wsConnected ? '#22c55e' : '#9ca3af'} />
          {wsConnected ? 'Live' : 'Connecting'}
        </div>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3 style={{ marginTop: 0 }}>Severity Filter</h3>
          {[
            ['All', null],
            ['Critical', 'critical'],
            ['High', 'high'],
          ].map(([label, value]) => (
            <button
              key={label}
              className='filter-btn'
              onClick={() => setSeverityFilter(value)}
              style={{
                width: '100%',
                textAlign: 'left',
                marginBottom: 8,
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                background: severityFilter === value ? '#0066ff' : '#fff',
                color: severityFilter === value ? '#fff' : '#111827',
                cursor: 'pointer',
              }}>
              {label}
            </button>
          ))}
          <div style={{ marginTop: 20, padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Active</span><strong>{activeList.length}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Mitigated</span><strong>{mitigatedIncidents.size}</strong></div>
          </div>
        </aside>

        <main style={styles.content}>
          {(activeSection === 'overview' || activeSection === 'incidents') && (
            <>
              {activeSection === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(120px,1fr))', gap: 12, marginBottom: 18 }}>
                  {[
                    ['Critical', criticalCount, '#dc2626'],
                    ['High', highCount, '#ea580c'],
                    ['Avg Risk', avgRiskScore, '#0066ff'],
                    ['Mitigated', mitigatedIncidents.size, '#16a34a'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, background: '#fafafa' }}>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>{label}</div>
                      <div style={{ color, fontWeight: 800, fontSize: 24 }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {filteredIncidents.map((incident) => (
                <div key={incident.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                      <AlertTriangle size={16} color={incident.severity === 'critical' ? '#dc2626' : '#ea580c'} />
                      {incident.title}
                    </div>
                    <div style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>
                      {incident.source} → {incident.target} · {timeAgo(incident.timestamp)}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {incident.indicators.map((tag) => (
                        <span key={tag} style={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 999, padding: '4px 8px', background: '#f9fafb' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 22 }}>{incident.riskScore}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button className='action-btn' onClick={() => { setSelectedIncident(incident); setShowAttackDetails(true); }} style={{ border: 'none', background: '#ea580c', color: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>Learn</button>
                      <button className='action-btn' onClick={() => startExecution(incident)} style={{ border: 'none', background: '#0066ff', color: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>Execute</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeSection === 'cases' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
              {createdCases.length === 0 && <div>No resolved cases yet. Execute mitigation to create case files.</div>}
              {createdCases.map((c) => (
                <button key={c.caseId} className='case-card' onClick={() => setSelectedCase(c)} style={{ textAlign: 'left', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, background: '#fafafa', cursor: 'pointer' }}>
                  <div style={{ color: '#0066ff', fontWeight: 700 }}>{c.caseId}</div>
                  <div style={{ fontWeight: 700, marginTop: 6 }}>{c.title}</div>
                  <div style={{ marginTop: 10, fontSize: 13 }}>Risk reduction: <strong>{c.riskReduction}%</strong></div>
                  <div style={{ fontSize: 13 }}>Safety score: <strong>{c.postAttackAssessment.safetyAfter}%</strong></div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      {showAttackDetails && selectedIncident && (
        <div className='fade-in' style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)', display: 'grid', placeItems: 'center', zIndex: 10 }}>
          <div className='slide-up' style={{ width: 'min(860px,95vw)', maxHeight: '92vh', overflow: 'auto', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>{selectedIncident.title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
              <div>ID: <strong>{selectedIncident.id}</strong></div>
              <div>Severity: <strong style={{ textTransform: 'capitalize' }}>{selectedIncident.severity}</strong></div>
              <div>Risk: <strong>{selectedIncident.riskScore}</strong></div>
              <div>Confidence: <strong>{selectedIncident.analysis.confidence}%</strong></div>
            </div>
            <div style={{ marginTop: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 10 }}><Info size={14} style={{ verticalAlign: 'middle' }} /> {ATTACK_LIBRARY[selectedIncident.attackType].whatIs}</div>
            <h4>How it works</h4>
            <ol>{ATTACK_LIBRARY[selectedIncident.attackType].howWorks.map((s) => <li key={s}>{s}</li>)}</ol>
            <h4>Detection indicators</h4>
            {selectedIncident.indicators.map((indicator) => <div key={indicator}><CheckCircle2 size={14} color='#22c55e' style={{ verticalAlign: 'middle' }} /> {indicator}</div>)}
            <div style={{ marginTop: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 10 }}><AlertTriangle size={14} color='#ca8a04' style={{ verticalAlign: 'middle' }} /> {ATTACK_LIBRARY[selectedIncident.attackType].whyHappened}</div>
            <h4>Potential impacts</h4>
            <ul>{ATTACK_LIBRARY[selectedIncident.attackType].impacts.map((i) => <li key={i} style={{ color: '#b91c1c' }}>{i}</li>)}</ul>
            <div style={{ marginTop: 10, padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }}>MITRE ATT&CK: <strong>{ATTACK_LIBRARY[selectedIncident.attackType].mitre.id}</strong> — {ATTACK_LIBRARY[selectedIncident.attackType].mitre.description}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowAttackDetails(false)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8 }}>Close</button>
              <button onClick={() => startExecution(selectedIncident)} style={{ border: 'none', background: '#0066ff', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>Execute Mitigation Now</button>
            </div>
          </div>
        </div>
      )}

      {selectedIncident && executionMode && (
        <div className='fade-in' style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.55)', display: 'grid', placeItems: 'center', zIndex: 11 }}>
          <div className='slide-up' style={{ width: 'min(920px,95vw)', background: '#1a1a1a', borderRadius: 12, border: '1px solid #374151', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', color: '#fff', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between' }}>
              <div><Terminal size={16} style={{ verticalAlign: 'middle' }} /> {selectedIncident.id} · {selectedIncident.title}</div>
              {executionMode === 'completed' && <button onClick={resetExecution} style={{ border: 'none', background: '#22c55e', color: '#052e16', padding: '6px 10px', borderRadius: 8, fontWeight: 700 }}>Close</button>}
            </div>
            <div ref={terminalRef} className='terminal-scroll' style={{ height: 380, overflowY: 'auto', padding: 14, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
              {terminalOutput.map((line, idx) => <div key={idx} style={{ color: lineColor(line.type), marginBottom: 6 }}>{line.text}</div>)}
            </div>
            <div style={{ background: '#111827', padding: 10 }}>
              <div style={{ height: 8, background: '#374151', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${executionProgress}%`, background: '#0066ff', borderRadius: 999, transition: 'width .4s ease' }} />
              </div>
              <div style={{ marginTop: 8, color: '#e5e7eb', fontSize: 12 }}>{executionMode.toUpperCase()} · {executionProgress}%</div>
            </div>
          </div>
        </div>
      )}

      {selectedCase && (
        <div className='fade-in' style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)', display: 'grid', placeItems: 'center', zIndex: 10 }}>
          <div className='slide-up' style={{ width: 'min(760px,95vw)', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Case Detail · {selectedCase.caseId}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              <div>ID: <strong>{selectedCase.id}</strong></div>
              <div>Severity: <strong style={{ textTransform: 'capitalize' }}>{selectedCase.severity}</strong></div>
              <div>Risk Reduction: <strong>{selectedCase.riskReduction}%</strong></div>
              <div>Status: <strong>RESOLVED</strong></div>
            </div>
            <div style={{ marginTop: 12, padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              System safety: <strong>{selectedCase.postAttackAssessment.safetyBefore}%</strong> → <strong>{selectedCase.postAttackAssessment.safetyAfter}%</strong>
              <span style={{ marginLeft: 8, color: '#16a34a', fontWeight: 700 }}>+{selectedCase.postAttackAssessment.safetyAfter - selectedCase.postAttackAssessment.safetyBefore}% improvement</span>
            </div>
            <div style={{ marginTop: 12, padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              AI time: <strong>{selectedCase.aiTimeSeconds}s</strong> · Human time: <strong>{selectedCase.humanTimeMinutes}m</strong> · Time saved: <strong>{selectedCase.timeSaved}s</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={() => setSelectedCase(null)} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '8px 12px' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
