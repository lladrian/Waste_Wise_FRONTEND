// components/DashboardCard.jsx
import React from 'react';
import { FiArrowUp, FiArrowDown, FiTrendingUp } from 'react-icons/fi';

const DashboardCard = ({ 
  title, 
  value, 
  change, 
  changeType, // 'positive', 'negative', or 'neutral'
  icon: Icon,
  color = 'indigo',
  subtitle 
}) => {
  const colorClasses = {
    indigo: 'from-indigo-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-red-600',
    purple: 'from-purple-500 to-pink-600'
  };

  const changeIcons = {
    positive: <FiArrowUp className="w-4 h-4 text-green-500" />,
    negative: <FiArrowDown className="w-4 h-4 text-red-500" />,
    neutral: <FiTrendingUp className="w-4 h-4 text-gray-500" />
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {change && (
        <div className="flex items-center space-x-1">
          {changeIcons[changeType]}
          <span className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change}
          </span>
          <span className="text-xs text-gray-500">from last week</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;