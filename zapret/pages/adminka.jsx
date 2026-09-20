import { useState } from 'react';

export default function AdminPanel() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [downloadLink, setDownloadLink] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus('Select file');

    setStatus('Загрузка...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('File uploaded succesfully!');
        setDownloadLink(data.url);
      } else {
        setStatus(`Ошибка: ${data.error || 'Error 502'}`);
      }
    } catch (err) {
      setStatus('Ошибка сети');
    }
  };

  return (
    <div style={{ background: '#05080c', color: '#eef5fa', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ marginTop: 0, color: '#2ad4ec' }}>admin panel</h2>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input 
            type="password" 
            placeholder="Пароль администратора" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
          />
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])}
            style={{ color: '#8ea3b4' }}
          />
          <button 
            type="submit" 
            style={{ padding: '12px', background: 'linear-gradient(120deg, #7ee8fa, #2ad4ec)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#031018' }}
          >
            Загрузить файл
          </button>
        </form>
        {status && <p style={{ marginTop: '14px', fontSize: '14px' }}>{status}</p>}
        {downloadLink && (
          <div style={{ marginTop: '14px' }}>
            <p>Link:</p>
            <a href={downloadLink} target="_blank" rel="noreferrer" style={{ color: '#7ee8fa', wordBreak: 'break-all' }}>{downloadLink}</a>
          </div>
        )}
      </div>
    </div>
  );
}
