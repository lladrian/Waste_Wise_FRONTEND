import { useState } from 'react';
import { FiCalendar, FiDownload } from 'react-icons/fi';

function DateRangeFilter({ onChange, downloadHandler, hideDownload = false }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleStartChange = (e) => {
    const value = e.target.value;

    if (endDate && value > endDate) {
      setError('Start date cannot be after end date.');
      setStartDate(value);
      setEndDate('');
      onChange?.({ startDate: value, endDate: '' });
      return;
    }

    setError('');
    setStartDate(value);
    onChange?.({ startDate: value, endDate });
  };

  const handleEndChange = (e) => {
    const value = e.target.value;

    if (startDate && value < startDate) {
      setEndDate('');
      return;
    }

    setError('');
    setEndDate(value);
    onChange?.({ startDate, endDate: value });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setError('');
    onChange?.({ startDate: '', endDate: '' });
  };

  const handleDownload = () => {
    if (startDate && endDate && !error && downloadHandler) {
      downloadHandler();
    }
  };

  const canDownload = startDate && endDate && !error;

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Start Date */}
      <div className="flex flex-col">
        <label className="flex items-center gap-2">
          <FiCalendar className="text-gray-500 w-4 h-4" />
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={handleStartChange}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </label>
      </div>

      <span className="text-gray-400 self-center text-lg font-semibold">—</span>

      {/* End Date */}
      <div className="flex flex-col">
        <label className="flex items-center gap-2">
          <FiCalendar className="text-gray-500 w-4 h-4" />
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={handleEndChange}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </label>
      </div>

      {/* Reset Button */}
      {(startDate || endDate) && (
        <button
          onClick={handleReset}
          className="px-4 py-1.5 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors self-center"
          type="button"
        >
          Reset
        </button>
      )}

      {/* Download Button - Conditionally Rendered */}
      {!hideDownload && canDownload && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 ml-auto px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          type="button"
        >
          <FiDownload className="w-4 h-4" />
          Download Report
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="w-full text-red-600 text-xs mt-1 ml-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default DateRangeFilter;