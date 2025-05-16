import React, { useState } from 'react';

export default function AIInput({ onParsedResult }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('http://localhost:3001/api/parseBooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
  
      const data = await response.json();
  
      const parsed = typeof data.parsed === 'string'
        ? JSON.parse(data.parsed)
        : data.parsed;
  
      if (!parsed || !parsed.startDate || !parsed.endDate || !parsed.gear || !parsed.locationName) {
        throw new Error('Missing required parsed fields');
      }
  
      console.log('🧠 Parsed:', parsed);
      onAIResult?.(parsed);  // <-- call it correctly
    } catch (err) {
      console.error('❌ Failed to parse AI response:', err);
      setError('Could not understand your input. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block font-semibold">Use AI Booking:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="e.g., Book 4 Mac Auras in Studio G from June 12 to 14"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Parsing...' : 'Submit to AI'}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}
